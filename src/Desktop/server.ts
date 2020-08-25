import express from "express";
import { Proxy } from "./proxy";
import { configContext as ctx, overridePath } from "../ConfigContext";

const production = "https://main.documentdb.ext.azure.com";
const localhost = new URL("http://localhost:2222/");

const aadProxy = new Proxy(ctx.AAD_ENDPOINT, new URL("/aad", localhost));
const arcadiaProxy = new Proxy(ctx.ARCADIA_ENDPOINT, new URL("/arcadia", localhost));
const armAuthAreaProxy = new Proxy(ctx.ARM_AUTH_AREA, new URL("/armauth", localhost));
const armProxy = new Proxy(ctx.ARM_ENDPOINT, new URL("/arm", localhost));
const graphProxy = new Proxy(ctx.GRAPH_ENDPOINT, new URL("/graph", localhost));

const proxy = new Proxy(production, new URL("/prod", localhost), {
  router: req => String(req.headers["x-ms-proxy-target"] || production)
});

const server = express();
server.use(aadProxy.handler);
server.use(arcadiaProxy.handler);
server.use(armAuthAreaProxy.handler);
server.use(armProxy.handler);
server.use(graphProxy.handler);
server.use(proxy.handler);
server.use(express.static("./dist"));

server.get(overridePath, (_, res) =>
  res.send({
    AAD_ENDPOINT: aadProxy.localUrl.href,
    ARCADIA_ENDPOINT: arcadiaProxy.localUrl.href,
    ARM_AUTH_AREA: armAuthAreaProxy.localUrl.href,
    ARM_ENDPOINT: armProxy.localUrl.href,
    GRAPH_ENDPOINT: graphProxy.localUrl.href,
    PROXY_PATH: proxy.localUrl.pathname,
    BACKEND_ENDPOINT: proxy.localUrl.href,
    MONGO_BACKEND_ENDPOINT: proxy.localUrl.href
  })
);

export { server, localhost as url };
