import DoctorDashboardLanding from '@/components/dashboard/intro';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function SomePage() {
  return (
    <DashboardLayout>
      <DoctorDashboardLanding />
    </DashboardLayout>
  );
}

