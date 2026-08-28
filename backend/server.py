from fastapi import FastAPI, APIRouter, Header, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="KymrStudio")
api_router = APIRouter(prefix="/api")


class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class EnquiryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=200)
    message: str = Field(min_length=1, max_length=4000)

class Enquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


@api_router.get("/")
async def root():
    return {"message": "KymrStudio — system live"}

@api_router.get("/health")
async def health():
    return {"message": "KymrStudio — system live"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

@api_router.post("/enquiries", response_model=Enquiry)
async def create_enquiry(input: EnquiryCreate):
    enquiry = Enquiry(**input.model_dump())
    doc = enquiry.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    _ = await db.enquiries.insert_one(doc)
    return enquiry

@api_router.get("/enquiries", response_model=List[Enquiry])
async def list_enquiries(x_admin_key: str = Header(default="")):
    if x_admin_key != os.environ.get('ADMIN_KEY'):
        raise HTTPException(status_code=401, detail="unauthorized")
    docs = await db.enquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for doc in docs:
        if isinstance(doc.get('created_at'), str):
            doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    return docs

class LeadCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=200)
    company: str = ""
    phone: str = ""
    config: dict = Field(default_factory=dict)
    tier: str = ""
    meeting: dict = Field(default_factory=dict)
    message: str = ""

class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    company: str = ""
    phone: str = ""
    config: dict = Field(default_factory=dict)
    tier: str = ""
    meeting: dict = Field(default_factory=dict)
    message: str = ""
    source: str = "website"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

@api_router.post("/leads", response_model=Lead)
async def create_lead(input: LeadCreate):
    lead = Lead(**input.model_dump())
    doc = lead.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    _ = await db.leads.insert_one(doc)
    return lead

@api_router.get("/leads", response_model=List[Lead])
async def list_leads(x_admin_key: str = Header(default="")):
    if x_admin_key != os.environ.get('ADMIN_KEY'):
        raise HTTPException(status_code=401, detail="unauthorized")
    docs = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for doc in docs:
        if isinstance(doc.get('created_at'), str):
            doc['created_at'] = datetime.fromisoformat(doc['created_at'])
    return docs

@api_router.post("/webhooks/calcom")
async def calcom_webhook(payload: dict):
    secret = os.environ.get('CAL_WEBHOOK_SECRET')
    if secret:
        if payload.get('secret') != secret:
            raise HTTPException(status_code=401, detail="invalid webhook secret")
    event = payload.get('triggerEvent') or payload.get('trigger_event') or ""
    if event != "BOOKING_CREATED":
        return {"received": True, "ignored": event}
    data = payload.get('payload') or {}
    attendees = data.get('attendees') or []
    email = (attendees[0].get('email') if attendees else None) or data.get('email')
    if not email:
        return {"received": True, "matched": False}
    start = data.get('startTime')
    result = await db.leads.update_many(
        {"email": email},
        {"$set": {"meeting": {"booked": True, "startTime": start, "via": "calcom-webhook"}}},
    )
    return {"received": True, "matched": result.matched_count > 0, "updated": result.modified_count}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
