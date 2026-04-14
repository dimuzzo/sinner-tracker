const BASE_POINTS = 7000;
const QUALIFICATION_POINTS = 7200; // ATP Finals threshold
let currentLang = 'en';

const translations = {
    en: {
        rankingTitle: "ATP Ranking", winLossTitle: "Win / Loss (YTD)", pointsTitle: "Total ATP Points",
        pointsEvolution: "Points Evolution", foxStats: "The Fox Stats", trophyCabinet: "Trophy Cabinet 🏆",
        rivalries: "Epic Rivalries ⚔️", tournaments: "Tournaments Breakdown", tournHeader: "Tournament",
        defendingHeader: "Defending", earnedHeader: "Earned", netDiffHeader: "Net Diff", 
        footerText: "Sinner Tracker - Unofficial Fan Dashboard", opponent: "Opponent", sinner: "Sinner",
        nextMatchTitle: "Next Match", serveIn: "1st Serve In", bpSaved: "BP Saved", 
        retWon: "Return Won", bpConv: "BP Converted", raceToTurin: "Race to Turin 🇮🇹",
        qualifying: "Qualifying...", qualified: "QUALIFIED! 🎉", installApp: "Install App"
    },
    it: {
        rankingTitle: "Classifica ATP", winLossTitle: "Vittorie / Sconfitte", pointsTitle: "Punti Totali ATP",
        pointsEvolution: "Evoluzione Punti", foxStats: "Le Statistiche", trophyCabinet: "Bacheca Trofei 🏆",
        rivalries: "Rivalità Epiche ⚔️", tournaments: "Dettaglio Tornei", tournHeader: "Torneo",
        defendingHeader: "Da Difendere", earnedHeader: "Guadagnati", netDiffHeader: "Differenza", 
        footerText: "Sinner Tracker - Dashboard Non Ufficiale", opponent: "Avversario", sinner: "Sinner",
        nextMatchTitle: "Prossimo Match", serveIn: "1ª di Servizio", bpSaved: "Palle Break Salvate",
        retWon: "Risposta Vinta", bpConv: "Break Convertiti", raceToTurin: "Corsa per Torino 🇮🇹",
        qualifying: "Qualificazione in corso...", qualified: "QUALIFICATO! 🎉", installApp: "Installa App"
    }
};

// --- THEME LOGIC ---
function initTheme() {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        document.getElementById('dark-mode-btn').innerText = '☀️';
    }
}

function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.getElementById('dark-mode-btn').innerText = isDark ? '☀️' : '🌙';
    initDashboard(true);
}

// --- LANGUAGE LOGIC ---
function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'it' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) el.innerText = translations[currentLang][key];
    });
    initDashboard(true); 
}

