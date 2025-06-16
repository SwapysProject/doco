import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { NewPrescriptionPage } from "@/components/prescriptions/new-prescription-dashboard-page";

export default function NewPrescription() {
  return (
    <DashboardLayout>
      <NewPrescriptionPage />
    </DashboardLayout>
  );
}
