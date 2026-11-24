/* ===========================================================
   Rise & Crumb Bakery - site behaviour
   Edit the CONFIG and PRODUCTS below to make the site yours.
   =========================================================== */

const CONFIG = {
  currency: "$",                 // e.g. "GH₵", "£", "€"
  whatsappNumber: "10000000000", // country code + number, digits only
  // Opening hours by weekday (0 = Sunday). Times in 24h, [open, close].
  hours: { 0: [8, 13], 1: [7, 18], 2: [7, 18], 3: [7, 18], 4: [7, 18], 5: [7, 18], 6: [7, 16] }
};

const PRODUCTS = [
  { id: 1,  name: "Country Sourdough",   cat: "Bread",    price: 6.5,  emoji: "🍞", bg: "#fde7b0", desc: "48-hour ferment, crackly crust, soft open crumb.", tag: "Best seller", today: true },
  { id: 2,  name: "Soft Dinner Rolls",   cat: "Bread",    price: 4.0,  emoji: "🥖", bg: "#f9d9b0", desc: "Pillowy rolls, six to a bag. Great with butter.", today: true },
  { id: 3,  name: "Seeded Rye Loaf",     cat: "Bread",    price: 7.0,  emoji: "🌾", bg: "#e9dcc0", desc: "Dense, nutty and packed with seeds.", today: false },
  { id: 4,  name: "Butter Croissant",    cat: "Pastry",   price: 3.5,  emoji: "🥐", bg: "#fbe0a6", desc: "Laminated by hand with 27 layers of butter.", tag: "Best seller", today: true },
  { id: 5,  name: "Cinnamon Swirl",      cat: "Pastry",   price: 3.75, emoji: "🌀", bg: "#f5c9a8", desc: "Warm cinnamon dough with cream cheese glaze.", today: true },
  { id: 6,  name: "Apple Turnover",      cat: "Pastry",   price: 3.25, emoji: "🍎", bg: "#f9cfcf", desc: "Flaky pastry filled with spiced baked apple.", today: true },
  { id: 7,  name: "Vanilla Celebration Cake", cat: "Cakes", price: 32,  emoji: "🎂", bg: "#f7c9d4", desc: "Three layers, vanilla sponge, buttercream. Serves 8.", today: true },
  { id: 8,  name: "Chocolate Fudge Cake", cat: "Cakes",   price: 36,   emoji: "🍫", bg: "#d9c2b5", desc: "Rich chocolate sponge with ganache. Serves 8.", today: false },
  { id: 9,  name: "Carrot Loaf Cake",    cat: "Cakes",    price: 14,   emoji: "🥕", bg: "#fcd9a8", desc: "Moist spiced loaf with walnut and cream cheese frosting.", today: true },
  { id: 10, name: "Chocolate Chip Cookie", cat: "Cookies", price: 2.5, emoji: "🍪", bg: "#f2d7b0", desc: "Crisp edges, gooey middle, sea salt on top.", today: true },
  { id: 11, name: "Oat & Raisin Cookie", cat: "Cookies",  price: 2.5,  emoji: "🍪", bg: "#ecdcbe", desc: "Chewy and lightly spiced.", today: true },
  { id: 12, name: "Fresh Fruit Tart",    cat: "Pastry" ,  price: 5.5,  emoji: "🍓", bg: "#f9cfd6", desc: "Buttery shortcrust, vanilla custard, seasonal fruit.", today: true }
];

/* ---------- Helpers ---------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const money = n => CONFIG.currency + n.toFixed(2);

/* ---------- Basket state (kept in memory + localStorage when available) ---------- */
let cart = [];
try { cart = JSON.parse(localStorage.getItem("rc-cart")) || []; } catch (e) { cart = []; }
const saveCart = () => { try { localStorage.setItem("rc-cart", JSON.stringify(cart)); } catch (e) {} };

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- Mobile nav ---------- */
const burger = $("#burger"), nav = $("#nav");
burger.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  burger.setAttribute("aria-expanded", open);
});
$$("#nav a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("open");
  burger.setAttribute("aria-expanded", "false");
}));

