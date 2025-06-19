import { Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { NewPrescriptionPage } from "@/components/prescriptions/new-prescription-patient_page";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg">Loading prescription form...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewPrescription() {
  return (
    <DashboardLayout>
      <Suspense fallback={<LoadingFallback />}>
        <NewPrescriptionPage />
      </Suspense>
    </DashboardLayout>
  );
}
