// =========================================
// CONSTANTS
// =========================================
const QUALIFICATION_POINTS = 7730;

const COUNTRY_FLAGS = {
    ES: '🇪🇸', SR: '🇷🇸', DE: '🇩🇪', IT: '🇮🇹',
    US: '🇺🇸', GB: '🇬🇧', FR: '🇫🇷', AU: '🇦🇺',
    RU: '🇷🇺', GR: '🇬🇷', NO: '🇳🇴', CA: '🇨🇦',
    AR: '🇦🇷', CZ: '🇨🇿', PL: '🇵🇱', UK: '🇬🇧',
};

const TZ_MAP = {
    AUS: 'Australia/Melbourne', ESP: 'Europe/Madrid',
    FRA: 'Europe/Paris',        GBR: 'Europe/London',
    USA: 'America/New_York',    ITA: 'Europe/Rome',
    MON: 'Europe/Monaco',       CHN: 'Asia/Shanghai',
    GER: 'Europe/Berlin',       CAN: 'America/Toronto',
};

// =========================================
// TRANSLATIONS
// =========================================
let currentLang = 'en';

const T = {
    en: {
        rankingTitle: 'ATP Ranking',     winLossTitle: 'Win / Loss',    pointsTitle: 'ATP Points',
        pointsEvolution: 'Points Evolution', foxStats: 'The Fox Stats', trophyCabinet: 'Trophy Cabinet',
        rivalries: 'Epic Rivalries',     tournaments: 'Tournaments',    tournHeader: 'Tournament',
        defendingHeader: 'Defending',    earnedHeader: 'Earned',        netDiffHeader: 'Net Diff',
        footerText: 'Sinner Tracker 2026 — Unofficial Fan Dashboard',
        serveIn: '1st Serve In',         bpSaved: 'BP Saved',           retWon: 'Return Won',
        bpConv: 'BP Converted',          raceToTurin: 'Race to Turin',
        qualifying: 'Qualifying…',       qualified: 'QUALIFIED! 🎉',    installApp: 'Install App',
        liveNow: 'Live Now',             recentForm: 'Form',            surfaceMastery: 'Surface Mastery',
        winsYTD: 'Wins YTD',             roadmapTitle: 'Roadmap',       majorEvents: 'Next Major Events',
        pigeon: 'The Pigeon 🟢',         nemesis: 'The Nemesis 🔴',
        bioTitle: 'Identity Card',       bioHeight: 'Height',           bioWeight: 'Weight',
        bioPlays: 'Plays',               bioPro: 'Pro Since',           bioCoaches: 'Coaching Team',
        goldenMastersTitle: 'Career Golden Masters',
        goldenMastersSub: 'All 9 ATP Masters 1000 Titles Conquered',
        titlesYTD: 'Titles YTD',         matchSchedule: 'Match Schedule',
        localTime: 'Local',              yourTime: 'Your Time',         winStreak: 'Win Streak',
        daysUntil: 'Days until',
    },
    it: {
        rankingTitle: 'Classifica ATP',  winLossTitle: 'Vittorie / Sconfitte', pointsTitle: 'Punti Totali ATP',
        pointsEvolution: 'Evoluzione Punti', foxStats: 'Le Statistiche',       trophyCabinet: 'Bacheca Trofei',
        rivalries: 'Rivalità Epiche',    tournaments: 'Dettaglio Tornei',      tournHeader: 'Torneo',
        defendingHeader: 'Da Difendere', earnedHeader: 'Guadagnati',           netDiffHeader: 'Differenza',
        footerText: 'Sinner Tracker 2026 — Dashboard Non Ufficiale',
        serveIn: '1ª di Servizio',       bpSaved: 'PB Salvate',               retWon: 'Risposta Vinta',
        bpConv: 'Break Conv.',           raceToTurin: 'Corsa per Torino',
        qualifying: 'Qualificazione in corso…', qualified: 'QUALIFICATO! 🎉', installApp: 'Installa App',
        liveNow: 'In Diretta',           recentForm: 'Forma',                 surfaceMastery: 'Vittorie per Superficie',
        winsYTD: 'Vittorie YTD',         roadmapTitle: 'Calendario',          majorEvents: 'Prossimi Grandi Eventi',
        pigeon: 'Il Figlioccio 🟢',      nemesis: 'La Bestia Nera 🔴',
        bioTitle: "Carta d'Identità",    bioHeight: 'Altezza',                bioWeight: 'Peso',
        bioPlays: 'Mano',                bioPro: 'Pro dal',                   bioCoaches: 'Team Tecnico',
        goldenMastersTitle: 'Career Golden Masters',
        goldenMastersSub: 'Tutti e 9 i titoli Masters 1000 conquistati',
        titlesYTD: 'Titoli YTD',         matchSchedule: 'Orari Programmati',
        localTime: 'Locale',             yourTime: 'Tuo Orario',              winStreak: 'Vittorie di Fila',
        daysUntil: 'Giorni a',
    }
};

