
export default class Service {
    #id;
    #userId;
    #studentsId;
    #observations;
    #createdAt;
    #updatedAt;
    #active;

    constructor(data = {}) {
        this.#id = data.id ?? null;
        this.userId = data.userId ?? data.user_id;
        this.studentsId = data.studentsId ?? data.students_id ?? data.student_id;
        this.observations = data.observations;
        this.#createdAt = data.createdAt ?? data.created_at ?? null;
        this.#updatedAt = data.updatedAt ?? data.updated_at ?? null;
        this.active = data.active;
    }

    get id() {
        return this.#id;
    }

    get userId() {
        return this.#userId;
    }

    get studentsId() {
        return this.#studentsId;
    }

    get observations() {
        return this.#observations;
    }

    get createdAt() {
        return this.#createdAt;
    }

    get updatedAt() {
        return this.#updatedAt;
    }

    get active() {
        return this.#active;
    }

    set userId(value) {
        this.#userId = value == null || value === "" ? null : Number(value);
    }

    set studentsId(value) {
        this.#studentsId = value == null || value === "" ? null : Number(value);
    }

    set observations(value) {
        this.#observations = value == null ? "" : String(value).trim();
    }

    set active(value) {
        this.#active = value == null ? 1 : Number(value);
    }

    toJSON() {
        return {
            id: this.#id,
            user_id: this.#userId,
            students_id: this.#studentsId,
            observations: this.#observations,
            created_at: this.#createdAt,
            updated_at: this.#updatedAt,
            active: this.#active
        };
    }
}
