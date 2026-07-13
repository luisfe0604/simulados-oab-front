import { PageHeader } from "@/components/ui";
import { ContaClient } from "./ContaClient";

export const dynamic = "force-dynamic";

export default function ContaPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Conta"
        title="Sua conta e assinatura"
        lead="Gerencie seus dados e o status da sua assinatura."
      />
      <ContaClient />
    </div>
  );
}
