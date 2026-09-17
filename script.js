const QUALIFICATION_POINTS = 7730;
const DATA_URL = 'data.json';

const COUNTRY_FLAGS = {
    ES: '🇪🇸', SR: '🇷🇸', DE: '🇩🇪', IT: '🇮🇹', US: '🇺🇸', GB: '🇬🇧', FR: '🇫🇷',
    AU: '🇦🇺', RU: '🇷🇺', GR: '🇬🇷', NO: '🇳🇴', CA: '🇨🇦', AR: '🇦🇷', CZ: '🇨🇿',
    PL: '🇵🇱', UK: '🇬🇧', CHN: '🇨🇳', GBR: '🇬🇧', FRA: '🇫🇷', USA: '🇺🇸', AUS: '🇦🇺',
    ITA: '🇮🇹', ESP: '🇪🇸', MON: '🇲🇨', CAN: '🇨🇦'
};

const TZ_MAP = {
    AUS: 'Australia/Melbourne', ESP: 'Europe/Madrid', FRA: 'Europe/Paris', GBR: 'Europe/London',
    USA: 'America/New_York', ITA: 'Europe/Rome', MON: 'Europe/Monaco', CHN: 'Asia/Shanghai',
    GER: 'Europe/Berlin', CAN: 'America/Toronto', SRB: 'Europe/Belgrade'
};

let currentLang = localStorage.getItem('language') || 'en';
let currentMatchFilter = 'all';
let currentChartMode = 'season';
let currentTrophyFilter = 'all';
let nextTimer = null;

