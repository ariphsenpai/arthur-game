// ===== PRODUCT DATA =====
const products = [
  {
    id: 1,
    name: 'wkwkphone Pro Max',
    emoji: '📱',
    specs: '6.8" AMOLED | 256GB | 108MP Camera | 5000mAh',
    price: 4999000,
  },
  {
    id: 2,
    name: 'wkwkphone Pro',
    emoji: '📲',
    specs: '6.6" Super AMOLED | 128GB | 64MP Camera | 4500mAh',
    price: 3799000,
  },
  {
    id: 3,
    name: 'wkwkphone Ultra',
    emoji: '🚀',
    specs: '6.7" Dynamic AMOLED | 512GB | 200MP Camera | 6000mAh',
    price: 7999000,
  },
  {
    id: 4,
    name: 'wkwkphone Neo',
    emoji: '✨',
    specs: '6.5" IPS LCD | 128GB | 48MP Camera | 4000mAh',
    price: 2499000,
  },
  {
    id: 5,
    name: 'wkwkphone Lite',
    emoji: '💨',
    specs: '6.4" IPS LCD | 64GB | 32MP Camera | 3500mAh',
    price: 1599000,
  },
  {
    id: 6,
    name: 'wkwkphone Fold',
    emoji: '📂',
    specs: '7.3" Foldable AMOLED | 256GB | 50MP Camera | 4400mAh',
    price: 9999000,
  },
  {
    id: 7,
    name: 'wkwkphone Mini',
    emoji: '📟',
    specs: '5.8" OLED | 128GB | 12MP Camera | 3000mAh',
    price: 1299000,
  },
  {
    id: 8,
    name: 'wkwkphone Gaming X',
    emoji: '🎮',
    specs: '6.8" 165Hz AMOLED | 256GB | 64MP | 6000mAh + RGB',
    price: 5999000,
  },
];

// ===== STATE =====
let cart = [];
const CART_KEY = 'wkwkphone_cart';

// ===== DOM REFS =====
const productGrid = document.getElementById('productGrid');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const toast = document.getElementById('toast');

// ===== INIT =====
function init() {
  loadCart();
  renderProducts();
  renderCart();
}

// ===== FORMAT PRICE =====
function formatPrice(num) {
  return 'Rp ' + Math.round(num).toLocaleString('id-ID');
}

// ===== RENDER PRODUCTS =====
function renderProducts() {
  productGrid.innerHTML = products.map(p => `
    <div class="product-card">
      <div class="product-img">${p.emoji}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-specs">${p.specs}</div>
      <div class="product-price">${formatPrice(p.price)}</div>
      <div class="product-actions">
        <button class="btn-add" onclick="addToCart(${p.id})">🛒 Tambah</button>
        <button class="btn-detail" onclick="showDetail(${p.id})">👁️</button>
      </div>
    </div>
  `).join('');
}

// ===== CART OPERATIONS =====
function loadCart() {
  try {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) cart = JSON.parse(saved);
  } catch (e) {}
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}

function addToCart(id) {
  const prod = products.find(p => p.id === id);
  if (!prod) return;
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: id, qty: 1 });
  }
  saveCart();
  showToast(`${prod.name} ditambahkan!`);
  // Haptic-like shake animation on cart btn
  const btn = document.getElementById('cartBtn');
  btn.style.transform = 'scale(1.2)';
  setTimeout(() => btn.style.transform = '', 200);
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }
  saveCart();
  renderCart();
}

function getCartTotal() {
  return cart.reduce((sum, item) => {
    const prod = products.find(p => p.id === item.id);
    return sum + (prod ? prod.price * item.qty : 0);
  }, 0);
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

// ===== RENDER CART =====
function renderCart() {
  if (!cartItems) return;
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Belum ada barang nih...</p>';
    return;
  }
  cartItems.innerHTML = cart.map(item => {
    const prod = products.find(p => p.id === item.id);
    if (!prod) return '';
    return `
      <div class="cart-item">
        <div class="cart-item-img">${prod.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${prod.name}</div>
          <div class="cart-item-price">${formatPrice(prod.price)}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
            <span>${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
          </div>
        </div>
        <div style="font-weight:700;color:#fd79a8">${formatPrice(prod.price * item.qty)}</div>
      </div>
    `;
  }).join('');
}

// ===== UPDATE CART UI =====
function updateCartUI() {
  cartCount.textContent = getCartCount();
  cartTotal.textContent = formatPrice(getCartTotal());
  renderCart();
}

// ===== TOGGLE CART =====
function toggleCart() {
  const open = cartSidebar.classList.toggle('open');
  cartOverlay.classList.toggle('open');
  if (open) renderCart();
}

// ===== CHECKOUT =====
function checkout() {
  if (cart.length === 0) {
    showToast('Keranjang masih kosong!');
    return;
  }
  const total = getCartTotal();
  const items = cart.map(item => {
    const p = products.find(prod => prod.id === item.id);
    return `${p.name} × ${item.qty}`;
  }).join('\n');
  const msg = encodeURIComponent(
    `Halo wkwkphone! Saya mau order:\n\n${items}\n\nTotal: ${formatPrice(total)}\n\nMohon info pembayaran & pengiriman.`
  );
  // Close cart
  toggleCart();
  // Open WhatsApp
  window.open(`https://wa.me/628137355599?text=${msg}`, '_blank');
  // Clear cart after checkout
  cart = [];
  saveCart();
  showToast('✅ Order dikirim via WhatsApp!');
}

// ===== SHOW DETAIL =====
function showDetail(id) {
  const prod = products.find(p => p.id === id);
  if (!prod) return;
  showToast(`${prod.name}\n${prod.specs}\n${formatPrice(prod.price)}`);
}

// ===== TOAST =====
let toastTimer;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== GO =====
document.addEventListener('DOMContentLoaded', init);
