/**
 * DREAM CART BD - Core Client Application Library
 * Handles: Google Apps Script API sync, Multi-Role Pricing, Cart, Wishlist, Floating Actions, Search, Dark Mode
 */

const APP_CONFIG = {
  shopName: 'Dream Cart BD',
  slogan: 'আপনার বিশ্বস্ত অনলাইন শপিং পার্টনার',
  appScriptUrl: 'https://script.google.com/macros/s/AKfycbwflHuBqMKWpKPTTVNY-grU_dnNphwELXbk6Hn-wcBjxJk4xvqScmT2n8i3ZQCStMI3/exec',
  spreadsheetId: '1BGi8IXV6S7uXDi4IaR_sCJYhtpfzyLGuldo4NnGVmR8',
  phones: {
    phone1: '01581703822',
    phone2: '01818273838',
    phone3: '01879653143'
  },
  whatsapp: {
    wa1: '8801581703822',
    wa2: '8801818273838'
  },
  deliveryFees: {
    dhaka: 90,
    cumilla: 70,
    outside_dhaka: 120,
    office_pickup: 0
  },
  offers: {
    freeDeliveryMin: 2000,
    onlinePaymentDiscountPct: 5
  }
};

// State
let localDB = null;
let currentCart = JSON.parse(localStorage.getItem('dcbd_cart') || '[]');
let currentWishlist = JSON.parse(localStorage.getItem('dcbd_wishlist') || '[]');

// Auth Helper
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('dcbd_user') || 'null');
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('dcbd_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('dcbd_user');
  }
}

// Fetch master database
async function loadDatabase() {
  if (localDB) return localDB;
  try {
    // Attempt local db first for instant rendering
    const res = await fetch('assets/js/db.json');
    if (res.ok) {
      localDB = await res.json();
    }
  } catch (e) {
    console.warn('Local db.json fetch skipped, falling back to embedded state.');
  }

  if (!localDB) {
    // Embedded fallback ensures 100% offline & GitHub Pages reliability
    localDB = {
      settings: { shop_name: "Dream Cart BD" },
      products: [],
      categories: [],
      brands: [],
      banners: []
    };
  }

  // Attempt live sync in background with Apps Script
  try {
    fetch(APP_CONFIG.appScriptUrl + '?action=getAll')
      .then(r => r.json())
      .then(data => {
        if (data && data.status === 'success') {
          if (data.products && data.products.length) localDB.products = data.products;
          if (data.categories && data.categories.length) localDB.categories = data.categories;
          if (data.brands && data.brands.length) localDB.brands = data.brands;
          if (data.banners && data.banners.length) localDB.banners = data.banners;
          console.log('Synchronized with live Google Apps Script!');
        }
      }).catch(err => console.log('Apps Script background sync paused (offline or network restriction).'));
  } catch (err) {}

  return localDB;
}

// Product Pricing Calculation by Account Type
function getProductPriceForUser(product, user) {
  const sellingPrice = parseFloat(product.Selling_Price) || 0;
  const originalPrice = parseFloat(product.Original_Price) || 0;
  const wholesalePrice = parseFloat(product.WholeSale_price) || 0;
  const minOrderQty = parseInt(product.Min_order_Q) || 1;

  if (!user) {
    return {
      price: sellingPrice,
      originalPrice: originalPrice,
      type: 'Customer',
      minQty: 1
    };
  }

  if (user.Account_Type === 'reseller') {
    return {
      price: wholesalePrice || sellingPrice,
      originalPrice: originalPrice,
      resalePrice: sellingPrice,
      type: 'Reseller',
      commission: sellingPrice - wholesalePrice,
      minQty: 1
    };
  }

  if (user.Account_Type === 'wholesaler') {
    return {
      price: wholesalePrice || sellingPrice,
      originalPrice: originalPrice,
      type: 'Wholesaler',
      minQty: minOrderQty
    };
  }

  return {
    price: sellingPrice,
    originalPrice: originalPrice,
    type: 'Customer',
    minQty: 1
  };
}

