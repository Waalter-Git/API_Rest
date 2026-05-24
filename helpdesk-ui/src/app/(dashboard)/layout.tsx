import type { ReactNode } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';

type DashboardRouteLayoutProps = {
  children: ReactNode;
};

export default function DashboardRouteLayout({ children }: Readonly<DashboardRouteLayoutProps>) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
