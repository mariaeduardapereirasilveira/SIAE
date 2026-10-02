import HttpClientBase from "./HttpClientBase.js";

export default class SectorService extends HttpClientBase {

    async list() {
        return this.get("/sectors/list");
    }

    async find(id) {
        return this.get(`/sectors/id/${id}`);
    }

    async create(data) {
      console.log("Dados recebidos pelo SectorService:", data);
        return this.postForm("/sectors/", data);
    }

    async update(id, data) {
        return this.putForm(`/sectors/id/${id}`, data);
    }

    async remove(id) {
        return this.delete(`/sectors/id/${id}`);
    }
}