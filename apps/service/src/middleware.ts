import { createMiddleware } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { buildCsp } from "@/libs/security/csp";
import { getSecurityHeaders } from "@/libs/security/headers";
import { generateNonce } from "@/libs/security/nonce";
import { setServerNonce } from "./router";

export const securityMiddleware = createMiddleware().server(({ next }) => {
  const nonce = generateNonce();
  const isDev = import.meta.env.DEV;

  setServerNonce(nonce);

  const csp = buildCsp(nonce, isDev);
  const securityHeaders = getSecurityHeaders(csp, isDev);

  for (const [key, value] of Object.entries(securityHeaders)) {
    setResponseHeader(key, value);
  }

  return next({ context: { nonce } });
});
