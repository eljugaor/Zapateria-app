const fmt = (n) => n.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });

let allProducts = []; // cache local de productos

// elementos del DOM
const list = document.getElementById('product-list');
const cartCountEl = document.getElementById('cart-count');
const searchNameEl = document.getElementById('search-name');
const filterNameEl = document.getElementById('filter-name');
const filterMinEl = document.getElementById('filter-min');
const filterMaxEl = document.getElementById('filter-max');

function renderProducts(products) {
  // renderiza la lista (preserva la estructura HTML que ya tenías)
  list.innerHTML = products.map(p => `
    <div class="col-12 col-sm-6 col-lg-4">
      <div class="card h-100 shadow-sm">
        <img src="${p.image}" class="card-img-top" alt="${p.name}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${p.name}</h5>
          <p class="text-muted mb-2">${p.description}</p>
          <p class="fw-bold">${fmt(p.price)}</p>
          <div class="mt-auto d-flex gap-2">
            <button class="btn btn-primary" data-id="${p.id}" data-qty="1">Agregar</button>
            <a href="/cart.html" class="btn btn-outline-secondary">Ver carrito</a>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  // volver a atachar listeners de "Agregar"
  list.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const productId = Number(btn.dataset.id);
      const qty = Number(btn.dataset.qty);
      await addToCart(productId, qty);
    });
  });
}

function debounce(fn, wait = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function getFilterValues() {
  const qNavbar = (searchNameEl?.value || '').trim().toLowerCase();
  const qMain = (filterNameEl?.value || '').trim().toLowerCase();
  const q = qNavbar || qMain; // prioriza el navbar si hay texto ahí
  const min = filterMinEl?.value ? Number(filterMinEl.value) : null;
  const max = filterMaxEl?.value ? Number(filterMaxEl.value) : null;
  return { q, min, max };
}

function filterAndRender() {
  const { q, min, max } = getFilterValues();

  let filtered = allProducts.filter(p => {
    const searchable = (p.name + ' ' + (p.description || '')).toLowerCase();
    const matchText = q ? searchable.includes(q) : true;
    const matchMin = (min !== null) ? p.price >= min : true;
    const matchMax = (max !== null) ? p.price <= max : true;
    return matchText && matchMin && matchMax;
  });

  renderProducts(filtered);
  updateCartCount(); // por si acaso el DOM cambia, aseguramos contador
}

const debouncedFilter = debounce(filterAndRender, 180);

async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    allProducts = await res.json();
    renderProducts(allProducts);
    updateCartCount();
  } catch (e) {
    console.error('Error cargando productos', e);
    list.innerHTML = `<div class="col-12"><p class="text-danger">No se pudieron cargar los productos.</p></div>`;
  }
}

async function updateCartCount() {
  try {
    const res = await fetch('/api/cart');
    const cart = await res.json();
    const count = cart.reduce((acc, i) => acc + i.qty, 0);
    if (cartCountEl) cartCountEl.textContent = String(count);
  } catch (e) {
    // en caso de error, no romper la app
    console.warn('No se pudo actualizar el carrito', e);
  }
}

// Event listeners para los filtros (sin recargar)
if (searchNameEl) searchNameEl.addEventListener('input', debouncedFilter);
if (filterNameEl) filterNameEl.addEventListener('input', debouncedFilter);
if (filterMinEl) filterMinEl.addEventListener('input', debouncedFilter);
if (filterMaxEl) filterMaxEl.addEventListener('input', debouncedFilter);

// evitar que el formulario del navbar intente enviar por GET y recargue
const searchForm = document.getElementById('search-form');
if (searchForm) {
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    debouncedFilter();
  });
}

// inicio
loadProducts();

// Agregar esto al inicio del archivo
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

async function addToCart(productId, qty) {
  const res = await fetch('/api/cart/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CSRF-Token': csrfToken
    },
    body: JSON.stringify({ productId, qty })
  });
  return res.json();
}

// conectar socket (funciona desde cualquier página donde se cargue app.js)
const socket = io();

// helper: recalcula y pinta contador del carrito
function updateCartCount(cart) {
  const count = Array.isArray(cart) ? cart.reduce((s, it) => s + (it.qty || 0), 0) : 0;
  const el = document.getElementById("cart-count");
  if (el) el.textContent = String(count);
}

// helper: actualizar botones de "Agregar" según carrito (opcional)
function updateProductButtons(cart) {
  if (!Array.isArray(cart)) return;
  // si tus botones tienen attribute data-product-id
  document.querySelectorAll(".add-to-cart").forEach(btn => {
    const pid = Number(btn.getAttribute("data-product-id"));
    const item = cart.find(i => i.productId === pid);
    // ejemplo: deshabilitar si ya hay stock 0 o comportamiento personalizado
    if (item && item.qty >= 999999) { // ajustar lógica si tienes límites
      btn.disabled = true;
    } else {
      btn.disabled = false;
    }
  });
}

// cuando el servidor notifica cambio en carrito
socket.on("cartUpdated", (cart) => {
  console.log("cartUpdated event received:", cart);
  updateCartCount(cart);
  updateProductButtons(cart);

  // si estás mostrando fragmentos del carrito en la home, refresca esa UI:
  if (typeof renderCart === "function") {
    renderCart(cart);
  }
});

// Si quieres sincronizar inicialmente el contador al cargar la página
async function syncCartCountOnLoad() {
  try {
    const res = await fetch("/api/cart");
    if (res.ok) {
      const cart = await res.json();
      updateCartCount(cart);
      updateProductButtons(cart);
    }
  } catch (err) {
    console.warn("No se pudo sincronizar carrito:", err);
  }
}
syncCartCountOnLoad();
