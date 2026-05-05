import httpx
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.lead import Lead

EVOLUTION_URL = settings.EVOLUTION_API_URL
INSTANCE      = settings.EVOLUTION_INSTANCE
API_KEY       = settings.EVOLUTION_API_KEY

def formatar_brl(valor):
    return f"R$ {valor:,.2f}".replace(",","X").replace(".",",").replace("X",".")

async def enviar_whatsapp(numero, texto):
    url = f"{EVOLUTION_URL}/message/sendText/{INSTANCE}"
    headers = {"apikey": API_KEY, "Content-Type": "application/json"}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(url, json={"number": numero, "text": texto}, headers=headers)
            return r.status_code in [200, 201]
    except Exception as e:
        print(f"Erro WhatsApp: {e}")
        return False

async def enviar_mensagem_boas_vindas(lead):
    texto = (
        f"Ola, {lead.nome.split()[0]}!\n\n"
        f"Sou o assistente da *Dra. Carolina Burnett Garcia*.\n\n"
        f"Recebi sua simulacao:\n"
        f"Estimativa: *{formatar_brl(lead.valor_estimado)}*\n"
        f"Vinculos: *{lead.num_vinculos}*\n\n"
        f"Para iniciar a analise gratuita, informe seu *CRM* e estado. Ex: 123456-SP"
    )
    await enviar_whatsapp(lead.whatsapp, texto)

async def processar_resposta_bot(lead, texto, db):
    tl = texto.lower().strip()
    if lead.bot_etapa == "inicio":
        if any(c.isdigit() for c in texto):
            lead.crm = texto.upper()
            lead.bot_etapa = "crm_confirmado"
            db.commit()
            await enviar_whatsapp(lead.whatsapp, f"CRM *{lead.crm}* registrado! Agora informe seu *e-mail*.")
        else:
            await enviar_whatsapp(lead.whatsapp, "Informe seu CRM. Ex: *123456-SP*")
    elif lead.bot_etapa == "crm_confirmado":
        if "@" in texto:
            lead.email = texto.lower()
            lead.bot_etapa = "qualificado"
            lead.status = "qualificado"
            db.commit()
            if lead.alto_potencial:
                msg = f"Otimas noticias! Estimativa *{formatar_brl(lead.valor_estimado)}* tem prioridade maxima. A Dra. Carolina entrara em contato em breve. Separe: holerites 5 anos, contratos PJ, CNIS."
            else:
                msg = f"Analise iniciada! Instrucoes enviadas para *{lead.email}*. Retorno em 24h uteis."
            await enviar_whatsapp(lead.whatsapp, msg)
        else:
            await enviar_whatsapp(lead.whatsapp, "Informe um *e-mail valido*. Ex: nome@email.com")
    elif lead.bot_etapa == "qualificado":
        if any(p in tl for p in ["prazo","quando","demora"]):
            msg = "Prazo medio: 6 a 24 meses. Muitos casos resolvem administrativamente antes."
        elif any(p in tl for p in ["custo","pagar","honorario"]):
            msg = "Sem custo antecipado! Honorarios so apos o deposito do valor recuperado."
        elif any(p in tl for p in ["document","preciso"]):
            msg = "Documentos: holerites 5 anos, contratos PJ, CNIS (app Meu INSS)."
        else:
            msg = "Obrigado! Nossa equipe retornara em breve."
        await enviar_whatsapp(lead.whatsapp, msg)
