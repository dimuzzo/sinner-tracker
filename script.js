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
        footerText: "Sinner Tracker - Unofficial Fan Dashboard", opponent: "Opponent", sinner: "Sinner"
    },
    it: {
        rankingTitle: "Classifica ATP", winLossTitle: "Vittorie / Sconfitte", pointsTitle: "Punti Totali ATP",
        pointsEvolution: "Evoluzione Punti", foxStats: "Le Statistiche", servicePower: "Forza al Servizio 🎾",
        returnGame: "Gioco in Risposta ⚡", serveIn: "Prima in Campo", bpSaved: "Palle Break Salvate",
        returnWon: "Risposta Vincente 1ª", bpConv: "Palle Break Convertite", trophyCabinet: "Bacheca Trofei 🏆",
        rivalries: "Rivalità Epiche ⚔️", tournaments: "Dettaglio Tornei", tournHeader: "Torneo",
        defendingHeader: "Da Difendere", earnedHeader: "Guadagnati", netDiffHeader: "Differenza", 
        footerText: "Sinner Tracker - Dashboard Non Ufficiale", opponent: "Avversario", sinner: "Sinner"
    }
};

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'it' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) el.innerText = translations[currentLang][key];
    });
    initDashboard(true); 
}

async function initDashboard(isLanguageToggle = false) {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        if (!isLanguageToggle) {
            document.getElementById('ranking-display').innerText = `#${data.ranking} 👑`;
            document.getElementById('win-loss-display').innerText = data.win_loss;
            document.getElementById('total-points-display').innerText = data.total_points;
            
            if(data.stats) {
                document.getElementById('stat-serve-in').innerText = data.stats.first_serve_in + '%';
                document.getElementById('bar-serve-in').style.width = data.stats.first_serve_in + '%';
                document.getElementById('stat-bp-saved').innerText = data.stats.break_points_saved + '%';
                document.getElementById('bar-bp-saved').style.width = data.stats.break_points_saved + '%';
            }

            renderTableAndPoints(data.tournaments);
            renderChart(data.tournaments);
            renderTrophies(data.trophies || []);
        }
        renderH2H(data.rivalries || []); 
    } catch (error) {
        console.error("Critical error loading stats:", error);
    }
}

function renderTableAndPoints(tournaments) {
    const tableBody = document.getElementById('tournament-data');
    if (!tableBody) return;
    let htmlContent = '';
    tournaments.forEach(t => {
        const diff = t.earned - t.defending;
        let diffColor = diff >= 0 ? 'text-sinner-green' : 'text-red-500';
        let sign = diff >= 0 ? '+' : '';
        htmlContent += `
            <tr class="border-b border-gray-100 transition duration-150">
                <td class="py-4 px-6 text-sinner-orange font-bold">${t.name}</td>
                <td class="py-4 px-6 text-center text-gray-400">${t.defending}</td>
                <td class="py-4 px-6 text-center font-bold">${t.earned}</td>
                <td class="py-4 px-6 text-center font-black ${diffColor}">${sign}${diff}</td>
            </tr>`;
    });
    tableBody.innerHTML = htmlContent;
}

function renderChart(tournaments) {
    const ctxElement = document.getElementById('pointsChart');
    if (!ctxElement) return;
    const ctx = ctxElement.getContext('2d');
    const labels = [];
    const pointsData = [];
    let runningTotal = BASE_POINTS;
    tournaments.forEach(t => {
        runningTotal += (t.earned - t.defending);
        labels.push(t.name);
        pointsData.push(runningTotal);
    });
    if(window.sinnerChart) window.sinnerChart.destroy();
    window.sinnerChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total ATP Points', data: pointsData,
                borderColor: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.1)',
                fill: true, tension: 0.4, borderWidth: 4, pointBackgroundColor: '#171717'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: '#f1f5f9' }, ticks: { font: { weight: '600' } } },
                x: { grid: { display: false }, ticks: { font: { weight: '600' } } }
            }
        }
    });
}

function renderTrophies(trophiesData) {
    const cabinet = document.getElementById('trophy-cabinet');
    if (!cabinet) return;
    const data = trophiesData.length > 0 ? trophiesData : [
        { title: "Australian Open", year: 2024, category: "Grand Slam" },
        { title: "Miami Open", year: 2024, category: "Masters 1000" }
    ];
    let htmlContent = '';
    data.forEach(t => {
        let specialStyle = t.category === "Grand Slam" ? "bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-400" : "bg-white border-sinner-black";
        let icon = t.category === "Grand Slam" ? "👑" : "🏆";
        htmlContent += `
            <div class="p-5 rounded-xl shadow-md border-b-4 text-center ${specialStyle} transition-transform hover:-translate-y-2">
                <div class="text-4xl mb-3">${icon}</div>
                <h4 class="font-bold text-sm mb-2">${t.title}</h4>
                <span class="text-[10px] bg-sinner-black text-white px-2 py-1 rounded uppercase">${t.category}</span>
                <p class="text-sinner-orange font-black mt-2">${t.year}</p>
            </div>`;
    });
    cabinet.innerHTML = htmlContent;
}

function renderH2H(rivalsData) {
    const container = document.getElementById('h2h-container');
    if (!container) return;
    const data = rivalsData.length > 0 ? rivalsData : [
        { name: "Carlos Alcaraz", wins: 7, losses: 10, country: "🇪🇸" },
        { name: "Novak Djokovic", wins: 6, losses: 5, country: "🇷🇸" }
    ];
    let htmlContent = '';
    data.forEach(rival => {
        const winPct = Math.round((rival.wins / (rival.wins + rival.losses)) * 100);
        htmlContent += `
            <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-transform hover:-translate-y-2">
                <div class="flex justify-between items-center mb-4">
                    <h4 class="font-bold text-sinner-black">${rival.name} ${rival.country}</h4>
                    <span class="text-xl font-black">${rival.wins} - ${rival.losses}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3 mb-2 flex overflow-hidden">
                    <div class="bg-sinner-orange h-3" style="width: ${winPct}%"></div>
                    <div class="bg-sinner-black h-3" style="width: ${100 - winPct}%"></div>
                </div>
                <div class="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                    <span>${translations[currentLang].sinner} (${winPct}%)</span>
                    <span>${translations[currentLang].opponent}</span>
                </div>
            </div>`;
    });
    container.innerHTML = htmlContent;
}

document.addEventListener('DOMContentLoaded', () => initDashboard(false));