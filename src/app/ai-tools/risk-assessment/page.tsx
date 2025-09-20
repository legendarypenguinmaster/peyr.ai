import { ClientPageWrapper } from "@/components/ui";
import RiskAssessmentClient from "./RiskAssessmentClient";

export default function RiskAssessmentPage() {
  return (
    <ClientPageWrapper loadingText="Loading Risk Assessment...">
      <RiskAssessmentClient />
    </ClientPageWrapper>
  );
}

