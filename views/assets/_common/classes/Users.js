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

    async update(data) {
        return this.put("/users/update", data);
    }

    async updateAdmin(data) {
        return this.put("/users/update-admin", data);
    }
}


