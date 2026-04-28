import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer as createHttpServer } from "http";
import cors from "cors";
import path from "path";
import rateLimit from "express-rate-limit";
import { connectDB } from "./src/server/db.js";
import { initSocket } from "./src/server/socket.js";
import authRoutes from "./src/server/routes/auth.routes.js";
import userRoutes from "./src/server/routes/user.routes.js";
import productRoutes from "./src/server/routes/product.routes.js";
import orderRoutes from "./src/server/routes/order.routes.js";
import messageRoutes from "./src/server/routes/message.routes.js";
import bannerRoutes from "./src/server/routes/banner.routes.js";
import promotionRoutes from "./src/server/routes/promotion.routes.js";
import statsRoutes from "./src/server/routes/stats.routes.js";
import supplierRoutes from "./src/server/routes/supplier.routes.js";
import cartRoutes from "./src/server/routes/cart.routes.js";

import uploadRoutes from "./src/server/routes/upload.routes.js";

async function startServer() {
  await connectDB();

  const app = express();
  const httpServer = createHttpServer(app);
  const PORT = Number(process.env.PORT || 3000);

  // Initialize Socket.io
  initSocket(httpServer);

  const allowedOrigins = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"] : "*";
  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  app.set('trust proxy', 1);

  // Serve uploads
  const uploadDir = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadDir));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 1000, 
    message: "Too many requests, please try again later",
    validate: { xForwardedForHeader: false, default: true } // disable validate checks to prevent errors in this environment
  });
  app.use("/api/", limiter);

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/banners", bannerRoutes);
  app.use("/api/promotions", promotionRoutes);
  app.use("/api/stats", statsRoutes);
  app.use("/api/suppliers", supplierRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/upload", uploadRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