// Render Standard Product Card HTML
function renderProductCardHTML(p, user = getCurrentUser()) {
  const pricing = getProductPriceForUser(p, user);
  const isOutOfStock = parseInt(p.Stock) <= 0;
  const discountPct = pricing.originalPrice > pricing.price ? Math.round(((pricing.originalPrice - pricing.price) / pricing.originalPrice) * 100) : 0;
  const isFav = currentWishlist.includes(p.SKU);

  let wholesalerMinQtyHtml = '';
  if (user && user.Account_Type === 'wholesaler') {
    wholesalerMinQtyHtml = `<div class="wholesale-min-row">📦 Min Order: <strong>${pricing.minQty} Pcs</strong></div>`;
  }

  const orderButtonHtml = isOutOfStock
    ? `<button class="btn-pre-order" onclick="openPreOrder('${p.SKU}')"><i class="fa fa-clock"></i> Pre Order</button>`
    : `<button class="btn-order-now" onclick="quickOrderNow('${p.SKU}')"><i class="fa fa-shopping-bag"></i> Order Now</button>`;

  return `
    <div class="product-card fade-in" data-sku="${p.SKU}" data-category="${p.Category || ''}" data-brand="${p.Brand || ''}" data-price="${pricing.price}">
      <div class="product-card-top">
        ${discountPct > 0 ? `<span class="discount-badge">-${discountPct}%</span>` : ''}
        <button class="card-fav-btn ${isFav ? 'active' : ''}" onclick="toggleWishlist('${p.SKU}')" title="Add to Favourite">
          <i class="${isFav ? 'fas fa-heart' : 'far fa-heart'}"></i>
        </button>
        <a href="product-details.html?sku=${p.SKU}">
          <img src="${p.Images || 'assets/images/placeholder.jpg'}" alt="${p.P_Name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80'">
        </a>
      </div>
      <div class="product-card-body">
        <div class="brand-sku-line">${p.Brand || 'Brand'} • SKU: ${p.SKU}</div>
        <a href="product-details.html?sku=${p.SKU}" class="product-title" title="${p.P_Name}">${p.P_Name}</a>
        <hr>
        <div class="pricing-stock-row">
          <div>
            <span class="current-price">৳${pricing.price}</span>
            ${pricing.originalPrice > pricing.price ? `<span class="original-price">৳${pricing.originalPrice}</span>` : ''}
          </div>
          <span class="stock-tag ${isOutOfStock ? 'out' : ''}">${isOutOfStock ? 'Out of Stock' : `Stock: ${p.Stock} pcs`}</span>
        </div>
        ${wholesalerMinQtyHtml}
        <hr>
        <div class="product-card-actions">
          ${orderButtonHtml}
          <div class="card-icon-toolbar">
            <button class="toolbar-btn" onclick="addToCart('${p.SKU}')" title="Add to Cart"><i class="fa fa-cart-plus"></i></button>
            <button class="toolbar-btn" onclick="toggleWishlist('${p.SKU}')" title="Wishlist"><i class="fa fa-heart"></i></button>
            <button class="toolbar-btn wa" onclick="sendProductWhatsApp('${p.SKU}', '8801581703822')" title="WhatsApp 1"><i class="fab fa-whatsapp"></i> 1</button>
            <button class="toolbar-btn wa" onclick="sendProductWhatsApp('${p.SKU}', '8801818273838')" title="WhatsApp 2"><i class="fab fa-whatsapp"></i> 2</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Cart Operations
function addToCart(sku, qty = 1) {
  const user = getCurrentUser();
  const existing = currentCart.find(item => item.sku === sku);
  if (existing) {
    existing.qty += qty;
  } else {
    currentCart.push({ sku: sku, qty: qty });
  }
  localStorage.setItem('dcbd_cart', JSON.stringify(currentCart));
  updateHeaderBadges();
  showToast('পণ্যটি সফলভাবে কার্টে যুক্ত হয়েছে!', 'success');
}

function updateCartQty(sku, qty) {
  if (qty <= 0) {
    currentCart = currentCart.filter(item => item.sku !== sku);
  } else {
    const item = currentCart.find(i => i.sku === sku);
    if (item) item.qty = qty;
  }
  localStorage.setItem('dcbd_cart', JSON.stringify(currentCart));
  updateHeaderBadges();
}

function toggleWishlist(sku) {
  const index = currentWishlist.indexOf(sku);
  if (index > -1) {
    currentWishlist.splice(index, 1);
    showToast('পছন্দের তালিকা থেকে সরানো হয়েছে', 'info');
  } else {
    currentWishlist.push(sku);
    showToast('পছন্দের তালিকায় যুক্ত হয়েছে!', 'success');
  }
  localStorage.setItem('dcbd_wishlist', JSON.stringify(currentWishlist));
  updateHeaderBadges();
  document.querySelectorAll(`.card-fav-btn[onclick*="${sku}"]`).forEach(btn => {
    btn.innerHTML = currentWishlist.includes(sku) ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
  });
}

function updateHeaderBadges() {
  const cartBadges = document.querySelectorAll('.cart-count-badge');
  const favBadges = document.querySelectorAll('.fav-count-badge');
  const cartTotalQty = currentCart.reduce((sum, item) => sum + item.qty, 0);

  cartBadges.forEach(b => b.textContent = cartTotalQty);
  favBadges.forEach(b => b.textContent = currentWishlist.length);
}

// Quick Order / Pre Order
function quickOrderNow(sku) {
  window.location.href = `order.html?sku=${sku}&type=regular`;
}

function openPreOrder(sku) {
  window.location.href = `order.html?sku=${sku}&type=preorder`;
}

// WhatsApp Integration
function sendProductWhatsApp(sku, phone) {
  if (!localDB) return;
  const p = localDB.products.find(item => item.SKU === sku);
  if (!p) return;
  const text = `আসসালামু আলাইকুম, আমি Dream Cart BD থেকে এই পণ্যটি অর্ডার করতে চাই:\nপণ্যের নাম: ${p.P_Name}\nSKU: ${p.SKU}\nমূল্য: ৳${p.Selling_Price}\nলিংক: ${window.location.origin}/product-details.html?sku=${p.SKU}`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
}

// Live Search with Instant Preview Dropdown
function setupLiveSearch() {
  const searchInputs = document.querySelectorAll('.live-search-input');
  searchInputs.forEach(input => {
    const parent = input.closest('.search-wrapper');
    if (!parent) return;
    let previewBox = parent.querySelector('.search-preview-box');
    if (!previewBox) {
      previewBox = document.createElement('div');
      previewBox.className = 'search-preview-box';
      parent.appendChild(previewBox);
    }

    input.addEventListener('input', async (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q || q.length < 2) {
        previewBox.style.display = 'none';
        return;
      }

      await loadDatabase();
      const matches = (localDB.products || []).filter(p =>
        (p.P_Name && p.P_Name.toLowerCase().includes(q)) ||
        (p.SKU && p.SKU.toLowerCase().includes(q)) ||
        (p.Category && p.Category.toLowerCase().includes(q)) ||
        (p.Brand && p.Brand.toLowerCase().includes(q))
      ).slice(0, 6);

      if (matches.length === 0) {
        previewBox.innerHTML = '<div style="padding: 12px; font-size: 13px; color: var(--text-muted); text-align: center;">কোনো পণ্য পাওয়া যায়নি</div>';
        previewBox.style.display = 'block';
        return;
      }

      previewBox.innerHTML = matches.map(p => `
        <a href="product-details.html?sku=${p.SKU}" class="search-preview-item">
          <img src="${p.Images}" alt="${p.P_Name}">
          <div style="flex: 1; overflow: hidden;">
            <div style="font-size: 13px; font-weight: 700; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.P_Name}</div>
            <div style="font-size: 12px; color: var(--primary); font-weight: 700;">৳${p.Selling_Price} <span style="font-size: 11px; color: var(--text-muted); font-weight: normal;">• SKU: ${p.SKU}</span></div>
          </div>
        </a>
      `).join('');
      previewBox.style.display = 'block';
    });

    document.addEventListener('click', (ev) => {
      if (!parent.contains(ev.target)) {
        previewBox.style.display = 'none';
      }
    });
  });
}

// Toast Notifications
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bg = type === 'success' ? '#10b981' : type === 'danger' ? '#ef4444' : '#1e3c72';
  toast.style.cssText = `background: ${bg}; color: white; padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 15px rgba(0,0,0,0.15); animation: fadeIn 0.3s ease; display: flex; align-items: center; gap: 8px;`;
  toast.innerHTML = `<i class="fa fa-info-circle"></i> <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Dark Mode Toggle
function initTheme() {
  const savedTheme = localStorage.getItem('dcbd_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  const themeBtns = document.querySelectorAll('.theme-toggle-btn');
  themeBtns.forEach(btn => {
    btn.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('dcbd_theme', next);
      themeBtns.forEach(b => b.innerHTML = next === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>');
    });
  });
}

// Fixed Floating Buttons Behavior
function initFloatingActions() {
  const whatsappFloat = document.getElementById('float-whatsapp');
  if (whatsappFloat) {
    const popup = whatsappFloat.querySelector('.sub-buttons-popup');
    whatsappFloat.querySelector('.float-main-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      popup.classList.toggle('active');
    });
  }

  const callFloat = document.getElementById('float-call');
  if (callFloat) {
    const popup = callFloat.querySelector('.sub-buttons-popup');
    callFloat.querySelector('.float-main-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      popup.classList.toggle('active');
    });
  }

  document.addEventListener('click', () => {
    document.querySelectorAll('.sub-buttons-popup').forEach(p => p.classList.remove('active'));
  });
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateHeaderBadges();
  setupLiveSearch();
  initFloatingActions();
  loadDatabase();
});
