// src/routes/cart.ts
import { Router } from "express";
import type { CartItem } from "../types/index.d.js";
import { products } from "./../data/products";
import fs from "fs/promises";
import path from "path";

const dataFile = path.resolve("./src/data/data.json");


const router = Router();

// Cart is stored per-session in cookie-session
router.get("/", (req, res) => {
  const cart: CartItem[] = (req.session as any).cart || [];
  res.json(cart);
});

router.post("/add", async (req, res) => {
  const { productId, qty } = req.body as CartItem;
  if (!productId || qty == null || qty <= 0) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  const sess: any = req.session;
  sess.cart = sess.cart || [];
  const idx = sess.cart.findIndex((i: CartItem) => i.productId === productId);
  if (idx >= 0) sess.cart[idx].qty += qty;
  else sess.cart.push({ productId, qty });

  // Escribir en data.json
  await writeData({ cart: sess.cart });

  res.json({ ok: true, cart: sess.cart });
});


router.post("/remove", async (req, res) => {
  const { productId } = req.body as { productId: number };
  if (!productId) return res.status(400).json({ error: "productId requerido" });
  const sess: any = req.session;
  sess.cart = (sess.cart || []).filter((i: CartItem) => i.productId !== productId);
  //write on data file
  await writeData({ cart: sess.cart });
  res.json({ ok: true, cart: sess.cart });
});

router.post("/clear", async (req, res) => {
  (req.session as any).cart = [];
  //write on data file
  await writeData({ cart: [] });
  res.json({ ok: true, cart: [] });
});

router.get("/total", (req, res) => {
  try {
    const sess: any = req.session;
    const cart: CartItem[] = sess?.cart || [];

    const total = cart.reduce((sum, item) => {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) return sum; // si no existe el producto, lo omitimos
      return sum + (prod.price || 0) * (item.qty || 0);
    }, 0);

    const formatted = total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });

    res.json({ total, formatted });
  } catch (err) {
    console.error('Error calculando total del carrito', err);
    res.status(500).json({ error: 'Error calculando total' });
  }
});

async function readData() {
  try {
    const data = await fs.readFile(dataFile, "utf-8");
    return JSON.parse(data);
  } catch {
    return { cart: [] };
  }
}

async function writeData(data: any) {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
}


export default router;
