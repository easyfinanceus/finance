const scoreForm = document.querySelector('#score-form');
const scoreResult = document.querySelector('#score-result');
const rateBox = document.querySelector('#rate-box');

if (scoreForm) {
  scoreForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const payments = Number(document.querySelector('#payments').value);
    const utilization = Number(document.querySelector('#utilization').value);
    const history = Number(document.querySelector('#history').value);

    let score = 540;

    score += payments * 2.1;
    score += Math.max(0, 100 - utilization) * 1.5;
    score += history * 6;

    score = Math.min(850, Math.max(300, Math.round(score)));

    let zone = 'Нужно улучшение';
    if (score >= 740) zone = 'Отличный уровень';
    else if (score >= 670) zone = 'Хороший уровень';
    else if (score >= 580) zone = 'Средний уровень';

    scoreResult.innerHTML = `
      <strong>Оценка: ${score}</strong><br>
      <span class="muted">Категория: ${zone}. Это ориентировочный расчет для обучения, не FICO.</span>
    `;
  });
}

async function loadUsdRate() {
  if (!rateBox) return;

  const endpoint = 'https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR,GBP,JPY';

  try {
    const response = await fetch(endpoint, { cache: 'no-store' });
    if (!response.ok) throw new Error('API error');

    const data = await response.json();
    const rates = data.rates || {};

    rateBox.innerHTML = `
      <strong>USD курсы (ориентир)</strong><br>
      EUR: ${rates.EUR ?? '-'} | GBP: ${rates.GBP ?? '-'} | JPY: ${rates.JPY ?? '-'}<br>
      <small>Обновлено: ${data.date || 'сегодня'}</small>
    `;
  } catch (error) {
    rateBox.innerHTML = '<small>Не удалось загрузить курс сейчас. Попробуйте позже.</small>';
  }
}

loadUsdRate();
