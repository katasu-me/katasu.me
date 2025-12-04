import { createStart } from "@tanstack/react-start";
import { securityMiddleware } from "./middleware";

export const startInstance = createStart(() => ({
  requestMiddleware: [securityMiddleware],
}));
