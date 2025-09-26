// src/pages/NewIssuePage.tsx
"use client";

import { DashboardLayout } from "../components/maintainerDashboard/dashboard-layout";
import NewIssueForm from "../components/maintainerDashboard/new-issue-form";

export default function NewIssuePage() {
  return (
    <DashboardLayout>
      <div className="px-6 py-4">
        <NewIssueForm />
      </div>
    </DashboardLayout>
  );
}