const T = {
    en: {
        navOverview: 'Overview', navPerformance: 'Performance', navRoadmap: 'Roadmap', navHistory: 'History',
        navTrophies: 'Trophies', navRivalries: 'H2H', navTournaments: 'Tournaments',
        heroEyebrow: 'The Fox Dashboard', heroSubtitle: 'World No. {ranking} · Italian tennis player', liveNow: 'Live Now', recentForm: 'Recent Form', winStreak: 'Win Streak',
        viewMatches: 'View Matches', shareBanner: 'Share', installApp: 'Install App',
        rankingTitle: 'ATP Ranking', titlesYTD: 'Titles YTD', winLossTitle: 'Win / Loss', pointsTitle: 'ATP Points',
        streakTitle: 'Current Streak', overviewTitle: 'Season Overview', freshness: 'Data fresh',
        goldenMastersTitle: 'Career Golden Masters', goldenMastersSub: 'All 9 ATP Masters 1000 Titles Conquered',
        raceToTurin: 'Race to Turin', qualificationLine: 'Qualification line', qualifying: 'Qualification in progress…',
        qualified: 'QUALIFIED ✓', aboveLine: 'above the line', belowLine: 'to the line',
        performanceTitle: 'Performance', seasonStats: 'Season snapshot', foxStats: 'The Fox Stats',
        foxStatsSub: 'Key serve and return percentages', surfaceMastery: 'Surface Mastery',
        surfaceSub: 'Wins by court type', winsYTD: 'Wins YTD', bioTitle: 'Identity Card', bioSub: 'Player profile',
        bioHeight: 'Height', bioWeight: 'Weight', bioPlays: 'Plays', bioPro: 'Pro Since', bioCoaches: 'Coaching Team', birthplace: 'Birthplace',
        roadwayTitle: 'Roadmap', roadmapTitle: 'Roadmap', majorEvents: 'Next Major Events', historyTitle: 'Match & Points History',
        historySub: 'Recent results and season movement', recentMatches: 'Recent Matches', recentMatchesSub: 'Latest recorded results',
        pointsEvolution: 'Points Evolution', pointsEvolutionSub: 'Tournament movement and saved history',
        trophyCabinet: 'Trophy Cabinet', rivalries: 'Epic Rivalries', h2hSub: 'Head-to-head snapshot',
        pigeon: 'Best H2H', nemesis: 'Worst H2H', h2hMethod: 'Best / worst H2H is calculated from the win-loss differential against the tracked rivals.', h2hDifference: 'Differential',
        tournaments: 'Tournament Breakdown', tournamentsSub: 'Defending vs earned points',
        matchContext: 'Next Match', eventContext: 'Next Event', localTime: 'Local', yourTime: 'Your Time',
        countdownPrefix: 'Starts in', dataUpdated: 'Last updated', offline: 'Offline', online: 'Online',
        cached: 'Showing cached data', cacheNote: 'Last cached snapshot',
        sourceFallback: 'Schedule fallback · roadmap', noMatch: 'No confirmed opponent yet',
        footerText: 'Sinner Tracker 2026 - Unofficial Fan Dashboard',
        serveIn: '1st Serve In', bpSaved: 'BPs Saved', retWon: '1st Return Won', bpConv: 'BPs Converted',
        tournament: 'Tournament', defendingHeader: 'Defending', earnedHeader: 'Earned', netDiffHeader: 'Net Diff',
        apiError: 'Statistic unavailable due to an external error.',
        all: 'All', wins: 'Wins', losses: 'Losses', season: 'Season', net: 'Net', filterWin: 'W', filterLoss: 'L',
        gs: 'Grand Slam', masters: 'Masters 1000', finals: 'ATP Finals',
        noData: 'No data available', historyStartsToday: 'Historical snapshots start from the first automated sync.', netMovementNote: 'Net movement = earned − defending points.',
        resultWin: 'W', resultLoss: 'L', dataSource: 'Data source', surfaceHard: 'Hard', surfaceClay: 'Clay', surfaceGrass: 'Grass', indoorHard: 'Indoor Hard',
        unknown: 'Unknown'
    },
    it: {
        navOverview: 'Overview', navPerformance: 'Prestazioni', navRoadmap: 'Calendario', navHistory: 'Storico',
        navTrophies: 'Trofei', navRivalries: 'H2H', navTournaments: 'Tornei',
        heroEyebrow: 'The Fox Dashboard', heroSubtitle: 'N. {ranking} al mondo · Tennista italiano', liveNow: 'In Diretta', recentForm: 'Forma Recente', winStreak: 'Striscia di vittorie',
        viewMatches: 'Vedi Partite', shareBanner: 'Condividi', installApp: 'Installa App',
        rankingTitle: 'Classifica ATP', titlesYTD: 'Titoli YTD', winLossTitle: 'Vittorie / Sconfitte', pointsTitle: 'Punti ATP',
        streakTitle: 'Striscia Attuale', overviewTitle: 'Panoramica Stagione', freshness: 'Dati aggiornati',
        goldenMastersTitle: 'Career Golden Masters', goldenMastersSub: 'Tutti e 9 i titoli Masters 1000 conquistati',
        raceToTurin: 'Corsa per Torino', qualificationLine: 'Soglia qualificazione', qualifying: 'Qualificazione in corso…',
        qualified: 'QUALIFICATO ✓', aboveLine: 'sopra la soglia', belowLine: 'alla soglia',
        performanceTitle: 'Prestazioni', seasonStats: 'Snapshot stagionale', foxStats: 'The Fox Stats',
        foxStatsSub: 'Percentuali chiave al servizio e in risposta', surfaceMastery: 'Vittorie per Superficie',
        surfaceSub: 'Vittorie per tipo di campo', winsYTD: 'Vittorie YTD', bioTitle: 'Carta d\'Identità', bioSub: 'Profilo giocatore',
        bioHeight: 'Altezza', bioWeight: 'Peso', bioPlays: 'Mano', bioPro: 'Pro dal', bioCoaches: 'Team Tecnico', birthplace: 'Luogo di nascita',
        roadmapTitle: 'Calendario', majorEvents: 'Prossimi Grandi Eventi', historyTitle: 'Storico Partite & Punti',
        historySub: 'Risultati recenti e andamento stagionale', recentMatches: 'Partite Recenti', recentMatchesSub: 'Ultimi risultati registrati',
        pointsEvolution: 'Evoluzione Punti', pointsEvolutionSub: 'Movimento per torneo e storico salvato',
        trophyCabinet: 'Bacheca Trofei', rivalries: 'Rivalità', h2hSub: 'Situazione testa a testa',
        pigeon: 'Miglior H2H', nemesis: 'Peggior H2H', h2hMethod: 'Il miglior / peggior H2H è calcolato sulla differenza tra vittorie e sconfitte contro i rivali monitorati.', h2hDifference: 'Differenza',
        tournaments: 'Dettaglio Tornei', tournamentsSub: 'Punti da difendere vs guadagnati',
        matchContext: 'Prossima Partita', eventContext: 'Prossimo Evento', localTime: 'Locale', yourTime: 'Tuo Orario',
        countdownPrefix: 'Inizia tra', dataUpdated: 'Ultimo aggiornamento', offline: 'Offline', online: 'Online',
        cached: 'Visualizzazione dati in cache', cacheNote: 'Ultimo snapshot salvato',
        sourceFallback: 'Fallback calendario · roadmap', noMatch: 'Avversario non ancora confermato',
        footerText: 'Sinner Tracker 2026 - Dashboard Non Ufficiale',
        serveIn: '1ª di Servizio', bpSaved: 'PB Salvate', retWon: '1ª Risposta Vinta', bpConv: 'PB Convertite',
        tournament: 'Torneo', defendingHeader: 'Da Difendere', earnedHeader: 'Guadagnati', netDiffHeader: 'Differenza',
        apiError: 'Statistica non disponibile per un problema esterno.',
        all: 'Tutti', wins: 'Vittorie', losses: 'Sconfitte', season: 'Stagione', net: 'Netto', filterWin: 'V', filterLoss: 'S',
        gs: 'Grand Slam', masters: 'Masters 1000', finals: 'ATP Finals',
        noData: 'Nessun dato disponibile', historyStartsToday: 'Lo storico parte dal primo aggiornamento automatico.', netMovementNote: 'Variazione netta = punti guadagnati − punti da difendere.',
        resultWin: 'V', resultLoss: 'S', dataSource: 'Fonte dei dati', surfaceHard: 'Cemento', surfaceClay: 'Terra', surfaceGrass: 'Erba', indoorHard: 'Cemento Indoor', unknown: 'Sconosciuto'
    }
};