// --- DASHBOARD CORE ---
async function initDashboard(isRefresh = false) {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error("Database not found");
        const data = await response.json();
        
        // Hero Stats
        document.getElementById('ranking-display').innerText = `#${data.ranking || '1'} 👑`;
        document.getElementById('win-loss-display').innerText = data.win_loss || '0 - 0';
        document.getElementById('total-points-display').innerText = data.total_points || '0';
        
        // Next Match
        if (data.next_match) {
            document.getElementById('next-opponent-display').innerText = `vs ${data.next_match.opponent}`;
            document.getElementById('next-tournament-display').innerText = `${data.next_match.tournament} - ${data.next_match.round}`;
            const matchDate = new Date(data.next_match.date);
            const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            document.getElementById('next-date-display').innerText = matchDate.toLocaleDateString(currentLang === 'it' ? 'it-IT' : 'en-US', options);
        }

        // RACE TO TURIN LOGIC
        let racePoints = 0;
        if (data.tournaments && data.tournaments.length > 0) {
            racePoints = data.tournaments.reduce((sum, t) => sum + (t.earned || 0), 0);
        }
        racePoints = data.race_points || racePoints;

        document.getElementById('race-points-display').innerText = racePoints;
        const racePct = Math.min((racePoints / QUALIFICATION_POINTS) * 100, 100).toFixed(1);
        document.getElementById('race-pct-display').innerText = racePct + '%';
        
        setTimeout(() => {
            document.getElementById('bar-race').style.width = racePct + '%';
        }, 100);

        const statusEl = document.getElementById('race-status');
        if (racePoints >= QUALIFICATION_POINTS) {
            statusEl.innerText = translations[currentLang].qualified;
            statusEl.classList.add('text-sinner-green');
            statusEl.classList.remove('text-gray-400', 'dark:text-gray-500');
        } else {
            statusEl.innerText = translations[currentLang].qualifying;
            statusEl.classList.remove('text-sinner-green');
            statusEl.classList.add('text-gray-400', 'dark:text-gray-500');
        }

        if (data.tournaments) {
            renderTableAndPoints(data.tournaments);
            renderChart(data.tournaments);
        }
        
        if (data.stats) renderRadarChart(data.stats);
        
        renderTrophies(data.trophies || []);
        renderH2H(data.rivalries || []); 
    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

function renderRadarChart(s) {
    const ctx = document.getElementById('radarChart').getContext('2d');
    const isDark = document.documentElement.classList.contains('dark');
    const color = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    if (window.sinnerRadar) window.sinnerRadar.destroy();
    window.sinnerRadar = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: [
                translations[currentLang].serveIn, 
                translations[currentLang].bpSaved, 
                translations[currentLang].retWon, 
                translations[currentLang].bpConv
            ],
            datasets: [{
                data: [s.first_serve_in, s.break_points_saved, s.first_return_won, s.break_points_converted],
                backgroundColor: 'rgba(249, 115, 22, 0.2)',
                borderColor: '#f97316',
                borderWidth: 3,
                pointBackgroundColor: '#f97316'
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: { color: gridColor },
                    grid: { color: gridColor },
                    pointLabels: { color: color, font: { size: 12, weight: 'bold' } },
                    ticks: { display: false, stepSize: 20 },
                    suggestedMin: 0, suggestedMax: 100
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function renderTableAndPoints(tournaments) {
    const tableBody = document.getElementById('tournament-data');
    if (!tableBody) return;
    let htmlContent = '';
    tournaments.forEach(t => {
        const diff = t.earned - t.defending;
        htmlContent += `
            <tr class="border-b border-gray-100 dark:border-gray-700">
                <td class="py-4 px-6 text-sinner-orange font-bold">${t.name}</td>
                <td class="py-4 px-6 text-center text-gray-400">${t.defending}</td>
                <td class="py-4 px-6 text-center font-bold">${t.earned}</td>
                <td class="py-4 px-6 text-center font-black ${diff >= 0 ? 'text-sinner-green' : 'text-red-500'}">${diff >= 0 ? '+' : ''}${diff}</td>
            </tr>`;
    });
    tableBody.innerHTML = htmlContent;
}

function renderChart(tournaments) {
    const ctx = document.getElementById('pointsChart').getContext('2d');
    const isDark = document.documentElement.classList.contains('dark');
    const labels = tournaments.map(t => t.name);
    let runningTotal = BASE_POINTS;
    const pointsData = tournaments.map(t => { runningTotal += (t.earned - t.defending); return runningTotal; });

    if(window.sinnerChart) window.sinnerChart.destroy();
    window.sinnerChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: pointsData,
                borderColor: '#f97316',
                backgroundColor: isDark ? 'rgba(249, 115, 22, 0.05)' : 'rgba(249, 115, 22, 0.1)',
                fill: true, tension: 0.4, borderWidth: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderTrophies(trophiesData) {
    const cabinet = document.getElementById('trophy-cabinet');
    if (!cabinet) return;
    let htmlContent = '';
    trophiesData.forEach(t => {
        let style = t.category === "Grand Slam" ? "bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-400" : "bg-white dark:bg-dark-card border-sinner-black dark:border-gray-600";
        htmlContent += `<div class="p-5 rounded-xl shadow-md border-b-4 text-center ${style} transition hover:-translate-y-1">
            <div class="text-4xl mb-3">${t.category === "Grand Slam" ? '👑' : '🏆'}</div>
            <h4 class="font-bold text-sm mb-1">${t.title}</h4>
            <p class="text-sinner-orange font-black">${t.year}</p>
        </div>`;
    });
    cabinet.innerHTML = htmlContent;
}

function renderH2H(rivalsData) {
    const container = document.getElementById('h2h-container');
    if (!container) return;
    let htmlContent = '';
    rivalsData.forEach(rival => {
        const winPct = Math.round((rival.wins / (rival.wins + rival.losses)) * 100);
        htmlContent += `<div class="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
            <div class="flex justify-between items-center mb-4">
                <h4 class="font-bold">${rival.name} ${rival.country}</h4>
                <span class="font-black">${rival.wins} - ${rival.losses}</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 flex overflow-hidden">
                <div class="bg-sinner-orange h-3" style="width: ${winPct}%"></div>
                <div class="bg-sinner-black dark:bg-gray-500 h-3" style="width: ${100 - winPct}%"></div>
            </div>
        </div>`;
    });
    container.innerHTML = htmlContent;
}

document.addEventListener('DOMContentLoaded', () => { 
    initTheme(); 
    initDashboard(); 
});

// --- PWA INSTALLATION LOGIC ---
let deferredPrompt;
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Update UI notify the user they can install the PWA
    installBtn.classList.remove('hidden');
});

installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the PWA install');
        } else {
            console.log('User dismissed the PWA install');
        }
        // We've used the prompt, and can't use it again, throw it away
        deferredPrompt = null;
        installBtn.classList.add('hidden');
    }
});

window.addEventListener('appinstalled', () => {
    // Hide the app-provided install promotion
    installBtn.classList.add('hidden');
    // Clear the deferredPrompt so it can be garbage collected
    deferredPrompt = null;
    console.log('PWA was installed successfully');
});