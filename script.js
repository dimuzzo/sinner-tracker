// Database of tournaments
const tournaments = [
    { name: "Australian Open", defending: 180, earned: 2000 },
    { name: "Rotterdam", defending: 300, earned: 500 },
    { name: "Indian Wells", defending: 360, earned: 400 },
    { name: "Miami Open", defending: 600, earned: 1000 },
    { name: "Monte-Carlo", defending: 360, earned: 180 }
];

const BASE_POINTS = 7000; // Starting points before this sequence

/**
 * Initializes the Dashboard elements (Table, Chart, and Total Points)
 */
function initDashboard() {
    renderTableAndPoints();
    renderChart();
}

/**
 * Calculates net differences and populates the HTML table
 */
function renderTableAndPoints() {
    const tableBody = document.getElementById('tournament-data');
    let currentPoints = BASE_POINTS;
    let htmlContent = '';

    tournaments.forEach(t => {
        const diff = t.earned - t.defending;
        currentPoints += diff;

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
    
    // Update the total points display dynamically
    const pointsDisplay = document.getElementById('total-points-display');
    if(pointsDisplay) {
        pointsDisplay.innerText = currentPoints;
    }
}

/**
 * Renders the Chart.js line graph
 */
function renderChart() {
    const ctxElement = document.getElementById('pointsChart');
    if (!ctxElement) return;

    const ctx = ctxElement.getContext('2d');
    
    // Prepare data arrays
    const labels = [];
    const pointsData = [];
    let runningTotal = BASE_POINTS;

    tournaments.forEach(t => {
        runningTotal += (t.earned - t.defending);
        labels.push(t.name);
        pointsData.push(runningTotal);
    });

    // Initialize Chart
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cumulative ATP Points',
                data: pointsData,
                borderColor: '#f97316', // sinner-orange
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 4,
                pointBackgroundColor: '#171717', // sinner-black
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#171717',
                    titleFont: { family: 'Montserrat', size: 14 },
                    bodyFont: { family: 'Montserrat', size: 14, weight: 'bold' },
                    padding: 12,
                    displayColors: false
                }
            },
            scales: {
                y: { 
                    beginAtZero: false, 
                    grid: { color: '#f1f5f9' },
                    ticks: { font: { family: 'Montserrat', weight: '600' } }
                },
                x: { 
                    grid: { display: false },
                    ticks: { font: { family: 'Montserrat', weight: '600' } }
                }
            }
        }
    });
}

// 1. Database of major trophies
const trophies = [
    { title: "Australian Open", year: 2024, category: "Grand Slam", surface: "Hard" },
    { title: "Miami Open", year: 2024, category: "Masters 1000", surface: "Hard" },
    { title: "Rotterdam", year: 2024, category: "ATP 500", surface: "Hard (Indoor)" },
    { title: "Davis Cup", year: 2023, category: "Team", surface: "Hard (Indoor)" },
    { title: "Toronto", year: 2023, category: "Masters 1000", surface: "Hard" },
    { title: "Vienna", year: 2023, category: "ATP 500", surface: "Hard (Indoor)" },
    { title: "Beijing", year: 2023, category: "ATP 500", surface: "Hard" }
];

/**
 * Generates the HTML for the trophy cards and applies special styling for Grand Slams
 */
function renderTrophies() {
    const cabinet = document.getElementById('trophy-cabinet');
    if (!cabinet) return;

    let htmlContent = '';

    trophies.forEach(t => {
        // Default styling for standard titles
        let bgClass = "bg-white";
        let borderClass = "border-sinner-black";
        let icon = "🏆";
        
        // Special highlighting for Grand Slams
        if (t.category === "Grand Slam") {
            bgClass = "bg-gradient-to-br from-yellow-50 to-orange-100";
            borderClass = "border-yellow-400";
            icon = "👑"; 
        } else if (t.category === "Masters 1000") {
            borderClass = "border-sinner-orange";
        }

        htmlContent += `
            <div class="p-5 rounded-xl shadow-md border-b-4 ${borderClass} ${bgClass} transition-transform hover:-translate-y-2 duration-300 text-center flex flex-col justify-between min-h-[160px]">
                <div>
                    <div class="text-4xl mb-3 drop-shadow-md">${icon}</div>
                    <h4 class="font-bold text-sinner-black leading-tight text-sm">${t.title}</h4>
                </div>
                <div class="mt-4">
                    <span class="inline-block bg-sinner-black text-sinner-white text-[10px] px-2 py-1 rounded uppercase tracking-wider font-bold">${t.category}</span>
                    <p class="text-sinner-orange font-black mt-2 text-lg">${t.year}</p>
                </div>
            </div>
        `;
    });

    cabinet.innerHTML = htmlContent;
}

// 2. We need to update the existing DOMContentLoaded listener to also run renderTrophies()
// Replace your current DOMContentLoaded line at the very bottom with this:
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    renderTrophies();
});