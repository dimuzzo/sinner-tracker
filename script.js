const BASE_POINTS = 7000;

/**
 * Main Initialization: Fetches data and triggers rendering functions
 */
async function initDashboard() {
    try {
        // Fetch real-time data from the JSON file
        const response = await fetch('data.json');
        const data = await response.json();
        
        // Update Dashboard Text Elements
        document.getElementById('ranking-display').innerText = `#${data.ranking} 👑`;
        document.getElementById('win-loss-display').innerText = data.win_loss;
        document.getElementById('total-points-display').innerText = data.total_points;
        
        // Render dynamic components
        renderTableAndPoints(data.tournaments, data.total_points);
        renderChart(data.tournaments);
        renderTrophies();
        renderH2H();
        
        console.log(`System synchronized. Last update: ${data.last_updated}`);
    } catch (error) {
        console.error("Critical error during dashboard initialization:", error);
    }
}

/**
 * Populates the tournament table
 */
function renderTableAndPoints(tournaments, totalPoints) {
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
            </tr>
        `;
    });
    tableBody.innerHTML = htmlContent;
}

/**
 * Renders the points evolution line chart
 */
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
                label: 'Total ATP Points',
                data: pointsData,
                borderColor: '#f97316',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 4,
                pointBackgroundColor: '#171717'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: '#f1f5f9' }, ticks: { font: { weight: '600' } } },
                x: { grid: { display: false }, ticks: { font: { weight: '600' } } }
            }
        }
    });
}

/**
 * Renders the Trophy Cabinet cards
 */
function renderTrophies() {
    const cabinet = document.getElementById('trophy-cabinet');
    if (!cabinet) return;

    const trophies = [
        { title: "Australian Open", year: 2024, category: "Grand Slam" },
        { title: "Miami Open", year: 2024, category: "Masters 1000" },
        { title: "Rotterdam", year: 2024, category: "ATP 500" },
        { title: "Davis Cup", year: 2023, category: "Team" },
        { title: "Beijing", year: 2023, category: "ATP 500" }
    ];

    let htmlContent = '';
    trophies.forEach(t => {
        let specialStyle = t.category === "Grand Slam" ? "bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-400" : "bg-white border-sinner-black";
        let icon = t.category === "Grand Slam" ? "👑" : "🏆";

        htmlContent += `
            <div class="p-5 rounded-xl shadow-md border-b-4 text-center ${specialStyle} transition-transform hover:-translate-y-2">
                <div class="text-4xl mb-3">${icon}</div>
                <h4 class="font-bold text-sm mb-2">${t.title}</h4>
                <span class="text-[10px] bg-sinner-black text-white px-2 py-1 rounded uppercase">${t.category}</span>
                <p class="text-sinner-orange font-black mt-2">${t.year}</p>
            </div>
        `;
    });
    cabinet.innerHTML = htmlContent;
}

/**
 * Renders the H2H Rivalries section
 */
function renderH2H() {
    const container = document.getElementById('h2h-container');
    if (!container) return;

    const rivalsData = [
        { name: "Carlos Alcaraz", wins: 4, losses: 5, country: "🇪🇸" },
        { name: "Novak Djokovic", wins: 3, losses: 4, country: "🇷🇸" },
        { name: "Daniil Medvedev", wins: 5, losses: 6, country: "🏳️" }
    ];

    let htmlContent = '';
    rivalsData.forEach(rival => {
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
                    <span>Sinner (${winPct}%)</span>
                    <span>Opponent</span>
                </div>
            </div>
        `;
    });
    container.innerHTML = htmlContent;
}

// Global initialization on page load
document.addEventListener('DOMContentLoaded', initDashboard);