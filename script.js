const BASE_POINTS = 7000;
let currentLang = 'en';

const translations = {
    en: {
        rankingTitle: "ATP Ranking", winLossTitle: "Win / Loss (YTD)", pointsTitle: "Total ATP Points",
        pointsEvolution: "Points Evolution", foxStats: "The Fox Stats", servicePower: "Service Power 🎾",
        returnGame: "Return Game ⚡", serveIn: "1st Serve In", bpSaved: "Break Points Saved",
        returnWon: "1st Serve Return Pts Won", bpConv: "Break Points Converted", trophyCabinet: "Trophy Cabinet 🏆",
        rivalries: "Epic Rivalries ⚔️", tournaments: "Tournaments Breakdown", tournHeader: "Tournament",
        defendingHeader: "Defending", earnedHeader: "Earned", netDiffHeader: "Net Diff", 
        footerText: "Sinner Tracker - Unofficial Fan Dashboard", opponent: "Opponent", sinner: "Sinner",
        nextMatchTitle: "Next Match"
    },
    it: {
        rankingTitle: "Classifica ATP", winLossTitle: "Vittorie / Sconfitte", pointsTitle: "Punti Totali ATP",
        pointsEvolution: "Evoluzione Punti", foxStats: "Le Statistiche", servicePower: "Forza al Servizio 🎾",
        returnGame: "Gioco in Risposta ⚡", serveIn: "Prima in Campo", bpSaved: "Palle Break Salvate",
        returnWon: "Risposta Vincente 1ª", bpConv: "Palle Break Convertite", trophyCabinet: "Bacheca Trofei 🏆",
        rivalries: "Rivalità Epiche ⚔️", tournaments: "Dettaglio Tornei", tournHeader: "Torneo",
        defendingHeader: "Da Difendere", earnedHeader: "Guadagnati", netDiffHeader: "Differenza", 
        footerText: "Sinner Tracker - Dashboard Non Ufficiale", opponent: "Avversario", sinner: "Sinner",
        nextMatchTitle: "Prossimo Match"
    }
};

// --- DARK MODE LOGIC ---
function initTheme() {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        document.getElementById('dark-mode-btn').innerText = '☀️';
    } else {
        document.documentElement.classList.remove('dark');
        document.getElementById('dark-mode-btn').innerText = '🌙';
    }
}

function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.getElementById('dark-mode-btn').innerText = isDark ? '☀️' : '🌙';
    // Re-render chart to update colors
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
        
        // Populate Hero Stats
        document.getElementById('ranking-display').innerText = `#${data.ranking || '1'} 👑`;
        document.getElementById('win-loss-display').innerText = data.win_loss || '0 - 0';
        document.getElementById('total-points-display').innerText = data.total_points || '0';
        
        // Next Match Widget
        if (data.next_match) {
            document.getElementById('next-opponent-display').innerText = `vs ${data.next_match.opponent}`;
            document.getElementById('next-tournament-display').innerText = `${data.next_match.tournament} - ${data.next_match.round}`;
            const matchDate = new Date(data.next_match.date);
            const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            document.getElementById('next-date-display').innerText = matchDate.toLocaleDateString(currentLang === 'it' ? 'it-IT' : 'en-US', options);
        }

        // Stats Bars
        const s = data.stats || { first_serve_in: 64, break_points_saved: 73, first_return_won: 34, break_points_converted: 42 };
        updateStat('serve-in', s.first_serve_in);
        updateStat('bp-saved', s.break_points_saved);
        updateStat('ret-won', s.first_return_won);
        updateStat('bp-conv', s.break_points_converted);

        if (data.tournaments) {
            renderTableAndPoints(data.tournaments);
            renderChart(data.tournaments);
        }
        renderTrophies(data.trophies || []);
        renderH2H(data.rivalries || []); 
    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

function updateStat(id, value) {
    document.getElementById(`stat-${id}`).innerText = value + '%';
    document.getElementById(`bar-${id}`).style.width = value + '%';
}

function renderTableAndPoints(tournaments) {
    const tableBody = document.getElementById('tournament-data');
    if (!tableBody) return;
    let htmlContent = '';
    tournaments.forEach(t => {
        const diff = t.earned - t.defending;
        let diffColor = diff >= 0 ? 'text-sinner-green' : 'text-red-500';
        htmlContent += `
            <tr class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <td class="py-4 px-6 text-sinner-orange font-bold">${t.name}</td>
                <td class="py-4 px-6 text-center text-gray-400">${t.defending}</td>
                <td class="py-4 px-6 text-center font-bold">${t.earned}</td>
                <td class="py-4 px-6 text-center font-black ${diffColor}">${diff >= 0 ? '+' : ''}${diff}</td>
            </tr>`;
    });
    tableBody.innerHTML = htmlContent;
}

function renderChart(tournaments) {
    const ctxElement = document.getElementById('pointsChart');
    if (!ctxElement || !tournaments.length) return;
    
    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    const labels = tournaments.map(t => t.name);
    let runningTotal = BASE_POINTS;
    const pointsData = tournaments.map(t => {
        runningTotal += (t.earned - t.defending);
        return runningTotal;
    });

    if(window.sinnerChart) window.sinnerChart.destroy();
    window.sinnerChart = new Chart(ctxElement.getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: pointsData,
                borderColor: '#f97316',
                backgroundColor: isDark ? 'rgba(249, 115, 22, 0.05)' : 'rgba(249, 115, 22, 0.1)',
                fill: true, tension: 0.4, borderWidth: 4, pointRadius: 4, pointBackgroundColor: '#f97316'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: gridColor }, ticks: { color: textColor, font: { weight: '600' } } },
                x: { grid: { display: false }, ticks: { color: textColor, font: { weight: '600' } } }
            }
        }
    });
}

function renderTrophies(trophiesData) {
    const cabinet = document.getElementById('trophy-cabinet');
    if (!cabinet) return;
    let htmlContent = '';
    trophiesData.forEach(t => {
        let cardStyle = t.category === "Grand Slam" 
            ? "bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-400" 
            : "bg-white dark:bg-dark-card border-sinner-black dark:border-gray-600";
        htmlContent += `
            <div class="p-5 rounded-xl shadow-md border-b-4 text-center ${cardStyle} transition hover:-translate-y-1">
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
        htmlContent += `
            <div class="bg-white dark:bg-dark-card p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
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