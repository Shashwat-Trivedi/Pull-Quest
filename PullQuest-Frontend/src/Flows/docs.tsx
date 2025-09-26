"use client";

import { DashboardLayout } from "@/components/maintainerDashboard/dashboard-layout";
import DocsView from "@/components/maintainerDashboard/docs-view";

export default function DocsPage() {
  return (
    <DashboardLayout>
      <DocsView />
    </DashboardLayout>
  );
}
