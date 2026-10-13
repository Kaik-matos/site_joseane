/* Joseane Oliveira Advocacia — Interações do site */

// Ano dinâmico no rodapé
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Menu mobile
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
}

// Animação de entrada (reveal on scroll)
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && revealEls.length) {
  const io = new IntersectionObserver(
    entries => entries.forEach(e => e.isIntersecting && e.target.classList.add("in")),
    { threshold: 0.15 }
  );
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add("in"));
}

/* ===== LÓGICA DOS NOVOS CARROSSEIS (ESTRUTURA E ADVOGADOS) ===== */
function inicializarCarrossel(secaoSelector, trilhaSelector, itemSelector, gapOriginal = 20) {
  const secao = document.querySelector(secaoSelector);
  if (!secao) return;

  const trilha = secao.querySelector(trilhaSelector);
  const itens = secao.querySelectorAll(itemSelector);
  const btnProximo = secao.querySelector(".next-btn");
  const btnAnterior = secao.querySelector(".prev-btn");
  const bolinhas = secao.querySelectorAll(".carousel-indicator");

  if (!trilha || itens.length === 0) return;

  let indiceAtual = 0;

  function moverCarrossel() {
    const larguraItem = itens[0].getBoundingClientRect().width;
    const itensPorPagina = window.innerWidth <= 860 ? 1 : 3;
    const indiceMaximo = Math.max(0, itens.length - itensPorPagina);

    // Garante que o índice fique dentro dos limites válidos
    if (indiceAtual > indiceMaximo) indiceAtual = indiceMaximo;
    if (indiceAtual < 0) indiceAtual = 0;

    // CORRIGIDO: Agora usando 'deslocamento' perfeitamente soletrado
    const deslocamento = indiceAtual * (larguraItem + gapOriginal);
    trilha.style.transform = `translateX(-${deslocamento}px)`;
    trilha.style.transition = "transform 0.3s ease-in-out";

    // Atualiza o estado visual das bolinhas de paginação
    bolinhas.forEach((bolinha, idx) => {
      bolinha.classList.toggle("current-slide", idx === indiceAtual);
    });
  }

  if (btnProximo) {
    btnProximo.addEventListener("click", () => {
      const itensPorPagina = window.innerWidth <= 860 ? 1 : 3;
      const indiceMaximo = Math.max(0, itens.length - itensPorPagina);
      
      if (indiceAtual < indiceMaximo) {
        indiceAtual++;
      } else {
        indiceAtual = 0;
      }
      moverCarrossel();
    });
  }

  if (btnAnterior) {
    btnAnterior.addEventListener("click", () => {
      const itensPorPagina = window.innerWidth <= 860 ? 1 : 3;
      const indiceMaximo = Math.max(0, itens.length - itensPorPagina);

      if (indiceAtual > 0) {
        indiceAtual--;
      } else {
        indiceAtual = indiceMaximo;
      }
      moverCarrossel();
    });
  }

  bolinhas.forEach((bolinha, idx) => {
    bolinha.addEventListener("click", () => {
      indiceAtual = idx;
      moverCarrossel();
    });
  });

  window.addEventListener("resize", moverCarrossel);
  moverCarrossel();
}

// Ativa os carrosséis
document.addEventListener("DOMContentLoaded", () => {
  inicializarCarrossel(".section-estrutura", ".carousel-track", ".carousel-slide", 20);
  inicializarCarrossel(".section-advogados", ".lawyers-grid", ".lawyer-card", 24);
});
/* ============================================================ */

/* ===== "Banco de Dados" local de contatos ===== */
const DB_KEY = "ma_contatos";
function getContatos() {
  try { return JSON.parse(localStorage.getItem(DB_KEY)) || []; }
  catch { return []; }
}
function saveContact(data) {
  const list = getContatos();
  list.push({ ...data, id: Date.now(), criadoEm: new Date().toISOString() });
  localStorage.setItem(DB_KEY, JSON.stringify(list));
}

// Formulário de contato
const form = document.getElementById("contactForm");
if (form) {
  const msg = form.querySelector(".form-msg");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.nome || !data.email || !data.mensagem) {
      msg.textContent = "Por favor preencha nome, e-mail e mensagem.";
      msg.className = "form-msg error";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      msg.textContent = "Informe um e-mail válido.";
      msg.className = "form-msg error";
      return;
    }
    saveContact(data);
    msg.textContent = "Mensagem enviada com sucesso! Retornaremos em até 24h úteis.";
    msg.className = "form-msg success";
    form.reset();
  });
}

// Painel admin simples — abra contatos.html?admin=1
if (location.search.includes("admin=1")) {
  const adminEl = document.getElementById("adminPanel");
  if (adminEl) {
    const lista = getContatos();
    adminEl.innerHTML = lista.length
      ? lista.map(c => `
          <article class="service-card">
            <h3>${c.nome} <small style="color:var(--muted);font-weight:400">— ${new Date(c.criadoEm).toLocaleString("pt-BR")}</small></h3>
            <p><strong>E-mail:</strong> ${c.email}<br>
               <strong>Telefone:</strong> ${c.telefone || "-"}<br>
               <strong>Área:</strong> ${c.area || "-"}</p>
            <p>${c.mensagem}</p>
          </article>`).join("")
      : "<p>Nenhum contato registrado ainda.</p>";
  }
}