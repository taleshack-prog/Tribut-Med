from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import leads, webhook, dashboard
from app.core.database import engine, Base

app = FastAPI(title="Tribut Med API", version="1.0.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(leads.router,     prefix="/api/leads",     tags=["leads"])
app.include_router(webhook.router,   prefix="/api/webhook",   tags=["webhook"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

@app.on_event("startup")
async def startup():
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Banco conectado e tabelas criadas!")
    except Exception as e:
        print(f"⚠️ Banco indisponivel na inicializacao: {e}")

@app.get("/")
def root():
    return {"status": "ok", "service": "Tribut Med API"}
