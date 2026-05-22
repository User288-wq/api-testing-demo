const fs = require('fs');
const path = require('path');

function getLatestTestResults() {
    const reportsDir = './reports';
    if (!fs.existsSync(reportsDir)) return null;
    const jsonReports = fs.readdirSync(reportsDir).filter(f => f.endsWith('.json') && f.includes('newman'));
    if (jsonReports.length === 0) return null;
    const latest = jsonReports.sort().reverse()[0];
    try {
        return JSON.parse(fs.readFileSync(path.join(reportsDir, latest), 'utf8'));
    } catch(e) { return null; }
}

function getPerformanceMetrics() {
    const perfFile = './reports/performance-metrics.json';
    if (!fs.existsSync(perfFile)) return null;
    try {
        const data = JSON.parse(fs.readFileSync(perfFile, 'utf8'));
        // k6 output structure may contain metrics
        return data;
    } catch(e) { return null; }
}

function generateDashboard() {
    const results = getLatestTestResults();
    const perf = getPerformanceMetrics();
    const timestamp = new Date().toLocaleString();

    // Extraire des métriques de performance
    let avgResponseTime = 'N/A';
    let p95ResponseTime = 'N/A';
    let errorRate = 'N/A';
    if (perf && perf.metrics) {
        avgResponseTime = perf.metrics.http_req_duration?.avg?.toFixed(0) || 'N/A';
        p95ResponseTime = perf.metrics.http_req_duration?.['p(95)']?.toFixed(0) || 'N/A';
        errorRate = perf.metrics.http_req_failed?.rate?.toFixed(4) || 'N/A';
    }

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
        <h1>  API Tests Dashboard</h1>
        <p>User288-wq - Dernière mise à jour : ${timestamp}</p>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-label">  Taux de succès (fonctionnel)</div>
            <div class="stat-value">${results ? (results.run.stats.assertions.total ? ((results.run.stats.assertions.total - results.run.stats.assertions.failed) / results.run.stats.assertions.total * 100).toFixed(1) : 'N/A') : 'N/A'}%</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">  Temps réponse moyen (ms)</div>
            <div class="stat-value">${avgResponseTime}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">  P95 temps réponse (ms)</div>
            <div class="stat-value">${p95ResponseTime}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">  Taux d'erreur (performance)</div>
            <div class="stat-value">${errorRate === 'N/A' ? 'N/A' : (errorRate * 100).toFixed(2) + '%'}</div>
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
    if (!fs.existsSync('./docs')) fs.mkdirSync('./docs');
    fs.writeFileSync('./docs/index.html', html);
    console.log('  Dashboard généré dans docs/index.html');
}

generateDashboard();
