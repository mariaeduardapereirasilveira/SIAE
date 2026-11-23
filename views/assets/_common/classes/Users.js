import HttpClientBase from "./HttpClientBase.js";

export default class Users extends HttpClientBase {
 

    async login(email, password) {
        return this.postForm("/users/login", {
            email,
            password
        });
    }

    async loginFromForm(form) {
        const formData = new FormData(form);

        return this.login(
            formData.get("email"),
            formData.get("password")
        );
    }

    async loginAdmin(email, password) {
        return this.postForm("/users/login/admin", {
            email,
            password
        });
    }

    async loginAdminFromForm(form) {
        const formData = new FormData(form);

        return this.loginAdmin(
            formData.get("email"),
            formData.get("password")
        );
    }

    async register(data) {
        return this.postForm("/users/register", data);
    }

    
async update(id, data) {
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        throw new Error("ID do usuário inválido.");
    }

    return this.putForm(
        `/users/id/${encodeURIComponent(id)}`,
        data
    );
}


    async updateAdmin(data) {
        return this.putForm("/users/update-admin", data);
    }
    
    
    
    /**
     * Atualiza a fotografia de um estudante.
    *
    * @param {number} studentId - ID do estudante que será editado.
    * @param {FormData} data - FormData contendo a imagem no campo "photo".
    * @returns {Promise<object>} Resposta da API.
    */
   async uploadStudentPhoto(studentId, data) {
       if (!Number.isInteger(Number(studentId)) || Number(studentId) <= 0) {
           throw new Error("ID do estudante inválido.");
        }
        
        return this.postForm(
            `/users/id/${encodeURIComponent(studentId)}/photo`,
            data
        );
    }



/**
 * Desativa um estudante ou profissional.
 * O registro permanece no banco (soft delete).
 *
 * @param {number} id - ID do usuário.
 */
async deactivate(id) {
    return this.delete(
        `/users/id/${encodeURIComponent(id)}`
    );
}

/**
 * Reativa um estudante ou profissional.
 *
 * @param {number} id - ID do usuário.
 */
async reactivate(id) {
    return this.putForm(
        `/users/id/${encodeURIComponent(id)}/reactivate`,
        {}
    );
}




}
