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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const {
  PORT,
} = require('./config/config');

const dbConnection = require('./config/db.js');
dbConnection();

// Fix database index issues
const fixDatabaseIndexes = async () => {
  try {
    const mongoose = require('mongoose');
    const db = mongoose.connection;
    
    // Wait for database connection
    await new Promise((resolve) => {
      if (db.readyState === 1) {
        resolve();
      } else {
        db.once('open', resolve);
      }
    });
    
    // Drop the problematic phone index from users collection
    try {
      await db.collection('users').dropIndex('phone_1');
      console.log('Successfully dropped phone_1 index from users collection');
    } catch (indexError) {
      if (indexError.code === 27) { // Index not found
        console.log('phone_1 index not found, skipping...');
      } else {
        console.log('Error dropping phone_1 index:', indexError.message);
      }
    }
  } catch (error) {
    console.log('Error fixing database indexes:', error.message);
  }
};

fixDatabaseIndexes();

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


