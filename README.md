# 🦊🥕 Sinner Tracker - The Fox Dashboard

An unofficial, high-performance web dashboard dedicated to tracking **Jannik Sinner's** ATP journey in real-time. This project combines data automation with a sleek, responsive UI to provide fans with a professional-grade tennis analytics tool.

## Live Demo

Check out the live dashboard [here](https://dimuzzo.github.io/sinner-tracker/).

## Key Features

* **Live-ish Data**: Automated daily updates of ATP Ranking, Points, and Match Statistics using GitHub Actions.
* **The Fox Stats**: Custom Radar Chart visualizing technical skills (Serve In, BP Saved, Return Won, BP Converted).
* **Surface Mastery**: Doughnut Chart breakdown of wins across Hard, Clay, and Grass courts, with detailed win counts for each surface.
* **Season Overview**: Quick view of ATP ranking, titles, win/loss record, total points, and current winning streak.
* **Next Match & Event**: Dynamic hero section showing the upcoming match, opponent, round, scheduled time, local time zone, and countdown to the next major event.
* **Tournament Roadmap**: Dynamic timeline of Sinner's elite schedule for the current season, including court type, event dates, and tournament status.
* **Epic Rivalries**: H2H tracking against top rivals (Alcaraz, Djokovic, Zverev) with win percentages plus automated "Nemesis" and "Pigeon" detection.
* **Race to Turin**: Real-time progress bar towards ATP Finals qualification, including the qualification threshold and points difference.
* **Recent Matches**: Recent match results with win/loss filters and opponent/result details.
* **Points Evolution**: Interactive chart showing the evolution of ATP points, with season and net movement views.
* **Tournament Breakdown**: Detailed tournament table showing defending points, earned points, and net difference.
* **Trophy Cabinet**: Filterable trophy collection with repeated titles grouped together by tournament and winning years.
* **Identity Card**: Detailed player bio including height, weight, playing style, birthplace, and coaching team.
* **Responsive UI**: Layout optimized for desktop, tablet, and mobile screens.
* **Dark Mode & Multi-language**: Toggle between light/dark themes and English/Italian languages with dynamically translated labels, dates, surfaces, and statistics.
* **PWA Ready**: Install the dashboard as an app on iOS or Android for a native experience.
* **Offline Support**: Cached dashboard data and assets allow the app to fall back to the last cached snapshot when the network is unavailable.
* **Dynamic Status Information**: Online/offline status and the timestamp of the latest data update are displayed directly in the dashboard.
* **Shareable Banner**: Export the main tournament banner as an image for sharing.
* **Accessibility & Responsive Motion**: Keyboard focus support, reduced-motion handling, and responsive components for different screen sizes.

## Technology Stack

* **Frontend**: HTML5, Tailwind CSS, JavaScript (ES6+).
* **Charts**: [Chart.js](https://www.chartjs.org/) for interactive data visualization.
* **Image Export**: [html2canvas](https://html2canvas.hertzen.com/) for generating shareable dashboard banners.
* **PWA**: Web App Manifest and Service Worker for installation and offline caching.
* **Automation**: Python script (`updater.py`) running on GitHub Actions.
* **Validation & Testing**: Automated data validation and Python tests for the dashboard data pipeline.
* **Data Source**: Tennis API via [RapidAPI](https://rapidapi.com/).

## How It Works (Automation)

The project uses a "serverless" approach to keep data fresh without a backend:

1. **GitHub Action**: A scheduled workflow runs every day at 02:00 UTC.
2. **Python Bot**: The `updater.py` script fetches the latest statistics from the Tennis API.
3. **Data Processing**: The updater normalizes tournament names and court information, processes H2H and recent-match data, calculates derived statistics, and handles API errors safely.
4. **Data Validation**: The generated `data.json` is validated against the expected dashboard structure before being used.
5. **Data Sync**: The script updates the `data.json` file in the repository.
6. **Static Deploy**: GitHub Pages automatically reflects the changes in `data.json` without any manual intervention.

## Local Setup

If you want to contribute or run this locally:

1. **Clone the repo**:

   ```bash
   git clone https://github.com/dimuzzo/sinner-tracker.git
   ```

2. **Configure API Key**:

   Add your RapidAPI key to your environment variables or GitHub Secrets as `API_KEY`.

3. **Run Updater**:

   ```bash
   python updater.py
   ```

4. **Validate Data**:

   ```bash
   python updater.py --validate-only
   ```

5. **Launch Web UI**:

   Open `index.html` with a local HTTP server such as VS Code Live Server.

## License

This project is for educational and fan purposes only. All tennis data is property of their respective owners.

---

*Forza Jannik!* 🎾

---

> Created with passion by [dimuzzo](https://github.com/dimuzzo)