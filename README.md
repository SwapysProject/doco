# 🏥 Doctor Care System

A comprehensive **AI-powered healthcare management platform** built with **Next.js 15**, **MongoDB**, and **Google Gemini AI**. This modern web application provides doctors with an intuitive interface to manage patients, appointments, prescriptions, and medical records with advanced AI capabilities.

## ✨ Key Features

### 🤖 **AI-Powered Prescription Generation**
- **Google Gemini AI Integration** for intelligent prescription recommendations
- **Smart medication suggestions** based on symptoms, diagnosis, and patient history
- **Drug interaction checking** and allergy alerts
- **Prescription history analysis** for personalized recommendations
- **AI confidence scoring** for transparent decision-making
- **Enhanced MCP (Model Context Protocol)** server for advanced AI capabilities

### 👥 **Patient Management**
- **Comprehensive patient profiles** with medical history, allergies, and current medications
- **Patient search and filtering** with advanced query capabilities
- **Patient status tracking** (Stable, Monitoring, Critical, Active)
- **Patient assignment** and doctor-patient relationship management
- **Real-time patient data updates** with live notifications

### 📅 **Appointment Scheduling**
- **Advanced appointment management** with multiple status types
- **Real-time scheduling** with conflict detection
- **Appointment types**: Consultation, Follow-up, Surgery, Emergency, Checkup
- **Virtual and in-person** appointment support
- **Appointment reminders** and notifications
- **Calendar integration** with filtering capabilities

### 💊 **Prescription Management**
- **Digital prescription creation** with PDF generation
- **Prescription tracking** and status management
- **Medication database** with dosage and frequency management
- **Prescription renewal** and expiration tracking
- **Email delivery** of prescriptions to patients
- **Prescription analytics** and reporting

### 🔐 **Authentication & Security**
- **JWT-based authentication** with secure token management
- **bcrypt password hashing** for enhanced security
- **Role-based access control** for doctors and staff
- **Session management** with automatic logout
- **Secure API endpoints** with middleware protection

### 📊 **Analytics & Dashboard**
- **Real-time statistics** and KPI tracking
- **Patient overview** with health status distribution
- **Appointment analytics** with completion rates
- **Prescription tracking** with AI-generated metrics
- **Interactive charts** using Recharts library
- **Performance monitoring** and system health tracking

### 🎨 **Modern UI/UX**
- **Beautiful dark/light theme** with seamless switching
- **Responsive design** optimized for all devices
- **Smooth animations** powered by Framer Motion
- **Modern component library** using Radix UI primitives
- **Tailwind CSS** for consistent styling
- **Lucide React icons** for visual clarity
- **Enhanced hover effects** and micro-interactions

### 🔄 **Real-time Features**
- **WebSocket integration** with Socket.IO for live updates
- **Real-time notifications** for appointment changes
- **Live patient status updates** across all connected clients
- **Instant messaging** between healthcare providers
- **Real-time data synchronization** across multiple sessions

## 🛠️ Technology Stack

### **Frontend**
- **Next.js 15** with App Router and React 19
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations
- **Radix UI** for accessible components
- **Lucide React** for icons
- **Recharts** for data visualization

### **Backend**
- **Next.js API Routes** for serverless functions
- **MongoDB** for database management
- **JWT** for authentication
- **bcrypt** for password security
- **Socket.IO** for real-time communication

### **AI & Integrations**
- **Google Gemini AI** for prescription generation
- **Model Context Protocol (MCP)** server
- **PDF generation** with jsPDF
- **Email service** with Resend
- **Document processing** with html2canvas

### **Development Tools**
- **ESLint** for code linting
- **TypeScript** for type checking
- **Turbopack** for fast development builds
- **tsx** for TypeScript execution

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- MongoDB database (local or MongoDB Atlas)
- Google Gemini AI API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd doctor-care-system
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Environment Setup**
Create a `.env.local` file with:
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key

# AI Integration
GOOGLE_AI_API_KEY=your_gemini_api_key

# Email Service
RESEND_API_KEY=your_resend_api_key

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. **Database Setup**
```bash
npm run seed-db
```

5. **Start the development server**
```bash
npm run dev
```

6. **Start the MCP server** (optional, for advanced AI features)
```bash
npm run mcp-server
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📱 API Endpoints

### **Authentication**
- `POST /api/auth/login` - Doctor login
- `POST /api/auth/register` - Doctor registration
- `POST /api/auth/logout` - Logout

### **Patient Management**
- `GET /api/patients` - List all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/[id]` - Get patient details
- `PUT /api/patients/[id]` - Update patient
- `DELETE /api/patients/[id]` - Delete patient
- `GET /api/my-patients` - Get assigned patients
- `GET /api/recent-patients` - Get recently viewed patients

