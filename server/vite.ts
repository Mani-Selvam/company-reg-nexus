import type { Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";

export async function registerVite(app: Express) {
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      hmr: {
        port: 5001,
      },
    },
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use(async (req, res, next) => {
    const url = req.originalUrl;

    try {
      let template = fs.readFileSync(
        path.resolve(process.cwd(), "client/index.html"),
        "utf-8",
      );

      template = await vite.transformIndexHtml(url, template);

      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  return vite;
}
