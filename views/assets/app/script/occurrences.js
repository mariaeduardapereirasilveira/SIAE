
import ServiceService from "../../_common/classes/ServiceService.js";

const serviceService = new ServiceService();

async function testarServicosDoUsuario() {
    try {
        const token = localStorage.getItem("token");
        const userId = Number(localStorage.getItem("userId"));

        if (token) {
            serviceService.setAuthToken(token);
        }

        const resposta = await serviceService.list();

        console.log("Resposta da API:", resposta);
       console.log("Dados dos serviços:", resposta.data);

        const servicos = Array.isArray(resposta.data)
            ? resposta.data
            : [];

        const servicosDoUsuario = servicos.filter(servico =>
            Number(servico.userId ?? servico.user_id) === userId
        );

        console.log("Serviços do usuário:", servicosDoUsuario);
    } catch (erro) {
        console.error("Erro ao consultar serviços:", erro);
    }
}

testarServicosDoUsuario();
