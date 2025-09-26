// src/pages/maintainer/support.tsx
"use client";

import { DashboardLayout } from "@/components/maintainerDashboard/dashboard-layout";
import { SupportView }    from "@/components/maintainerDashboard/support-view";

export default function SupportPage() {
  return (
    <DashboardLayout>
      <SupportView />
    </DashboardLayout>
  );
}
