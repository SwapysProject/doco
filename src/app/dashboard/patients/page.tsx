"use client"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import React, { useState } from 'react';
import { 
  Search,
  Filter,
  Plus,
  Users,
  ChevronRight,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Edit,
  FileText,
  Activity,
  Pill,
  User,
  MessageSquare,
  Download,
  Eye
} from 'lucide-react';

// Mock patient data
const mockPatients = [
  {
    id: 1,
    name: "Sarah Johnson",
    age: 34,
    gender: "Female",
    phone: "+1 (555) 123-4567",
    email: "sarah.j@email.com",
    address: "123 Oak Street, Springfield, IL 62701",
    condition: "Hypertension",
    status: "Stable",
    lastVisit: "2025-06-10",
    nextAppointment: "2025-06-20",
    bloodType: "O+",
    allergies: ["Penicillin", "Shellfish"],
    medications: ["Lisinopril 10mg", "Metformin 500mg"],
    vitals: {
      bloodPressure: "120/80",
      heartRate: "72 bpm",
      temperature: "98.6°F",
      weight: "145 lbs",
      height: "5'6\""
    },
    medicalHistory: [
      { date: "2025-06-10", condition: "Routine Checkup", notes: "Blood pressure stable, continue current medication" },
      { date: "2025-05-15", condition: "Hypertension Follow-up", notes: "Adjusted medication dosage" },
      { date: "2025-04-12", condition: "Annual Physical", notes: "Overall health good, recommended lifestyle changes" }
    ]
  },
  {
    id: 2,
    name: "Michael Chen",
    age: 42,
    gender: "Male",
    phone: "+1 (555) 234-5678",
    email: "m.chen@email.com",
    address: "456 Pine Avenue, Springfield, IL 62702",
    condition: "Diabetes Type 2",
    status: "Monitoring",
    lastVisit: "2025-06-08",
    nextAppointment: "2025-06-18",
    bloodType: "A+",
    allergies: ["Sulfa drugs"],
    medications: ["Metformin 1000mg", "Glipizide 5mg"],
    vitals: {
      bloodPressure: "130/85",
      heartRate: "78 bpm",
      temperature: "98.4°F",
      weight: "180 lbs",
      height: "5'10\""
    },
    medicalHistory: [
      { date: "2025-06-08", condition: "Diabetes Management", notes: "HbA1c levels improved, continue current treatment" },
      { date: "2025-05-10", condition: "Blood Sugar Check", notes: "Glucose levels within target range" }
    ]
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    age: 28,
    gender: "Female",
    phone: "+1 (555) 345-6789",
    email: "emily.r@email.com",
    address: "789 Maple Drive, Springfield, IL 62703",
    condition: "Asthma",
    status: "Critical",
    lastVisit: "2025-06-12",
    nextAppointment: "2025-06-15",
    bloodType: "B-",
    allergies: ["Dust mites", "Pollen"],
    medications: ["Albuterol inhaler", "Fluticasone nasal spray"],
    vitals: {
      bloodPressure: "110/70",
      heartRate: "85 bpm",
      temperature: "99.1°F",
      weight: "125 lbs",
      height: "5'4\""
    },
    medicalHistory: [
      { date: "2025-06-12", condition: "Asthma Exacerbation", notes: "Increased inhaler usage, prescribed oral steroids" },
      { date: "2025-05-20", condition: "Routine Follow-up", notes: "Asthma well controlled" }
    ]
  },
  {
    id: 4,
    name: "David Thompson",
    age: 55,
    gender: "Male",
    phone: "+1 (555) 456-7890",
    email: "d.thompson@email.com",
    address: "321 Elm Street, Springfield, IL 62704",
    condition: "Cardiac Arrhythmia",
    status: "Active",
    lastVisit: "2025-06-11",
    nextAppointment: "2025-06-25",
    bloodType: "AB+",
    allergies: ["None known"],
    medications: ["Warfarin 5mg", "Metoprolol 50mg"],
    vitals: {
      bloodPressure: "140/90",
      heartRate: "95 bpm",
      temperature: "98.8°F",
      weight: "200 lbs",
      height: "6'1\""
    },
    medicalHistory: [
      { date: "2025-06-11", condition: "Arrhythmia Monitoring", notes: "EKG shows improvement, continue medication" },
      { date: "2025-05-28", condition: "Cardiology Consultation", notes: "Referred for stress test" }
    ]
  }
];

