import { BankingDashboard } from '@/components/BankingDashboard';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/banking')({
  component: BankingPage,
});

function BankingPage() {
  return <BankingDashboard />;
}