import { ClientPageWrapper } from "@/components/ui";
import LegalGeneratorClient from "./LegalGeneratorClient";

export default function LegalGeneratorPage() {
  return (
    <ClientPageWrapper loadingText="Loading Legal Generator...">
      <LegalGeneratorClient />
    </ClientPageWrapper>
  );
}
