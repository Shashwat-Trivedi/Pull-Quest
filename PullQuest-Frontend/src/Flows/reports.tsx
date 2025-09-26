// src/pages/maintainer/reports.tsx
"use client";

import { DashboardLayout } from "@/components/maintainerDashboard/dashboard-layout";
import { ReportsView }    from "@/components/maintainerDashboard/reports-view";

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <ReportsView />
    </DashboardLayout>
  );
}
