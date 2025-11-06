import express from "express";
import session from "cookie-session";
import path from "path";
import { limiter, securityHeaders, sanitizeInput, csrfProtection, handleCsrfError } from "./middleware/auth.js";
import productsRouter from "./routes/products.js";
import cartRouter from "./routes/cart.js";
import http from "http";
import { Server as IOServer } from "socket.io";

const PORT = process.env.PORT || 3000;
const app = express();

// Use this instead of import.meta.url
const __dirname = process.cwd();

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos - ANTES de security middleware
app.use(express.static(path.join(__dirname, 'public')));

// Security middleware
app.use(securityHeaders);
app.use(limiter);
app.use(sanitizeInput);

// Session configuration
app.use(session({
  name: "session",
  keys: [process.env.SESSION_KEY || "secure-key"],
  maxAge: 24 * 60 * 60 * 1000,
  secure: false, // cambiado para desarrollo local
  httpOnly: true,
  sameSite: "lax"
}));

// Aplicar csrf sólo para rutas que no empiezan por /api
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  return csrfProtection(req, res, next);
});

// Proporcionar token CSRF a vistas (solo para non-api)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Crear servidor HTTP y Socket.IO
const httpServer = http.createServer(app);
const io = new IOServer(httpServer, {
  cors: { origin: true, credentials: true }
});

// Guardar io en app para que rutas lo emitan
app.set("io", io);

// API routes
app.use("/api/products", productsRouter);
app.use("/api/cart", cartRouter);

// Error handler para CSRF
app.use(handleCsrfError);

httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

export default app;
