import { ClientPageWrapper } from "@/components/ui";
import EquityCalculatorClient from "./EquityCalculatorClient";

export default function EquityCalculatorPage() {
  return (
    <ClientPageWrapper loadingText="Loading Equity Calculator...">
      <EquityCalculatorClient />
    </ClientPageWrapper>
  );
}
