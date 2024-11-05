const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const targetUrl = 'http://api.backpack.exchange'; // Actual API URL
const allowedOrigin = 'http://localhost:3000'; // Frontend origin

// Enable CORS with more relaxed settings (you can adjust as needed)

app.use(cors({
    origin: 'http://localhost:3000', // Make sure the frontend origin is allowed
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'], // Allow methods
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Referer', 'Origin'], // Allow necessary headers
}));


// Handle OPTIONS preflight requests
app.options('*', (req, res) => {
    res.sendStatus(200);
});

// Proxy setup
app.use('/api', createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true, // Modify the Origin header to match the target API
    secure: false, // Disable SSL verification (use for local dev)
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying request to: ${targetUrl}${req.url}`);

        // Optional: Set custom headers if necessary
        proxyReq.setHeader('sec-fetch-site', 'same-site');
        proxyReq.setHeader('sec-fetch-mode', 'cors');
        proxyReq.setHeader('sec-fetch-dest', 'empty');
        proxyReq.setHeader('sec-ch-ua', '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"');
        proxyReq.setHeader('sec-ch-ua-mobile', '?0');
        proxyReq.setHeader('sec-ch-ua-platform', '"Windows"');
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
    console.log(`Server is running on port ${port}`);
});
