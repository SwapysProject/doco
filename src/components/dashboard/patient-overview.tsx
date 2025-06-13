"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp,
  TrendingDown,
  Activity,
  Heart,
  Thermometer,
  Droplets,
  Weight,
  Users
} from "lucide-react"

/**
 * Health metric interface for patient vital signs
 */
interface HealthMetric {
  label: string;
  value: string;
  unit: string;
  status: "normal" | "warning" | "critical";
  trend: "up" | "down" | "stable";
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  target?: string;
}

/**
 * Patient overview statistics
 */
interface PatientStats {
  totalPatients: number
  newPatients: number
  criticalPatients: number
  dischargedToday: number
  occupancyRate: number
  averageStayDuration: number
}

/**
 * Mock health metrics data
 */
const healthMetrics: HealthMetric[] = [
  {
    label: "Avg Heart Rate",
    value: "72",
    unit: "bpm",
    status: "normal",
    trend: "stable",
    icon: Heart,
    target: "60-100 bpm"
  },
  {
    label: "Avg Temperature",
    value: "98.6",
    unit: "°F",
    status: "normal",
    trend: "stable",
    icon: Thermometer,
    target: "97-99°F"
  },
  {
    label: "Avg Blood Pressure",
    value: "120/80",
    unit: "mmHg",
    status: "normal",
    trend: "down",
    icon: Droplets,
    target: "<140/90"
  },
  {
    label: "Avg BMI",
    value: "24.2",
    unit: "kg/m²",
    status: "normal",
    trend: "up",
    icon: Weight,
    target: "18.5-24.9"
  }
]

/**
 * Mock patient statistics
 */
const patientStats: PatientStats = {
  totalPatients: 247,
  newPatients: 12,
  criticalPatients: 3,
  dischargedToday: 8,
  occupancyRate: 78,
  averageStayDuration: 4.2
}

/**
 * Returns the appropriate status styling for health metrics
 */
function getStatusColor(status: "normal" | "warning" | "critical") {
  switch (status) {
    case "normal":
      return "text-green-600 bg-green-50 border-green-200"
    case "warning":
      return "text-yellow-600 bg-yellow-50 border-yellow-200"
    case "critical":
      return "text-red-600 bg-red-50 border-red-200"
    default:
      return "text-gray-600 bg-gray-50 border-gray-200"
  }
}

/**
 * Returns the appropriate trend icon
 */
function getTrendIcon(trend: "up" | "down" | "stable") {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-3 w-3 text-green-500" />
    case "down":
      return <TrendingDown className="h-3 w-3 text-red-500" />
    case "stable":
    default:
      return <Activity className="h-3 w-3 text-gray-500" />
  }
}

/**
 * Patient Overview Component
 * 
 * Provides a comprehensive overview of patient statistics including:
 * - Overall patient count and status
 * - Average health metrics across all patients
 * - Hospital occupancy and efficiency metrics
 * - Key performance indicators for patient care
 */
export function PatientOverview() {
  return (
    <div className="space-y-6">
      {/* Patient Statistics Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Patient Overview
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Key Statistics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {patientStats.totalPatients}
              </div>
              <div className="text-xs text-muted-foreground">Total Patients</div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {patientStats.newPatients}
              </div>
              <div className="text-xs text-muted-foreground">New Today</div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {patientStats.criticalPatients}
              </div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {patientStats.dischargedToday}
              </div>
              <div className="text-xs text-muted-foreground">Discharged</div>
            </div>
          </div>

          {/* Occupancy Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hospital Occupancy</span>
              <span className="font-medium">{patientStats.occupancyRate}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${patientStats.occupancyRate}%` }}
              ></div>
            </div>
            <div className="text-xs text-muted-foreground">
              {Math.round((patientStats.occupancyRate / 100) * 320)} of 320 beds occupied
            </div>
          </div>

          {/* Average Stay Duration */}
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <div>
              <div className="text-sm font-medium">Avg Stay Duration</div>
              <div className="text-xs text-muted-foreground">Per patient</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">{patientStats.averageStayDuration}</div>
              <div className="text-xs text-muted-foreground">days</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Health Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Average Health Metrics
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Population-wide health indicators
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {healthMetrics.map((metric, index) => {
              const IconComponent = metric.icon
              
              return (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${getStatusColor(metric.status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      <span className="text-sm font-medium">{metric.label}</span>
                    </div>
                    {getTrendIcon(metric.trend)}
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-lg font-bold">
                        {metric.value}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">
                        {metric.unit}
                      </span>
                    </div>
                    
                    <Badge 
                      variant={metric.status === "normal" ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {metric.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {metric.target && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Target: {metric.target}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Today&apos;s Insights</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <div className="text-sm font-medium text-green-800">
                  Recovery Rate Up 2.3%
                </div>                <div className="text-xs text-green-600">
                  Compared to last week&apos;s average
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <div className="text-sm font-medium text-blue-800">
                  New Treatment Protocol
                </div>
                <div className="text-xs text-blue-600">
                  Updated guidelines for cardiac patients
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <div className="text-sm font-medium text-yellow-800">
                  Equipment Maintenance
                </div>
                <div className="text-xs text-yellow-600">
                  MRI Room 2 scheduled for tonight
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}