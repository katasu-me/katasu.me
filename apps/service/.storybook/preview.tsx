import type { Preview } from "@storybook/react-vite";
import { createMemoryHistory, createRootRoute, createRouter, RouterContextProvider } from "@tanstack/react-router";
import "../src/styles.css";

// Storybook用のメモリベースRouter
// TanStack RouterのLink/useLocationなどのAPIはRouterContextが必要なため提供する
const rootRoute = createRootRoute();
const storybookRouter = createRouter({
  routeTree: rootRoute,
  history: createMemoryHistory({ initialEntries: ["/"] }),
});

const preview: Preview = {
  decorators: [
    (Story) => (
      <RouterContextProvider router={storybookRouter}>
        <Story />
      </RouterContextProvider>
    ),
    (Story) => (
      <div>
        <Story />
        {/* NOTE: Portal内にフォントを適用するため */}
        <style>
          {`
            body {
              font-family: "Reddit Sans", "IBM Plex Sans JP";
            }
          `}
        </style>
      </div>
    ),
  ],
};

export default preview;
