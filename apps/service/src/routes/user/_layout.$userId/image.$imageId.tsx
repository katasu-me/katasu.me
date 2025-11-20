import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/user/_layout/$userId/image/$imageId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/user/_layout/$userId/image/$imageId"!</div>;
}
