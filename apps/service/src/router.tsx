import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { Loading } from "./components/Loading";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

let serverNonce: string | undefined;

export function setServerNonce(nonce: string): void {
  serverNonce = nonce;
}

// Create a new router instance
export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPendingComponent: () => <Loading className="col-start-2 h-[80vh]" />,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPendingMs: 300,
    defaultViewTransition: true,
    ssr: {
      nonce: serverNonce,
    },
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
};
