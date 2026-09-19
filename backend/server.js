const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, getDBStatus } = require('./config/db');

// Load env vars
dotenv.config();


const app = express();

// Connect to MongoDB
connectDB();

// Body Parser & CORS
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/brands', require('./routes/brandRoutes'));
app.use('/api/calendars', require('./routes/calendarRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
const pexelsRouter = require('./routes/pexels');
// Health check endpoint
app.use('/api/pexels', pexelsRouter);
app.get('/api/health', (req, res) => {

  const dbStatus = getDBStatus();
  res.json({
    status: 'ok',
    service: 'PostWise-AI API Server',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[PostWise-AI Backend] Server running on port ${PORT}`);
});
