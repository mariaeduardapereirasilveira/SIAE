(() => {
  "use strict";
  const toggle = document.querySelector("[data-menu-toggle]");
  const sidebar = document.querySelector(".sidebar");
  if (!toggle || !sidebar) return;

  const close = () => {
    sidebar.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = sidebar.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", event => {
    if (window.innerWidth > 820 || !sidebar.classList.contains("is-open")) return;
    if (!sidebar.contains(event.target) && !toggle.contains(event.target)) close();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) close();
  });
})();