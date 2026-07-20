import { createCsrfMiddleware, createStart } from "@tanstack/react-start";
import { securityMiddleware } from "./middleware";

// Server Function はsame-origin前提のRPCなので、クロスサイトからの呼び出しを遮断する
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, securityMiddleware],
}));
