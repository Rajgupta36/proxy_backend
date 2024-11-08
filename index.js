require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const targetUrl = 'https://api.backpack.exchange'; // Actual API URL
const allowedOrigin = process.env.ALLOWED_ORIGIN// Frontend origin


// Enable CORS with more relaxed settings (you can adjust as needed)
app.use(cors({
    origin: allowedOrigin,// Enable credentials if necessary
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Referer', 'Origin'], // Allow additional headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    preflightContinue: false, // Let the proxy handle OPTIONS requests
    optionsSuccessStatus: 200, // Response status for OPTIONS
}));

// Handle OPTIONS preflight requests
app.options('*', (req, res) => {
    res.sendStatus(200);
});

// Proxy setup
app.use('/api', createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true, // Modify the Origin header to match the target API
    secure: true, // Disable SSL verification (use for local dev)
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying request to: ${targetUrl}${req.url}`);
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`Response received with status: ${proxyRes.statusCode}`);
    }
}));

// Error handling
app.use((err, req, res, next) => {
    console.error('Error in proxy:', err);
    res.status(500).send('Proxy error');
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port} + ${process.env.ALLOWED_ORIGIN}`);
});
