// --- existing imports ---
const express = require('express');
const app = express();

// --- PROMETHEUS MONITORING SETUP START ---
const client = require('prom-client');

// Create a registry to register metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom metric: HTTP request duration
const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 5],
});
register.registerMetric(httpRequestDuration);

// Middleware to measure request durations
app.use((req, res, next) => {
    const end = httpRequestDuration.startTimer();
    res.on('finish', () => {
        end({
            method: req.method,
            route: req.route?.path || req.path,
            status_code: res.statusCode,
        });
    });
    next();
});

// Endpoint to expose metrics for Prometheus
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (err) {
        res.status(500).end(err);
    }
});
// --- PROMETHEUS MONITORING SETUP END ---

// --- your existing routes ---
app.get('/', (req, res) => {
    res.send('E-Commerce App Running...');
});

// --- server listener ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
