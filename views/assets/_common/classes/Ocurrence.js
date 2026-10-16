export default class Occurrence {

  #id;

  #servicesId;

  #sectorsId;

  #userId;

  #studentId;

  #title;

  #description;

  #status;

  #secrecyLevel;

  #class;

  constructor(data = {}) {

    this.#id = data.id ?? null;

    this.servicesId = data.servicesId ?? data.services_id;

    this.sectorsId = data.sectorsId ?? data.sectors_id;

    this.userId = data.userId ?? data.user_id;

    this.studentId = data.studentId ?? data.student_id;

    this.title = data.title;

    this.description = data.description;

    this.status = data.status;

    this.secrecyLevel =

      data.secrecyLevel ?? data.secrecy_level;

    this.class = data.class;

  }

  get id() {

    return this.#id;

  }

  get servicesId() {

    return this.#servicesId;

  }

  get sectorsId() {

    return this.#sectorsId;

  }

  get userId() {

    return this.#userId;

  }

  get studentId() {

    return this.#studentId;

  }

  get title() {

    return this.#title;

  }

  get description() {

    return this.#description;

  }

  get status() {

    return this.#status;

  }

  get secrecyLevel() {

    return this.#secrecyLevel;

  }

  get class() {

    return this.#class;

  }



  set servicesId(value) {

    if (!value) {

      throw new Error("O serviço é obrigatório.");

    }

    this.#servicesId = Number(value);

  }

  set sectorsId(value) {

    if (!value) {

      throw new Error("O setor é obrigatório.");

    }

    this.#sectorsId = Number(value);

  }

  set userId(value) {

    if (!value) {

      throw new Error("O usuário é obrigatório.");

    }

    this.#userId = Number(value);

  }

  set studentId(value) {

    if (!value) {

      throw new Error("O aluno é obrigatório.");

    }

    this.#studentId = Number(value);

  }

  set title(value) {

    if (!value || value.trim() === "") {

      throw new Error("O título da ocorrência é obrigatório.");

    }

     this.#title = value.trim();

  }

  set description(value) {

    this.#description = value ? value.trim() : "";

  }

  set status(value) {

    const statuses = [

      "Ativo",

      "Encerrado",

      "Interrompido"

    ];

    if (!statuses.includes(value)) {

      throw new Error("Status da ocorrência inválido.");

    }

    this.#status = value;

  }

  set secrecyLevel(value) {

    if (!value || value.trim() === "") {

      throw new Error("O nível de sigilo é obrigatório.");

    }

    this.#secrecyLevel = value.trim();

  }

  set class(value) {

    this.#class = value ? value.trim() : "";

  }



  toJSON() {

    return {

      id: this.#id,

      services_id: this.#servicesId,

      sectors_id: this.#sectorsId,

      user_id: this.#userId,

      student_id: this.#studentId,

      title: this.#title,

      description: this.#description,

      status: this.#status,

      secrecy_level: this.#secrecyLevel,

      class: this.#class

    };

  }

}