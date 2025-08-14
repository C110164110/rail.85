// ====== 共用動畫與漢堡選單 ======
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.fade-in').forEach(el => el.classList.add('show'));
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav-links');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      nav.classList.toggle('nav-active');
      burger.classList.toggle('toggle');
    });
  }
});

// ====== 商品頁（products.html） ======
if (location.pathname.includes('products.html')) {
  let products = [];
  let filter = 'all';

  fetch('products.json')
    .then(res => res.json())
    .then(data => {
      products = data;
      renderProducts();
    });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filter = btn.dataset.type || 'all';
      renderProducts();
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  function renderProducts() {
    const list = document.querySelector('.product-list');
    if (!list) return;
    list.innerHTML = '';
    products
      .filter(p => filter === 'all' || p.type === filter)
      .forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card fade-in';
        card.innerHTML = `
          <img src="assets/img/${p.img}" alt="${p.name}">
          <h3>${p.name}</h3>
          <p>NT$${p.price} / 月</p>
          <button class="add-btn" data-id="${p.id}">加入租賃清單</button>
        `;
        list.appendChild(card);
      });
    document.querySelectorAll('.add-btn').forEach(btn => {
      btn.addEventListener('click', () => addToCart(btn.dataset.id));
    });
    setTimeout(() => {
      document.querySelectorAll('.fade-in').forEach(el => el.classList.add('show'));
    }, 50);
  }

  function addToCart(id) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!cart.includes(id)) cart.push(id);
    localStorage.setItem('cart', JSON.stringify(cart));
    showCart();
  }

  document.querySelector('.cart-btn').addEventListener('click', showCart);

  function showCart() {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartDrawer = document.querySelector('.cart-drawer');
    if (!cartDrawer) return;
    cartDrawer.classList.add('open');
    cartDrawer.innerHTML = '<h4>租賃清單</h4><ul></ul><div class="cart-total"></div><button class="close-cart">關閉</button>';
    const ul = cartDrawer.querySelector('ul');
    let total = 0;
    cart.forEach(id => {
      const p = products.find(x => x.id == id);
      if (!p) return;
      total += parseInt(p.price.replace(/[^\d]/g, ''));
      const li = document.createElement('li');
      li.innerHTML = `${p.name} <span>NT$${p.price} / 月</span> <button class="del-btn" data-id="${p.id}">刪除</button>`;
      ul.appendChild(li);
    });
    cartDrawer.querySelector('.cart-total').textContent = `總金額：NT$${total}`;
    cartDrawer.querySelectorAll('.del-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        cart = cart.filter(i => i != btn.dataset.id);
        localStorage.setItem('cart', JSON.stringify(cart));
        showCart();
      });
    });
    cartDrawer.querySelector('.close-cart').addEventListener('click', () => {
      cartDrawer.classList.remove('open');
    });
  }
}

// ====== 首頁（index.html） ======
if (
  location.pathname.endsWith('index.html') ||
  location.pathname === '/' ||
  location.pathname.endsWith('/nuloop-site/')
) {
  let products = [];
  fetch('products.json')
    .then(res => res.json())
    .then(data => {
      products = data;
      document.querySelectorAll('.add-btn[data-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          let id = btn.dataset.id;
          let cart = JSON.parse(localStorage.getItem('cart') || '[]');
          if (!cart.includes(id)) cart.push(id);
          localStorage.setItem('cart', JSON.stringify(cart));
          showCart(products);
        });
      });
      const cartBtn = document.querySelector('.cart-btn');
      if (cartBtn) {
        cartBtn.addEventListener('click', () => showCart(products));
      }
    });

  function showCart(products) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartDrawer = document.querySelector('.cart-drawer');
    if (!cartDrawer) return;
    cartDrawer.classList.add('open');
    cartDrawer.innerHTML = '<h4>租賃清單</h4><ul></ul><div class="cart-total"></div><button class="close-cart">關閉</button>';
    const ul = cartDrawer.querySelector('ul');
    let total = 0;
    cart.forEach(id => {
      const p = products.find(x => x.id == id);
      if (!p) return;
      total += parseInt(p.price.replace(/[^\d]/g, ''));
      const li = document.createElement('li');
      li.innerHTML = `${p.name} <span>NT$${p.price} / 月</span> <button class="del-btn" data-id="${p.id}">刪除</button>`;
      ul.appendChild(li);
    });
    cartDrawer.querySelector('.cart-total').textContent = `總金額：NT$${total}`;
    cartDrawer.querySelectorAll('.del-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        cart = cart.filter(i => i != btn.dataset.id);
        localStorage.setItem('cart', JSON.stringify(cart));
        showCart(products);
      });
    });
    cartDrawer.querySelector('.close-cart').addEventListener('click', () => {
      cartDrawer.classList.remove('open');
    });
  }
}

// ====== 聯絡表單（contact.html） ======
if (location.pathname.includes('contact.html')) {
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      alert('已送出，我們會盡快聯絡您！');
      form.reset();
    });
  }
}

// ====== 按鈕 hover 動畫 ======
document.addEventListener('mouseover', e => {
  if (e.target.classList.contains('btn') || e.target.classList.contains('add-btn')) {
    e.target.classList.add('hover');
  }
});
document.addEventListener('mouseout', e => {
  if (e.target.classList.contains('btn') || e.target.classList.contains('add-btn')) {
    e.target.classList.remove('hover');
  }
});