/* ---------- Active nav link on scroll ---------- */
const sections = ["menu", "about", "order", "visit"].map(id => document.getElementById(id));
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        $$("#nav a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  sections.forEach(s => s && io.observe(s));
}

/* ---------- Open / closed status + today's row in hours table ---------- */
function updateStatus() {
  const now = new Date();
  const [open, close] = CONFIG.hours[now.getDay()];
  const h = now.getHours() + now.getMinutes() / 60;
  const el = $("#openStatus");
  const isOpen = h >= open && h < close;
  el.className = "status " + (isOpen ? "open" : "closed");
  el.textContent = isOpen ? "Open now" : "Closed right now";

  const rows = $$(".hours tr");
  const idx = now.getDay() === 0 ? 2 : now.getDay() === 6 ? 1 : 0;
  rows.forEach((r, i) => r.classList.toggle("today", i === idx));
}
updateStatus();
setInterval(updateStatus, 60000);

/* ---------- Today's board ---------- */
$("#todayList").innerHTML = PRODUCTS.filter(p => p.today).slice(0, 6)
  .map(p => `<li><span>${p.emoji} ${p.name}</span><strong>${money(p.price)}</strong></li>`).join("");

/* ---------- Menu: filters + grid ---------- */
const categories = ["All", ...new Set(PRODUCTS.map(p => p.cat))];
let activeCat = "All";

function renderFilters() {
  $("#filters").innerHTML = categories.map(c =>
    `<button class="filter" role="tab" aria-selected="${c === activeCat}" data-cat="${c}">${c}</button>`).join("");
}

function renderMenu() {
  const list = PRODUCTS.filter(p => activeCat === "All" || p.cat === activeCat);
  $("#menuGrid").innerHTML = list.map(p => `
    <article class="card ${p.today ? "" : "sold-out"}">
      <div class="card-art" style="background:${p.bg}" aria-hidden="true">${p.emoji}</div>
      <div class="card-body">
        ${p.tag ? `<span class="tag">${p.tag}</span>` : ""}
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="card-row">
          <span class="price">${money(p.price)}</span>
          <button class="add" data-id="${p.id}" ${p.today ? "" : "disabled"}>${p.today ? "Add" : "Sold out"}</button>
        </div>
      </div>
    </article>`).join("");
}

$("#filters").addEventListener("click", e => {
  const btn = e.target.closest(".filter");
  if (!btn) return;
  activeCat = btn.dataset.cat;
  renderFilters();
  renderMenu();
});

$("#menuGrid").addEventListener("click", e => {
  const btn = e.target.closest(".add");
  if (!btn) return;
  addToCart(Number(btn.dataset.id));
});

renderFilters();
renderMenu();

