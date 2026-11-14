// Utilidades UI compartidas entre todas las paginas.

function el(tag, attrs = {}, children = []) {
  if (Array.isArray(attrs) || attrs instanceof Node || typeof attrs === "string" || typeof attrs === "number") {
    children = attrs;
    attrs = {};
  }
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
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
  bar.appendChild(el("a", { class: "brand", href: "/index.html", text: "Registro de Egresados" }));

  const nav = el("nav");
  nav.appendChild(el("a", { href: "/index.html", text: "Directorio" }));

  if (user) {
    nav.appendChild(el("a", { href: "/dashboard.html", text: "Mi ficha" }));
    nav.appendChild(el("a", { href: "/cartas.html", text: "Cartas de presentacion" }));
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
        ["cover_letters", "Cartas de presentacion"],
        ["notifications", "Notificaciones"],
        ["audit_logs", "Registro de Auditoría"],
      ];
      const creditsBtn = el("a", {
        href: "#",
        text: "ℹ️ Créditos del proyecto",
        style: "border-top: 1px solid #e2e8f0; font-weight: 600; color: #1e40af;",
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
        el("summary", { text: "Gestion" }),
        el("div", { class: "admin-nav-dropdown" }, dropdownChildren),
      ]);
      nav.appendChild(menu);
    }

    // Botón de Campana de Notificaciones
    const notifContainer = el("div", { class: "notif-bell-container" });
    const bellBtn = el("button", {
      type: "button",
      class: "notif-bell-btn",
      title: "Notificaciones",
      "aria-label": "Notificaciones",
    }, [
      el("span", { class: "notif-bell-icon", text: "🔔" }),
      el("span", { id: "notifBadge", class: "notif-badge", style: "display:none;" })
    ]);

    const notifDropdown = el("div", { id: "notifDropdown", class: "notif-dropdown", hidden: true, style: "display:none;" });
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

    document.addEventListener("click", (e) => {
      if (!notifContainer.contains(e.target)) {
        toggleNotifications(true);
      }
    });

    nav.addEventListener("click", (e) => {
      if (!notifContainer.contains(e.target)) {
        toggleNotifications(true);
      }
    });

    nav.appendChild(notifContainer);

    const logoutBtn = el("button", { class: "btn btn-secondary", text: "Cerrar sesion" });
    logoutBtn.addEventListener("click", async () => {
      await api.auth.logout();
      window.location.href = "/index.html";
    });
    nav.appendChild(logoutBtn);
  } else {
    nav.appendChild(el("a", { href: "/login.html", text: "Iniciar sesion" }));
    nav.appendChild(el("a", { class: "btn btn-primary", href: "/registro.html", text: "Crear cuenta" }));
  }

  bar.appendChild(nav);

  // El badge debe consultarse DESPUES de insertar la barra en el documento;
  // antes de appendChild(getElementById("notifBadge")) devuelve null.
  if (user) {
    checkUnreadNotifications();
    if (!window._notifPollInterval) {
      window._notifPollInterval = setInterval(checkUnreadNotifications, 20000);
    }
  }

  return user;
}

async function checkUnreadNotifications() {
  const badge = document.getElementById("notifBadge");
  if (!badge) return;
  try {
    const data = await api.notifications.list(5);
    const unread = Number(data?.unreadCount || 0);
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
  } catch {
    badge.style.display = "none";
    badge.setAttribute("hidden", "");
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
          window.location.href = item.link;
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
      el("div", { class: "cv-preview-header", style: "justify-content: center; position: relative; padding: 0 0 16px 0; border-bottom: 2px solid #0f2744;" }, [
        el("h2", { style: "margin: 0; color: #0f2744; font-size: 1.3rem;", text: "Créditos del Proyecto" }),
        el("button", {
          type: "button",
          class: "admin-icon-button",
          style: "position: absolute; right: 0; top: -6px;",
          text: "✕",
          onclick: () => modal.remove()
        })
      ]),
      el("div", { style: "padding: 24px 12px 16px 12px; line-height: 1.8; color: #1e293b; font-size: 1rem;" }, [
        el("div", { style: "background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 16px; text-align: left;" }, [
          el("div", { style: "margin-bottom: 12px;" }, [
            el("span", { style: "font-weight: 700; color: #0f2744; display: block; font-size: 0.88rem; text-transform: uppercase; letter-spacing: 0.5px;", text: "Supervisión del Proyecto:" }),
            el("span", { style: "font-size: 1.05rem; font-weight: 600;", text: "Yovana Luisa Sánchez Sánchez" })
          ]),
          el("div", { style: "margin-bottom: 12px;" }, [
            el("span", { style: "font-weight: 700; color: #0f2744; display: block; font-size: 0.88rem; text-transform: uppercase; letter-spacing: 0.5px;", text: "Desarrollador 1:" }),
            el("span", { style: "font-size: 1.05rem; font-weight: 600;", text: "Ing. Diego Garcia Pablo" })
          ]),
          el("div", {}, [
            el("span", { style: "font-weight: 700; color: #0f2744; display: block; font-size: 0.88rem; text-transform: uppercase; letter-spacing: 0.5px;", text: "Capataz:" }),
            el("span", { style: "font-size: 1.05rem; font-weight: 600;", text: "Ing. Daniel Cruz Zarate" })
          ])
        ]),
        el("p", { style: "font-size: 0.85rem; color: #64748b; margin: 0;", text: "Carrera de Ingeniería Informática — Sede Yacuiba\nUniversidad Autónoma Juan Misael Saracho" })
      ]),
      el("div", { style: "padding-top: 12px; border-top: 1px solid #e2e8f0;" }, [
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
