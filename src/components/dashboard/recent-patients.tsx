"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, FileText, Users } from "lucide-react";

/**
 * Format date consistently for SSR/client hydration
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

const recentPatients = [
  {
    id: "P001",
    name: "Sarah Johnson",
    age: 34,
    gender: "Female",
    condition: "Hypertension",
    status: "Stable",
    lastVisit: "2025-06-12",
    nextAppointment: "2025-06-20",
    avatar: "/api/placeholder/32/32",
  },
  {
    id: "P002",
    name: "Michael Chen",
    age: 45,
    gender: "Male",
    condition: "Diabetes Type 2",
    status: "Monitoring",
    lastVisit: "2025-06-11",
    nextAppointment: "2025-06-18",
    avatar: "/api/placeholder/32/32",
  },
  {
    id: "P003",
    name: "Emily Davis",
    age: 28,
    gender: "Female",
    condition: "Asthma",
    status: "Stable",
    lastVisit: "2025-06-10",
    nextAppointment: "2025-06-25",
    avatar: "/api/placeholder/32/32",
  },
  {
    id: "P004",
    name: "Robert Wilson",
    age: 67,
    gender: "Male",
    condition: "Heart Disease",
    status: "Critical",
    lastVisit: "2025-06-13",
    nextAppointment: "2025-06-14",
    avatar: "/api/placeholder/32/32",
  },
  {
    id: "P005",
    name: "Lisa Anderson",
    age: 52,
    gender: "Female",
    condition: "Arthritis",
    status: "Stable",
    lastVisit: "2025-06-09",
    nextAppointment: "2025-06-22",
    avatar: "/api/placeholder/32/32",
  },
];

const getStatusColor = (status: string | undefined | null) => {
  if (!status) return "bg-gray-500/10 text-gray-700 hover:bg-gray-500/20";

  switch (status.toLowerCase()) {
    case "stable":
      return "bg-green-500/10 text-green-700 hover:bg-green-500/20";
    case "monitoring":
      return "bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20";
    case "critical":
      return "bg-red-500/10 text-red-700 hover:bg-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-700 hover:bg-gray-500/20";
  }
};

export function RecentPatients() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Recent Patients
        </CardTitle>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Next Appointment</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentPatients.map((patient) => (
              <TableRow key={patient.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={patient.avatar} alt={patient.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">
                        {patient.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {patient.age}y, {patient.gender}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{patient.condition}</span>
                </TableCell>{" "}
                <TableCell>
                  <Badge className={getStatusColor(patient.status)}>
                    {patient.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(patient.lastVisit)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(patient.nextAppointment)}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Patient
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" />
                        Medical Records
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
