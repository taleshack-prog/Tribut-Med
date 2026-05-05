from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.config import settings
from app.models.lead import Lead

router = APIRouter()

def auth(x_dashboard_key: str = Header(...)):
    if x_dashboard_key != settings.DASHBOARD_PASSWORD:
        raise HTTPException(status_code=401, detail="Nao autorizado")

@router.get("/stats")
def stats(db: Session = Depends(get_db), _=Depends(auth)):
    return {
        "total":          db.query(Lead).count(),
        "qualificados":   db.query(Lead).filter(Lead.status=="qualificado").count(),
        "alto_potencial": db.query(Lead).filter(Lead.alto_potencial==True).count(),
        "convertidos":    db.query(Lead).filter(Lead.status=="convertido").count(),
        "valor_pipeline": db.query(func.sum(Lead.valor_estimado)).scalar() or 0,
    }

@router.get("/leads")
def leads_dashboard(status: str = None, db: Session = Depends(get_db), _=Depends(auth)):
    q = db.query(Lead).order_by(Lead.created_at.desc())
    if status:
        q = q.filter(Lead.status == status)
    return [{"id":l.id,"nome":l.nome,"whatsapp":l.whatsapp,"crm":l.crm,
             "valor_estimado":l.valor_estimado,"alto_potencial":l.alto_potencial,
             "status":l.status,"bot_etapa":l.bot_etapa,
             "created_at":l.created_at.isoformat() if l.created_at else None}
            for l in q.limit(200).all()]

@router.patch("/leads/{lead_id}/status")
def atualizar_status(lead_id: int, body: dict, db: Session = Depends(get_db), _=Depends(auth)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead nao encontrado")
    lead.status = body.get("status", lead.status)
    lead.notas  = body.get("notas", lead.notas)
    db.commit()
    return {"ok": True}
