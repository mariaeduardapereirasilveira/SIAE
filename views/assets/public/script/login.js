import Toast from "../../_common/prototypes/Toast.js";
import FormController from "../../_common/prototypes/FormControllerPrototype.js";
import Users from "../../_common/classes/Users.js";

const users = new Users();
const form = document.querySelector("#loginForm");
const professionalTab = document.querySelector("#tabProfessional");
const adminTab = document.querySelector("#tabAdmin");
const passwordInput = document.querySelector("#passwordInput");
const passwordToggle = document.querySelector("#togglePassword");
const feedback = document.querySelector("#loginFeedback");
const submitButton = form?.querySelector('button[type="submit"]');
let selectedRole = null;

if (form) {
    FormController.inicializar(form);
}

function selectRole(role) {
  if (role !== "admin" && role !== "professional" && role !== null) {
        return;
    }

    selectedRole = role;

    const isAdmin = role === "admin";
    const isProfessional = role === "professional";

    adminTab?.classList.toggle("active", isAdmin);
    professionalTab?.classList.toggle("active", isProfessional);

    adminTab?.setAttribute("aria-pressed", String(isAdmin));
    professionalTab?.setAttribute("aria-pressed", String(isProfessional));

    if (submitButton) {
        submitButton.textContent = isAdmin
            ? "Entrar como administrador"
            : isProfessional
                ? "Entrar como profissional"
                : "Selecione seu perfil";
    }

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

form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    if (!selectedRole) {
        Toast.mostrar(
            "Selecione um perfil para continuar.",
            "warning"
        );
        return;
    }

    const dados = FormController.obterDados();

    const email = String(dados.email || "").trim();
    const password = String(dados.password || "");

    if (!email || !password) {
        Toast.mostrar(
            "Preencha o e-mail e a senha.",
            "warning"
        );
        return;
    }

    const roleAtSubmit = selectedRole;

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Entrando...";
    }

    try {
        const response = roleAtSubmit === "admin"
            ? await users.loginAdmin(email, password)
            : await users.login(email, password);

        if (response?.code !== 200 || !response?.data?.token) {
            throw new Error(
                response?.message || "Não foi possível validar suas credenciais."
            );
        }

        const user = response.data;

        const expectedEnrollment = roleAtSubmit === "admin"
            ? "administrador"
            : "profissional";

        if (
            user.enrollment &&
            user.enrollment !== expectedEnrollment
        ) {
            throw new Error(
                "O perfil retornado não corresponde ao selecionado."
            );
        }

        localStorage.setItem("token", user.token);
        localStorage.setItem("enrollment", user.enrollment || expectedEnrollment);
        localStorage.setItem("userId", user.id || "");
        localStorage.setItem("userName", user.name || "");
        localStorage.setItem("userPhoto", user.photoUrl || user.photo || "");

        FormController.limpar();

        Toast.mostrar(
            "Login realizado com sucesso!",
            "success"
        );

        const destination = roleAtSubmit === "admin"
            ? "../admin/admin.html"
            : "../app/dashboard.html";

        setTimeout(() => {
            window.location.href = destination;
        }, 700);

    } catch (error) {
        console.error("Erro ao realizar login:", error);

        Toast.mostrar(
            error.message || "Ocorreu um erro ao realizar o login.",
            "error"
        );

    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = selectedRole === "admin"
                ? "Entrar como administrador"
                : selectedRole === "professional"
                    ? "Entrar como profissional"
                    : "Selecione seu perfil";
        }
    }
});
selectRole(null);
