// Utilidades UI compartidas entre todas las paginas.

// Oculta visualmente la extensión .html de la barra de direcciones del navegador sin recargar
(function cleanBrowserUrl() {
  try {
    const { pathname, search, hash } = window.location;
    if (pathname.endsWith("/index.html")) {
      const base = pathname.slice(0, -10) || "/";
      window.history.replaceState(null, "", base + search + hash);
    } else if (pathname.endsWith(".html")) {
      const cleanPath = pathname.slice(0, -5) || "/";
      window.history.replaceState(null, "", cleanPath + search + hash);
    }
  } catch {
    // Ignorar en entornos restringidos
  }
})();

function normalizeInternalUrl(rawUrl) {
  if (!rawUrl) return rawUrl;
  const str = String(rawUrl);
  if (/^https?:\/\//i.test(str) || str.startsWith("/api/") || str.startsWith("#")) return str;
  const [pathPart, queryPart] = str.split("?");
  if (pathPart === "/" || pathPart === "") {
    return queryPart ? `/index.html?${queryPart}` : "/index.html";
  }
  const cleanBase = pathPart.endsWith(".html") ? pathPart : `${pathPart}.html`;
  return queryPart ? `${cleanBase}?${queryPart}` : cleanBase;
}

function getSvgIcon(name, extraClass = "") {
  const cls = `icon-svg ${extraClass}`.trim();
  switch (name) {
    case "academic":
      return `<svg class="${cls}" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
    case "bell":
      return `<svg class="${cls}" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`;
    case "lock":
      return `<svg class="${cls}" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
    case "key":
      return `<svg class="${cls}" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5-1.5 1.5 1.5 1.5L11 13H8v3H5v3H2v-3.5L13.5 4a3.5 3.5 0 1 1 5 5z"/></svg>`;
    case "eye":
      return `<svg class="${cls}" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    case "file-pdf":
    case "document":
      return `<svg class="${cls}" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`;
    case "save":
      return `<svg class="${cls}" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`;
    case "printer":
      return `<svg class="${cls}" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`;
    case "rocket":
      return `<svg class="${cls}" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
    case "search":
      return `<svg class="${cls}" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
    case "briefcase":
      return `<svg class="${cls}" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
    case "edit":
    case "pencil":
      return `<svg class="${cls}" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`;
    case "mail":
      return `<svg class="${cls}" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
    case "globe":
      return `<svg class="${cls}" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
    case "info":
      return `<svg class="${cls}" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    case "user":
      return `<svg class="${cls}" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    case "message":
      return `<svg class="${cls}" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
    case "award":
      return `<svg class="${cls}" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`;
    case "check":
      return `<svg class="${cls}" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
    case "close":
      return `<svg class="${cls}" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    default:
      return "";
  }
}

function el(tag, attrs = {}, children = []) {
  if (Array.isArray(attrs) || attrs instanceof Node || typeof attrs === "string" || typeof attrs === "number") {
    children = attrs;
    attrs = {};
  }
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "html") node.innerHTML = value;
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === true) {
      // Atributos booleanos (disabled, hidden, checked, required...): presente = activo
      node.setAttribute(key, "");
    } else if (value === false) {
      // Atributo booleano desactivado: se omite (evita disabled="false" y checked="false")
    } else if (value !== null && value !== undefined) {
      node.setAttribute(key, value);
    }
  }
  const append = (c) => {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) {
      c.forEach(append);
    } else if (c instanceof Node) {
      node.appendChild(c);
    } else {
      node.appendChild(document.createTextNode(String(c)));
    }
  };
  append(children);
  return node;
}

function showAlert(container, message, type = "error") {
  container.innerHTML = "";
  container.appendChild(
    el("div", { class: `alert alert-${type === "error" ? "error" : "success"}`, text: message })
  );
}

function clearAlert(container) {
  container.innerHTML = "";
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

/**
 * Retorna el elemento/nodo HTML de la insignia verde de verificado (Sello Verde de Confianza).
 */
function createVerifiedBadge(title = "Correo electrónico verificado") {
  const span = document.createElement("span");
  span.className = "verified-badge";
  span.title = title;
  span.setAttribute("aria-label", title);
  span.innerHTML = `
    <svg viewBox="0 0 20 20" fill="none" class="verified-icon" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0z" fill="#10b981"/>
      <path d="M6 10.2l2.6 2.6L14.2 7" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  return span;
}

/**
 * Construye la barra de navegacion superior y actualiza sus enlaces
 * segun si hay una sesion activa (llama a /api/auth/me).
 * Implementa navegación responsive con menú hamburguesa para móviles.
 */
async function renderTopbar(activeUser) {
  const bar = document.getElementById("topbar");
  if (!bar) return;

  let user = activeUser;
  if (user === undefined) {
    try {
      const result = await api.auth.me();
      user = result.user;
    } catch {
      user = null;
    }
  }

  bar.innerHTML = "";

  // 1. Contenedor principal de la barra (marca a la izquierda, acciones a la derecha)
  const topbarMain = el("div", { class: "topbar-main" });

  const brandLink = el("a", { class: "brand-container", href: "/index.html" }, [
    el("div", { class: "brand-icon-wrap", html: getSvgIcon("academic") }),
    el("div", { class: "brand-text-wrap" }, [
      el("span", { class: "brand-title" }, [
        el("span", { class: "brand-title-full", text: "Registro de Egresados" }),
        el("span", { class: "brand-title-compact", text: "Red de Egresados" }),
      ]),
      el("span", { class: "brand-subtitle" }, [
        el("span", { class: "brand-sub-full", text: "Ingeniería Informática · UAJMS" }),
        el("span", { class: "brand-sub-compact", text: "UAJMS · INFORMÁTICA" })
      ])
    ])
  ]);
  topbarMain.appendChild(brandLink);

  const topbarActions = el("div", { class: "topbar-actions" });

  // 2. Función constructora de campana de notificaciones (reutilizable para móvil y escritorio)
  const createNotifWidget = (extraClass = "") => {
    const notifContainer = el("div", { class: `notif-bell-container ${extraClass}`.trim() });
    const bellBtn = el("button", {
      type: "button",
      class: "notif-bell-btn",
      title: "Notificaciones",
      "aria-label": "Notificaciones",
    }, [
      el("span", { class: "notif-bell-icon", html: getSvgIcon("bell") }),
      el("span", { class: "notif-badge", style: "display:none;" })
    ]);

    const notifDropdown = el("div", { class: "notif-dropdown", hidden: true, style: "display:none;" });
    notifContainer.appendChild(bellBtn);
    notifContainer.appendChild(notifDropdown);

    const toggleNotifications = async (forceClose = false) => {
      const isCurrentlyOpen = !notifDropdown.hasAttribute("hidden") && notifDropdown.style.display !== "none";
      if (isCurrentlyOpen || forceClose) {
        notifDropdown.setAttribute("hidden", "");
        notifDropdown.style.display = "none";
      } else {
        notifDropdown.removeAttribute("hidden");
        notifDropdown.style.display = "flex";
        await loadNotificationsDropdown(notifDropdown);
      }
    };

    bellBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await toggleNotifications();
    });

    return notifContainer;
  };

  // Listener global único para cerrar desplegables de notificaciones al hacer clic fuera
  if (!window._notifDropdownListenerAttached) {
    window._notifDropdownListenerAttached = true;
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".notif-bell-container")) {
        document.querySelectorAll(".notif-dropdown").forEach((d) => {
          d.setAttribute("hidden", "");
          d.style.display = "none";
        });
      }
    });
  }

  // En móvil: campana dentro de topbarActions, accesible junto a la hamburguesa
  if (user) {
    topbarActions.appendChild(createNotifWidget("notif-container-mobile"));
  }

  // 3. Botón Hamburguesa móvil
  const hamburgerBtn = el("button", {
    type: "button",
    id: "mobileMenuToggle",
    class: "topbar-hamburger-btn",
    "aria-label": "Abrir menú de navegación",
    "aria-expanded": "false",
    "aria-controls": "topbarNav",
  }, [
    el("span", { class: "hamburger-icon", "aria-hidden": "true" }, [
      el("span", { class: "bar" }),
      el("span", { class: "bar" }),
      el("span", { class: "bar" })
    ])
  ]);
  topbarActions.appendChild(hamburgerBtn);

  topbarMain.appendChild(topbarActions);
  bar.appendChild(topbarMain);

  // 4. Navegación (inline en escritorio, cajón colapsable en móvil)
  const nav = el("nav", { id: "topbarNav", class: "topbar-nav", "aria-label": "Navegación principal" });
  nav.appendChild(el("a", { class: "topbar-nav-link", href: "/index.html", text: "Directorio" }));

  if (user) {
    nav.appendChild(el("a", { class: "topbar-nav-link", href: "/dashboard.html", text: "Mi ficha" }));
    nav.appendChild(el("a", { class: "topbar-nav-link", href: "/cartas.html", text: "Cartas de presentación" }));
    if (user.role === "admin") {
      const adminLinks = [
        ["users", "Usuarios y roles"],
        ["technologies", "Habilidades técnicas"],
        ["soft_skills", "Habilidades Personales"],
        ["graduates", "Perfiles"],
        ["projects", "Proyectos"],
        ["experiences", "Experiencias"],
        ["certificates", "Certificados"],
        ["recommendations", "Comentarios"],
        ["cover_letters", "Cartas de presentación"],
        ["notifications", "Notificaciones"],
        ["audit_logs", "Registro de Auditoría"],
      ];
      const creditsBtn = el("a", {
        href: "#",
        class: "admin-credits-link",
        html: `${getSvgIcon("info")} Créditos del proyecto`,
        style: "border-top: 1px solid var(--border); font-weight: 600; color: var(--secondary);",
        onclick: (e) => {
          e.preventDefault();
          showCreditsModal();
        }
      });

      const dropdownChildren = adminLinks.map(([entity, label]) =>
        el("a", { href: `/admin.html?entity=${entity}`, text: label })
      );
      dropdownChildren.push(creditsBtn);

      const menu = el("details", { class: "admin-nav-menu" }, [
        el("summary", { text: "Gestión" }),
        el("div", { class: "admin-nav-dropdown" }, dropdownChildren),
      ]);
      nav.appendChild(menu);
    }

    // En escritorio: campana junto a las opciones de navegación, antes de Cerrar sesión
    nav.appendChild(createNotifWidget("notif-container-desktop"));

    const logoutBtn = el("button", { class: "btn btn-logout-topbar", text: "Cerrar sesión" });
    logoutBtn.addEventListener("click", async () => {
      await api.auth.logout();
      window.location.href = "/index.html";
    });
    nav.appendChild(logoutBtn);
  } else {
    nav.appendChild(el("a", { class: "topbar-link-login", href: "/login.html", text: "Iniciar sesión" }));
    nav.appendChild(el("a", { class: "btn btn-primary topbar-btn-register", href: "/registro.html", text: "Crear cuenta" }));
  }

  bar.appendChild(nav);

  // 5. Interactividad del menú hamburguesa
  const toggleMobileMenu = (forceClose = false) => {
    const isExpanded = hamburgerBtn.getAttribute("aria-expanded") === "true";
    const nextState = forceClose ? false : !isExpanded;
    hamburgerBtn.setAttribute("aria-expanded", String(nextState));
    hamburgerBtn.setAttribute("aria-label", nextState ? "Cerrar menú de navegación" : "Abrir menú de navegación");
    if (nextState) {
      nav.classList.add("is-open");
      hamburgerBtn.classList.add("is-active");
    } else {
      nav.classList.remove("is-open");
      hamburgerBtn.classList.remove("is-active");
    }
  };

  hamburgerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMobileMenu();
  });

  // Cerrar al pulsar un enlace de navegación
  nav.querySelectorAll("a, button").forEach((item) => {
    item.addEventListener("click", () => {
      if (window.innerWidth <= 860) {
        toggleMobileMenu(true);
      }
    });
  });

  // Cerrar al pulsar fuera del topbar
  document.addEventListener("click", (e) => {
    if (!bar.contains(e.target)) {
      toggleMobileMenu(true);
    }
  });

  // Cerrar con tecla Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      toggleMobileMenu(true);
      hamburgerBtn.focus();
    }
  });

  // Cerrar automáticamente si la ventana se amplía a modo escritorio
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860 && nav.classList.contains("is-open")) {
      toggleMobileMenu(true);
    }
  });

  // El badge debe consultarse DESPUES de insertar la barra en el documento
  if (user) {
    checkUnreadNotifications();
    if (!window._notifPollInterval) {
      window._notifPollInterval = setInterval(checkUnreadNotifications, 20000);
    }
  }

  return user;
}

