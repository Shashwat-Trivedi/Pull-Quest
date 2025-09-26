import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { UserProvider } from "./context/UserProvider";
import PrivateRoute from "./components/PrivateRoutes";
import { Toaster } from "./components/ui/sonner";

import Website from "./pages/Website";
import LoginPage from "./auth/LoginPage";
import SignUp    from "./auth/SignUp";
import ConnectWallet from "./pages/ConnectWallet";

import ContributorDashboard  from "./pages/ContributorDashboard";
import ContributorProfile    from "./components/contributor/ContributorProfile";
import IssueDetailsPage      from "./components/IssueDetailsPage";
import ContributorSettings   from "./components/ContributorSettings";

import DashboardPage          from "./Flows/MaintainerFlow";
import DocsPage               from "./Flows/docs";
import IntegrationsPage       from "./Flows/integrations";
import OrgSettingsConfigPage  from "./Flows/org-settings";
import OrgSettingsApiKeysPage from  "./Flows/org-settings";
import ReferralsPage          from "./Flows/referrals";
import ReportsPage            from "./Flows/reports";
import SupportPage            from "./Flows/support";

import OpenIssuePage from "./components/maintainerDashboard/OpenIssuePage";
import RepoPrs       from "./Flows/RepoPrs";
import ReviewPrStep  from "./Flows/RepoIssuesStep";
import CompanyDashboard from "./pages/CompanyDashborad";
import NewIssuePage from "./Flows/NewIssueForm";
import BountyIssuesMaintainer from "./Flows/BountyIssuesMaintainer";

export default function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* public */}
          <Route path="/"    element={<Website />} />
          <Route path="/login"   element={<LoginPage />} />
          <Route path="/signUp"  element={<SignUp    />} />
          <Route path="/connect-wallet" element={<ConnectWallet />} />

          {/* contributor */}
          <Route path="/contributor/*" element={
            <PrivateRoute allowedRoles={["contributor"]}>
              <Routes>
                <Route path="dashboard" element={<ContributorDashboard  />} />
                <Route path="profile"   element={<ContributorProfile    />} />
                <Route path="issue/:issueId" element={<IssueDetailsPage />} />
                <Route path="settings"  element={<ContributorSettings   />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </PrivateRoute>
          }/>

          <Route path="/maintainer/*" element={
              <Routes>
                <Route path="dashboard"                element={<DashboardPage               />} />
                <Route path="docs"                     element={<DocsPage                    />} />
                <Route path="integrations"             element={<IntegrationsPage            />} />
                <Route path="org-settings/config"      element={<OrgSettingsConfigPage       />} />
                <Route path="org-settings/api-keys"    element={<OrgSettingsApiKeysPage      />} />
                <Route path="referrals"                element={<ReferralsPage               />} />
                <Route path="reports"                  element={<ReportsPage                 />} />
                <Route path="support"                  element={<SupportPage                 />} />
                <Route path="open-issue/:number"       element={<OpenIssuePage              />} />
                <Route path="repo/:owner/:repo/issues" element={<RepoPrs                     />} />
                <Route path="repo/:owner/:repo/prs"    element={<ReviewPrStep                />} />
                <Route path="new-issue"                element={<NewIssuePage                />} />
                <Route path="bounty-issues"            element={<BountyIssuesMaintainer            />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
          }/>

          {/* company */}
          <Route path="/company/dashboard" element={
            <PrivateRoute allowedRoles={["company"]}>
              <CompanyDashboard />
            </PrivateRoute>
          }/>

          {/* catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toaster />
      </Router>
    </UserProvider>
  );
}