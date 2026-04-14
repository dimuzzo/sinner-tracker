# 🦊🥕 Sinner Tracker - The Fox Dashboard

An unofficial, high-performance web dashboard dedicated to tracking **Jannik Sinner's** ATP journey in real-time. This project combines data automation with a sleek, responsive UI to provide fans with a professional-grade tennis analytics tool.

## Live Demo
Check out the live dashboard [here](https://dimuzzo.github.io/sinner-tracker/).

## Key Features
* **Live-ish Data**: Automated daily updates of ATP Ranking, Points, and Match Statistics using GitHub Actions.
* **The Fox Stats**: Custom Radar Chart visualizing technical skills (Serve In, BP Saved, Return Won, BP Converted).
* **Surface Mastery**: Doughnut Chart breakdown of wins across Hard, Clay, and Grass courts.
* **Tournament Roadmap**: Dynamic timeline of Sinner's elite schedule for the current season.
* **Epic Rivalries**: H2H tracking against top rivals (Alcaraz, Djokovic, Zverev) plus automated "Nemesis" and "Pigeon" detection.
* **Race to Turin**: Real-time progress bar towards ATP Finals qualification.
* **PWA Ready**: Install the dashboard as an app on iOS or Android for a native experience.
* **Identity Card**: Detailed player bio including height, weight, and coaching team.
* **Dark Mode & Multi-language**: Toggle between light/dark themes and English/Italian languages.

## Technology Stack
* **Frontend**: HTML5, Tailwind CSS (for modern UI), JavaScript (ES6+).
* **Charts**: [Chart.js](https://www.chartjs.org/) for interactive data visualization.
* **Automation**: Python script (`updater.py`) running on GitHub Actions.
* **Data Source**: Tennis API via [RapidAPI](https://rapidapi.com/).

## How It Works (Automation)
The project uses a "serverless" approach to keep data fresh without a backend:
1.  **GitHub Action**: A scheduled workflow runs every day at 02:00 UTC.
2.  **Python Bot**: The `updater.py` script fetches the latest statistics from the Tennis API.
3.  **Data Sync**: The script updates the `data.json` file in the repository.
4.  **Static Deploy**: GitHub Pages automatically reflects the changes in `data.json` without any manual intervention.

## Local Setup
If you want to contribute or run this locally:

1.  **Clone the repo**:
    ```bash
    git clone https://github.com/dimuzzo/sinner-tracker.git
    ```
2.  **Configure API Key**:
    Add your RapidAPI key to your environment variables or GitHub Secrets as `API_KEY`.
3.  **Run Updater**:
    ```bash
    python updater.py
    ```
4.  **Launch Web UI**:
    Open `index.html` in any modern browser.

## License
This project is for educational and fan purposes only. All tennis data is property of their respective owners.

---
*Forza Jannik!* 🎾