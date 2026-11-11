// Utilidades UI compartidas entre todas las paginas.

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      node.setAttribute(key, value);
    }
  }
  for (const child of [].concat(children)) {
    if (child) node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }
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
      ];
      const menu = el("details", { class: "admin-nav-menu" }, [
        el("summary", { text: "Gestion" }),
        el("div", { class: "admin-nav-dropdown" }, adminLinks.map(([entity, label]) =>
          el("a", { href: `/admin.html?entity=${entity}`, text: label })
        )),
      ]);
      nav.appendChild(menu);
    }
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
  return user;
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
  return user;
}