export default function PatientsPage() {
  const [view, setView] = useState('list'); // 'list' or 'detail'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredPatients = mockPatients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || patient.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'stable': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'monitoring': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'critical': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'active': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'stable': return <CheckCircle className="w-4 h-4" />;
      case 'monitoring': return <Clock className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'active': return <Activity className="w-4 h-4" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    setView('detail');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedPatient(null);
  };

  if (view === 'detail' && selectedPatient) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToList}
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Back to Patients</span>
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{selectedPatient.name}</h1>
                    <p className="text-sm text-muted-foreground">Patient Details</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center space-x-2">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Message</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Detail Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Patient Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Basic Info Card */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Patient Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Age</span>
                    <span className="text-sm font-medium text-foreground">{selectedPatient.age} years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Gender</span>
                    <span className="text-sm font-medium text-foreground">{selectedPatient.gender}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Blood Type</span>
                    <span className="text-sm font-medium text-foreground">{selectedPatient.bloodType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPatient.status)}`}>
                      {getStatusIcon(selectedPatient.status)}
                      <span>{selectedPatient.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info Card */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{selectedPatient.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{selectedPatient.email}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm text-foreground">{selectedPatient.address}</span>
                  </div>
                </div>
              </div>

              {/* Vitals Card */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Latest Vitals</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Blood Pressure</span>
                    <span className="text-sm font-medium text-foreground">{selectedPatient.vitals.bloodPressure}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Heart Rate</span>
                    <span className="text-sm font-medium text-foreground">{selectedPatient.vitals.heartRate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Temperature</span>
                    <span className="text-sm font-medium text-foreground">{selectedPatient.vitals.temperature}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Weight</span>
                    <span className="text-sm font-medium text-foreground">{selectedPatient.vitals.weight}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Height</span>
                    <span className="text-sm font-medium text-foreground">{selectedPatient.vitals.height}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Medical Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Appointments Card */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Appointments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Last Visit</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedPatient.lastVisit}</p>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Next Appointment</span>
                    </div>
                    <p className="text-sm text-primary font-medium">{selectedPatient.nextAppointment}</p>
                  </div>
                </div>
              </div>

              {/* Current Medications */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Current Medications</h3>
                <div className="space-y-3">
                  {selectedPatient.medications.map((medication, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <Pill className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{medication}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allergies */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Allergies</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.allergies.map((allergy, index) => (
                    <span key={index} className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-full text-xs font-medium">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>

              {/* Medical History */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Medical History</h3>
                <div className="space-y-4">
                  {selectedPatient.medicalHistory.map((record, index) => (
                    <div key={index} className="border-l-2 border-primary/20 pl-4 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-foreground">{record.condition}</h4>
                        <span className="text-xs text-muted-foreground">{record.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{record.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
     <>
            <DashboardLayout>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Patients</h1>
                  <p className="text-sm text-muted-foreground">Manage and view patient information</p>
                </div>
              </div>
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Patient</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="px-6 py-4 bg-card border-b border-border">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search patients by name, condition, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            >
              <option value="all">All Status</option>
              <option value="stable">Stable</option>
              <option value="monitoring">Monitoring</option>
              <option value="critical">Critical</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{mockPatients.length}</p>
                <p className="text-sm text-muted-foreground">Total Patients</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{mockPatients.filter(p => p.status === 'Stable').length}</p>
                <p className="text-sm text-muted-foreground">Stable</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{mockPatients.filter(p => p.status === 'Monitoring').length}</p>
                <p className="text-sm text-muted-foreground">Monitoring</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{mockPatients.filter(p => p.status === 'Critical').length}</p>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
            </div>
          </div>
        </div>

        {/* Patients List */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Patient List</h2>
            <p className="text-sm text-muted-foreground">
              {filteredPatients.length} of {mockPatients.length} patients
            </p>
          </div>
          <div className="divide-y divide-border">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => handlePatientClick(patient)}
                className="px-6 py-4 hover:bg-accent cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{patient.name}</h3>
                      <p className="text-sm text-muted-foreground">{patient.age} years • {patient.gender}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{patient.condition}</p>
                      <p className="text-xs text-muted-foreground">Last visit: {patient.lastVisit}</p>
                    </div>
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                      {getStatusIcon(patient.status)}
                      <span>{patient.status}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Next appointment</p>
                        <p className="text-sm font-medium text-foreground">{patient.nextAppointment}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredPatients.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No patients found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
    </>
  );
}