from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.lead import Lead
from app.services.bot import processar_resposta_bot

router = APIRouter()

@router.post("/whatsapp")
async def webhook_whatsapp(request: Request, db: Session = Depends(get_db)):
    try:
        body  = await request.json()
        if body.get("event") != "messages.upsert":
            return {"status": "ignored"}
        data  = body.get("data", {})
        key   = data.get("key", {})
        if key.get("fromMe"):
            return {"status": "ignored"}
        numero = key.get("remoteJid","").replace("@s.whatsapp.net","").replace("@c.us","")
        msg    = data.get("message", {})
        texto  = (msg.get("conversation") or msg.get("extendedTextMessage",{}).get("text") or "").strip()
        if not numero or not texto:
            return {"status": "ignored"}
        lead = db.query(Lead).filter(Lead.whatsapp.contains(numero[-8:])).first()
        if not lead:
            return {"status": "nao_encontrado"}
        await processar_resposta_bot(lead, texto, db)
        return {"status": "ok"}
    except Exception as e:
        return {"status": "erro", "detail": str(e)}
