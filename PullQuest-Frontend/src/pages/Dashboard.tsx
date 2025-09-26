import ContributorDashboard from "./ContributorDashboard";
import MaintainerDashboard from "./MaintainerDashboard";
import { useEffect, useState } from "react";

interface Props {
  role: string;
}

const Dashboard = ({ role }: Props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  <div className="h-screen flex items-center justify-center bg-gray-100">
    {role === "maintainer" ? (
      <MaintainerDashboard />
    ) : role === "contributor" ? (
      <ContributorDashboard />
    ) : (
      <h1 className="text-3xl font-bold">Welcome to {role} Dashboard</h1>
    )}
  </div>;
};

export default Dashboard;
