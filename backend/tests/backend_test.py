"""KymrStudio backend API tests — health/root, enquiries, leads, cal.com webhook."""
import os
import uuid

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")
ADMIN_KEY = "kymr-vault-7f3a-2026"


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- health / root ---
class TestHealth:
    def test_root_api(self, api):
        r = api.get(f"{BASE_URL}/api/", timeout=30)
        assert r.status_code == 200
        assert "system live" in r.json()["message"]

    def test_health_endpoint(self, api):
        """Review request expects /api/health; verify presence."""
        r = api.get(f"{BASE_URL}/api/health", timeout=30)
        assert r.status_code == 200, f"/api/health missing (got {r.status_code})"


# --- leads ---
class TestLeads:
    def test_create_lead_and_admin_list(self, api):
        email = f"TEST_lead_{uuid.uuid4().hex[:8]}@example.test"
        payload = {
            "name": "TEST_Lead",
            "email": email,
            "company": "TEST_Co",
            "phone": "123",
            "config": {"mix": "hybrid", "cadence": "weekly", "volume": 20},
            "tier": "MOMENTUM",
            "message": "TEST message",
        }
        r = api.post(f"{BASE_URL}/api/leads", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == email
        assert data["tier"] == "MOMENTUM"
        assert data["config"]["cadence"] == "weekly"
        assert isinstance(data["id"], str) and len(data["id"]) > 0
        assert data["source"] == "website"
        assert "_id" not in data

        # 401 without admin key
        r401 = api.get(f"{BASE_URL}/api/leads", timeout=30)
        assert r401.status_code == 401

        # 200 with admin key + persistence check
        r200 = api.get(f"{BASE_URL}/api/leads", headers={"X-Admin-Key": ADMIN_KEY}, timeout=30)
        assert r200.status_code == 200
        leads = r200.json()
        assert isinstance(leads, list)
        found = [x for x in leads if x["email"] == email]
        assert found, "created lead not persisted/returned"
        assert found[0]["name"] == "TEST_Lead"
        assert all("_id" not in x for x in leads)

    def test_create_lead_validation(self, api):
        r = api.post(f"{BASE_URL}/api/leads", json={"name": "", "email": "a"}, timeout=30)
        assert r.status_code == 422

    def test_leads_wrong_admin_key(self, api):
        r = api.get(f"{BASE_URL}/api/leads", headers={"X-Admin-Key": "nope"}, timeout=30)
        assert r.status_code == 401


# --- cal.com webhook ---
class TestCalcomWebhook:
    def test_booking_created_flips_lead_to_booked(self, api):
        email = f"TEST_book_{uuid.uuid4().hex[:8]}@example.test"
        api.post(f"{BASE_URL}/api/leads", json={"name": "TEST_Book", "email": email, "message": "x"}, timeout=30)
        payload = {
            "triggerEvent": "BOOKING_CREATED",
            "payload": {"attendees": [{"email": email}], "startTime": "2026-08-01T10:00:00Z"},
        }
        r = api.post(f"{BASE_URL}/api/webhooks/calcom", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["received"] is True
        assert body["matched"] is True
        assert body["updated"] >= 1

        leads = api.get(f"{BASE_URL}/api/leads", headers={"X-Admin-Key": ADMIN_KEY}, timeout=30).json()
        lead = next(x for x in leads if x["email"] == email)
        assert lead["meeting"]["booked"] is True
        assert lead["meeting"]["startTime"] == "2026-08-01T10:00:00Z"

    def test_other_event_ignored(self, api):
        r = api.post(f"{BASE_URL}/api/webhooks/calcom", json={"triggerEvent": "PING"}, timeout=30)
        assert r.status_code == 200
        assert r.json()["ignored"] == "PING"

    def test_booking_no_email_unmatched(self, api):
        r = api.post(
            f"{BASE_URL}/api/webhooks/calcom",
            json={"triggerEvent": "BOOKING_CREATED", "payload": {}},
            timeout=30,
        )
        assert r.status_code == 200
        assert r.json()["matched"] is False


# --- legacy enquiries ---
class TestEnquiries:
    def test_create_and_list_enquiry(self, api):
        email = f"TEST_enq_{uuid.uuid4().hex[:8]}@example.test"
        r = api.post(
            f"{BASE_URL}/api/enquiries",
            json={"name": "TEST_Enq", "email": email, "message": "TEST hello"},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        assert r.json()["email"] == email

        assert api.get(f"{BASE_URL}/api/enquiries", timeout=30).status_code == 401
        r2 = api.get(f"{BASE_URL}/api/enquiries", headers={"X-Admin-Key": ADMIN_KEY}, timeout=30)
        assert r2.status_code == 200
        assert any(x["email"] == email for x in r2.json())
