// src/pages/maintainer/org-settings.tsx
"use client";

import { DashboardLayout }  from "@/components/maintainerDashboard/dashboard-layout";
import { OrgSettingsView }  from "@/components/maintainerDashboard/org-settings-view";

export default function OrgSettingsPage() {
  return (
    <DashboardLayout>
      <OrgSettingsView />
    </DashboardLayout>
  );
}
