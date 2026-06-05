require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');        // ← ADD
const errorHandler = require('./middleware/errorHandler');

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);                         // ← ADD

app.get('/', (req, res) => {
  res.json({ message: 'AI-Genius server is running!' });
});

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: `Route ${req.originalUrl} not found.` });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});