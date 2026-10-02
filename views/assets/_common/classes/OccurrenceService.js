import HttpClientBase from "./HttpClientBase.js";

export default class OccurrenceService extends HttpClientBase {

    async list() {
        return this.get("/occurrences/list");
    }

    async find(id) {
        return this.get(`/occurrences/id/${id}`);
    }

    async create(data) {
        return this.postForm("/occurrences/", data);
    }

    async update(id, data) {
        return this.putForm(`/occurrences/id/${id}`, data);
    }

    async remove(id) {
        return this.delete(`/occurrences/id/${id}`);
    }

}