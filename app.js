const pageLanguage = document.documentElement.lang || 'ru';

const translations = {
  ru: {
    scoreLabels: {
      excellent: 'Отличный уровень',
      good: 'Хороший уровень',
      fair: 'Средний уровень',
      poor: 'Нужно улучшение',
      result: 'Оценка',
      category: 'Категория',
      note: 'Это ориентировочный расчет для обучения, не FICO.'
    },
    rates: {
      loading: 'Загрузка актуальных курсов USD...',
      title: 'USD курсы (ориентир)',
      updated: 'Обновлено',
      fallback: 'Не удалось загрузить курс сейчас. Попробуйте позже.'
    },
    search: {
      all: 'Показаны все статьи.',
      found: 'Найдено статей: ',
      none: 'По вашему запросу ничего не найдено. Попробуйте другое слово.',
      suggestions: 'Быстрые подсказки',
      results: 'Подходящие материалы',
      open: 'Открыть статью'
    }
  },
  en: {
    scoreLabels: {
      excellent: 'Excellent range',
      good: 'Good range',
      fair: 'Fair range',
      poor: 'Needs improvement',
      result: 'Estimated score',
      category: 'Category',
      note: 'This is an educational estimate, not an official FICO score.'
    },
    rates: {
      loading: 'Loading current USD exchange rates...',
      title: 'USD rates (reference)',
      updated: 'Updated',
      fallback: 'Could not load exchange rates right now. Please try again later.'
    },
    search: {
      all: 'Showing all articles.',
      found: 'Articles found: ',
      none: 'No articles matched your search. Try another keyword.',
      suggestions: 'Quick suggestions',
      results: 'Best matches',
      open: 'Open article'
    }
  },
  az: {
    scoreLabels: {
      excellent: 'Ela seviye',
      good: 'Yaxsi seviye',
      fair: 'Orta seviye',
      poor: 'Yaxsilasdirmaga ehtiyac var',
      result: 'Təxmini bal',
      category: 'Kateqoriya',
      note: 'Bu resmi FICO deyil, tədris ucun texmini hesablamadir.'
    },
    rates: {
      loading: 'USD məzənnələri yüklənir...',
      title: 'USD məzənnələri (istinad üçün)',
      updated: 'Yenilənib',
      fallback: 'Məzənnələri indi yükləmək olmadı. Zəhmət olmasa sonra yenidən yoxlayın.'
    },
    search: {
      all: 'Bütün məqalələr göstərilir.',
      found: 'Tapılan məqalə sayı: ',
      none: 'Sorğunuza uyğun məqalə tapılmadı. Başqa açar söz yoxlayın.',
      suggestions: 'Sürətli təkliflər',
      results: 'Uyğun materiallar',
      open: 'Məqaləni aç'
    }
  }
};

const copy = translations[pageLanguage] || translations.ru;

const scoreForm = document.querySelector('#score-form');
const scoreResult = document.querySelector('#score-result');
const rateBox = document.querySelector('#rate-box');
const articleSearch = document.querySelector('#article-search');
const searchStatus = document.querySelector('#search-status');
const searchEmpty = document.querySelector('#search-empty');
const searchSuggestions = document.querySelector('#search-suggestions');
const searchResults = document.querySelector('#search-results');
const searchCards = Array.from(document.querySelectorAll('.search-card'));

const searchAliases = {
  ru: {
    'кредитка': 'кредитная карта credit card',
    'кредитный': 'credit kredit',
    'скор': 'score credit score',
    'страховка': 'insurance sigorta',
    'дебет': 'debit debit card'
  },
  en: {
    'score': 'credit score fico credit history',
    'debit': 'debit card budget',
    'credit': 'credit card credit score credit history',
    'insurance': 'coverage deductible premium renters auto health',
    'cashback': 'rewards credit card'
  },
  az: {
    'kredit': 'credit score credit card kredit bali kredit tarixcesi',
    'sigorta': 'insurance sığorta deductible premium',
    'debit': 'debit kart debit card',
    'kart': 'credit card debit card kredit karti debit kart',
    'bal': 'score credit score fico'
  }
};

function normalizeText(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9а-яёəğıöşü\s-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value) {
  return normalizeText(value).split(' ').filter(Boolean);
}

function expandQuery(query) {
  const aliases = searchAliases[pageLanguage] || {};
  const tokens = tokenize(query);
  const expanded = [...tokens];

  tokens.forEach((token) => {
    if (aliases[token]) {
      expanded.push(...tokenize(aliases[token]));
    }
  });

  return [...new Set(expanded)];
}

if (rateBox) {
  rateBox.textContent = copy.rates.loading;
}

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

    let zone = copy.scoreLabels.poor;
    if (score >= 740) zone = copy.scoreLabels.excellent;
    else if (score >= 670) zone = copy.scoreLabels.good;
    else if (score >= 580) zone = copy.scoreLabels.fair;

    scoreResult.innerHTML = `
      <strong>${copy.scoreLabels.result}: ${score}</strong><br>
      <span class="muted">${copy.scoreLabels.category}: ${zone}. ${copy.scoreLabels.note}</span>
    `;
  });
}

