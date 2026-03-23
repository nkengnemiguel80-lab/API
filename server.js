const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const articleRoutes = require('./routes/articles');
const { initDB } = require('./models/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Routes
app.use('/api/articles', articleRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Blog API is running', timestamp: new Date().toISOString() });
});

// Root redirect to frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Initialize DB then start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Blog API running at http://localhost:${PORT}`);
    console.log(`📚 Swagger docs at http://localhost:${PORT}/api-docs`);
    console.log(`🌐 Frontend at http://localhost:${PORT}\n`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

module.exports = app;
