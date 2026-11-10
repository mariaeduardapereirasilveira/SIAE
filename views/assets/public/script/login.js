import Users from "../../_common/classes/Users.js";

const users = new Users();
const form = document.querySelector("#loginForm");
const professionalTab = document.querySelector("#tabProfessional");
const adminTab = document.querySelector("#tabAdmin");
const passwordInput = document.querySelector("#passwordInput");
const passwordToggle = document.querySelector("#togglePassword");
const feedback = document.querySelector("#loginFeedback");
const submitButton = form?.querySelector('button[type="submit"]');
let selectedRole = "admin";

function selectRole(role) {
  selectedRole = role;
  const isAdmin = role === "admin";
  adminTab?.classList.toggle("active", isAdmin);
  professionalTab?.classList.toggle("active", !isAdmin);
  adminTab?.setAttribute("aria-pressed", String(isAdmin));
  professionalTab?.setAttribute("aria-pressed", String(!isAdmin));
  if (feedback) feedback.textContent = "";
}

professionalTab?.addEventListener("click", () => selectRole("professional"));
adminTab?.addEventListener("click", () => selectRole("admin"));

passwordToggle?.addEventListener("click", () => {
  if (!passwordInput) return;
  const visible = passwordInput.type === "password";
  passwordInput.type = visible ? "text" : "password";
  passwordToggle.setAttribute("aria-label", visible ? "Ocultar senha" : "Mostrar senha");
});

form?.addEventListener("submit", async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  if (feedback) feedback.textContent = "Verificando acesso...";
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Entrando...";
  }

  try {
    const response = selectedRole === "admin"
      ? await users.loginAdminFromForm(form)
      : await users.loginFromForm(form);

    if (response?.code !== 200 || !response?.data?.token) {
      throw new Error(response?.message || "Não foi possível validar suas credenciais.");
    }

    const user = response.data;
    localStorage.setItem("token", user.token);
    localStorage.setItem("enrollment", user.enrollment || (selectedRole === "admin" ? "administrador" : "profissional"));
    localStorage.setItem("userId", user.id || "");
    localStorage.setItem("userName", user.name || "");
    localStorage.setItem("userPhoto", user.photoUrl || user.photo || "");
    window.location.href = "../app/dashboard.html";
  } catch (error) {
    console.error("Erro ao realizar login:", error);
    if (feedback) feedback.textContent = error.message || "Ocorreu um erro. Tente novamente.";
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Entrar";
    }
  }
});

selectRole("admin");
