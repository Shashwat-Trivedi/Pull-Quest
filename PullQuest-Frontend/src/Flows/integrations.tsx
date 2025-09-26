// src/pages/maintainer/integrations.tsx
"use client";

import { DashboardLayout }    from "@/components/maintainerDashboard/dashboard-layout";
import { IntegrationsView }   from "@/components/maintainerDashboard/integration-view";

export default function IntegrationsPage() {
  return (
    <DashboardLayout>
      <IntegrationsView />
    </DashboardLayout>
  );
}