// =========================================
// THEME
// =========================================
function initTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', isDark);
    document.getElementById('dark-mode-btn').innerText = isDark ? '☀️' : '🌙';
}

function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.getElementById('dark-mode-btn').innerText = isDark ? '☀️' : '🌙';
    // Redraw charts only — don't re-fetch data
    if (window._lastData) {
        renderRadarChart(window._lastData.stats);
        renderDoughnutChart(window._lastData.surface_mastery);
        renderChart(window._lastData.tournaments, window._lastData.total_points);
    }
}

// =========================================
// LANGUAGE
// =========================================
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (T[currentLang][key]) el.innerText = T[currentLang][key];
    });
    document.getElementById('lang-btn').innerText = currentLang === 'en' ? 'IT' : 'EN';
}

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'it' : 'en';
    applyTranslations();
    // Redraw charts with translated labels — no re-fetch
    if (window._lastData) {
        renderRadarChart(window._lastData.stats);
        renderRoadmap(window._lastData.roadmap);
    }
}

// =========================================
// COUNTDOWN
// =========================================
function initCountdown() {
    const nextSlam = { name: 'Wimbledon', date: '2026-07-01T10:00:00Z' };
    const target = new Date(nextSlam.date).getTime();

    const tick = () => {
        const diff = target - Date.now();
        const container = document.getElementById('slam-countdown-container');
        if (!container) return;

        if (diff > 0) {
            container.classList.remove('hidden');
            document.getElementById('countdown-label').innerText =
                `${T[currentLang].daysUntil} ${nextSlam.name}`;
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            document.getElementById('countdown-timer').innerText = `${d}d ${h}h ${m}m`;
        } else {
            container.classList.add('hidden');
        }
    };
    tick();
    setInterval(tick, 60000);
}