/* ---------- Basket ---------- */
function addToCart(id) {
  const item = cart.find(i => i.id === id);
  if (item) item.qty++; else cart.push({ id, qty: 1 });
  saveCart();
  renderCart();
  const btn = $("#cartOpen");
  btn.classList.remove("bump"); void btn.offsetWidth; btn.classList.add("bump");
  toast(PRODUCTS.find(p => p.id === id).name + " added");
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function cartTotal() {
  return cart.reduce((sum, i) => sum + PRODUCTS.find(p => p.id === i.id).price * i.qty, 0);
}

function renderCart() {
  const list = $("#cartList");
  // Drop anything that no longer exists in PRODUCTS
  cart = cart.filter(i => PRODUCTS.some(p => p.id === i.id));

  if (!cart.length) {
    list.innerHTML = `<li class="cart-empty">Your basket is empty. Add something fresh from the menu.</li>`;
  } else {
    list.innerHTML = cart.map(i => {
      const p = PRODUCTS.find(x => x.id === i.id);
      return `
        <li class="cart-item">
          <strong>${p.emoji} ${p.name}</strong>
          <span class="line-price">${money(p.price * i.qty)}</span>
          <div class="qty">
            <button aria-label="Decrease ${p.name}" data-act="dec" data-id="${p.id}">&minus;</button>
            <span>${i.qty}</span>
            <button aria-label="Increase ${p.name}" data-act="inc" data-id="${p.id}">+</button>
          </div>
          <button class="remove" data-act="rm" data-id="${p.id}">Remove</button>
        </li>`;
    }).join("");
  }

  $("#cartCount").textContent = cart.reduce((n, i) => n + i.qty, 0);
  $("#cartTotal").textContent = money(cartTotal());
  $("#checkout").disabled = !cart.length;
}

$("#cartList").addEventListener("click", e => {
  const b = e.target.closest("button[data-act]");
  if (!b) return;
  const id = Number(b.dataset.id);
  if (b.dataset.act === "inc") changeQty(id, 1);
  if (b.dataset.act === "dec") changeQty(id, -1);
  if (b.dataset.act === "rm") removeItem(id);
});

$("#clearCart").addEventListener("click", () => { cart = []; saveCart(); renderCart(); });

/* Drawer open/close */
const drawer = $("#drawer"), overlay = $("#overlay");
function openCart() {
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  $("#cartClose").focus();
}
function closeCart() {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  overlay.hidden = true;
  document.body.style.overflow = "";
  $("#cartOpen").focus();
}
$("#cartOpen").addEventListener("click", openCart);
$("#cartClose").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", e => { if (e.key === "Escape" && drawer.classList.contains("open")) closeCart(); });

/* Checkout: opens WhatsApp with the order pre-written */
$("#checkout").addEventListener("click", () => {
  if (!cart.length) return;
  const lines = cart.map(i => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return `${i.qty} x ${p.name} (${money(p.price * i.qty)})`;
  });
  const msg = `Hello Rise & Crumb, I would like to order:\n${lines.join("\n")}\nTotal: ${money(cartTotal())}\nPickup or delivery: `;
  window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
});

renderCart();

/* ---------- Custom order form ---------- */
const form = $("#orderForm");
const dateInput = $("#date");
dateInput.min = new Date(Date.now() + 2 * 864e5).toISOString().split("T")[0]; // at least 2 days ahead

const rules = {
  name:    v => v.trim().length >= 2 || "Enter your name.",
  phone:   v => /^[+()\d\s-]{7,}$/.test(v.trim()) || "Enter a valid phone number.",
  date:    v => !!v || "Choose the date you need the cake.",
  size:    v => !!v || "Choose a size.",
  details: v => v.trim().length >= 10 || "Tell us a bit more (at least 10 characters)."
};

function validateField(name) {
  const input = form.elements[name];
  const result = rules[name](input.value);
  const field = input.closest(".field");
  const msg = $(`.error[data-for="${name}"]`);
  const ok = result === true;
  field.classList.toggle("invalid", !ok);
  msg.textContent = ok ? "" : result;
  input.setAttribute("aria-invalid", String(!ok));
  return ok;
}

Object.keys(rules).forEach(name => {
  form.elements[name].addEventListener("blur", () => validateField(name));
  form.elements[name].addEventListener("input", () => {
    if (form.elements[name].closest(".field").classList.contains("invalid")) validateField(name);
  });
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const allOk = Object.keys(rules).map(validateField).every(Boolean);
  const msg = $("#formMsg");
  if (!allOk) {
    msg.className = "form-msg";
    msg.textContent = "Please fix the highlighted fields.";
    const firstBad = $(".field.invalid input, .field.invalid select, .field.invalid textarea");
    if (firstBad) firstBad.focus();
    return;
  }
  const d = new FormData(form);
  const text = `Custom cake request\nName: ${d.get("name")}\nPhone: ${d.get("phone")}\nDate needed: ${d.get("date")}\nSize: ${d.get("size")}\nDetails: ${d.get("details")}`;
  window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  msg.className = "form-msg ok";
  msg.textContent = "Thank you. Your request is ready to send on WhatsApp.";
  form.reset();
});

/* ---------- Footer year ---------- */
$("#year").textContent = new Date().getFullYear();
