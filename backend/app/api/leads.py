from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.models.lead import Lead
from app.services.bot import enviar_mensagem_boas_vindas

router = APIRouter()

class LeadCreate(BaseModel):
    nome: str
    whatsapp: str
    email: Optional[str] = None
    crm: Optional[str] = None
    renda_total: float
    num_vinculos: int
    periodo_meses: int
    valor_estimado: float

@router.post("/")
async def criar_lead(data: LeadCreate, db: Session = Depends(get_db)):
    ex = db.query(Lead).filter(Lead.whatsapp == data.whatsapp).first()
    if ex:
        ex.valor_estimado = data.valor_estimado
        db.commit()
        await enviar_mensagem_boas_vindas(ex)
        return {"id": ex.id, "status": "atualizado"}
    lead = Lead(
        nome=data.nome, whatsapp=data.whatsapp, email=data.email,
        crm=data.crm, renda_total=data.renda_total, num_vinculos=data.num_vinculos,
        periodo_meses=data.periodo_meses, valor_estimado=data.valor_estimado,
        alto_potencial=data.valor_estimado >= 50000, status="novo", bot_etapa="inicio"
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    await enviar_mensagem_boas_vindas(lead)
    return {"id": lead.id, "status": "criado"}

@router.get("/")
def listar_leads(db: Session = Depends(get_db)):
    return db.query(Lead).order_by(Lead.created_at.desc()).all()
