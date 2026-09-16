import Users from "../../_common/classes/Users.js";

const users = new Users();


// ==============================
// ELEMENTOS
// ==============================

const modal = document.querySelector("#professionalModal");
const form = document.querySelector("#professionalForm");

const openModalButton = document.querySelector("#openProfessionalModal");
const closeModalButton = document.querySelector("#closeProfessionalModal");
const cancelModalButton = document.querySelector("#cancelProfessionalModal");

const logoutButton = document.querySelector("#logoutButton");


// ==============================
// AUTENTICAÇÃO
// ==============================

function checkAuth() {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "../public/login.html";
        return false;
    }

    return true;
}


// ==============================
// MODAL
// ==============================

function openModal() {

    modal.classList.add("active");

    document.body.style.overflow = "hidden";
}


function closeModal() {

    modal.classList.remove("active");

    document.body.style.overflow = "";
}


// ==============================
// EVENTOS DO MODAL
// ==============================

openModalButton.addEventListener("click", () => {
    openModal();
});


closeModalButton.addEventListener("click", () => {
    closeModal();
});


cancelModalButton.addEventListener("click", () => {
    closeModal();
});


// ==============================
// CADASTRO DO PROFISSIONAL
// ==============================

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const formData = new FormData(form);

    const data = {
        nome: formData.get("name"),
        funcao: formData.get("function"),
        setor: formData.get("sector"),
        email: formData.get("email"),
        telefone: formData.get("phone"),
        registro: formData.get("register")
    };

    console.log("Enviando:", data);


    try {

        const response = await users.register(data);

        console.log("Resposta da API:", response);

        alert("Profissional cadastrado com sucesso!");

        form.reset();

        closeModal();

    } catch (error) {

        console.error("Erro ao cadastrar profissional:", error);

        alert("Erro ao cadastrar profissional.");

    }

});


// ==============================
// LOGOUT
// ==============================

// logoutButton.addEventListener("click", () => {

//     localStorage.clear();

//     window.location.href = "../public/login.html";

// });


// ==============================
// INICIALIZAÇÃO
// ==============================

checkAuth();
