import Users from "../../_common/classes/Users";

console.log("Script de cadastro carregado.");   

const users = new Users();

const token = localStorage.getItem("token");

console.log("TOKEN RECUPERADO:", token);

//if (!token) {
//    console.error("Token não encontrado.");
//    window.location.href = "../login/login.html";
//} else {
//    console.log("Token encontrado aqui:", token);
//    users.setAuthToken(token);
//}

const form = document.querySelector("#professionalForm");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    console.log("Token encontrado aqui:", token);
    users.setAuthToken(token);

    const formData = new FormData(form);

    const data = {
        nome: formData.get("name"),
        funcao: formData.get("function"),
        setor: formData.get("sector"),
        email: formData.get("email"),
        telefone: formData.get("phone"),
        registro: formData.get("register")
    };

    try {
        const response = await users.register(data);

        console.log("Profissional cadastrado:", response);

        //window.location.href = "dashboard.html";

    } catch (error) {
        console.error("Erro ao cadastrar profissional:", error);
    }
});
