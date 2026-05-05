/**
 * TRIBUT MED — Motor de Cálculo Tributário
 * Baseado na EC nº 103/2019
 * V_rec = Σ (C_total,t − Teto_INSS,t) × (1 + i_SELIC)
 */

// ─── Tabela de tetos INSS mensais (2020–2025) ───
const TETOS_INSS = {
  2020: 7786.02,
  2021: 7786.02,
  2022: 7786.02,
  2023: 8157.41,
  2024: 8157.41,
  2025: 8157.41,
};

// Estimativa SELIC acumulada por ano para correção
const SELIC_ANUAL = {
  2020: 0.0202,
  2021: 0.0973,
  2022: 0.1375,
  2023: 0.1175,
  2024: 0.1065,
  2025: 0.0750,
};

const INSS_ALIQUOTA_TETO = 0.14; // alíquota máxima para cálculo de excesso

/**
 * Calcula o valor estimado de recuperação
 * @param {Array} vinculos — [{valor: number}]
 * @param {number} meses — período em meses (12–60)
 * @returns {Object} resultado detalhado
 */
function calcularRecuperacao(vinculos, meses) {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();

  let totalRecuperavel = 0;
  let totalPagoExcedente = 0;

  // Distribuir os meses pelos anos passados
  const anoInicio = anoAtual - Math.ceil(meses / 12) + 1;

  for (let ano = anoInicio; ano <= anoAtual; ano++) {
    const mesesAno = ano === anoAtual
      ? hoje.getMonth() + 1
      : ano === anoInicio
        ? 12 - (12 - (meses % 12 || 12))
        : 12;

    const teto = TETOS_INSS[ano] || TETOS_INSS[2025];
    const selic = SELIC_ANUAL[ano] || 0.08;

    // Soma das rendas brutas totais
    const rendaTotal = vinculos.reduce((s, v) => s + (parseFloat(v.valor) || 0), 0);

    if (rendaTotal <= teto) continue;

    // INSS que deveria ser pago (só até o teto)
    const inssDevido = teto * INSS_ALIQUOTA_TETO;

    // INSS efetivamente pago (cada vínculo desconta separadamente)
    const inssPago = vinculos.reduce((s, v) => {
      const val = parseFloat(v.valor) || 0;
      // Cada empregador desconta alíquota progressiva, simulamos alíquota máxima para conservadorismo
      return s + Math.min(val, teto) * INSS_ALIQUOTA_TETO;
    }, 0);

    const excedenteMensal = Math.max(0, inssPago - inssDevido);
    const excedenteAnual = excedenteMensal * mesesAno;

    // Correção SELIC proporcional ao tempo passado
    const anosPassados = anoAtual - ano + 0.5;
    const correcao = excedenteAnual * (Math.pow(1 + selic, anosPassados) - 1);

    totalPagoExcedente += excedenteAnual;
    totalRecuperavel += excedenteAnual + correcao;
  }

  const elegivel = totalRecuperavel > 5000;
  const altoPotencial = totalRecuperavel > 50000;

  return {
    valorBruto: totalPagoExcedente,
    valorComCorrecao: totalRecuperavel,
    elegivel,
    altoPotencial,
    meses,
    vinculos: vinculos.length,
  };
}

/**
 * Formata valor em BRL
 */
function formatBRL(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

window.TributCalc = { calcularRecuperacao, formatBRL };