window._lastData = null;
window._radarChart = null;
window._doughnutChart = null;
window._lineChart = null;

const t = key => T[currentLang][key] ?? key;
const fmt = value => Number(value ?? 0).toLocaleString('en-US');

function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[c]));
}

function initTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', isDark);
    updateThemeButton(isDark);
}

function updateThemeButton(isDark) {
    const btn = document.getElementById('dark-mode-btn');
    if (!btn) return;
    btn.textContent = isDark ? '☀️' : '🌙';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeButton(isDark);
    if (window._lastData) {
        renderRadarChart(window._lastData.stats);
        renderDoughnutChart(window._lastData.surface_mastery);
        renderPointsChart(window._lastData);
    }
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (T[currentLang][key]) el.textContent = T[currentLang][key];
    });
    document.getElementById('lang-btn').textContent = currentLang === 'en' ? 'IT' : 'EN';
    if (window._lastData) renderDashboard(window._lastData);
}

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'it' : 'en';
    localStorage.setItem('language', currentLang);
    applyTranslations();
}

function setNetworkStatus() {
    const online = navigator.onLine;
    const pill = document.getElementById('network-status');
    const label = document.getElementById('network-status-text');
    pill?.classList.toggle('online', online);
    pill?.classList.toggle('offline', !online);
    if (label) label.textContent = online ? t('online') : t('offline');
}

function formatRelativeTime(iso) {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
    if (seconds < 60) return currentLang === 'it' ? 'meno di un minuto fa' : 'less than a minute ago';
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return currentLang === 'it' ? `${mins} min fa` : `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return currentLang === 'it' ? `${hours} h fa` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return currentLang === 'it' ? `${days} g fa` : `${days}d ago`;
}

function formatDate(iso, options = {}) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    const locale = currentLang === 'it' ? 'it-IT' : 'en-US';
    return date.toLocaleDateString(locale, options);
}

function formatMatchDay(date) {
    if (currentLang === 'it') {
        const weekdays = [
            'Domenica',
            'Lunedì',
            'Martedì',
            'Mercoledì',
            'Giovedì',
            'Venerdì',
            'Sabato'
        ];

        const months = [
            'Gennaio',
            'Febbraio',
            'Marzo',
            'Aprile',
            'Maggio',
            'Giugno',
            'Luglio',
            'Agosto',
            'Settembre',
            'Ottobre',
            'Novembre',
            'Dicembre'
        ];

        return `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
    }

    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    const locale = currentLang === 'it' ? 'it-IT' : 'en-US';
    return date.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
}

function isValidMatch(match) {
    return match && match.tournament && match.tournament !== 'Unknown Tournament' && match.date;
}

function getNextEvent(data) {
    const now = Date.now();
    const items = Array.isArray(data.roadmap) ? data.roadmap
        .map(item => ({ ...item, ts: new Date(item.date).getTime() }))
        .filter(item => Number.isFinite(item.ts) && item.ts >= now - 86400000)
        .sort((a, b) => a.ts - b.ts) : [];
    return items[0] || null;
}

function resolveNextContext(data) {
    const match = isValidMatch(data.next_match) ? data.next_match : null;
    if (match) return { type: 'match', item: match };
    const event = getNextEvent(data);
    return { type: 'event', item: event };
}

function renderFreshness(data) {
    const relative = formatRelativeTime(data.last_updated);
    const full = formatDateTime(data.last_updated);
    const text = `${t('dataUpdated')} ${relative}`;
    document.getElementById('last-updated-header').textContent = text;
    document.getElementById('freshness-label').textContent = text;
    document.getElementById('footer-updated').textContent = full;
    document.getElementById('last-updated-header').title = full;
    document.getElementById('freshness-label').title = full;
}

