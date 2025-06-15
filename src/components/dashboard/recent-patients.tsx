"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  Users,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface Patient {
  id: string;
  patientId: string;
  name: string;
  age: string | number;
  condition: string;
  lastVisit: string;
  status: string;
  phone: string;
  email: string;
}

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

export function RecentPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchRecentPatients = async () => {
      try {
        const response = await fetch("/api/recent-patients", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();

        if (data.success) {
          setPatients(data.patients);
          setError(null);
        } else {
          setError(data.message || "Failed to load recent patients");
          if (response.status === 401) {
            console.log("Unauthorized access to recent patients");
          }
        }
      } catch (err) {
        console.error("Error fetching recent patients:", err);
        setError("Failed to load recent patients");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPatients();

    // Refresh every 2 minutes
    const interval = setInterval(fetchRecentPatients, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "stable":
        return "bg-green-500/10 text-green-700 hover:bg-green-500/20";
      case "critical":
        return "bg-red-500/10 text-red-700 hover:bg-red-500/20";
      case "monitoring":
        return "bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20";
      case "active":
        return "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 hover:bg-gray-500/20";
    }
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 transition-all duration-300 hover:shadow-lg">
        <CardContent className="pt-6">
          <div className="text-red-600 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Patients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading patients...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Recent Patients
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="transition-all duration-200 hover:scale-105"
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {patients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent patients found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient, index) => (
                <TableRow
                  key={patient.id}
                  className="hover:bg-muted/50 transition-all duration-200"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: "fadeInUp 0.5s ease-out forwards",
                  }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 transition-all duration-200 hover:scale-110">
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
                          {patient.age} years old
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{patient.condition}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${getStatusColor(patient.status)} transition-all duration-200`}
                    >
                      {patient.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(patient.lastVisit)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="animate-in slide-in-from-right-2 duration-200"
                      >
                        <DropdownMenuItem className="transition-colors duration-200 hover:bg-primary/10">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="transition-colors duration-200 hover:bg-primary/10">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Patient
                        </DropdownMenuItem>
                        <DropdownMenuItem className="transition-colors duration-200 hover:bg-primary/10">
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
        )}
      </CardContent>
    </Card>
  );
}
