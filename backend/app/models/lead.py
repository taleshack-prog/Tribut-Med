from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class Lead(Base):
    __tablename__ = "leads"
    id             = Column(Integer, primary_key=True, index=True)
    nome           = Column(String(255))
    whatsapp       = Column(String(20), unique=True, index=True)
    email          = Column(String(255))
    crm            = Column(String(50))
    renda_total    = Column(Float, default=0)
    num_vinculos   = Column(Integer, default=1)
    periodo_meses  = Column(Integer, default=48)
    valor_estimado = Column(Float, default=0)
    alto_potencial = Column(Boolean, default=False)
    status         = Column(String(50), default="novo")
    bot_etapa      = Column(String(50), default="inicio")
    notas          = Column(Text)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
    updated_at     = Column(DateTime(timezone=True), onupdate=func.now())