// =========================================
// DATA FETCH & POPULATE
// =========================================
async function initDashboard() {
    try {
        const res = await fetch('data.json?v=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) throw new Error('data.json not found');
        const data = await res.json();
        window._lastData = data; // cache for theme/lang refreshes

        populateHero(data);
        populateBanner(data.next_match, data.current_streak, data.recent_form);
        populateBio(data.bio);
        populateRace(data);
        populateSpecialH2H(data.special_h2h);

        if (data.tournaments) {
            renderTableAndPoints(data.tournaments);
            renderChart(data.tournaments, data.total_points);
        }
        if (data.stats)           renderRadarChart(data.stats);
        if (data.surface_mastery) renderDoughnutChart(data.surface_mastery);
        if (data.trophies)        renderTrophies(data.trophies);
        if (data.rivalries)       renderH2H(data.rivalries);
        if (data.roadmap)         renderRoadmap(data.roadmap);

        initCountdown();
        initShareButton();

    } catch (err) {
        console.error('Dashboard init error:', err);
    }
}

// =========================================
// HERO STATS
// =========================================
function populateHero(data) {
    document.getElementById('ranking-display').innerText    = `#${data.ranking ?? 1} 👑`;
    document.getElementById('win-loss-display').innerText   = data.win_loss ?? '0 - 0';
    document.getElementById('total-points-display').innerText = (data.total_points ?? 0).toLocaleString();

    if (data.trophies) {
        const year = new Date().getFullYear();
        const ytd = data.trophies.filter(t => t.year === year && t.title !== 'Career Golden Masters').length;
        document.getElementById('titles-ytd-display').innerText = ytd;
    }
}

// =========================================
// BANNER
// =========================================
function populateBanner(nextMatch, streak, recentForm) {
    if (!nextMatch) return;

    document.getElementById('next-tournament-display').innerText = nextMatch.tournament;
    document.getElementById('next-opponent-display').innerText   = `vs ${nextMatch.opponent}`;
    document.getElementById('next-round-display').innerText      = nextMatch.round;
    document.getElementById('local-country-code').innerText      = nextMatch.countryAcr ?? '—';

    // Live detection
    if (nextMatch.date) {
        const matchDate = new Date(nextMatch.date);
        const now       = Date.now();
        const isLive    = now >= matchDate.getTime() && now <= matchDate.getTime() + 10800000;

        const banner    = document.getElementById('tournament-banner');
        const liveEl    = document.getElementById('live-indicator');

        banner.classList.toggle('live', isLive);
        liveEl.classList.toggle('hidden', !isLive);

        // Dual timezone
        const tz        = TZ_MAP[nextMatch.countryAcr] ?? 'UTC';
        const locale    = currentLang === 'it' ? 'it-IT' : 'en-US';
        const timeOpts  = { hour: '2-digit', minute: '2-digit', hour12: false };

        document.getElementById('next-date-user').innerText  = matchDate.toLocaleTimeString(locale, timeOpts);
        document.getElementById('next-date-local').innerText = matchDate.toLocaleTimeString(locale, { ...timeOpts, timeZone: tz });
        document.getElementById('next-date-day').innerText   = matchDate.toLocaleDateString(locale, { weekday: 'long', month: 'short', day: 'numeric' });
    }

    // Streak badge
    const streakBadge = document.getElementById('streak-badge');
    const streakCount = document.getElementById('streak-count');
    if (streak >= 3) {
        streakCount.innerText = streak;
        streakBadge.classList.remove('hidden');
    } else {
        streakBadge.classList.add('hidden');
    }

    // Recent form
    const formEl = document.getElementById('recent-form-display');
    if (formEl && recentForm?.length) {
        formEl.innerHTML = recentForm.map(m => `
            <div class="form-dot ${m.win ? 'bg-fox-green' : 'bg-red-500'}">
                ${m.win ? 'W' : 'L'}
                <div class="tooltip">
                    <span class="font-bold">${m.opponent}</span><br>
                    <span style="opacity:.7; font-size:0.6rem;">${m.result}</span>
                </div>
            </div>`).join('');
    }
}

// =========================================
// BIO
// =========================================
function populateBio(bio) {
    if (!bio) return;
    document.getElementById('bio-height').innerText     = `${bio.height} cm`;
    document.getElementById('bio-weight').innerText     = `${bio.weight} kg`;
    document.getElementById('bio-pro').innerText        = bio.turned_pro;
    document.getElementById('bio-coach').innerText      = bio.coach;
    document.getElementById('bio-birthplace').innerText = bio.birthplace ?? '—';

    const hand = bio.plays?.split(',')[0] ?? '';
    document.getElementById('bio-plays').innerText = currentLang === 'it'
        ? (hand.includes('Right') ? 'Destro' : 'Mancino')
        : hand;
}

// =========================================
// RACE TO TURIN
// =========================================
function populateRace(data) {
    const racePoints = data.race_points
        ?? (data.tournaments ?? []).reduce((s, t) => s + (t.earned ?? 0), 0);

    document.getElementById('race-points-display').innerText = racePoints.toLocaleString();
    const pct = Math.min((racePoints / QUALIFICATION_POINTS) * 100, 100).toFixed(1);
    document.getElementById('race-pct-display').innerText = pct + '%';

    setTimeout(() => {
        const bar = document.getElementById('bar-race');
        if (bar) bar.style.width = pct + '%';
    }, 120);

    const statusEl = document.getElementById('race-status');
    if (!statusEl) return;
    if (racePoints >= QUALIFICATION_POINTS) {
        statusEl.innerText = T[currentLang].qualified;
        statusEl.style.color = 'var(--green)';
    } else {
        statusEl.innerText = T[currentLang].qualifying;
        statusEl.style.color = '';
    }
}

// =========================================
// SPECIAL H2H
// =========================================
function populateSpecialH2H(h2h) {
    if (!h2h) return;
    document.getElementById('pigeon-name').innerText  = h2h.pigeon.name;
    document.getElementById('pigeon-score').innerText = `${h2h.pigeon.wins} - ${h2h.pigeon.losses}`;
    document.getElementById('nemesis-name').innerText  = h2h.nemesis.name;
    document.getElementById('nemesis-score').innerText = `${h2h.nemesis.wins} - ${h2h.nemesis.losses}`;
}

// =========================================
// CHART: RADAR
// =========================================
function renderRadarChart(s) {
    if (!s) return;
    const el = document.getElementById('radarChart');
    if (!el) return;
    const isDark    = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

    if (window._radarChart) window._radarChart.destroy();
    window._radarChart = new Chart(el.getContext('2d'), {
        type: 'radar',
        data: {
            labels: [
                T[currentLang].serveIn,
                T[currentLang].bpSaved,
                T[currentLang].retWon,
                T[currentLang].bpConv
            ],
            datasets: [{
                data: [s.first_serve_in, s.break_points_saved, s.first_return_won, s.break_points_converted],
                backgroundColor: 'rgba(249,115,22,0.15)',
                borderColor: '#f97316',
                borderWidth: 2.5,
                pointBackgroundColor: '#f97316',
                pointBorderColor: '#fff',
                pointBorderWidth: 1.5,
                pointRadius: 4,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: true,
            layout: { padding: 16 },
            scales: {
                r: {
                    angleLines:  { color: gridColor },
                    grid:        { color: gridColor },
                    pointLabels: { color: textColor, font: { size: 12, weight: 'bold', family: 'Montserrat' } },
                    ticks:       { display: false, stepSize: 25 },
                    suggestedMin: 0, suggestedMax: 100,
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: { label: ctx => `${ctx.raw}%` }
                }
            }
        }
    });
}

// =========================================
// CHART: DOUGHNUT
// =========================================
function renderDoughnutChart(surfaces) {
    if (!surfaces) return;
    const el = document.getElementById('doughnutChart');
    if (!el) return;
    const isDark = document.documentElement.classList.contains('dark');
    const total  = (surfaces.Hard ?? 0) + (surfaces.Clay ?? 0) + (surfaces.Grass ?? 0);

    const center = document.getElementById('total-wins-center');
    if (center) center.innerText = total;

    if (window._doughnutChart) window._doughnutChart.destroy();
    window._doughnutChart = new Chart(el.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Hard', 'Clay', 'Grass'],
            datasets: [{
                data: [surfaces.Hard ?? 0, surfaces.Clay ?? 0, surfaces.Grass ?? 0],
                backgroundColor: ['#3b82f6', '#ea580c', '#22c55e'],
                borderWidth: isDark ? 2 : 0,
                borderColor: isDark ? '#111827' : '#fff',
                hoverOffset: 6,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: true, cutout: '76%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: isDark ? '#94a3b8' : '#64748b',
                        padding: 16, usePointStyle: true, pointStyle: 'circle',
                        font: { family: 'Montserrat', size: 13, weight: 'bold' }
                    }
                }
            }
        }
    });
}

