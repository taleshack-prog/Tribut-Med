# TRIBUT MED — Landing Page

**Sistema de Captação e Qualificação de Leads para Recuperação de INSS Médico**

Landing page de alta conversão com simulador tributário integrado para a consultoria jurídica previdenciária **Dra. Carolina Burnett Garcia**.

---

## 🚀 Deploy Rápido

### Opção 1 — GitHub Pages (Gratuito)

```bash
# 1. Fork / clone este repositório
git clone https://github.com/SEU_USER/tribut-med.git
cd tribut-med

# 2. Ative GitHub Pages nas configurações do repositório
# Settings → Pages → Source: Deploy from branch → main → / (root)

# 3. Acesse:
# https://SEU_USER.github.io/tribut-med
```

### Opção 2 — Netlify (Recomendado)

```bash
# 1. Instale Netlify CLI
npm install -g netlify-cli

# 2. Deploy direto
netlify deploy --dir . --prod
```

Ou arraste a pasta para [netlify.com/drop](https://app.netlify.com/drop) — deploy em 30 segundos.

### Opção 3 — Vercel

```bash
npm install -g vercel
vercel --prod
```

---

## 📁 Estrutura

```
tribut-med/
├── index.html              # Landing page principal
├── src/
│   ├── styles/
│   │   └── main.css        # Estilos completos
│   └── lib/
│       ├── calc.js         # Motor de cálculo tributário (EC 103/2019)
│       └── ui.js           # Interações e simulador
├── public/                 # Imagens e assets estáticos
├── .gitignore
└── README.md
```

---

## ⚙️ Configurações Obrigatórias

Antes de subir em produção, edite os seguintes valores:

### 1. Número de WhatsApp (ui.js, linha ~102)
```js
window.open(`https://wa.me/55SEUNUMERO?text=${msg}`, '_blank');
```

### 2. Meta tags de SEO (index.html, `<head>`)
```html
<meta name="description" content="..." />
```

### 3. OAB / Dados da advogada (index.html, footer)
```html
<p>Dra. Carolina Burnett Garcia — OAB/SP XXXXX</p>
```

---

## 🧮 Lógica de Cálculo

O simulador implementa a fórmula previdenciária da **EC nº 103/2019**:

```
V_rec = Σ (C_total,t − Teto_INSS,t) × (1 + i_SELIC)
```

Onde:
- `C_total,t` = soma das contribuições INSS de todos os vínculos no mês t
- `Teto_INSS,t` = teto constitucional vigente no mês t
- `i_SELIC` = taxa SELIC acumulada para correção monetária

> ⚠️ **Importante**: Os valores do simulador são estimativas indicativas. Cálculos definitivos exigem análise documental completa pela equipe jurídica.

---

## 🔗 Integrações Futuras (Fase 2)

- [ ] Bot WhatsApp via Twilio API
- [ ] CRM com PostgreSQL + FastAPI
- [ ] Dashboard de leads (Fase 3)
- [ ] Petições automatizadas com IA Generativa (Fase 4)

---

## 📄 Licença

Proprietário — Tribut Med Consultoria Jurídica © 2026
