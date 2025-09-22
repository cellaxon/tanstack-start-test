import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/banking')({
  beforeLoad: () => {
    // Redirect to dashboard with banking tab active
    throw redirect({
      to: '/dashboard',
      search: { tab: 'banking' },
    });
  },
});