// =========================================
// CHART: LINE (points evolution)
// =========================================
function renderChart(tournaments, currentTotalPoints) {
    if (!tournaments?.length) return;
    const el = document.getElementById('pointsChart');
    if (!el) return;
    const isDark = document.documentElement.classList.contains('dark');

    const totalNetDiff = tournaments.reduce((s, t) => s + ((t.earned ?? 0) - (t.defending ?? 0)), 0);
    let running = (currentTotalPoints ?? 7000) - totalNetDiff;
    const pointsData = tournaments.map(t => {
        running += (t.earned ?? 0) - (t.defending ?? 0);
        return running;
    });

    const axisColor = isDark ? '#475569' : '#e2e8f0';
    const labelColor = isDark ? '#94a3b8' : '#64748b';

    if (window._lineChart) window._lineChart.destroy();
    window._lineChart = new Chart(el.getContext('2d'), {
        type: 'line',
        data: {
            labels: tournaments.map(t => t.name),
            datasets: [{
                data: pointsData,
                borderColor: '#f97316',
                backgroundColor: isDark ? 'rgba(249,115,22,0.06)' : 'rgba(249,115,22,0.08)',
                fill: true, tension: 0.42, borderWidth: 3,
                pointBackgroundColor: '#f97316',
                pointRadius: 5, pointHoverRadius: 7,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    grid: { color: axisColor },
                    ticks: { color: labelColor, font: { family: 'Montserrat', size: 12, weight: 'bold' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: labelColor, font: { family: 'Montserrat', size: 11, weight: '600' }, maxRotation: 30 }
                }
            }
        }
    });
}

// =========================================
// RENDER: TABLE
// =========================================
function renderTableAndPoints(tournaments) {
    const tbody = document.getElementById('tournament-data');
    if (!tbody) return;
    tbody.innerHTML = tournaments.map(t => {
        const diff = (t.earned ?? 0) - (t.defending ?? 0);
        const diffStr = (diff >= 0 ? '+' : '') + diff;
        const diffColor = diff >= 0 ? 'color:var(--green)' : 'color:#ef4444';
        return `<tr>
            <td class="text-fox-orange font-bold">${t.name}</td>
            <td class="text-center text-muted">${t.defending}</td>
            <td class="text-center font-bold">${t.earned}</td>
            <td class="text-center font-black" style="${diffColor}">${diffStr}</td>
        </tr>`;
    }).join('');
}

// =========================================
// RENDER: TROPHIES
// =========================================
function renderTrophies(trophiesData) {
    const cabinet = document.getElementById('trophy-cabinet');
    if (!cabinet) return;

    // Group by title
    const grouped = {};
    trophiesData.forEach(t => {
        if (!grouped[t.title]) grouped[t.title] = { title: t.title, category: t.category, years: [] };
        grouped[t.title].years.push(t.year);
    });

    const sorted = Object.values(grouped).sort((a, b) => {
        if (a.title === 'Career Golden Masters') return -1;
        if (b.title === 'Career Golden Masters') return 1;
        return Math.max(...b.years) - Math.max(...a.years);
    });

    // Update counter — exclude Career Golden Masters from title count
    const realTrophies = sorted.filter(t => t.title !== 'Career Golden Masters');
    const countEl = document.getElementById('trophy-count');
    if (countEl) countEl.innerText = `${realTrophies.reduce((s, t) => s + t.years.length, 0)} titles`;

    cabinet.innerHTML = sorted.map(t => {
        t.years.sort((a, b) => b - a);

        let cls = 'trophy-card masters';
        let icon = '🏆';
        if (t.title === 'Career Golden Masters') { cls = 'trophy-card golden'; icon = '✨'; }
        else if (t.category === 'Grand Slam')    { cls = 'trophy-card slam';    icon = '👑'; }
        else if (t.category === 'ATP Finals')    { cls = 'trophy-card finals';   icon = '💎'; }

        const nameColor = t.title === 'Career Golden Masters' ? 'color:#fff' : '';
        const badges = t.years.map(y => `<span class="year-badge">${y}</span>`).join('');

        return `<div class="${cls}">
            <div class="trophy-icon">${icon}</div>
            <h4 class="trophy-name" style="${nameColor}">${t.title}</h4>
            <div class="flex flex-wrap justify-center gap-1 mt-1">${badges}</div>
        </div>`;
    }).join('');
}

// =========================================
// RENDER: H2H
// =========================================
function renderH2H(rivals) {
    const container = document.getElementById('h2h-container');
    if (!container) return;
    container.innerHTML = rivals.map(r => {
        const total  = r.wins + r.losses;
        const winPct = total > 0 ? Math.round((r.wins / total) * 100) : 50;
        const flag   = COUNTRY_FLAGS[r.country] ?? '';
        return `<div class="card glass h2h-card card-hover">
            <div class="flex justify-between items-center mb-3">
                <h4 class="font-bold text-sm">${flag} ${r.name}</h4>
                <span class="font-black text-base" style="font-family:'Barlow Condensed',sans-serif;">${r.wins} – ${r.losses}</span>
            </div>
            <div class="h2h-bar">
                <div class="h2h-bar-win rounded-l-full" style="width:${winPct}%"></div>
                <div class="h2h-bar-loss rounded-r-full" style="width:${100 - winPct}%"></div>
            </div>
            <div class="flex justify-between mt-1.5">
                <span class="label-xs text-fox-orange">Sinner</span>
                <span class="label-xs text-muted">${r.name.split(' ').pop()}</span>
            </div>
        </div>`;
    }).join('');
}

// =========================================
// RENDER: ROADMAP
// =========================================
function renderRoadmap(roadmap) {
    const container = document.getElementById('roadmap-container');
    if (!container || !roadmap?.length) return;

    const COURT_COLORS = {
        clay:   { dot: 'bg-orange-600', badge: '🟠' },
        grass:  { dot: 'bg-green-500',  badge: '🟢' },
        hard:   { dot: 'bg-blue-500',   badge: '🔵' },
        'i.hard': { dot: 'bg-indigo-500', badge: '🟣' },
    };
    const locale = currentLang === 'it' ? 'it-IT' : 'en-US';

    container.innerHTML = roadmap.map(t => {
        const d    = new Date(t.date);
        const ds   = d.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
        const key  = (t.court ?? '').toLowerCase();
        const cfg  = COURT_COLORS[key] ?? COURT_COLORS.hard;

        return `<div class="roadmap-stop">
            <div class="roadmap-dot ${cfg.dot} flex-shrink-0"></div>
            <div class="roadmap-info">
                <p class="roadmap-date">${cfg.badge} ${ds} · ${t.country}</p>
                <h4 class="roadmap-name">${t.name}</h4>
            </div>
        </div>`;
    }).join('');
}

// =========================================
// SHARE (IG screenshot)
// =========================================
function initShareButton() {
    const btn = document.getElementById('share-btn');
    if (!btn) return;

    // Clone to remove stale listeners
    const fresh = btn.cloneNode(true);
    btn.replaceWith(fresh);

    fresh.addEventListener('click', async () => {
        const banner = document.getElementById('tournament-banner');
        fresh.style.opacity = '0';
        try {
            const canvas = await html2canvas(banner, { scale: 3, backgroundColor: '#0d0d0d', useCORS: true });
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/jpeg', 0.95);
            link.download = 'SinnerTracker-Banner.jpg';
            link.click();
        } catch (e) {
            console.error('Screenshot error:', e);
        } finally {
            fresh.style.opacity = '1';
        }
    });
}

// =========================================
// PWA INSTALL
// =========================================
let _deferredInstall = null;
const installBtn = document.getElementById('install-btn');
if (installBtn) {
    window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        _deferredInstall = e;
        installBtn.style.display = 'flex';
    });
    installBtn.addEventListener('click', async () => {
        if (!_deferredInstall) return;
        _deferredInstall.prompt();
        await _deferredInstall.userChoice;
        _deferredInstall = null;
        installBtn.style.display = 'none';
    });
    window.addEventListener('appinstalled', () => {
        installBtn.style.display = 'none';
        _deferredInstall = null;
    });
}

// =========================================
// BOOT
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initDashboard();
});