function renderHero(data) {
    const context = resolveNextContext(data);
    const match = context.type === 'match' ? context.item : null;
    const event = context.type === 'event' ? context.item : null;
    const label = document.getElementById('next-context-label');
    const tournament = document.getElementById('next-tournament-display');
    const opponent = document.getElementById('next-opponent-display');
    const round = document.getElementById('next-round-display');
    const local = document.getElementById('next-date-local');
    const user = document.getElementById('next-date-user');
    const day = document.getElementById('next-date-day');
    const source = document.getElementById('next-source-note');
    const banner = document.getElementById('hero-banner');
    const live = document.getElementById('hero-live-badge');

    document.getElementById('hero-rank-badge').textContent = `#${data.ranking ?? '—'} ATP`;
    document.getElementById('ranking-display').textContent = `#${data.ranking ?? '—'}`;
    document.getElementById('hero-subtitle').textContent = t('heroSubtitle').replace('{ranking}', data.ranking ?? '—');

    const next = context.item;
    if (!next) {
        label.textContent = t('eventContext');
        tournament.textContent = t('noData');
        opponent.textContent = t('noData');
        round.textContent = '—';
        local.textContent = '—'; user.textContent = '—'; day.textContent = '—'; source.textContent = '—';
        return;
    }

    label.textContent = context.type === 'match' ? t('matchContext') : t('eventContext');
    tournament.textContent = next.tournament || next.name || t('unknown');
    opponent.textContent = context.type === 'match'
        ? (next.opponent && !['TBD', 'Unknown Player'].includes(next.opponent) ? `vs ${next.opponent}` : t('noMatch'))
        : `${next.country ? (COUNTRY_FLAGS[next.country] || next.country) : ''} ${next.court || ''}`.trim();
    round.textContent = next.round || (next.court || '—');
    source.textContent = context.type === 'match' ? 'Tennis API · scheduled match' : t('sourceFallback');

    if (next.date) {
        updateNextDate(next.date, next.countryAcr || next.country || 'ITA', local, user, day, banner, live);
        scheduleNextTimer(next.date);
    }
}

function updateNextDate(iso, country, localEl, userEl, dayEl, banner, liveEl) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return;
    const locale = currentLang === 'it' ? 'it-IT' : 'en-US';
    const timeOpts = { hour: '2-digit', minute: '2-digit', hour12: false };
    const tz = TZ_MAP[country] || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const isLive = Date.now() >= date.getTime() && Date.now() <= date.getTime() + 3 * 3600 * 1000;
    banner.classList.toggle('live', isLive);
    liveEl.classList.toggle('hidden', !isLive);
    if (isLive) clearTimeout(nextTimer);
    const hasTime = !iso.endsWith('T00:00:00Z');
    localEl.textContent = hasTime ? date.toLocaleTimeString(locale, { ...timeOpts, timeZone: tz }) : '—';
    userEl.textContent = hasTime ? date.toLocaleTimeString(locale, timeOpts) : '—';
    dayEl.textContent = formatMatchDay(date);
}

function scheduleNextTimer(iso) {
    clearTimeout(nextTimer);
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return;
    const tick = () => {
        const diff = date.getTime() - Date.now();
        const el = document.getElementById('next-countdown');
        if (!el) return;
        if (diff <= 0) {
            el.textContent = t('liveNow');
            return;
        }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        el.textContent = `${t('countdownPrefix')} ${d}d ${h}h ${m}m`;
        nextTimer = setTimeout(tick, 60000);
    };
    tick();
}

function renderHeroForm(data) {
    const form = document.getElementById('recent-form-display');
    const recent = Array.isArray(data.recent_form) ? data.recent_form : [];
    if (!recent.length) {
        form.innerHTML = `<span class="text-xs text-slate-400">${escapeHTML(t('noData'))}</span>`;
        return;
    }
    form.innerHTML = recent.map((m, i) => {
        const isWin = Boolean(m.win);
        const opponent = escapeHTML(m.opponent || t('unknown'));
        const result = escapeHTML(m.result || '');
        return `<span class="form-dot ${isWin ? 'win' : 'loss'}" tabindex="0" aria-label="${isWin ? t('resultWin') : t('resultLoss')} vs ${opponent}">${isWin ? t('resultWin') : t('resultLoss')}<span class="tooltip"><strong>${opponent}</strong><br>${result}</span></span>`;
    }).join('');
    const streak = Number(data.current_streak || 0);
    const badge = document.getElementById('hero-streak-badge');
    document.getElementById('hero-streak-count').textContent = streak;
    badge.classList.toggle('hidden', streak < 3);
    document.getElementById('current-streak-display').textContent = streak;
}

function renderHeroStats(data) {
    const trophies = Array.isArray(data.trophies) ? data.trophies : [];
    const year = new Date().getFullYear();
    const ytd = trophies.filter(trophy => Number(trophy.year) === year && trophy.title !== 'Career Golden Masters').length;
    document.getElementById('titles-ytd-display').textContent = ytd;
    document.getElementById('win-loss-display').textContent = (data.win_loss || '0–0').replace('-', '–');
    document.getElementById('total-points-display').textContent = fmt(data.total_points);
}

function populateRace(data) {
    const racePoints = Number(data.race_points ?? (data.tournaments || []).reduce((sum, x) => sum + Number(x.earned || 0), 0));
    const pct = Math.min((racePoints / QUALIFICATION_POINTS) * 100, 100);
    const delta = racePoints - QUALIFICATION_POINTS;
    document.getElementById('race-points-display').textContent = fmt(racePoints);
    document.getElementById('race-pct-display').textContent = `${pct.toFixed(1)}%`;
    document.getElementById('race-line-value').textContent = fmt(QUALIFICATION_POINTS);
    document.getElementById('race-qualifier-label').textContent = `/ ${fmt(QUALIFICATION_POINTS)} pts`;
    const bar = document.getElementById('bar-race');
    requestAnimationFrame(() => { if (bar) bar.style.width = `${pct}%`; });
    const status = document.getElementById('race-status');
    const deltaEl = document.getElementById('race-delta');
    if (delta >= 0) {
        status.textContent = t('qualified');
        status.className = 'label-xs mt-1 text-green-500';
        deltaEl.textContent = `+${fmt(delta)} ${t('aboveLine')}`;
    } else {
        status.textContent = t('qualifying');
        status.className = 'label-xs mt-1 text-muted';
        deltaEl.textContent = `${fmt(Math.abs(delta))} ${t('belowLine')}`;
    }
}

