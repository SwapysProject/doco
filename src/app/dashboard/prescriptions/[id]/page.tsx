import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PrescriptionDetailsPage } from "@/components/prescriptions/prescription-details-page";

interface PrescriptionPageProps {
  params: {
    id: string;
  };
}

export default function PrescriptionPage({ params }: PrescriptionPageProps) {
  return (
    <DashboardLayout>
      <PrescriptionDetailsPage prescriptionId={params.id} />
    </DashboardLayout>
  );
}
