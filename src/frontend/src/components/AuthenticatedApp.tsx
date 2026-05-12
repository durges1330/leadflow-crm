import type React from "react";
import { useState } from "react";
import type { RouteId, UserProfile } from "../types";
import { Layout } from "./Layout";

import { AiInsightsPage } from "../pages/AiInsightsPage";
// Lazy page components
import { DashboardPage } from "../pages/DashboardPage";
import { DocumentsPage } from "../pages/DocumentsPage";
import { LeadDetailPage } from "../pages/LeadDetailPage";
import { LeadsPage } from "../pages/LeadsPage";
import { PipelinePage } from "../pages/PipelinePage";
import { SettingsPage } from "../pages/SettingsPage";
import { TasksPage } from "../pages/TasksPage";

interface AuthenticatedAppProps {
  profile: UserProfile;
}

export const AuthenticatedApp: React.FC<AuthenticatedAppProps> = ({
  profile,
}) => {
  const [activeRoute, setActiveRoute] = useState<RouteId>("dashboard");
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);

  const handleNavigate = (route: RouteId) => {
    setActiveRoute(route);
    if (route !== "lead-detail") setActiveLeadId(null);
  };

  const handleOpenLead = (id: string) => {
    setActiveLeadId(id);
    setActiveRoute("lead-detail");
  };

  const renderPage = () => {
    switch (activeRoute) {
      case "dashboard":
        return (
          <DashboardPage
            onOpenLead={handleOpenLead}
            onNavigate={handleNavigate}
          />
        );
      case "leads":
        return <LeadsPage onOpenLead={handleOpenLead} />;
      case "lead-detail":
        return activeLeadId ? (
          <LeadDetailPage
            leadId={activeLeadId}
            onBack={() => handleNavigate("leads")}
          />
        ) : (
          <LeadsPage onOpenLead={handleOpenLead} />
        );
      case "pipeline":
        return <PipelinePage onOpenLead={handleOpenLead} />;
      case "tasks":
        return <TasksPage />;
      case "documents":
        return <DocumentsPage />;
      case "ai-insights":
        return <AiInsightsPage />;
      case "settings":
        return <SettingsPage profile={profile} />;
      default:
        return (
          <DashboardPage
            onOpenLead={handleOpenLead}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <Layout
      activeRoute={activeRoute}
      onNavigate={handleNavigate}
      profile={profile}
    >
      {renderPage()}
    </Layout>
  );
};
