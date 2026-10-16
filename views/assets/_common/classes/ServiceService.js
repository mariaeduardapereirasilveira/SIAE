
import HttpClientBase from "./HttpClientBase.js";

export default class ServiceService extends HttpClientBase {
    async list() {
        return this.get("/services/list");
    }

    async find(id) {
        return this.get(`/services/id/${id}`);
    }

    async create(data) {
        return this.post("/services/", data);
    }

    async update(id, data) {
        return this.put(`/services/id/${id}`, data);
    }

    async remove(id) {
        return this.delete(`/services/id/${id}`);
    }
}
