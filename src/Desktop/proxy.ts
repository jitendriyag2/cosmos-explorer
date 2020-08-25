import express from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";

export class Proxy {
  public readonly handler: express.RequestHandler;

  constructor(target: string, public readonly localUrl: URL, extraOptions?: Options) {
    const options = {
      target,
      pathRewrite: { ["^" + localUrl.pathname]: "" },
      preserveHeaderKeyCase: true,
      changeOrigin: true,
      logLevel: "debug" as const,
      secure: true
    };

    Object.assign(options, extraOptions);

    this.handler = createProxyMiddleware(localUrl.pathname, options);
  }
}
