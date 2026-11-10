(() => {
  "use strict";
  const logoutButton = document.querySelector("#logoutButton");
  logoutButton?.addEventListener("click", () => {
    if (window.confirm("Deseja realmente sair da sua conta?")) {
      localStorage.clear();
      window.location.href = "../public/login.html";
    }
  });
})();