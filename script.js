/**
 * Fully dynamic initialization from JSON
 */
async function initDashboard(isLanguageToggle = false) {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        // Dynamic Hero Stats
        document.getElementById('ranking-display').innerText = `#${data.ranking} 👑`;
        document.getElementById('win-loss-display').innerText = data.win_loss;
        document.getElementById('total-points-display').innerText = data.total_points;
        
        // Dynamic Progress Bars (The Fox Stats)
        updateStatBar('serve-in', data.stats.first_serve_in);
        updateStatBar('bp-saved', data.stats.break_points_saved);
        updateStatBar('ret-won', data.stats.first_return_won);
        updateStatBar('bp-conv', data.stats.break_points_converted);

        // Dynamic Lists
        renderTableAndPoints(data.tournaments);
        renderChart(data.tournaments);
        renderH2H(data.rivalries);
        
        if (data.trophies) renderTrophies(data.trophies);

    } catch (error) {
        console.error("Data fetch error:", error);
    }
}

function updateStatBar(id, value) {
    const textEl = document.getElementById(`stat-${id}`);
    const barEl = document.getElementById(`bar-${id}`);
    if(textEl) textEl.innerText = value + '%';
    if(barEl) barEl.style.width = value + '%';
}