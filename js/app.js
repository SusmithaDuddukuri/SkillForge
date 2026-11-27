/**
 * SkillForge – Online Learning Platform
 * Cart (for courses), navigation, modals, forms, localStorage
 */
(function () {
  'use strict';
  const Cart = {
    key: 'skillforge_cart',
    get() { try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch(e){ return []; } },
    save(items) { localStorage.setItem(this.key, JSON.stringify(items)); this.updateUI(); },
    add(product) {
      const items = this.get();
      const existing = items.find(i => i.id === product.id);
      if (existing) existing.qty += product.qty || 1;
      else items.push({ id: product.id, name: product.name, price: product.price, emoji: product.emoji || '📚', qty: product.qty || 1 });
      this.save(items);
      showToast(`${product.name} added to cart!`);
    },
    remove(id) { this.save(this.get().filter(i => i.id !== id)); showToast('Item removed'); },
    updateQty(id, qty) {
      const items = this.get(); const item = items.find(i => i.id === id);
      if (item) { item.qty = Math.max(1, qty); this.save(items); }
    },
    clear() { this.save([]); },
    total() { return this.get().reduce((s, i) => s + i.price * i.qty, 0); },
    count() { return this.get().reduce((s, i) => s + i.qty, 0); },
    updateUI() {
      const count = this.count();
      document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count; el.style.display = count > 0 ? 'flex' : 'none';
      });
    }
  };
  function showToast(msg, dur=2800) {
    let t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._timer); t._timer = setTimeout(() => t.classList.remove('show'), dur);
  }
  function openModal(id) { document.getElementById(id)?.classList.add('show'); }
  function closeModal(id) { document.getElementById(id)?.classList.remove('show'); }

  function initQty() {
    document.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const c = this.closest('.qty-selector'); const v = c.querySelector('.qty-value');
        let val = parseInt(v.textContent,10)||1;
        if (this.dataset.action==='inc') val++; else val = Math.max(1,val-1);
        v.textContent = val;
      });
    });
  }
  function initAddToCart() {
    document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const id = this.dataset.id || this.dataset.addToCart;
        const name = this.dataset.name || 'Course';
        const price = parseFloat(this.dataset.price)||0;
        const emoji = this.dataset.emoji || '📚';
        let qty = 1; const qe = document.querySelector('.qty-value');
        if (qe) qty = parseInt(qe.textContent,10)||1;
        Cart.add({id,name,price,emoji,qty});
      });
    });
  }
  function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const target = this.dataset.tab;
        this.parentElement.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
        this.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
        document.getElementById(target)?.classList.add('active');
      });
    });
  }
  function initMobile() {
    const btn = document.querySelector('.mobile-menu-btn'), nav = document.querySelector('.nav');
    if (btn && nav) btn.addEventListener('click', () => {
      nav.style.display = nav.style.display==='flex' ? 'none' : 'flex';
      nav.style.flexDirection='column'; nav.style.position='absolute';
      nav.style.top='100%'; nav.style.left=0; nav.style.right=0;
      nav.style.background='var(--primary-dark)'; nav.style.padding='1rem';
    });
  }
  function initSearch() {
    document.querySelector('.search-box')?.addEventListener('submit', function(e) {
      e.preventDefault();
      const q = this.querySelector('input').value.trim();
      if (q) location.href = 'courses.html?q=' + encodeURIComponent(q);
    });
  }
  function initCats() {
    document.querySelectorAll('.category-chip').forEach(chip => {
      chip.addEventListener('click', function() {
        document.querySelectorAll('.category-chip').forEach(c=>c.classList.remove('active'));
        this.classList.add('active');
        const cat = this.dataset.category;
        document.querySelectorAll('.product-card').forEach(card => {
          card.style.display = (!cat || cat==='all' || card.dataset.category===cat) ? '' : 'none';
        });
      });
    });
  }
  function initForms() {
    document.getElementById('contact-form')?.addEventListener('submit', function(e) {
      e.preventDefault(); showToast('Message sent! We will reply soon.'); this.reset();
    });
    document.getElementById('newsletter-form')?.addEventListener('submit', function(e) {
      e.preventDefault(); showToast('Subscribed to SkillForge updates!'); this.reset();
    });
    document.getElementById('checkout-form')?.addEventListener('submit', function(e) {
      e.preventDefault(); Cart.clear(); showToast('Enrollment successful! Check your email.');
      setTimeout(()=>location.href='index.html', 2000);
    });
    document.querySelectorAll('[data-auth]').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        showToast(this.dataset.auth==='login' ? 'Logged in (demo)' : 'Account created (demo)');
        closeModal('auth-modal');
      });
    });
  }
  function renderCart() {
    const container = document.getElementById('cart-items');
    if (!container) return;
    const items = Cart.get();
    if (!items.length) {
      container.innerHTML = `<div class="empty-state"><div class="icon">🛒</div><h3>Your cart is empty</h3><p>Browse courses and add them to get started.</p><a href="courses.html" class="btn btn-primary mt-2">Browse Courses</a></div>`;
      document.getElementById('cart-summary')?.classList.add('hidden');
      return;
    }
    let html = `<table class="cart-table"><thead><tr><th>Course</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead><tbody>`;
    items.forEach(item => {
      html += `<tr data-id="${item.id}"><td><div class="flex items-center gap-2"><span style="font-size:1.6rem">${item.emoji}</span><strong>${item.name}</strong></div></td>
      <td>$${item.price.toFixed(2)}</td><td><div class="qty-selector"><button class="qty-btn" data-action="dec" data-id="${item.id}">−</button><span class="qty-value">${item.qty}</span><button class="qty-btn" data-action="inc" data-id="${item.id}">+</button></div></td>
      <td>$${(item.price*item.qty).toFixed(2)}</td><td><button class="btn btn-sm" style="background:#ffebee;color:#c62828" data-remove="${item.id}">Remove</button></td></tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
    const total = Cart.total();
    const sum = document.getElementById('cart-summary');
    if (sum) {
      sum.classList.remove('hidden');
      sum.querySelector('.summary-subtotal').textContent = '$'+total.toFixed(2);
      sum.querySelector('.summary-total-value').textContent = '$'+total.toFixed(2);
    }
    container.querySelectorAll('[data-remove]').forEach(btn => btn.addEventListener('click', ()=>{ Cart.remove(btn.dataset.remove); renderCart(); }));
    container.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id=this.dataset.id, row=this.closest('tr'), ve=row.querySelector('.qty-value');
        let val=parseInt(ve.textContent,10);
        if (this.dataset.action==='inc') val++; else val=Math.max(1,val-1);
        Cart.updateQty(id,val); renderCart();
      });
    });
  }
  function highlightNav() {
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav a').forEach(a => {
      if (a.getAttribute('href')===path || (path==='' && a.getAttribute('href')==='index.html')) a.classList.add('active');
    });
  }
  document.addEventListener('DOMContentLoaded', () => {
    Cart.updateUI(); initQty(); initAddToCart(); initTabs(); initMobile(); initSearch(); initCats(); initForms(); renderCart(); highlightNav();
    document.querySelectorAll('.modal-overlay').forEach(o => o.addEventListener('click', e => { if(e.target===o) o.classList.remove('show'); }));
    document.querySelectorAll('.modal-close').forEach(b => b.addEventListener('click', () => b.closest('.modal-overlay').classList.remove('show')));
    document.querySelectorAll('.user-btn').forEach(b => b.addEventListener('click', () => openModal('auth-modal')));
  });
  window.SkillForge = { Cart, showToast, openModal, closeModal };
})();
