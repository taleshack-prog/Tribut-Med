from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/tributmed"
    SECRET_KEY: str = "tribut-med-secret-change-in-production"
    EVOLUTION_API_URL: str = "http://localhost:8080"
    EVOLUTION_API_KEY: str = "your-evolution-api-key"
    EVOLUTION_INSTANCE: str = "tributmed"
    DASHBOARD_PASSWORD: str = "carolina2026"
    MIN_RECOVERY_VALUE: float = 5000.0

    class Config:
        env_file = ".env"

settings = Settings()
