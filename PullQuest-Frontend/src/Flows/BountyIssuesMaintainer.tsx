// src/pages/maintainer/integrations.tsx
"use client";

import { DashboardLayout }    from "@/components/maintainerDashboard/dashboard-layout";
import BountyIssuesByMe from "@/components/maintainerDashboard/BountyIssuesByMe";
export default function BountyIssuesMaintainer() {
  return (
    <DashboardLayout>
      <BountyIssuesByMe />
    </DashboardLayout>
  );
}