function populateBio(bio) {
    if (!bio) return;
    document.getElementById('bio-height').textContent = bio.height ? `${bio.height} cm` : '—';
    document.getElementById('bio-weight').textContent = bio.weight ? `${bio.weight} kg` : '—';
    document.getElementById('bio-pro').textContent = bio.turned_pro || '—';
    document.getElementById('bio-coach').textContent = bio.coach || '—';
    document.getElementById('bio-birthplace').textContent = bio.birthplace || '—';
    const hand = bio.plays?.split(',')[0] || '';
    document.getElementById('bio-plays').textContent = currentLang === 'it'
        ? (hand.toLowerCase().includes('right') ? 'Destro' : hand.toLowerCase().includes('left') ? 'Mancino' : hand || '—')
        : hand || '—';
}

function renderPerformanceStats(stats) {
    if (!stats) return;
    const items = [
        ['serveIn', t('serveIn'), stats.first_serve_in],
        ['bpSaved', t('bpSaved'), stats.break_points_saved],
        ['retWon', t('retWon'), stats.first_return_won],
        ['bpConv', t('bpConv'), stats.break_points_converted]
    ];
    document.getElementById('performance-stat-grid').innerHTML = items.map(([key, label, value]) => `
        <div class="mini-stat">
            <span>${escapeHTML(label)}</span>
            <strong>${Number(value ?? 0).toFixed(1)}%</strong>
        </div>`).join('');
}

