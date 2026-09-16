import Users from "../../_common/classes/Users";
const users = new Users();
 const form= document.querySelector("#professionalForm");

 form.addEventListener("submit", async (event)=>{
    event.preventDefault();

    const formData= new FormData(form);

    const data = {
        nome: formData.get("name"),
        funcao: formData.get("function"),
        setor: formData.get("sector"),
        email: formData.get("email"),
        telefone: formData.get("phone"),
        registro: formData.get("register")
    };


    try{
        const response= await users.register(data);

 console.log("Profissional cadastrado:", response);

            window.location.href = "dashboard.html";


    }catch{
         console.error("Erro ao cadastrar profissional:", error);
    }
    
 });