async function checkUnreadNotifications() {
  const badges = document.querySelectorAll(".notif-badge");
  if (!badges || !badges.length) return;
  try {
    const data = await api.notifications.list(5);
    const unread = Number(data?.unreadCount || 0);
    badges.forEach((badge) => {
      if (unread > 0) {
        // Se muestra como maximo "5+" para no saturar el boton
        badge.textContent = unread > 5 ? "5+" : String(unread);
        badge.style.display = "inline-flex";
        badge.removeAttribute("hidden");
      } else {
        badge.textContent = "";
        badge.style.display = "none";
        badge.setAttribute("hidden", "");
      }
    });
  } catch {
    badges.forEach((badge) => {
      badge.style.display = "none";
      badge.setAttribute("hidden", "");
    });
  }
}

async function loadNotificationsDropdown(container) {
  container.innerHTML = `<div class="notif-loading">Cargando notificaciones...</div>`;
  try {
    // Maximo 5 notificaciones visibles en el panel del boton
    const data = await api.notifications.list(5);
    container.innerHTML = "";

    const header = el("div", { class: "notif-header" }, [
      el("strong", { text: "Notificaciones" }),
      el("button", {
        type: "button",
        class: "btn-link-action",
        text: "Marcar todas como leídas",
        onclick: async () => {
          await api.notifications.markAllRead();
          await checkUnreadNotifications();
          await loadNotificationsDropdown(container);
        }
      })
    ]);
    container.appendChild(header);

    if (!data.items || data.items.length === 0) {
      container.appendChild(el("div", { class: "notif-empty", text: "No tienes notificaciones pendientes." }));
      return;
    }

    const list = el("div", { class: "notif-list" });
    for (const item of data.items) {
      const itemEl = el("div", { class: `notif-item ${item.isRead ? "read" : "unread"}` });
      const content = el("div", { class: "notif-item-body" }, [
        el("div", { class: "notif-item-title", text: item.title }),
        el("div", { class: "notif-item-msg", text: item.message }),
        el("div", { class: "notif-item-date", text: new Date(item.createdAt).toLocaleDateString() + " " + new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
      ]);

      itemEl.appendChild(content);

      itemEl.addEventListener("click", async () => {
        if (!item.isRead) {
          await api.notifications.markRead(item.id);
          await checkUnreadNotifications();
        }
        if (item.link) {
          window.location.href = normalizeInternalUrl(item.link);
        }
      });

      list.appendChild(itemEl);
    }
    container.appendChild(list);
  } catch (err) {
    container.innerHTML = `<div class="notif-empty">Error al cargar notificaciones.</div>`;
  }
}

/**
 * Modal formal de créditos del equipo de desarrollo.
 */
function showCreditsModal() {
  const existing = document.getElementById("creditsModal");
  if (existing) {
    existing.remove();
  }

  const modal = el("div", { id: "creditsModal", class: "cv-dialog" }, [
    el("div", { class: "cv-preview-panel", style: "max-width: 520px; width: 100%; text-align: center; padding: 28px 24px;", role: "dialog", "aria-modal": "true" }, [
      el("div", { class: "cv-preview-header", style: "justify-content: center; position: relative; padding: 0 0 16px 0; border-bottom: 2px solid var(--primary);" }, [
        el("h2", { style: "margin: 0; color: var(--primary); font-size: 1.3rem;", text: "Créditos del Proyecto" }),
        el("button", {
          type: "button",
          class: "admin-icon-button",
          style: "position: absolute; right: 0; top: -6px;",
          text: "✕",
          onclick: () => modal.remove()
        })
      ]),
      el("div", { style: "padding: 24px 12px 16px 12px; line-height: 1.8; color: var(--text); font-size: 1rem;" }, [
        el("div", { style: "background: var(--panel-soft); border: 1px solid var(--border); border-radius: 8px; padding: 18px; margin-bottom: 16px; text-align: left;" }, [
          el("div", { style: "margin-bottom: 12px;" }, [
            el("span", { style: "font-weight: 700; color: var(--primary); display: block; font-size: 0.88rem; text-transform: uppercase; letter-spacing: 0.5px;", text: "Supervisión del Proyecto:" }),
            el("span", { style: "font-size: 1.05rem; font-weight: 600;", text: "Yovana Luisa Sánchez Sánchez" })
          ]),
          el("div", { style: "margin-bottom: 12px;" }, [
            el("span", { style: "font-weight: 700; color: var(--primary); display: block; font-size: 0.88rem; text-transform: uppercase; letter-spacing: 0.5px;", text: "Desarrollador 1:" }),
            el("span", { style: "font-size: 1.05rem; font-weight: 600;", text: "Ing. Diego Garcia Pablo" })
          ]),
          el("div", {}, [
            el("span", { style: "font-weight: 700; color: var(--primary); display: block; font-size: 0.88rem; text-transform: uppercase; letter-spacing: 0.5px;", text: "Capataz:" }),
            el("span", { style: "font-size: 1.05rem; font-weight: 600;", text: "Ing. Daniel Cruz Zarate" })
          ])
        ]),
        el("p", { style: "font-size: 0.85rem; color: var(--muted); margin: 0;", text: "Carrera de Ingeniería Informática — Sede Yacuiba\nUniversidad Autónoma Juan Misael Saracho" })
      ]),
      el("div", { style: "padding-top: 12px; border-top: 1px solid var(--border);" }, [
        el("button", {
          class: "btn btn-primary",
          type: "button",
          style: "min-width: 120px;",
          text: "Cerrar",
          onclick: () => modal.remove()
        })
      ])
    ])
  ]);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });

  document.body.appendChild(modal);
}