function renderRadarChart(stats) {
    const el = document.getElementById('radarChart');
    if (!el || !stats || typeof Chart === 'undefined') return;
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255,255,255,.09)' : 'rgba(0,0,0,.08)';
    if (window._radarChart) window._radarChart.destroy();
    window._radarChart = new Chart(el.getContext('2d'), {
        type: 'radar',
        data: {
            labels: [t('serveIn'), t('bpSaved'), t('retWon'), t('bpConv')],
            datasets: [{ data: [stats.first_serve_in, stats.break_points_saved, stats.first_return_won, stats.break_points_converted],
                backgroundColor: 'rgba(249,115,22,.14)', borderColor: '#f97316', borderWidth: 2.5,
                pointBackgroundColor: '#f97316', pointBorderColor: '#fff', pointBorderWidth: 1.5, pointRadius: 4 }]
        },
        options: {
            responsive: true, maintainAspectRatio: true,
            scales: { r: { angleLines: { color: gridColor }, grid: { color: gridColor },
                pointLabels: { color: textColor, font: { size: 11, weight: '700', family: 'Montserrat' } },
                ticks: { display: false }, suggestedMin: 0, suggestedMax: 100 } },
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${c.raw}%` } } }
        }
    });
}

function surfaceLabel(name) {
    const key = { Hard: 'surfaceHard', Clay: 'surfaceClay', Grass: 'surfaceGrass' }[name] || name;
    return t(key);
}

function renderDoughnutChart(surface) {
    const el = document.getElementById('doughnutChart');
    if (!el || !surface || typeof Chart === 'undefined') return;
    const values = [surface.Hard ?? 0, surface.Clay ?? 0, surface.Grass ?? 0];
    const total = values.reduce((a, b) => a + Number(b), 0);
    document.getElementById('total-wins-center').textContent = total;
    document.getElementById('surface-stat-list').innerHTML = ['Hard','Clay','Grass'].map((name, i) => `
        <div class="surface-row"><span>${escapeHTML(surfaceLabel(name))}</span><strong>${fmt(values[i])}</strong></div>`).join('');
    const isDark = document.documentElement.classList.contains('dark');
    if (window._doughnutChart) window._doughnutChart.destroy();
    window._doughnutChart = new Chart(el.getContext('2d'), {
        type: 'doughnut',
        data: { labels: ['Hard', 'Clay', 'Grass'].map(surfaceLabel), datasets: [{ data: values,
            backgroundColor: ['#3b82f6', '#ea580c', '#22c55e'], borderWidth: isDark ? 2 : 0, borderColor: '#111827', hoverOffset: 6 }] },
        options: { responsive: true, maintainAspectRatio: true, cutout: '76%', plugins: {
            legend: { position: 'bottom', labels: { color: isDark ? '#94a3b8' : '#64748b', padding: 14, usePointStyle: true, pointStyle: 'circle', font: { family: 'Montserrat', size: 11, weight: '700' }, boxWidth: 8 } }
        } }
    });
}

function formatCourtLabel(court) {
    const normalized = String(court ?? '').trim();
    if (!normalized) return '—';

    if (/^i\.?hard$/i.test(normalized) || /^indoor\s*hard$/i.test(normalized)) {
        return t('indoorHard');
    }

    if (/^hard$/i.test(normalized)) {
        return t('surfaceHard');
    }

    if (/^clay$/i.test(normalized)) {
        return t('surfaceClay');
    }

    if (/^grass$/i.test(normalized)) {
        return t('surfaceGrass');
    }

    return normalized;
}

function renderRoadmap(items) {
    const container = document.getElementById('roadmap-container');
    if (!container) return;
    const now = Date.now();
    const events = (Array.isArray(items) ? items : []).slice().sort((a,b) => new Date(a.date) - new Date(b.date));
    if (!events.length) { container.innerHTML = `<p class="text-sm text-muted">${escapeHTML(t('noData'))}</p>`; return; }
    container.innerHTML = events.map((event, i) => {
        const d = new Date(event.date);
        const isPast = d.getTime() < now;
        const isNext = !isPast && events.slice(0, i).every(e => new Date(e.date).getTime() < now);
        const dateLabel = formatDate(event.date, { month: 'short', day: 'numeric' });
        const flag = COUNTRY_FLAGS[event.country] || event.country || '';
        return `<article class="roadmap-stop ${isPast ? 'past' : ''} ${isNext ? 'next' : ''}">
            <div class="roadmap-dot" aria-hidden="true"></div>
            <div class="roadmap-info">
                ${isNext ? `<span class="roadmap-next">NEXT</span>` : ''}
                <p class="roadmap-date">${dateLabel} · ${flag}</p>
                <h3 class="roadmap-name">${escapeHTML(event.name)}</h3>
                <p class="roadmap-court">${escapeHTML(formatCourtLabel(event.court))}</p>
            </div>
        </article>`;
    }).join('');
}

function renderMatchHistory(data) {
    const list = document.getElementById('match-history-list');
    const matches = Array.isArray(data.recent_form) ? data.recent_form : [];
    const filtered = matches.filter(m => currentMatchFilter === 'all' || (currentMatchFilter === 'win' ? m.win : !m.win));
    if (!filtered.length) { list.innerHTML = `<div class="empty-state">${escapeHTML(t('noData'))}</div>`; return; }
    list.innerHTML = filtered.map(match => {
        const win = Boolean(match.win);
        return `<article class="match-row">
            <div class="result-badge ${win ? 'win' : 'loss'}">${win ? t('resultWin') : t('resultLoss')}</div>
            <div class="match-main"><strong>${escapeHTML(match.opponent || t('unknown'))}</strong><span>${escapeHTML(match.result || '—')}</span></div>
        </article>`;
    }).join('');
}

function buildPointSeries(data) {
    const history = Array.isArray(data.history?.points) ? data.history.points.slice().sort((a,b) => new Date(a.date) - new Date(b.date)) : [];
    if (history.length >= 2) {
        return { labels: history.map(x => formatDate(x.date, { month: 'short', day: 'numeric' })), values: history.map(x => x.points), note: t('historyStartsToday') };
    }
    const tournaments = Array.isArray(data.tournaments) ? data.tournaments : [];
    const totalNetDiff = tournaments.reduce((s, x) => s + (Number(x.earned || 0) - Number(x.defending || 0)), 0);
    let running = Number(data.total_points || 0) - totalNetDiff;
    const values = tournaments.map(x => { running += Number(x.earned || 0) - Number(x.defending || 0); return running; });
    return { labels: tournaments.map(x => x.name), values, note: t('historyStartsToday') };
}


function renderPointsChart(data) {
    const el = document.getElementById('pointsChart');
    if (!el || typeof Chart === 'undefined') return;
    const isDark = document.documentElement.classList.contains('dark');
    const axis = isDark ? '#475569' : '#e2e8f0';
    const labels = currentChartMode === 'net' ? (data.tournaments || []).map(x => x.name) : buildPointSeries(data).labels;
    let values;
    if (currentChartMode === 'net') {
        let total = 0;
        values = (data.tournaments || []).map(x => { total += Number(x.earned || 0) - Number(x.defending || 0); return total; });
    } else {
        values = buildPointSeries(data).values;
    }
    if (window._lineChart) window._lineChart.destroy();
    window._lineChart = new Chart(el.getContext('2d'), {
        type: 'line', data: { labels, datasets: [{ data: values, borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,.08)', fill: true, tension: .36, borderWidth: 3, pointBackgroundColor: '#f97316', pointRadius: 4, pointHoverRadius: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: 'index' },
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${fmt(c.raw)} pts` } } },
            scales: { y: { grid: { color: axis }, ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { family: 'Montserrat', size: 11, weight: '700' } } },
                      x: { grid: { display: false }, ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { family: 'Montserrat', size: 10, weight: '700' }, maxRotation: 32 } } }
        }
    });
    document.getElementById('points-history-note').textContent = currentChartMode === 'season' ? buildPointSeries(data).note : t('netMovementNote');
}

