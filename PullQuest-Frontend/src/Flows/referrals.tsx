// src/pages/maintainer/referrals.tsx
"use client";

import { DashboardLayout }   from "@/components/maintainerDashboard/dashboard-layout";
import { ReferralsView }     from "@/components/maintainerDashboard/reffrals-view";

export default function ReferralsPage() {
  return (
    <DashboardLayout>
      <ReferralsView />
    </DashboardLayout>
  );
}
