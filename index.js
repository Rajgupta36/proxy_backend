const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const targetUrl = 'https://api.backpack.exchange'; // Target API
const allowedOrigin = 'http://localhost:3000'; // Frontend origin

// Enable CORS with more relaxed settings
app.use(cors({
    origin: allowedOrigin,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Referer', 'Origin'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    preflightContinue: false,
    optionsSuccessStatus: 200,
}));

// Handle OPTIONS preflight requests
app.options('*', (req, res) => {
    res.sendStatus(200);
});

// Proxy setup with path rewrite
app.use('/api', createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    secure: false, // Disable SSL verification for local dev
    pathRewrite: {
        '^/api': '', // Remove the "/api" prefix when forwarding to the target
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying request to: ${targetUrl}${req.url}`);
        // Optional: Set custom headers if needed
        proxyReq.setHeader('sec-fetch-site', 'same-site');
        proxyReq.setHeader('sec-fetch-mode', 'cors');
        proxyReq.setHeader('sec-fetch-dest', 'empty');
        proxyReq.setHeader('sec-ch-ua', '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"');
        proxyReq.setHeader('sec-ch-ua-mobile', '?0');
        proxyReq.setHeader('sec-ch-ua-platform', '"Windows"');
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`Response received with status: ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
        console.error('Error in proxy:', err);
        res.status(500).send('Proxy error');
    }
}));

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
