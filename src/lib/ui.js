/**
 * TRIBUT MED — UI & Interações
 */

document.addEventListener('DOMContentLoaded', () => {

  // ─── NAVBAR SCROLL ───
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  // ─── MOBILE MENU ───
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');
  hamburger?.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  // ─── SCROLL REVEAL ───
  const reveals = document.querySelectorAll('[data-reveal]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        // Stagger siblings
        const siblings = e.target.parentElement?.querySelectorAll('[data-reveal]');
        siblings?.forEach((s, i) => {
          s.style.transitionDelay = `${i * 0.1}s`;
        });
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  reveals.forEach(el => observer.observe(el));

  // ─── FAQ ACCORDION ───
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q').addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ─── VÍNCULO SELECTOR ───
  let numVinculos = 2;
  const vincSelects = document.querySelectorAll('.vincSelect');
  vincSelects.forEach(btn => {
    btn.addEventListener('click', () => {
      vincSelects.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      numVinculos = parseInt(btn.dataset.val) || 2;
      renderVinculoInputs(numVinculos);
    });
  });

  function renderVinculoInputs(n) {
    const container = document.getElementById('vinculos-inputs');
    const tipos = ['CLT', 'PJ', 'PJ', 'PJ'];
    const valores = [15000, 20000, 10000, 8000];
    let html = '<div class="form-row" style="flex-wrap:wrap;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">';
    for (let i = 1; i <= n; i++) {
      const tipo = tipos[i - 1];
      const val = valores[i - 1];
      html += `
        <div class="form-group">
          <label>Vínculo ${i} — Renda bruta mensal</label>
          <div class="input-currency">
            <span>R$</span>
            <input type="number" id="v${i}" placeholder="${val.toLocaleString('pt-BR')}" min="0" value="${val}" />
          </div>
          <div class="input-type">
            <label><input type="radio" name="t${i}" value="CLT" ${tipo === 'CLT' ? 'checked' : ''} /> CLT</label>
            <label><input type="radio" name="t${i}" value="PJ" ${tipo === 'PJ' ? 'checked' : ''} /> PJ / Pessoa Jurídica</label>
          </div>
        </div>
      `;
    }
    html += '</div>';
    container.innerHTML = html;
  }

  // ─── SLIDER PERÍODO ───
  const slider = document.getElementById('periodo');
  const periodoLabel = document.getElementById('periodo-label');
  slider?.addEventListener('input', () => {
    const v = parseInt(slider.value);
    periodoLabel.textContent = v < 12 ? `${v} meses` : v === 12 ? '1 ano' : v === 60 ? '5 anos' : `${v} meses`;
  });

  // ─── BOTÃO CALCULAR ───
  const btnCalc = document.getElementById('btn-calcular');
  const resultValue = document.getElementById('result-value');
  const resultBar = document.getElementById('result-bar');
  const resultBreakdown = document.getElementById('result-breakdown');
  const resultAlert = document.getElementById('result-alert');
  const resultCta = document.getElementById('result-cta');

  btnCalc?.addEventListener('click', () => {
    // Loading state
    btnCalc.classList.add('loading');
    btnCalc.querySelector('span').textContent = 'Calculando';
    btnCalc.disabled = true;

    setTimeout(() => {
      // Coleta inputs
      const meses = parseInt(slider?.value || 48);
      const vinculos = [];
      for (let i = 1; i <= numVinculos; i++) {
        const inp = document.getElementById(`v${i}`);
        const tipo = document.querySelector(`input[name="t${i}"]:checked`)?.value || 'CLT';
        if (inp) vinculos.push({ valor: parseFloat(inp.value) || 0, tipo });
      }

      const resultado = window.TributCalc.calcularRecuperacao(vinculos, meses);

      // Anima valor
      animateValue(resultValue, 0, resultado.valorComCorrecao, 1200);

      // Barra de progresso (0–500k como max)
      const pct = Math.min(100, (resultado.valorComCorrecao / 500000) * 100);
      setTimeout(() => { resultBar.style.width = pct + '%'; }, 200);

      // Breakdown
      resultBreakdown.innerHTML = `
        <strong>Principal excedente:</strong> ${window.TributCalc.formatBRL(resultado.valorBruto)}<br/>
        <strong>Correção SELIC:</strong> ${window.TributCalc.formatBRL(resultado.valorComCorrecao - resultado.valorBruto)}<br/>
        <strong>Período considerado:</strong> ${meses} meses<br/>
        <strong>Vínculos detectados:</strong> ${vinculos.length}
      `;

      // Alert qualificado
      resultAlert.style.display = 'block';
      if (!resultado.elegivel) {
        resultAlert.style.background = 'rgba(255,80,80,.1)';
        resultAlert.style.borderColor = 'rgba(255,80,80,.3)';
        resultAlert.style.color = '#ff8080';
        resultAlert.textContent = '⚠️ Estimativa abaixo do mínimo de R$ 5.000. Confirme os valores informados ou entre em contato para análise manual.';
      } else if (resultado.altoPotencial) {
        resultAlert.textContent = '🔥 Alto potencial! Casos acima de R$ 50.000 têm prioridade e podem ter resolução mais rápida.';
      } else {
        resultAlert.textContent = '✅ Você se enquadra nos critérios. Um advogado da equipe entrará em contato via WhatsApp para análise completa.';
      }

      // Exibe CTA
      resultCta.style.display = 'block';

      // Restore button
      btnCalc.classList.remove('loading');
      btnCalc.querySelector('span').textContent = 'Recalcular';
      btnCalc.disabled = false;

      // Scroll suave ao resultado
      resultValue.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    }, 900);
  });

  // ─── ANIMA NÚMERO ───
  function animateValue(el, start, end, duration) {
    let startTs = null;
    const step = ts => {
      if (!startTs) startTs = ts;
      const progress = Math.min((ts - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      el.textContent = window.TributCalc.formatBRL(current);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ─── BOTÃO WHATSAPP ───
  const btnWpp = document.getElementById('btn-whatsapp');
  btnWpp?.addEventListener('click', async () => {
    const nome = document.getElementById('nome')?.value?.trim();
    const wpp = document.getElementById('whatsapp')?.value?.trim();
    const crm = document.getElementById('crm')?.value?.trim();

    if (!nome || !wpp) {
      alert('Por favor, preencha ao menos seu nome e WhatsApp.');
      return;
    }

    const valor = resultValue?.textContent || '';
    const meses = parseInt(slider?.value || '48');
    const msg = encodeURIComponent(
      `Olá! Me chamo ${nome}.\n\nRealizei a simulação no Tribut Med e minha estimativa de recuperação de INSS foi de *${valor}* (período: ${meses} meses).${crm ? `\n\nMeu CRM: ${crm}` : ''}\n\nGostaria de receber a análise completa.`
    );

    // Salvar lead no backend
    try {
      const rendaTotal = vinculos.reduce((s, v) => s + (parseFloat(v.valor) || 0), 0);
      const valorNum = parseFloat((resultValue?.textContent || '0').replace(/[^0-9,]/g,'').replace(',','.')) || 0;
      await fetch('https://tribut-med-production.up.railway.app/api/leads/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome, whatsapp: wpp, crm: crm || null, email: null,
          renda_total: rendaTotal, num_vinculos: numVinculos,
          periodo_meses: meses, valor_estimado: valorNum
        })
      });
    } catch(e) {
      console.log('Erro ao salvar lead:', e);
    }

    window.open(`https://wa.me/5551994703553?text=${msg}`, '_blank');
  });

  // ─── HERO AMOUNT COUNTER ───
  const heroAmount = document.getElementById('hero-amount');
  if (heroAmount) {
    // Já animado via CSS, mas adiciona counting effect no load
    setTimeout(() => {
      let count = 0;
      const target = 112480;
      const step = target / 60;
      const interval = setInterval(() => {
        count = Math.min(count + step, target);
        const formatted = count.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        heroAmount.innerHTML = `R$ ${formatted.replace(',00', '')}<span class="amount-cents">,00</span>`;
        if (count >= target) clearInterval(interval);
      }, 30);
    }, 1400);
  }

  // ─── SMOOTH SCROLL ───
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ─── INICIALIZA resultado panel como placeholder ───
  if (resultValue) resultValue.textContent = 'R$ 0,00';
  if (resultBar) resultBar.style.width = '0%';

});
