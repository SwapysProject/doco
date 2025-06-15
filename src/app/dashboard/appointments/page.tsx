import { AppointmentsPage } from "@/components/appointments/appointments-page";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function AppointmentsPageRoute() {
  return (
    <DashboardLayout>
      <AppointmentsPage />
    </DashboardLayout>
  );
}