function renderTrophies(trophies) {
    const cabinet = document.getElementById('trophy-cabinet');
    const filterHost = document.getElementById('trophy-filters');
    const all = Array.isArray(trophies) ? trophies : [];
    const categories = [
        ['all', t('all')], ['Grand Slam', t('gs')], ['Masters 1000', t('masters')], ['ATP Finals', t('finals')]
    ];

    filterHost.innerHTML = categories.map(([value, label]) => `
        <button class="filter-btn ${currentTrophyFilter === value ? 'active' : ''}" data-trophy-filter="${escapeHTML(value)}" type="button">${escapeHTML(label)}</button>
    `).join('');

    const groupedMap = new Map();
    for (const trophy of all) {
        const title = String(trophy.title || t('unknown'));
        const normalizedCategory = title === 'Career Golden Masters' ? 'Masters 1000' : (trophy.category || 'Masters 1000');
        const key = `${normalizedCategory}::${title}`;
        if (!groupedMap.has(key)) {
            groupedMap.set(key, { title, category: normalizedCategory, years: [] });
        }
        const year = trophy.year;
        if (year !== undefined && year !== null && !groupedMap.get(key).years.includes(String(year))) {
            groupedMap.get(key).years.push(String(year));
        }
    }

    const grouped = Array.from(groupedMap.values()).sort((a, b) => {
        const ay = Math.min(...a.years.map(Number).filter(Number.isFinite), 9999);
        const by = Math.min(...b.years.map(Number).filter(Number.isFinite), 9999);
        return by - ay || a.title.localeCompare(b.title);
    });

    const filtered = currentTrophyFilter === 'all'
        ? grouped
        : grouped.filter(x => x.category === currentTrophyFilter);

    document.getElementById('trophy-count').textContent = `${filtered.length} ${currentLang === 'it' ? 'competizioni' : 'competitions'}`;

    cabinet.innerHTML = filtered.map(trophy => {
        const cls = trophy.title === 'Career Golden Masters'
            ? 'golden'
            : trophy.category === 'Grand Slam'
                ? 'slam'
                : trophy.category === 'ATP Finals'
                    ? 'finals'
                    : 'masters';
        const icon = trophy.title === 'Career Golden Masters'
            ? '👑'
            : trophy.category === 'ATP Finals'
                ? '🥇'
                : '🏆';
        const yearsLabel = trophy.years.join(' · ') || '—';
        return `<article class="trophy-card ${cls}">
            <div class="trophy-icon" aria-hidden="true">${icon}</div>
            <div class="trophy-name">${escapeHTML(trophy.title)}</div>
            <span class="year-badge">${escapeHTML(yearsLabel)}</span>
        </article>`;
    }).join('');
}

function renderH2H(rivalries, special) {
    const host = document.getElementById('h2h-container');
    const items = Array.isArray(rivalries) ? rivalries : [];
    host.innerHTML = items.map(rival => {
        const total = Number(rival.wins || 0) + Number(rival.losses || 0);
        const winPct = total ? (Number(rival.wins || 0) / total) * 100 : 0;
        const flag = COUNTRY_FLAGS[rival.country] || '';
        return `<article class="h2h-card card glass"><div class="flex items-start justify-between gap-3"><div><p class="font-black">${flag} ${escapeHTML(rival.name)}</p><p class="text-xs text-muted mt-1">${rival.wins}–${rival.losses}</p></div><span class="h2h-percent">${winPct.toFixed(0)}%</span></div><div class="h2h-bar mt-4"><span class="h2h-bar-win" style="width:${winPct}%"></span><span class="h2h-bar-loss" style="width:${100 - winPct}%"></span></div><div class="flex justify-between text-[11px] text-muted mt-2"><span>${rival.wins} ${t('wins').toLowerCase()}</span><span>${rival.losses} ${t('losses').toLowerCase()}</span></div></article>`;
    }).join('');
    if (special?.pigeon) {
        document.getElementById('pigeon-name').textContent = special.pigeon.name;
        document.getElementById('pigeon-score').textContent = `${special.pigeon.wins}–${special.pigeon.losses}`;
        document.getElementById('pigeon-detail').textContent = `${t('h2hDifference')}: +${Math.max(0, special.pigeon.diff ?? (special.pigeon.wins - special.pigeon.losses))}`;
    }
    if (special?.nemesis) {
        document.getElementById('nemesis-name').textContent = special.nemesis.name;
        document.getElementById('nemesis-score').textContent = `${special.nemesis.wins}–${special.nemesis.losses}`;
        document.getElementById('nemesis-detail').textContent = `${t('h2hDifference')}: ${special.nemesis.diff ?? (special.nemesis.wins - special.nemesis.losses)}`;
    }
}

