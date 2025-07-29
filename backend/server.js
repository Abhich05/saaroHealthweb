require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
app.use((req, res, next) => {
  console.log("REQUEST RECEIVED:", req.method, req.originalUrl);
  next();
});
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const {
  PORT,
} = require('./config/config');

const dbConnection = require('./config/db.js');
dbConnection();

// Serve static files
const publicPath = path.join(__dirname, 'public');
app.use('/public', express.static(publicPath)); 

// Register API routes (including file uploads) AFTER body parsers
const indexRoutes = require('./routes/index.routes');
app.use('/api', indexRoutes);

app.post('/api/logout', (req, res) => {
  res.clearCookie('jwt_token', { 
    path: '/',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.status(200).json({ message: 'Logged out' });
});

app.post('/api/user/logout', (req, res) => {
  res.clearCookie('user_jwt_token', { 
    path: '/',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.status(200).json({ message: 'Logged out' });
});

// Test route to verify authentication
app.get('/api/test-auth', (req, res) => {
  const token = req.cookies?.jwt_token || req.cookies?.user_jwt_token;
  if (token) {
    res.json({ message: 'Authenticated', token: 'Present' });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});


