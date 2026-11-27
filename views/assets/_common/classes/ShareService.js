
import HttpClientBase from "./HttpClientBase.js";

/**
 * SIAE — Serviço de Compartilhamentos
 *
 * Responsável pela comunicação entre o
 * frontend e a API de compartilhamentos.
 */
export default class ShareService extends HttpClientBase {

    // Lista os compartilhamentos disponíveis.
    async list() {
        return this.get("/shares/list");
    }

    // Busca um compartilhamento pelo ID.
    async find(id) {
        return this.get(`/shares/id/${id}`);
    }

    // Cria um compartilhamento de ocorrência.
    async create(data) {
        return this.postForm("/shares/", data);
    }

    // Desativa um compartilhamento.
    async remove(id) {
        return this.delete(`/shares/id/${id}`);
    }

    // Lista compartilhamentos de um usuário.
    async listByUser(userId) {
        return this.get(`/shares/id/user/${userId}`);
    }

    // Lista compartilhamentos de uma ocorrência.
    async listByOccurrence(occurrenceId) {
        return this.get(
            `/shares/id/occurrence/${occurrenceId}`
        );
    }
}
