const fs = require('fs');
const path = require('path');

// Fonction pour lire le dernier rapport Newman (JSON) s'il existe
function getLatestTestResults() {
    const reportsDir = './reports';
    const jsonReports = [];
    if (fs.existsSync(reportsDir)) {
        const files = fs.readdirSync(reportsDir);
        files.forEach(file => {
            if (file.endsWith('.json') && file.includes('newman')) {
                jsonReports.push(path.join(reportsDir, file));
            }
        });
    }
    if (jsonReports.length === 0) return null;
    // Prendre le plus récent
    const latest = jsonReports.sort().reverse()[0];
    try {
        return JSON.parse(fs.readFileSync(latest, 'utf8'));
    } catch(e) { return null; }
}

// Générer le contenu HTML
function generateDashboard() {
    const results = getLatestTestResults();
    const timestamp = new Date().toLocaleString();

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Tests Dashboard - User288-wq</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f6f8fa; margin: 0; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; margin-bottom: 30px; }
        h1 { margin: 0 0 10px 0; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; border-radius: 15px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .stat-value { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
        .stat-label { color: #666; font-size: 0.9em; text-transform: uppercase; }
        .chart-container { background: white; border-radius: 15px; padding: 20px; margin-bottom: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        canvas { max-height: 400px; }
        .footer { text-align: center; margin-top: 40px; color: #666; font-size: 0.8em; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>🚀 API Tests Dashboard</h1>
        <p>User288-wq - Dernière mise à jour : ${timestamp}</p>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-label">✅ Taux de succès</div>
            <div class="stat-value">${results ? results.run.stats.assertions.total ? (results.run.stats.assertions.failed === 0 ? 100 : ((results.run.stats.assertions.total - results.run.stats.assertions.failed) / results.run.stats.assertions.total * 100).toFixed(1)) : 'N/A' : 'N/A'}%</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">📊 Total assertions</div>
            <div class="stat-value">${results ? results.run.stats.assertions.total : 'N/A'}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">⏱️ Temps réponse moyen</div>
            <div class="stat-value">${results ? Math.round(results.run.stats.responseTimes.average) : 'N/A'} ms</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">📈 Dernier run</div>
            <div class="stat-value">${results ? new Date(results.run.timings.started).toLocaleTimeString() : 'N/A'}</div>
        </div>
    </div>

    <div class="chart-container">
        <canvas id="resultsChart" width="400" height="200"></canvas>
    </div>
    <div class="chart-container">
        <canvas id="responseTimesChart" width="400" height="200"></canvas>
    </div>

    <div class="footer">
        <p>🤖 Généré automatiquement par GitHub Actions | <a href="https://github.com/User288-wq/api-testing-demo">Repository</a></p>
    </div>
</div>
<script>
    const ctx1 = document.getElementById('resultsChart').getContext('2d');
    new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: ['Assertions réussies', 'Assertions échouées'],
            datasets: [{
                label: 'Nombre',
                data: [${results ? results.run.stats.assertions.total - results.run.stats.assertions.failed : 0}, ${results ? results.run.stats.assertions.failed : 0}],
                backgroundColor: ['#2cbe4e', '#cb2431'],
                borderRadius: 5
            }]
        },
        options: { responsive: true, maintainAspectRatio: true }
    });

    const ctx2 = document.getElementById('responseTimesChart').getContext('2d');
    new Chart(ctx2, {
        type: 'line',
        data: {
            labels: ${results ? JSON.stringify(results.run.executions.map((_,i) => `Requête ${i+1}`)) : '[]'},
            datasets: [{
                label: 'Temps de réponse (ms)',
                data: ${results ? JSON.stringify(results.run.executions.map(e => e.response.responseTime)) : '[]'},
                borderColor: '#667eea',
                tension: 0.3,
                fill: false
            }]
        },
        options: { responsive: true, maintainAspectRatio: true }
    });
</script>
</body>
</html>`;
    // Écrire dans le dossier docs (pour GitHub Pages)
    if (!fs.existsSync('./docs')) fs.mkdirSync('./docs');
    fs.writeFileSync('./docs/index.html', html);
    console.log('✅ Dashboard généré dans docs/index.html');
}

generateDashboard();