/**
 * Toast superior general reutilizable
 */
function showToast(message, type = "info", durationMs = 4500) {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = el("div", { id: "toastContainer", class: "toast-container" });
    document.body.appendChild(container);
  }
  const toast = el("div", { class: `toast toast-${type}` }, [
    el("span", { class: "toast-msg", text: message }),
    el("button", {
      type: "button",
      class: "toast-close",
      text: "✕",
      onclick: () => toast.remove()
    })
  ]);
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("toast-fadeout");
    setTimeout(() => toast.remove(), 400);
  }, durationMs);
}

/**
 * Modal reutilizable de Términos y Condiciones de la Red Alumni.
 * @param {object} options
 * @param {object} [options.user] - Usuario actual si está autenticado
 * @param {boolean} [options.canClose] - Si es true, muestra botón para cerrar (modo consulta)
 * @param {Function} [options.onAccepted] - Callback al aceptar términos
 */
function showTermsModal({ user = null, canClose = false, onAccepted = null } = {}) {
  const existing = document.getElementById("termsModal");
  if (existing) existing.remove();

  const footerChildren = [];

  if (canClose) {
    footerChildren.push(
      el("button", {
        class: "btn btn-secondary",
        type: "button",
        style: "margin-right: 10px;",
        text: "Cerrar",
        onclick: () => modal.remove(),
      })
    );
  }

  if (user && !user.termsAccepted) {
    footerChildren.push(
      el("button", {
        id: "acceptTermsBtn",
        class: "btn btn-primary",
        type: "button",
        text: "Acepto los términos y condiciones",
        onclick: async () => {
          const btn = document.getElementById("acceptTermsBtn");
          btn.disabled = true;
          btn.textContent = "Procesando...";
          try {
            await api.auth.acceptTerms();
            user.termsAccepted = true;
            modal.remove();
            showToast("Términos y condiciones aceptados.", "success");
            if (onAccepted) onAccepted();
          } catch (err) {
            alert("Error al guardar aceptación: " + (err.message || err));
            btn.disabled = false;
            btn.textContent = "Acepto los términos y condiciones";
          }
        },
      })
    );
  } else if (!user && !canClose) {
    footerChildren.push(
      el("button", {
        class: "btn btn-primary",
        type: "button",
        text: "Entendido",
        onclick: () => {
          modal.remove();
          if (onAccepted) onAccepted();
        },
      })
    );
  }

  const headerChildren = [
    el("h2", { text: "Términos y Condiciones de la Red Alumni", style: "margin: 0;" }),
  ];

  if (canClose) {
    headerChildren.push(
      el("button", {
        type: "button",
        class: "admin-icon-button",
        text: "✕",
        onclick: () => modal.remove(),
      })
    );
  }

  const modal = el("div", { id: "termsModal", class: "cv-dialog" }, [
    el("div", { class: "cv-preview-panel terms-panel", role: "dialog", "aria-modal": "true" }, [
      el("div", { class: "cv-preview-header", style: canClose ? "display: flex; justify-content: space-between; align-items: center;" : "" }, headerChildren),
      el("div", { class: "terms-body" }, [
        el("p", { text: "Bienvenido al Directorio y Red Alumni de la carrera de Ingeniería Informática UAJMS." }),
        el("p", { text: "Antes de continuar, debes conocer y aceptar las siguientes condiciones del servicio:" }),
        el("ul", { class: "terms-list" }, [
          el("li", {}, [
            el("strong", { text: "Cuidado y Privacidad con Datos de Contacto: " }),
            "Debes ser consciente de que la información que decidas publicar en tu ficha (teléfono, correos y redes) será accesible a terceros. Sé prudente con los datos que compartes públicamente."
          ]),
          el("li", {}, [
            el("strong", { text: "Ofertas Laborales según tus Habilidades: " }),
            "Tu información profesional y habilidades técnicas/blandas registradas serán utilizadas para enviarte notificaciones y correos informativos sobre posibles trabajos temporales y oportunidades laborales afines a tu perfil."
          ]),
          el("li", {}, [
            el("strong", { text: "Promoción y Apoyo Profesional: " }),
            "Entiendes y aceptas que la razón de publicar tu perfil es hacer publicidad a tu trayectoria profesional y darte un respaldo institucional en tus primeros años de egreso o en tu carrera avanzada."
          ]),
          el("li", {}, [
            el("strong", { text: "Veracidad de la Información: " }),
            "Declaras que los títulos, certificaciones, proyectos y experiencias registradas son verídicos y comprobables."
          ]),
          el("li", {}, [
            el("strong", { text: "Moderación y Supervisión Institucional: " }),
            "La administración de la carrera revisará y aprobará la publicación de fichas para garantizar la calidad y el prestigio de nuestra comunidad académica."
          ])
        ])
      ]),
      el("div", { class: "terms-footer" }, footerChildren)
    ])
  ]);

  if (canClose) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  document.body.appendChild(modal);
  return modal;
}