function renderTableAndPoints(tournaments) {
    const tbody = document.getElementById('tournament-data');
    tbody.innerHTML = (Array.isArray(tournaments) ? tournaments : []).map(tournament => {
        const earned = Number(tournament.earned || 0); const defending = Number(tournament.defending || 0); const diff = earned - defending;
        return `<tr><td class="font-bold">${escapeHTML(tournament.name)}</td><td class="text-center">${fmt(defending)}</td><td class="text-center font-bold">${fmt(earned)}</td><td class="text-center ${diff > 0 ? 'positive' : diff < 0 ? 'negative' : ''}">${diff > 0 ? '+' : ''}${fmt(diff)}</td></tr>`;
    }).join('');
}

function renderDashboard(data) {
    window._lastData = data;
    applyTranslationsOnce();
    renderFreshness(data);
    renderHero(data);
    renderHeroForm(data);
    renderHeroStats(data);
    populateRace(data);
    populateBio(data.bio);
    renderPerformanceStats(data.stats);
    renderRadarChart(data.stats);
    renderDoughnutChart(data.surface_mastery);
    renderRoadmap(data.roadmap);
    renderMatchHistory(data);
    renderPointsChart(data);
    renderTrophies(data.trophies);
    renderH2H(data.rivalries, data.special_h2h);
    renderTableAndPoints(data.tournaments);
}

function applyTranslationsOnce() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (T[currentLang][key]) el.textContent = T[currentLang][key];
    });
    document.getElementById('lang-btn').textContent = currentLang === 'en' ? 'IT' : 'EN';
    setNetworkStatus();
}

function renderErrorState(message = t('apiError')) {
    const targets = ['match-history-list', 'roadmap-container'];
    targets.forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = `<div class="empty-state">⚠️ ${escapeHTML(message)}</div>`; });
}

async function loadData() {
    try {
        const response = await fetch(`${DATA_URL}?v=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.warn('Network data load failed, trying cached response:', error);
        try {
            const cache = await caches.open('sinner-tracker-runtime-v8');
            const cached = await cache.match(DATA_URL) || await cache.match(new Request(DATA_URL));
            if (cached) return await cached.json();
        } catch (cacheError) {
            console.warn('Cache fallback failed:', cacheError);
        }
        throw error;
    }
}

async function initDashboard() {
    try {
        const data = await loadData();
        renderDashboard(data);
        setNetworkStatus();
        setupInteractions();
    } catch (error) {
        console.error('Dashboard init error:', error);
        renderErrorState();
    }
}

function setupInteractions() {
    document.getElementById('dark-mode-btn')?.addEventListener('click', toggleDarkMode);
    document.getElementById('lang-btn')?.addEventListener('click', toggleLanguage);
    window.addEventListener('online', setNetworkStatus);
    window.addEventListener('offline', setNetworkStatus);
    document.querySelectorAll('[data-match-filter]').forEach(btn => btn.addEventListener('click', () => {
        currentMatchFilter = btn.dataset.matchFilter;
        document.querySelectorAll('[data-match-filter]').forEach(x => x.classList.toggle('active', x === btn));
        renderMatchHistory(window._lastData);
    }));
    document.querySelectorAll('[data-chart-mode]').forEach(btn => btn.addEventListener('click', () => {
        currentChartMode = btn.dataset.chartMode;
        document.querySelectorAll('[data-chart-mode]').forEach(x => x.classList.toggle('active', x === btn));
        renderPointsChart(window._lastData);
    }));
    document.getElementById('trophy-filters')?.addEventListener('click', event => {
        const btn = event.target.closest('[data-trophy-filter]');
        if (!btn) return;
        currentTrophyFilter = btn.dataset.trophyFilter;
        renderTrophies(window._lastData.trophies);
    });
    initShareButton();
    initInstallPrompt();
}

function initShareButton() {
    const btn = document.getElementById('share-btn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        const hero = document.getElementById('hero-banner');
        try {
            if (navigator.share && typeof html2canvas === 'undefined') {
                await navigator.share({ title: 'Sinner Tracker', text: 'The Fox Dashboard', url: location.href });
                return;
            }
            if (typeof html2canvas !== 'function') return;
            const canvas = await html2canvas(hero, { scale: 2, backgroundColor: '#0d0d0d', useCORS: true });
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .94));
            if (navigator.share && blob) {
                const file = new File([blob], 'SinnerTracker-Hero.jpg', { type: 'image/jpeg' });
                if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: 'Sinner Tracker' }); return; }
            }
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/jpeg', .94); link.download = 'SinnerTracker-Hero.jpg'; link.click();
        } catch (error) {
            console.warn('Share cancelled/failed:', error);
        }
    });
}

let _deferredInstall = null;
function initInstallPrompt() {
    const button = document.getElementById('install-btn');
    if (!button) return;
    window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault(); _deferredInstall = event; button.classList.remove('hidden');
    });
    button.addEventListener('click', async () => {
        if (!_deferredInstall) return;
        _deferredInstall.prompt();
        await _deferredInstall.userChoice.catch(() => null);
        _deferredInstall = null; button.classList.add('hidden');
    });
    window.addEventListener('appinstalled', () => { _deferredInstall = null; button.classList.add('hidden'); });
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    applyTranslationsOnce();
    initDashboard();
});