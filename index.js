require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const targetUrl = 'https://api.backpack.exchange'; // Your target API

// Allow ALL origins (wide-open CORS)
app.use(cors({
    origin: '*', // Allows any domain
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['*'], // Allows all headers
}));

// Proxy middleware
app.use('/api', createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true, // Changes the 'Host' header to target URL
    secure: false, // Disable SSL verification (enable in production)
    pathRewrite: { '^/api': '' }, // Removes '/api' from the path
    logLevel: 'debug', // Helps in debugging
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying: ${req.method} ${req.url}`);
    },
    onProxyRes: (proxyRes, req, res) => {
        // Force-set CORS headers (optional, since cors() already handles it)
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    }
}));

// Handle OPTIONS preflight (already handled by cors(), but explicit for safety)
app.options('*', cors());

// Error handling
app.use((err, req, res, next) => {
    console.error('Proxy Error:', err);
    res.status(500).json({ error: 'Proxy server error' });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Proxy server running on http://localhost:${port}`);
});
