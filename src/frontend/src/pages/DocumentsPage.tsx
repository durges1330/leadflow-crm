import { FileText } from "lucide-react";
import type React from "react";
import { EmptyState } from "../components/shared/EmptyState";
import { PageCard } from "../components/shared/PageCard";

export const DocumentsPage: React.FC = () => (
  <div className="space-y-4" data-ocid="documents.page">
    <div>
      <h1 className="text-2xl font-bold text-foreground tracking-tight">
        Documents
      </h1>
      <p className="text-muted-foreground text-sm mt-0.5">
        Proposals, certificates, and attachments
      </p>
    </div>
    <PageCard title="All Documents">
      <EmptyState
        icon={FileText}
        title="No documents yet"
        description="Documents attached to leads will appear here."
        data-ocid="documents.empty_state"
      />
    </PageCard>
  </div>
);
