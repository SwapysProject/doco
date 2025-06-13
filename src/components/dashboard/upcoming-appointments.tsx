"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  User,
  MoreHorizontal
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * Appointment type definition
 */
type AppointmentType = "consultation" | "follow-up" | "surgery" | "emergency"
type AppointmentStatus = "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled"

/**
 * Appointment data interface
 */
interface Appointment {
  id: string
  patientName: string
  patientId: string
  time: string
  duration: number // in minutes
  type: AppointmentType
  status: AppointmentStatus
  location: string
  isVirtual?: boolean
  notes?: string
  avatar?: string
}

/**
 * Mock appointment data for demonstration
 */
const upcomingAppointments: Appointment[] = [
  {
    id: "A001",
    patientName: "Sarah Johnson",
    patientId: "P001",
    time: "09:00",
    duration: 30,
    type: "consultation",
    status: "confirmed",
    location: "Room A-102",
    notes: "Routine checkup"
  },
  {
    id: "A002",
    patientName: "Michael Chen",
    patientId: "P002",
    time: "09:30",
    duration: 45,
    type: "follow-up",
    status: "scheduled",
    location: "Room A-105",
    notes: "Post-surgery follow-up"
  },
  {
    id: "A003",
    patientName: "Emily Rodriguez",
    patientId: "P003",
    time: "10:15",
    duration: 30,
    type: "consultation",
    status: "confirmed",
    location: "Virtual",
    isVirtual: true,
    notes: "Diabetes management review"
  },
  {
    id: "A004",
    patientName: "James Wilson",
    patientId: "P004",
    time: "11:00",
    duration: 60,
    type: "surgery",
    status: "scheduled",
    location: "OR-2",
    notes: "Minor surgical procedure"
  },
  {
    id: "A005",
    patientName: "Lisa Thompson",
    patientId: "P005",
    time: "14:00",
    duration: 30,
    type: "follow-up",
    status: "confirmed",
    location: "Room B-201",
    notes: "Treatment progress review"
  }
]

/**
 * Returns the appropriate appointment type badge styling
 */
function getAppointmentTypeBadge(type: AppointmentType) {
  const typeConfig = {
    consultation: {
      className: "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20",
      label: "Consultation"
    },
    "follow-up": {
      className: "bg-green-500/10 text-green-700 hover:bg-green-500/20",
      label: "Follow-up"
    },
    surgery: {
      className: "bg-red-500/10 text-red-700 hover:bg-red-500/20",
      label: "Surgery"
    },
    emergency: {
      className: "bg-orange-500/10 text-orange-700 hover:bg-orange-500/20",
      label: "Emergency"
    }
  }

  const config = typeConfig[type]
  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  )
}

/**
 * Returns the appropriate status badge styling
 */
function getStatusBadge(status: AppointmentStatus) {
  const statusConfig = {
    scheduled: {
      className: "bg-gray-500/10 text-gray-700 hover:bg-gray-500/20",
      label: "Scheduled"
    },
    confirmed: {
      className: "bg-green-500/10 text-green-700 hover:bg-green-500/20",
      label: "Confirmed"
    },
    "in-progress": {
      className: "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20",
      label: "In Progress"
    },
    completed: {
      className: "bg-purple-500/10 text-purple-700 hover:bg-purple-500/20",
      label: "Completed"
    },
    cancelled: {
      className: "bg-red-500/10 text-red-700 hover:bg-red-500/20",
      label: "Cancelled"
    }
  }

  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}

/**
 * Upcoming Appointments Component
 * 
 * Displays today's scheduled appointments with:
 * - Time and duration information
 * - Patient details and appointment type
 * - Location (physical or virtual)
 * - Quick action buttons for each appointment
 * - Status tracking and management
 */
export function UpcomingAppointments() {
  const currentTime = new Date()
  const todayString = currentTime.toDateString()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today&apos;s Appointments
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {todayString} • {upcomingAppointments.length} appointments scheduled
          </p>
        </div>
        <Button variant="outline" size="sm">
          Manage Schedule
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {upcomingAppointments.map((appointment) => (
            <div 
              key={appointment.id} 
              className="flex items-center gap-4 p-4 rounded-lg border bg-muted/25 hover:bg-muted/50 transition-colors"
            >
              {/* Time Column */}
              <div className="flex flex-col items-center min-w-[80px] text-center">
                <div className="text-lg font-semibold text-foreground">
                  {appointment.time}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {appointment.duration}min
                </div>
              </div>

              {/* Patient Info */}
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={appointment.avatar || `/api/placeholder/40/40`} 
                    alt={appointment.patientName} 
                  />
                  <AvatarFallback className="text-sm">
                    {appointment.patientName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground truncate">
                      {appointment.patientName}
                    </h4>
                    {getAppointmentTypeBadge(appointment.type)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {appointment.patientId}
                    </span>
                    
                    <span className="flex items-center gap-1">
                      {appointment.isVirtual ? (
                        <>
                          <Video className="h-3 w-3" />
                          Virtual Meeting
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3 w-3" />
                          {appointment.location}
                        </>
                      )}
                    </span>
                  </div>
                  
                  {appointment.notes && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {appointment.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center gap-3">
                {getStatusBadge(appointment.status)}
                
                <div className="flex gap-1">
                  {appointment.isVirtual ? (
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <Video className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <Phone className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        Start Appointment
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Reschedule
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        View Patient Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Add Notes
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Cancel Appointment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Schedule Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              Total appointments today: {upcomingAppointments.length}
            </div>
            <div className="flex gap-4 text-muted-foreground">
              <span>Next: {upcomingAppointments[0]?.time || "None"}</span>
              <span>•</span>
              <span>Free time: 12:00 - 13:00</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