/**
 * Modal obligatorio de Términos y Condiciones si el usuario no los ha aceptado.
 */
function ensureTermsAccepted(user) {
  if (!user || user.termsAccepted) return;
  showTermsModal({ user, canClose: false });
}

/**
 * Redirige a login si no hay sesion activa. Devuelve el usuario si la hay.
 */
async function requireSession() {
  const { user } = await api.auth.me();
  if (!user) {
    window.location.href = "/login.html";
    return null;
  }
  ensureTermsAccepted(user);
  return user;
}

const EYE_OPEN_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const EYE_OFF_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

/**
 * Envuelve un input de contraseña con un botón de ojo para mostrar/ocultar su contenido.
 */
function attachPasswordToggle(input) {
  if (!input || input.dataset.passwordToggleAttached === "true") return;
  input.dataset.passwordToggleAttached = "true";

  const wrapper = document.createElement("div");
  wrapper.className = "password-input-wrapper";
  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "password-toggle-btn";
  toggleBtn.title = "Mostrar contraseña";
  toggleBtn.setAttribute("aria-label", "Mostrar u ocultar contraseña");
  toggleBtn.innerHTML = EYE_OPEN_SVG;

  toggleBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    toggleBtn.innerHTML = isPassword ? EYE_OFF_SVG : EYE_OPEN_SVG;
    toggleBtn.title = isPassword ? "Ocultar contraseña" : "Mostrar contraseña";
  });

  wrapper.appendChild(toggleBtn);
}

function initPasswordToggles(root = document) {
  const inputs = root.querySelectorAll('input[type="password"]');
  inputs.forEach(attachPasswordToggle);
}

document.addEventListener("DOMContentLoaded", () => {
  initPasswordToggles();
});
