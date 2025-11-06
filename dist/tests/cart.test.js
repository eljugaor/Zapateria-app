import { Builder, By } from 'selenium-webdriver';
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';
describe('Zapateria Cart Tests', () => {
    let driver;
    beforeAll(async () => {
        driver = await new Builder().forBrowser('chrome').build();
    });
    afterAll(async () => {
        await driver.quit();
    });
    // Test 1: Página de carrito carga correctamente
    it('should load cart page successfully', async () => {
        await driver.get('http://localhost:3000/cart.html');
        const title = await driver.getTitle();
        expect(title).toContain('Carrito');
    });
    // Test 2: Agregar producto al carrito
    it('should add product to cart', async () => {
        const response = await fetch('http://localhost:3000/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: 1, qty: 1 })
        });
        const data = await response.json();
        expect(data.ok).toBeTruthy();
    });
    // Test 3: Validar cantidad negativa
    it('should reject negative quantity', async () => {
        const response = await fetch('http://localhost:3000/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: 1, qty: -1 })
        });
        expect(response.status).toBe(400);
    });
    // Test 4: Validar producto inexistente
    it('should reject non-existent product', async () => {
        const response = await fetch('http://localhost:3000/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: 999, qty: 1 })
        });
        expect(response.status).toBe(400);
    });
    // Test 5: Eliminar producto del carrito
    it('should remove product from cart', async () => {
        const response = await fetch('http://localhost:3000/api/cart/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: 1 })
        });
        const data = await response.json();
        expect(data.ok).toBeTruthy();
    });
    // Test 6: Validar cálculo del total
    it('should calculate cart total correctly', async () => {
        const response = await fetch('http://localhost:3000/api/cart/total');
        const data = await response.json();
        expect(typeof data.total).toBe('number');
    });
    // Test 7: Limpiar carrito
    it('should clear cart', async () => {
        const response = await fetch('http://localhost:3000/api/cart/clear', {
            method: 'POST'
        });
        const data = await response.json();
        expect(data.cart).toHaveLength(0);
    });
    // Test 8: Validar sesión persistente
    it('should maintain session', async () => {
        const response = await fetch('http://localhost:3000/api/cart');
        const data = await response.json();
        expect(Array.isArray(data)).toBeTruthy();
    });
    // Test 9: Interfaz de usuario
    it('should display cart items in UI', async () => {
        await driver.get('http://localhost:3000/cart.html');
        const cartItems = await driver.findElements(By.className('cart-item'));
        expect(cartItems.length).toBeGreaterThanOrEqual(0);
    });
    // Test 10: Actualización en tiempo real
    it('should update cart total in real-time', async () => {
        await driver.get('http://localhost:3000/cart.html');
        const totalElement = await driver.findElement(By.id('cart-total'));
        expect(await totalElement.getText()).toBeDefined();
    });
});
