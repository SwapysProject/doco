"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Calendar, 
  Activity, 
  TrendingUp,
  Heart,
  Clock,
  AlertTriangle,
  CheckCircle
} from "lucide-react"

const stats = [
  {
    title: "Total Patients",
    value: "1,247",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: Users,
    description: "Active patients this month"
  },
  {
    title: "Today's Appointments",
    value: "24",
    change: "+2",
    changeType: "positive" as const,
    icon: Calendar,
    description: "Scheduled for today"
  },
  {
    title: "Critical Cases",
    value: "3",
    change: "-1",
    changeType: "negative" as const,
    icon: AlertTriangle,
    description: "Requiring immediate attention"
  },
  {
    title: "Recovery Rate",
    value: "94.2%",
    change: "+1.8%",
    changeType: "positive" as const,
    icon: TrendingUp,
    description: "Patient recovery success rate"
  }
]

const quickStats = [
  {
    label: "Stable",
    value: "156",
    color: "bg-green-500",
    icon: CheckCircle
  },
  {
    label: "Monitoring",
    value: "42",
    color: "bg-yellow-500",
    icon: Clock
  },
  {
    label: "Critical",
    value: "3",
    color: "bg-red-500",
    icon: Heart
  },
  {
    label: "Active",
    value: "89",
    color: "bg-blue-500",
    icon: Activity
  }
]

export function DashboardStats() {
  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={stat.changeType === "positive" ? "default" : "destructive"}
                  className={
                    stat.changeType === "positive" 
                      ? "bg-green-500/10 text-green-700 hover:bg-green-500/20" 
                      : "bg-red-500/10 text-red-700 hover:bg-red-500/20"
                  }
                >
                  {stat.change}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Patient Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Patient Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickStats.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className={`p-2 rounded-full ${item.color} text-white`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-lg font-bold text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
