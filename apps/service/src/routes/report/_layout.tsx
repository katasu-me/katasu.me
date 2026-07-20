import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/report/_layout")({
  component: ReportLayoutComponent,
});

function ReportLayoutComponent() {
  return <Outlet />;
}