### **Appointment Management**
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/[id]` - Update appointment
- `DELETE /api/appointments/[id]` - Delete appointment
- `GET /api/upcoming-appointments` - Get upcoming appointments
- `GET /api/appointment-stats` - Get appointment statistics

### **Prescription Management**
- `GET /api/prescriptions` - List prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/prescriptions/[id]` - Get prescription details
- `GET /api/prescriptions/[id]/download` - Download prescription PDF
- `POST /api/ai-prescription` - Generate AI prescription
- `POST /api/prescription-email` - Email prescription
- `PUT /api/prescription-renewal` - Renew prescription

### **AI Features**
- `POST /api/ai-prescription` - Generate AI-powered prescriptions
- `POST /api/ai-prescription-enhanced` - Enhanced AI prescription with history analysis
- `POST /api/mcp-prescription` - MCP server prescription generation
- `POST /api/mcp-prescription-direct` - Direct MCP prescription calls

### **Analytics & Reports**
- `GET /api/dashboard-stats` - Dashboard statistics
- `GET /api/prescription-status` - Prescription status analytics
- `GET /api/sidebar-data` - Navigation data

### **Settings & Configuration**
- `GET /api/settings/profile` - User profile settings
- `GET /api/settings/notifications` - Notification preferences
- `GET /api/settings/medical` - Medical configuration

### **Real-time Features**
- `GET /api/websocket-status` - WebSocket connection status
- `GET /api/socketio-app` - Socket.IO application endpoint
- `GET /api/notifications` - Real-time notifications

## 🏗️ Project Structure

```
doctor-care-system/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── login/            # Authentication pages
│   │   └── globals.css       # Global styles
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── appointments/     # Appointment management
│   │   ├── patients/         # Patient management
│   │   └── prescriptions/    # Prescription management
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   ├── mcp-server/           # MCP server implementation
│   └── types/                # TypeScript definitions
├── scripts/                  # Database and utility scripts
├── data/                     # Sample data and configurations
└── public/                   # Static assets
```

## 🎯 Core Capabilities

### **AI-Powered Healthcare**
- **Intelligent Prescription Generation** using Google Gemini AI
- **Medical History Analysis** for personalized treatment recommendations
- **Drug Interaction Detection** and allergy checking
- **Symptom-Based Diagnosis** assistance
- **Treatment Effectiveness Tracking** with AI insights

### **Comprehensive Patient Care**
- **360° Patient View** with complete medical history
- **Real-time Health Monitoring** and status tracking
- **Automated Appointment Scheduling** with smart conflicts resolution
- **Digital Prescription Management** with PDF generation
- **Secure Communication** between doctors and patients

### **Advanced Analytics**
- **Performance Dashboards** with real-time KPIs
- **Treatment Outcome Analytics** and success rates
- **Resource Utilization** monitoring and optimization
- **Predictive Health Insights** using AI analysis
- **Custom Reporting** with data export capabilities

### **Enterprise Features**
- **Multi-Doctor Support** with role-based access
- **Scalable Architecture** for healthcare institutions
- **API-First Design** for third-party integrations
- **HIPAA-Compliant** security measures
- **Audit Trails** for all medical decisions

## 🔒 Security Features

- **End-to-End Encryption** for sensitive medical data
- **JWT Authentication** with automatic token refresh
- **Role-Based Access Control** (RBAC) for different user types
- **API Rate Limiting** to prevent abuse
- **Input Validation** and sanitization
- **Secure File Upload** and storage
- **Session Management** with automatic timeout

## 🌟 Unique Features

### **MCP (Model Context Protocol) Integration**
- Advanced AI server for complex medical reasoning
- Structured medical data processing
- Intelligent context understanding for better prescriptions

### **Smart Notifications**
- Real-time alerts for critical patient conditions
- Appointment reminders and scheduling conflicts
- Prescription expiration warnings
- System-wide announcements

### **Advanced Search & Filtering**
- Global search across patients, appointments, and prescriptions
- Advanced filtering with multiple criteria
- Real-time search suggestions
- Saved search queries

### **Responsive Design**
- Mobile-first approach for on-the-go access
- Touch-optimized interfaces for tablet use
- Progressive Web App (PWA) capabilities
- Offline mode for essential features

## 📈 Performance

- **Fast Loading** with Next.js 15 optimizations
- **Efficient Caching** strategies for database queries
- **Optimized Images** and lazy loading
- **Bundle Splitting** for faster page loads
- **Server-Side Rendering** for better SEO
- **Real-time Updates** without page refreshes

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and submit pull requests for any improvements.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@doctorcaresystem.com or join our Slack channel.

---

**Built with ❤️ for modern healthcare by leveraging cutting-edge AI technology and user-centric design principles.**
