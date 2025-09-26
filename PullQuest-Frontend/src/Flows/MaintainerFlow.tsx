// src/pages/MaintainerFlow.tsx
"use client";

import { DashboardLayout } from "../components/maintainerDashboard/dashboard-layout";
import RepoStep from "../Flows/RepoStep";

export default function MaintainerFlow() {
  return (
    <DashboardLayout>
      <div className="px-6 py-4">
        <RepoStep />
      </div>
    </DashboardLayout>
  );
}
