// ============================================================
// SIAE â€” Script global compartilhado
// ============================================================

// ---------- DetecÃ§Ã£o de perfil (admin / profissional) ----------
// Lemos o perfil salvo no login e aplicamos no <body> para que
// o CSS e o JS das pÃ¡ginas possam reagir ao tipo de usuÃ¡rio.
(function applyUserRole() {
  const role = localStorage.getItem("siae_role") || "professional";
  const name = localStorage.getItem("siae_name") || (role === "admin" ? "AntÃ´nio Diniz" : "Joana Carvalho");
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  document.body.dataset.role = role;

  // Atualiza nome ao lado do avatar no topbar
  document.querySelectorAll("[data-user-name]").forEach((el) => (el.textContent = name));
  document.querySelectorAll("[data-user-initials]").forEach((el) => (el.textContent = initials));

  // Mostra / esconde elementos conforme o perfil
  document.querySelectorAll("[data-hide-for-admin]").forEach((el) => {
    if (role === "admin") el.style.display = "none";
  });
  document.querySelectorAll("[data-show-for-admin]").forEach((el) => {
    if (role !== "admin") el.style.display = "none";
  });
  document.querySelectorAll("[data-hide-for-professional]").forEach((el) => {
    if (role === "professional") el.style.display = "none";
  });
})();

// ---------- Modais ----------
document.querySelectorAll("[data-modal-open]").forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("data-modal-open");
    const modal = document.querySelector("#" + targetId);
    if (modal) modal.classList.add("is-open");
  });
});

document.querySelectorAll("[data-modal-close]").forEach((button) => {
  button.addEventListener("click", () => {
    const modal = button.closest(".modal");
    if (modal) modal.classList.remove("is-open");
  });
});

document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.classList.remove("is-open");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.querySelectorAll(".modal.is-open").forEach((modal) => modal.classList.remove("is-open"));
  }
});

// ---------- Menu lateral mobile ----------
const menuToggle = document.querySelector("[data-menu-toggle]");
const sidebar = document.querySelector(".sidebar");
if (menuToggle && sidebar) {
  menuToggle.addEventListener("click", () => sidebar.classList.toggle("is-open"));
}

// ---------- Logout ----------
document.querySelectorAll("[data-logout]").forEach((link) => {
  link.addEventListener("click", () => {
    localStorage.clear();
  });
});
