document.addEventListener("DOMContentLoaded", () => {
  const roleButtons = document.querySelectorAll(".role-toggle button");
  const roleInput = document.getElementById("role-input");

  roleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      roleButtons.forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");
      roleInput.value = button.dataset.role;
    });
  });

  document.getElementById("login-form")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const role = roleInput.value || "professional";

    localStorage.setItem("siae_role", role);

    if (role === "admin") {
      window.location.href = "../admin/admin.html";
    } else {
      window.location.href = "../app/dashboard.html";
    }
  });
});
