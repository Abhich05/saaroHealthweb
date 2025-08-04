# SaaroHealth

**Comprehensive Healthcare Management System**

![SaaroHealth Logo](frontend/public/saaro-health2.png)

## 🏥 About SaaroHealth

SaaroHealth is a modern, comprehensive healthcare management system designed to streamline medical practice operations. It provides doctors and healthcare staff with powerful tools for patient management, appointment scheduling, prescription management, and more.

## ✨ Features

### 🎯 Core Features
- **Patient Management** - Complete patient records and history
- **Appointment Scheduling** - Smart appointment booking and management
- **Prescription Management** - Digital prescription creation and management
- **Invoice Generation** - Automated billing and invoice creation
- **Dashboard Analytics** - Real-time insights and reports
- **User Management** - Role-based access control
- **Document Management** - Secure file storage and retrieval

### 🏥 Medical Features
- **Consultation Forms** - Comprehensive medical consultation templates
- **Medicine Library** - Extensive medicine database
- **Template Library** - Reusable medical templates
- **Dropdown Configuration** - Customizable medical options
- **Patient Queue** - Real-time patient queue management
- **IPD Records** - Inpatient department management

### 🔐 Security Features
- **JWT Authentication** - Secure user authentication
- **Role-Based Access** - Granular permission system
- **Data Encryption** - Secure data transmission
- **Session Management** - Secure session handling

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd saarohealth
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Setup**
   ```bash
   # Backend environment variables
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Or start separately
   npm run dev:backend  # Backend server
   npm run dev:frontend # Frontend development server
   ```

## 📁 Project Structure

```
saarohealth/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/                 # Source code
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── api/            # API services
│   │   └── utils/          # Utility functions
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── middlewares/       # Express middlewares
│   └── package.json
└── package.json           # Root package.json
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Icons** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Multer** - File upload handling

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/saarohealth
JWT_SECRET=your-jwt-secret
NODE_ENV=development
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=SaaroHealth
```

## 📱 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development
- `npm run build` - Build frontend for production
- `npm run start` - Start backend server
- `npm run install:all` - Install all dependencies

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## 🏥 User Roles

### Doctor
- Full access to patient management
- Prescription creation and management
- Appointment scheduling
- Dashboard analytics

### Staff/User
- Limited patient access
- Appointment management
- Basic reporting

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

- **Access Tokens** - Short-lived tokens for API access
- **Refresh Tokens** - Long-lived tokens for session renewal
- **Secure Cookies** - Token storage in HTTP-only cookies

## 📊 API Documentation

### Base URL
```
http://localhost:5000
```

### Authentication Endpoints
- `POST /doctor/login` - Doctor login
- `POST /doctor/logout` - Doctor logout
- `POST /user/login` - Staff login
- `POST /user/logout` - Staff logout

### Patient Endpoints
- `GET /doctor/:doctorId/patient` - Get patients
- `POST /doctor/:doctorId/patient` - Create patient
- `PUT /doctor/:doctorId/patient/:patientId` - Update patient

### Appointment Endpoints
- `GET /appointment` - Get appointments
- `POST /appointment` - Create appointment
- `PUT /appointment/:id` - Update appointment

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd backend
npm start
```

### Docker Deployment
```bash
# Build and run with Docker
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Email: support@saarohealth.com
- Documentation: [docs.saarohealth.com](https://docs.saarohealth.com)
- Issues: [GitHub Issues](https://github.com/saarohealth/saarohealth/issues)

---

**SaaroHealth** - Empowering Healthcare Professionals with Modern Technology 