async function loadSearchExperience() {
  if (!articleSearch || !searchStatus || !searchCards.length) return;

  const searchIndexPath = document.body.dataset.searchIndex;
  if (!searchIndexPath) return;

  let entries = [];

  try {
    const response = await fetch(searchIndexPath, { cache: 'no-store' });
    if (!response.ok) throw new Error('Search index error');
    const index = await response.json();
    entries = index
      .filter((entry) => entry.lang === pageLanguage)
      .map((entry) => {
        const title = entry.title || '';
        const category = entry.category || '';
        const description = entry.description || '';
        const keywords = Array.isArray(entry.keywords) ? entry.keywords.join(' ') : '';
        const fullText = [title, category, description, keywords].join(' ');

        return {
          ...entry,
          pageUrl: pageLanguage === 'ru' ? entry.url : entry.url.replace(`${pageLanguage}/`, ''),
          normalizedTitle: normalizeText(title),
          normalizedCategory: normalizeText(category),
          normalizedDescription: normalizeText(description),
          normalizedKeywords: normalizeText(keywords),
          normalizedFullText: normalizeText(fullText),
          tokens: tokenize(fullText)
        };
      });
  } catch (error) {
    entries = [];
  }

  const rankEntry = (entry, query) => {
    const normalizedQuery = normalizeText(query);
    const expandedTokens = expandQuery(query);

    if (!normalizedQuery) return 0;

    let score = 0;

    if (entry.normalizedTitle.includes(normalizedQuery)) score += 120;
    if (entry.normalizedCategory.includes(normalizedQuery)) score += 70;
    if (entry.normalizedDescription.includes(normalizedQuery)) score += 40;
    if (entry.normalizedKeywords.includes(normalizedQuery)) score += 60;

    expandedTokens.forEach((token) => {
      if (entry.normalizedTitle.includes(token)) score += 20;
      if (entry.normalizedCategory.includes(token)) score += 10;
      if (entry.normalizedDescription.includes(token)) score += 6;
      if (entry.normalizedKeywords.includes(token)) score += 12;
    });

    const uniqueMatches = expandedTokens.filter((token) => entry.tokens.includes(token)).length;
    score += uniqueMatches * 8;

    return score;
  };

  const renderSuggestions = (matches) => {
    if (!searchSuggestions) return;

    const topSuggestions = matches.slice(0, 3);
    if (!topSuggestions.length) {
      searchSuggestions.hidden = true;
      searchSuggestions.innerHTML = '';
      return;
    }

    searchSuggestions.hidden = false;
      searchSuggestions.innerHTML = `
      <strong>${copy.search.suggestions}</strong>
      ${topSuggestions.map((entry) => `
        <a class="search-suggestion" href="${entry.pageUrl}">
          <span class="search-result-title">${entry.title}</span>
          <span class="search-meta">${entry.category}</span>
        </a>
      `).join('')}
    `;
  };

  const renderResults = (matches) => {
    if (!searchResults) return;

    if (!matches.length) {
      searchResults.hidden = true;
      searchResults.innerHTML = '';
      return;
    }

    searchResults.hidden = false;
    searchResults.innerHTML = `
      <strong>${copy.search.results}</strong>
      ${matches.slice(0, 3).map((entry) => `
        <a class="search-result-item" href="${entry.pageUrl}">
          <span class="search-result-title">${entry.title}</span>
          <span class="search-meta">${entry.category} · ${copy.search.open}</span>
          <span class="search-result-description">${entry.description}</span>
        </a>
      `).join('')}
    `;
  };

  const syncCards = (matches, query) => {
    const visibleUrls = new Set(matches.map((entry) => entry.pageUrl));
    let visibleCount = 0;

    searchCards.forEach((card) => {
      const link = card.querySelector('a');
      const href = link?.getAttribute('href');
      const shouldShow = !query || visibleUrls.has(href);
      card.classList.toggle('is-hidden', !shouldShow);
      if (shouldShow) visibleCount += 1;
    });

    return visibleCount;
  };

  const applySearch = () => {
    const query = articleSearch.value.trim();

    if (!query) {
      syncCards([], '');
      if (searchEmpty) searchEmpty.hidden = true;
      if (searchResults) {
        searchResults.hidden = true;
        searchResults.innerHTML = '';
      }
      if (searchSuggestions) {
        searchSuggestions.hidden = true;
        searchSuggestions.innerHTML = '';
      }
      searchStatus.textContent = copy.search.all;
      return;
    }

    const matches = entries
      .map((entry) => ({ ...entry, score: rankEntry(entry, query) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    const visibleCount = syncCards(matches, query);

    searchStatus.textContent = visibleCount
      ? `${copy.search.found}${visibleCount}.`
      : copy.search.none;

    if (searchEmpty) {
      searchEmpty.hidden = visibleCount !== 0;
    }

    renderSuggestions(matches);
    renderResults(matches);
  };

  articleSearch.addEventListener('input', applySearch);

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q');
  if (initialQuery) {
    articleSearch.value = initialQuery;
  }

  applySearch();
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
      <strong>${copy.rates.title}</strong><br>
      EUR: ${rates.EUR ?? '-'} | GBP: ${rates.GBP ?? '-'} | JPY: ${rates.JPY ?? '-'}<br>
      <small>${copy.rates.updated}: ${data.date || '-'}</small>
    `;
  } catch (error) {
    rateBox.innerHTML = `<small>${copy.rates.fallback}</small>`;
  }
}

loadSearchExperience();
loadUsdRate();
