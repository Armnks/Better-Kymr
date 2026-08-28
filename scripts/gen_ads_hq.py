import asyncio, os, base64, sys
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")
from emergentintegrations.llm.chat import LlmChat, UserMessage

STYLE = (
    "Ultra-realistic high-end commercial advertisement photograph, 4:5 vertical, maximum resolution and fine detail. "
    "Cinematic studio lighting, dramatic chiaroscuro, deep shadows, premium product photography, "
    "shallow depth of field, rich texture detail, dark moody backdrop, award-winning ad campaign quality. "
    "No text, no logos, no watermarks, no people."
)

SUBJECTS = {
    "watch": "A luxury mechanical chronograph watch with a black dial and brushed steel case, resting on dark slate, dramatic side light tracing the bezel",
    "automotive": "The sculpted rear quarter of a matte-black luxury sports car in a dark studio, a single blade of warm light tracing its body line",
    "beauty": "A matte ceramic jar of luxury face cream with a swirl of cream texture beside it, on travertine stone, soft warm directional light",
    "eyewear": "A pair of sculptural black acetate sunglasses standing on a mirrored black surface, hard rim light outlining the frame, faint smoke in the background",
}

async def gen(name, subject):
    chat = LlmChat(api_key=os.environ["EMERGENT_LLM_KEY"], session_id=f"hq-{name}", system_message="You generate commercial photography.")
    chat.with_model("gemini", "gemini-3-pro-image-preview").with_params(modalities=["image", "text"])
    msg = UserMessage(text=f"{STYLE} Subject: {subject}. Generate at the highest resolution possible (2K).")
    text, images = await chat.send_message_multimodal_response(msg)
    if images:
        data = base64.b64decode(images[0]["data"])
        with open(f"/tmp/hq_{name}.png", "wb") as f:
            f.write(data)
        print(f"{name}: {len(data)//1024}KB")
    else:
        print(f"{name}: NO IMAGE — {text[:100]}")

async def main():
    for name, subject in SUBJECTS.items():
        try:
            await gen(name, subject)
        except Exception as e:
            print(f"{name}: ERROR {str(e)[:150]}")

asyncio.run(main())
