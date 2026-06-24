const QUALIFICATION_POINTS = 7730; // ATP Finals threshold
let currentLang = 'en';

const translations = {
    en: {
        rankingTitle: "ATP Ranking", winLossTitle: "Win / Loss (YTD)", pointsTitle: "Total ATP Points",
        pointsEvolution: "Points Evolution", foxStats: "The Fox Stats", trophyCabinet: "Trophy Cabinet",
        rivalries: "Epic Rivalries", tournaments: "Tournaments Breakdown", tournHeader: "Tournament",
        defendingHeader: "Defending", earnedHeader: "Earned", netDiffHeader: "Net Diff", 
        footerText: "Sinner Tracker - Unofficial Fan Dashboard", opponent: "Opponent", sinner: "Sinner",
        nextMatchTitle: "Next Match", serveIn: "1st Serve In", bpSaved: "BP Saved", 
        retWon: "Return Won", bpConv: "BP Converted", raceToTurin: "Race to Turin",
        qualifying: "Qualifying...", qualified: "QUALIFIED! 🎉", installApp: "Install App",
        liveNow: "Live Now", recentForm: "Form", surfaceMastery: "Surface Mastery (YTD)",
        winsYTD: "Wins YTD",
        roadmapTitle: "Roadmap", majorEvents: "Next Major Events",
        pigeon: "The Pigeon 🟢", nemesis: "The Nemesis 🔴",
        bioTitle: "Player Identity Card", bioHeight: "Height", bioWeight: "Weight", bioPlays: "Plays", 
        bioPro: "Pro Since", bioCoaches: "Coaching Team",
        goldenMastersTitle: "Career Golden Masters", goldenMastersSub: "All 9 ATP Masters 1000 Titles Conquered",
        titlesYTD: "Titles YTD", currentEvent: "Current Event", matchSchedule: "Match Schedule",
        localTime: "Local Time", yourTime: "Your Time", winStreak: "Win Streak", daysUntil: "Days until"
    },
    it: {
        rankingTitle: "Classifica ATP", winLossTitle: "Vittorie / Sconfitte", pointsTitle: "Punti Totali ATP",
        pointsEvolution: "Evoluzione Punti", foxStats: "Le Statistiche", trophyCabinet: "Bacheca Trofei",
        rivalries: "Rivalità Epiche", tournaments: "Dettaglio Tornei", tournHeader: "Torneo",
        defendingHeader: "Da Difendere", earnedHeader: "Guadagnati", netDiffHeader: "Differenza", 
        footerText: "Sinner Tracker - Dashboard Non Ufficiale", opponent: "Avversario", sinner: "Sinner",
        nextMatchTitle: "Prossimo Match", serveIn: "1ª di Servizio", bpSaved: "PB Salvate",
        retWon: "Risposta Vinta", bpConv: "Break Conv.", raceToTurin: "Corsa per Torino",
        qualifying: "Qualificazione in corso...", qualified: "QUALIFICATO! 🎉", installApp: "Installa App",
        liveNow: "In Diretta", recentForm: "Forma", surfaceMastery: "Vittorie per Superficie",
        winsYTD: "Vittorie YTD",
        roadmapTitle: "Calendario", majorEvents: "Prossimi Grandi Eventi",
        pigeon: "Il Figlioccio 🟢", nemesis: "La Bestia Nera 🔴",
        bioTitle: "Carta d'Identità", bioHeight: "Altezza", bioWeight: "Peso", bioPlays: "Mano",
        bioPro: "Pro dal", bioCoaches: "Team Tecnico",
        goldenMastersTitle: "Career Golden Masters", goldenMastersSub: "Tutti e 9 i titoli Masters 1000 conquistati",
        titlesYTD: "Titoli YTD", currentEvent: "Torneo in Corso", matchSchedule: "Orari Programmati",
        localTime: "Ora Locale", yourTime: "Tuo Orario", winStreak: "Vittorie di Fila", daysUntil: "Giorni a"
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
    
    // Cambia il testo del bottone dinamicamente
    const langBtn = document.getElementById('lang-btn');
    if (langBtn) {
        langBtn.innerText = currentLang === 'en' ? 'IT' : 'EN';
    }

    initDashboard(true); 
}

// --- COUNTDOWN LOGIC ---
function updateSlamCountdown() {
    // Wimbledon 2026
    const nextSlam = { name: "Wimbledon", date: "2026-07-01T10:00:00Z" };
    const target = new Date(nextSlam.date).getTime();
    
    const timerFunc = () => {
        const now = new Date().getTime();
        const diff = target - now;
        const container = document.getElementById('slam-countdown-container');

        if (diff > 0) {
            container.classList.remove('hidden');
            document.getElementById('countdown-label').innerText = `${translations[currentLang].daysUntil} ${nextSlam.name}`;
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            document.getElementById('countdown-timer').innerText = `${days}d ${hours}h ${mins}m`;
        } else {
            container.classList.add('hidden');
        }
    };
    
    timerFunc();
    setInterval(timerFunc, 60000);
}

// --- DASHBOARD CORE ---
async function initDashboard(isRefresh = false) {
    try {
        const response = await fetch('data.json?v=' + new Date().getTime(), { cache: 'no-store' });
        if (!response.ok) throw new Error("Database not found");
        const data = await response.json();
        
        // Hero Stats
        document.getElementById('ranking-display').innerText = `#${data.ranking || '1'} 👑`;
        document.getElementById('win-loss-display').innerText = data.win_loss || '0 - 0';
        document.getElementById('total-points-display').innerText = data.total_points || '0';
        
        // --- RECENT FORM LOGIC ---
        if (data.recent_form && data.recent_form.length > 0) {
            const formContainer = document.getElementById('recent-form-display');
            if (formContainer) { 
                let htmlContent = '';
                data.recent_form.forEach(match => {
                    const colorClass = match.win ? 'bg-sinner-green' : 'bg-red-500';
                    const letter = match.win ? 'W' : 'L';
                    htmlContent += `
                        <div class="relative group cursor-pointer flex items-center justify-center w-6 h-6 rounded-full text-white text-[10px] font-black ${colorClass}">
                            ${letter}
                            <div class="absolute bottom-full mb-2 hidden group-hover:block w-max bg-sinner-black text-white text-xs p-2.5 rounded-md shadow-lg z-10 pointer-events-none">
                                <span class="font-bold">${match.opponent}</span> <br> 
                                <span class="text-gray-400 text-[10px]">${match.result}</span>
                                <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-sinner-black"></div>
                            </div>
                        </div>
                    `;
                });
                formContainer.innerHTML = htmlContent;
            }
        }
        
        // --- NEXT MATCH & DUAL TIMEZONE LOGIC ---
        if (data.next_match) {
            document.getElementById('next-opponent-display').innerText = `vs ${data.next_match.opponent}`;
            document.getElementById('next-tournament-display').innerText = data.next_match.tournament;
            document.getElementById('next-round-display').innerText = data.next_match.round;
            document.getElementById('local-country-code').innerText = data.next_match.countryAcr || "LOC";
            
            if (data.next_match.date) {
                const matchDate = new Date(data.next_match.date);
                const now = new Date();
                const isLive = (now >= matchDate && now <= new Date(matchDate.getTime() + 10800000));
                
                const banner = document.getElementById('tournament-banner');
                const indicator = document.getElementById('live-indicator');
                
                if (isLive) {
                    banner.classList.replace('border-turin-blue', 'border-red-500');
                    indicator.innerHTML = `<span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span> ${translations[currentLang].liveNow}`;
                    indicator.classList.remove('hidden');
                } else {
                    banner.classList.replace('border-red-500', 'border-turin-blue');
                    indicator.classList.add('hidden');
                }

                // Timezone Dictionary mapping Country Acronym to IANA Timezone
                const tzMap = {
                    "AUS": "Australia/Melbourne", "ESP": "Europe/Madrid", 
                    "FRA": "Europe/Paris", "GBR": "Europe/London", 
                    "USA": "America/New_York", "ITA": "Europe/Rome",
                    "MON": "Europe/Monaco", "CHN": "Asia/Shanghai",
                    "GER": "Europe/Berlin", "CAN": "America/Toronto"
                };
                
                const tzAcr = data.next_match.countryAcr;
                const localTZ = tzMap[tzAcr] || "UTC"; // Fallback to UTC if unknown

                // User Time (Your Time) - 24H Format
                const userTimeOpts = { hour: '2-digit', minute: '2-digit', hour12: false };
                document.getElementById('next-date-user').innerText = matchDate.toLocaleTimeString(currentLang === 'it' ? 'it-IT' : 'en-US', userTimeOpts);
                
                // Tournament Local Time - 24H Format
                const localTimeOpts = { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: localTZ };
                document.getElementById('next-date-local').innerText = matchDate.toLocaleTimeString(currentLang === 'it' ? 'it-IT' : 'en-US', localTimeOpts);
                
                // Day of the week
                const dayOpts = { weekday: 'long', month: 'short', day: 'numeric' };
                document.getElementById('next-date-day').innerText = matchDate.toLocaleDateString(currentLang === 'it' ? 'it-IT' : 'en-US', dayOpts);
            }
        }

        // --- TITLES YTD LOGIC ---
        if (data.trophies) {
            const currentYear = new Date().getFullYear();
            const titlesThisYear = data.trophies.filter(t => 
                t.year === currentYear && t.title !== "Career Golden Masters"
            ).length;
            document.getElementById('titles-ytd-display').innerText = titlesThisYear;
        }

        // --- PLAYER BIO LOGIC ---
        if (data.bio) {
            document.getElementById('bio-height').innerText = `${data.bio.height} cm`;
            document.getElementById('bio-weight').innerText = `${data.bio.weight} kg`;
            
            const plays = data.bio.plays.split(',')[0];
            document.getElementById('bio-plays').innerText = currentLang === 'it' ? 
                (plays.includes('Right') ? 'Destro' : 'Mancino') : plays;
                
            document.getElementById('bio-pro').innerText = data.bio.turned_pro;
            document.getElementById('bio-coach').innerText = data.bio.coach;
        }

        // --- RACE TO TURIN LOGIC ---
        let racePoints = 0;
        if (data.tournaments && data.tournaments.length > 0) {
            racePoints = data.tournaments.reduce((sum, t) => sum + (t.earned || 0), 0);
        }
        racePoints = data.race_points || racePoints;

        document.getElementById('race-points-display').innerText = racePoints;
        const racePct = Math.min((racePoints / QUALIFICATION_POINTS) * 100, 100).toFixed(1);
        document.getElementById('race-pct-display').innerText = racePct + '%';
        
        setTimeout(() => {
            const bar = document.getElementById('bar-race');
            if(bar) bar.style.width = racePct + '%';
        }, 100);

        const statusEl = document.getElementById('race-status');
        if (statusEl) {
            if (racePoints >= QUALIFICATION_POINTS) {
                statusEl.innerText = translations[currentLang].qualified;
                statusEl.classList.add('text-sinner-green');
                statusEl.classList.remove('text-gray-400', 'dark:text-gray-500');
            } else {
                statusEl.innerText = translations[currentLang].qualifying;
                statusEl.classList.remove('text-sinner-green');
                statusEl.classList.add('text-gray-400', 'dark:text-gray-500');
            }
        }

        if (data.tournaments) {
            renderTableAndPoints(data.tournaments);
            renderChart(data.tournaments, data.total_points);
        }
        
        if (data.stats) renderRadarChart(data.stats);
        
        // --- SURFACE MASTERY LOGIC ---
        if (data.surface_mastery) {
            renderDoughnutChart(data.surface_mastery);
        }
        
        renderTrophies(data.trophies || []);
        renderH2H(data.rivalries || []); 

        // --- SPECIAL H2H LOGIC ---
        if (data.special_h2h) {
            document.getElementById('pigeon-name').innerText = data.special_h2h.pigeon.name;
            document.getElementById('pigeon-score').innerText = `${data.special_h2h.pigeon.wins} - ${data.special_h2h.pigeon.losses}`;
            
            document.getElementById('nemesis-name').innerText = data.special_h2h.nemesis.name;
            document.getElementById('nemesis-score').innerText = `${data.special_h2h.nemesis.wins} - ${data.special_h2h.nemesis.losses}`;
        }

        if (data.roadmap) renderRoadmap(data.roadmap);

        // --- FOX STREAK LOGIC ---
        const streakBadge = document.getElementById('streak-badge');
        const streakCount = document.getElementById('streak-count');
        if (data.current_streak && data.current_streak >= 3) {
            if(streakCount) streakCount.innerText = data.current_streak;
            if (streakBadge) {
                streakBadge.innerHTML = `🔥 <span id="streak-count">${data.current_streak}</span> ${translations[currentLang].winStreak}`;
                streakBadge.classList.remove('hidden');
            }
        } else {
            if (streakBadge) streakBadge.classList.add('hidden');
        }

        // --- INSTAGRAM SHARE LOGIC ---
        const shareBtn = document.getElementById('share-btn');
        if (shareBtn) {
            const newShareBtn = shareBtn.cloneNode(true);
            shareBtn.parentNode.replaceChild(newShareBtn, shareBtn);
            
            newShareBtn.addEventListener('click', async () => {
                const banner = document.getElementById('tournament-banner');
                
                newShareBtn.innerText = "⏳";
                newShareBtn.style.opacity = "0"; 
                
                try {
                    const canvas = await html2canvas(banner, {
                        scale: 3,
                        backgroundColor: '#171717', 
                        useCORS: true
                    });
                    
                    newShareBtn.innerText = "📸";
                    newShareBtn.style.opacity = "1";
                    
                    const image = canvas.toDataURL("image/jpeg", 0.95);
                    const link = document.createElement('a');
                    link.href = image;
                    link.download = `SinnerTracker-Banner.jpg`;
                    link.click();
                } catch (e) {
                    console.error("Errore screenshot:", e);
                    newShareBtn.innerText = "📸";
                    newShareBtn.style.opacity = "1";
                }
            });
        }
        
        updateSlamCountdown();
    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

function renderRadarChart(s) {
    const ctxEl = document.getElementById('radarChart');
    if(!ctxEl) return;
    const ctx = ctxEl.getContext('2d');
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
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: 30
            },
            scales: {
                r: {
                    angleLines: { color: gridColor },
                    grid: { color: gridColor },
                    pointLabels: { 
                        color: color, 
                        font: { 
                            size: 10,
                            weight: 'bold', 
                            family: 'Montserrat' 
                        } 
                    },
                    ticks: { display: false, stepSize: 20 },
                    suggestedMin: 0, suggestedMax: 100
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function renderDoughnutChart(surfaces) {
    const ctxEl = document.getElementById('doughnutChart');
    if(!ctxEl) return;
    
    // Update center text (Total Wins)
    const totalWins = (surfaces.Hard || 0) + (surfaces.Clay || 0) + (surfaces.Grass || 0);
    const centerText = document.getElementById('total-wins-center');
    if(centerText) centerText.innerText = totalWins;

    const ctx = ctxEl.getContext('2d');
    const isDark = document.documentElement.classList.contains('dark');

    if (window.sinnerDoughnut) window.sinnerDoughnut.destroy();
    window.sinnerDoughnut = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Hard', 'Clay', 'Grass'],
            datasets: [{
                data: [surfaces.Hard || 0, surfaces.Clay || 0, surfaces.Grass || 0],
                backgroundColor: [
                    '#3b82f6', // Blue for Hard
                    '#ea580c', // Dark Orange for Clay
                    '#22c55e'  // Green for Grass
                ],
                borderWidth: isDark ? 2 : 0,
                borderColor: isDark ? '#1e293b' : '#ffffff', // Match dark-card background
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: isDark ? '#94a3b8' : '#64748b',
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            }
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
                <td class="py-3 px-4 text-sinner-orange font-bold">${t.name}</td>
                <td class="py-3 px-4 text-center text-gray-400">${t.defending}</td>
                <td class="py-3 px-4 text-center font-bold">${t.earned}</td>
                <td class="py-3 px-4 text-center font-black ${diff >= 0 ? 'text-sinner-green' : 'text-red-500'}">${diff >= 0 ? '+' : ''}${diff}</td>
            </tr>`;
    });
    tableBody.innerHTML = htmlContent;
}

function renderChart(tournaments, currentTotalPoints) {
    const ctxEl = document.getElementById('pointsChart');
    if(!ctxEl) return;
    const ctx = ctxEl.getContext('2d');
    const isDark = document.documentElement.classList.contains('dark');
    const labels = tournaments.map(t => t.name);
    
    // Calculate the total Net Difference of the tournaments in the list
    const totalNetDiff = tournaments.reduce((sum, t) => sum + (t.earned - t.defending), 0);
    
    // Reverse-engineer the exact starting points dynamically!
    let runningTotal = (currentTotalPoints ? (currentTotalPoints - totalNetDiff) : 7000);
    
    const pointsData = tournaments.map(t => { 
        runningTotal += (t.earned - t.defending); 
        return runningTotal; 
    });

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

    // Group trophies by Title
    const groupedTrophies = {};
    trophiesData.forEach(t => {
        if (!groupedTrophies[t.title]) {
            groupedTrophies[t.title] = {
                title: t.title,
                category: t.category,
                years: []
            };
        }
        groupedTrophies[t.title].years.push(t.year);
    });

    // Sort trophies: Career Golden Masters first, then by most recent year
    const sortedTrophies = Object.values(groupedTrophies).sort((a, b) => {
        if (a.title === "Career Golden Masters") return -1;
        if (b.title === "Career Golden Masters") return 1;
        return Math.max(...b.years) - Math.max(...a.years);
    });

    let htmlContent = '';
    sortedTrophies.forEach(t => {
        // Sort years in descending order for display
        t.years.sort((a, b) => b - a);

        let style = "bg-white/60 dark:bg-dark-card/60 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50";
        let icon = '🏆';
        let glow = "hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]";

        if (t.category === "Grand Slam" && t.title !== "Career Golden Masters") {
            style = "bg-gradient-to-br from-yellow-50/80 to-orange-50/80 dark:from-yellow-900/40 dark:to-orange-900/40 border-yellow-400/30";
            icon = '👑';
            glow = "hover:shadow-[0_0_25px_rgba(250,204,21,0.2)]";
        } else if (t.category === "ATP Finals") {
            style = "bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-900/40 dark:to-cyan-900/40 border-turin-blue/30";
            icon = '💎';
            glow = "hover:shadow-[0_0_25px_rgba(37,99,235,0.2)]";
        } else if (t.title === "Career Golden Masters") {
            style = "bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 border-yellow-300 text-white shadow-lg";
            icon = '✨';
            glow = "hover:shadow-[0_0_35px_rgba(234,179,8,0.5)] scale-105";
        }

        // Creation for years badges
        const yearsBadges = t.years.map(y => 
            `<span class="px-2.5 py-1 bg-sinner-orange/90 backdrop-blur-sm text-white text-[11px] font-black rounded-lg shadow-sm border border-white/20">${y}</span>`
        ).join('');

        htmlContent += `<div class="p-6 rounded-2xl border text-center ${style} transition-all duration-500 transform hover:-translate-y-2 ${glow}">
            <div class="text-5xl mb-4 drop-shadow-md transform transition-transform group-hover:scale-110">${icon}</div>
            <h4 class="font-black text-sm mb-3 uppercase tracking-wide ${t.title === 'Career Golden Masters' ? 'text-white' : 'text-sinner-black dark:text-gray-100'}">${t.title}</h4>
            <div class="flex flex-wrap justify-center gap-1.5 mt-auto">
                ${yearsBadges}
            </div>
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

function renderRoadmap(roadmapData) {
    const container = document.getElementById('roadmap-container');
    if (!container || !roadmapData || roadmapData.length === 0) return;
    
    let htmlContent = '';
    
    roadmapData.forEach((tourn, index) => {
        // Format Date (e.g. "Oct 05")
        const d = new Date(tourn.date);
        const dateStr = d.toLocaleDateString(currentLang === 'en' ? 'en-US' : 'it-IT', { month: 'short', day: 'numeric' });
        
        // Define colors based on court type
        let courtColor = 'bg-blue-500'; // Hard
        let courtEmoji = '🔵';
        if (tourn.court.toLowerCase().includes('clay')) {
            courtColor = 'bg-orange-600';
            courtEmoji = '🟠';
        } else if (tourn.court.toLowerCase().includes('grass')) {
            courtColor = 'bg-green-500';
            courtEmoji = '🟢';
        } else if (tourn.court.toLowerCase().includes('i.hard')) {
            courtColor = 'bg-indigo-500';
            courtEmoji = '🟣';
        }

        htmlContent += `
            <div class="flex flex-row md:flex-col items-center md:text-center gap-4 group custom-hover">
                <div class="flex-shrink-0 bg-gray-100 dark:bg-gray-800 text-sinner-black dark:text-gray-300 font-bold px-3 py-1.5 rounded-md text-sm border border-gray-200 dark:border-gray-600 shadow-sm z-10 w-20 text-center">
                    ${dateStr}
                </div>
                
                <div class="hidden md:flex w-6 h-6 rounded-full border-4 border-white dark:border-dark-card ${courtColor} shadow-md z-10 my-2 group-hover:scale-125 transition-transform"></div>
                
                <div class="flex flex-col flex-grow md:flex-grow-0 md:items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700 w-full shadow-sm">
                    <span class="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 flex items-center gap-1">
                        ${courtEmoji} ${tourn.court} • ${tourn.country}
                    </span>
                    <h4 class="font-extrabold text-sm md:text-xs lg:text-sm text-sinner-black dark:text-white leading-tight">
                        ${tourn.name}
                    </h4>
                </div>
            </div>
        `;
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

if(installBtn) {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.classList.remove('hidden');
    });

    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User ${outcome} the PWA install`);
            deferredPrompt = null;
            installBtn.classList.add('hidden');
        }
    });

    window.addEventListener('appinstalled', () => {
        installBtn.classList.add('hidden');
        deferredPrompt = null;
        console.log('PWA was installed successfully');
    });
}