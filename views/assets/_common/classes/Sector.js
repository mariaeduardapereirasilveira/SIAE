export default class Sector {
    #id;
    #name;
    #description;

    constructor(data = {}) {
        this.#id = data.id ?? null;
        this.name = data.name;
        this.description = data.description;
    }



get id() {
    return this.#id;
}

get name() {
    return this.#name;
}

get description() {
    return this.#description;
}

set name(value) {
    if (!value || value.trim() === "") {
        throw new Error("O nome do setor é obrigatório.");
    }

    this.#name = value.trim();
}

set description(value) {
    this.#description = value ? value.trim() : "";
}

toJSON() {
    return {
        id: this.#id,
        name: this.#name,
        description: this.#description
    };
}

    
}