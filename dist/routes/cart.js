// src/routes/cart.ts
import path from "path";
import fs from "fs/promises";
import { Router } from "express";
import { products } from "../data/products.js"; // usar .js en imports para Node+TS (NodeNext)
const router = Router();
const dataFile = path.resolve("./src/data/data.json");
// Helper: read file (returns object with cart property)
async function readData() {
    try {
        const txt = await fs.readFile(dataFile, "utf-8");
        return JSON.parse(txt || "{}");
    }
    catch (err) {
        // si no existe, devuelve objeto por defecto
        return { cart: [] };
    }
}
async function writeData(data) {
    await fs.writeFile(dataFile, JSON.stringify(data, null, 2), "utf-8");
}
// Cart is stored per-session in cookie-session
router.get("/", async (req, res) => {
    const cart = req.session.cart || [];
    res.json(cart);
});
router.post("/add", async (req, res) => {
    const { productId, qty } = req.body;
    // Validaciones
    if (typeof productId !== "number" || productId <= 0) {
        return res.status(400).json({ error: "productId inválido" });
    }
    if (typeof qty !== "number" || !Number.isFinite(qty)) {
        return res.status(400).json({ error: "qty debe ser un número" });
    }
    if (qty <= 0) {
        return res.status(400).json({ error: "La cantidad debe ser mayor a 0" });
    }
    // Validar existencia del producto
    const productExists = products.some((p) => p.id === productId);
    if (!productExists) {
        return res.status(400).json({ error: "El producto no existe" });
    }
    const sess = req.session;
    sess.cart = sess.cart || [];
    const idx = sess.cart.findIndex((i) => i.productId === productId);
    if (idx >= 0)
        sess.cart[idx].qty += qty;
    else
        sess.cart.push({ productId, qty });
    await writeData({ cart: sess.cart });
    res.json({ ok: true, cart: sess.cart });
});
router.post("/remove", async (req, res) => {
    const { productId } = req.body;
    if (typeof productId !== "number" || productId <= 0) {
        return res.status(400).json({ error: "productId inválido" });
    }
    const productExists = products.some((p) => p.id === productId);
    if (!productExists) {
        return res.status(400).json({ error: "El producto no existe" });
    }
    const sess = req.session;
    sess.cart = (sess.cart || []).filter((i) => i.productId !== productId);
    await writeData({ cart: sess.cart });
    res.json({ ok: true, cart: sess.cart });
});
router.post("/clear", async (req, res) => {
    req.session.cart = [];
    await writeData({ cart: [] });
    res.json({ ok: true, cart: [] });
});
router.get("/total", async (req, res) => {
    try {
        const sess = req.session;
        const cart = sess.cart || [];
        // obtener precios desde products
        const total = cart.reduce((sum, it) => {
            const p = products.find((x) => x.id === it.productId);
            const price = p?.price ?? 0;
            return sum + price * it.qty;
        }, 0);
        res.json({ total });
    }
    catch (err) {
        res.status(500).json({ error: "Error calculando total" });
    }
});
export default router;
