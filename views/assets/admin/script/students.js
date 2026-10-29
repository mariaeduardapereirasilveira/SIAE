import Users from "../../_common/classes/Users.js";

const API_BASE = "http://localhost/SIAE/api";
const users = new Users();
const modal = document.querySelector("#studentModal");
const form = document.querySelector("#studentForm");
const openModalButton = document.querySelector("#openStudentModal");
const closeModalButton = document.querySelector("#closeStudentModal");
const cancelModalButton = document.querySelector("#cancelStudentModal");
const photoInput = document.querySelector("#studentPhoto");
const photoPreview = document.querySelector("#studentPhotoPreview");
const photoPreviewImage = document.querySelector("#studentPhotoPreviewImage");
const photoPlaceholder = document.querySelector("#studentPhotoPlaceholder");
const choosePhotoButton = document.querySelector("#studentChoosePhoto");
let previewObjectUrl = null;

function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../public/login.html";
        return false;
    }
    users.setAuthToken(token);
    return true;
}

function openModal() {
    form?.reset();
    resetPhotoPreview();
    modal?.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    modal?.classList.remove("active");
    document.body.style.overflow = "";
    resetPhotoPreview();
    form?.reset();
}

function resetPhotoPreview() {
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
    if (photoInput) photoInput.value = "";
    photoPreviewImage?.removeAttribute("src");
    if (photoPreviewImage) photoPreviewImage.hidden = true;
    if (photoPlaceholder) photoPlaceholder.hidden = false;
    photoPreview?.classList.add("is-empty");
}

function updatePhotoPreview(file) {
    // Ao atualizar a prévia, NÃO limpar photoInput: o arquivo precisa continuar
    // selecionado para ser incluído em new FormData(form) no envio do cadastro.
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
    photoPreviewImage?.removeAttribute("src");
    if (photoPreviewImage) photoPreviewImage.hidden = true;
    if (photoPlaceholder) photoPlaceholder.hidden = false;
    photoPreview?.classList.add("is-empty");

    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
        alert("Escolha uma imagem JPG, PNG ou WEBP.");
        resetPhotoPreview();
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        alert("A foto deve ter no máximo 5 MB.");
        resetPhotoPreview();
        return;
    }

    previewObjectUrl = URL.createObjectURL(file);
    photoPreviewImage.src = previewObjectUrl;
    photoPreviewImage.hidden = false;
    photoPlaceholder.hidden = true;
    photoPreview.classList.remove("is-empty");
}

function resolvePhotoUrl(photo) {
    if (!photo || typeof photo !== "string") return "";

    const normalized = photo.trim().replace(/\\/g, "/");
    let path = normalized;
    if (/^https?:\/\//i.test(normalized)) {
        try { path = new URL(normalized).pathname; } catch (_) { return ""; }
    }
    path = path.split(/[?#]/, 1)[0];

    // Reconhece somente arquivos com nomes aleatórios gerados pelo endpoint de upload.
    // O prefixo antigo da URL não interfere: a URL final sempre aponta para a raiz do SIAE.
    const match = path.match(/(?:^|\/)uploads\/users\/([a-f0-9]{32}\.(?:jpg|png|webp))$/i)
        || path.match(/^([a-f0-9]{32}\.(?:jpg|png|webp))$/i);
    if (!match) return "";

    const siteBase = new URL("../", `${API_BASE}/`);
    return new URL(`uploads/users/${match[1]}`, siteBase).href;
}

function initials(name) {
    return String(name || "?").trim().split(/\s+/).slice(0, 2).map(part => part[0] || "").join("").toUpperCase() || "?";
}

function createAvatar(name, photo) {
    const avatar = document.createElement("div");
    avatar.className = "table-person-avatar";
    avatar.textContent = initials(name);
    const url = resolvePhotoUrl(photo);
    if (url) {
        const image = document.createElement("img");
        image.src = url;
        image.alt = `Foto de ${name}`;
        image.addEventListener("error", () => {
            console.warn(`Não foi possível carregar a foto de ${name}:`, url);
            image.remove();
        }, { once: true });
        avatar.appendChild(image);
    }
    return avatar;
}

function makeCell(text, className = "") {
    const cell = document.createElement("td");
    if (className) cell.className = className;
    cell.textContent = text || "—";
    return cell;
}

function showStudentDetails(student) {
    const dialog = document.getElementById("userDetailsDialog") || document.createElement("dialog");
    dialog.id = "userDetailsDialog";
    dialog.className = "user-details-dialog";
    dialog.replaceChildren();

    const header = document.createElement("div");
    header.className = "user-details-header";
    const avatar = createAvatar(student.name, student.photoUrl || student.photo);
    avatar.classList.add("user-details-avatar");
    header.appendChild(avatar);

    const titleWrap = document.createElement("div");
    const title = document.createElement("h2");
    title.textContent = student.name || "Aluno";
    const subtitle = document.createElement("p");
    subtitle.textContent = "Informações do aluno";
    titleWrap.append(title, subtitle);
    header.appendChild(titleWrap);

    const close = document.createElement("button");
    close.type = "button";
    close.className = "btn btn-ghost btn-sm";
    close.textContent = "Fechar";
    close.addEventListener("click", () => dialog.close());
    header.appendChild(close);
    dialog.appendChild(header);

    const fields = [
        ["E-mail", student.email],
        ["Turma", student.className],
        ["Data de nascimento", student.dateBirth],
        ["Status", Number(student.active) === 1 ? "Ativo" : "Inativo"]
    ];
    const list = document.createElement("dl");
    list.className = "user-details-fields";
    fields.forEach(([label, value]) => {
        const item = document.createElement("div");
        const term = document.createElement("dt"); term.textContent = label;
        const description = document.createElement("dd"); description.textContent = value || "—";
        item.append(term, description); list.appendChild(item);
    });
    dialog.appendChild(list);
    if (!dialog.isConnected) document.body.appendChild(dialog);
    dialog.showModal();
}

async function loadClasses() {
    const select = document.querySelector("#studentClass");
    try {
        const response = await fetch(`${API_BASE}/classes/list`);
        const result = await response.json();
        if (!response.ok || result.code !== 200) throw new Error(result.message || "Erro ao carregar turmas.");
        select.innerHTML = '<option value="">Selecione uma turma</option>';
        (result.data || []).forEach((turma) => {
            const option = document.createElement("option");
            option.value = turma.id;
            option.textContent = turma.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar turmas:", error);
        alert("Não foi possível carregar as turmas.");
    }
}

async function loadStudents() {
    const tbody = document.querySelector("#studentsTable");
    tbody.innerHTML = '<tr><td colspan="5" class="table-message">Carregando alunos...</td></tr>';
    try {
        const response = await fetch(`${API_BASE}/users/list`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const result = await response.json();
        if (!response.ok || result.code !== 200) throw new Error(result.message || "Não foi possível carregar os alunos.");

        const students = (result.data || []).filter(user => user.enrollment === "estudante");
        tbody.replaceChildren();
        if (!students.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="table-message">Nenhum aluno cadastrado ainda.</td></tr>';
            return;
        }

        students.forEach(student => {
            const row = document.createElement("tr");
            const personCell = document.createElement("td");
            const person = document.createElement("div"); person.className = "table-person-cell";
            person.append(createAvatar(student.name, student.photoUrl || student.photo));
            const name = document.createElement("span"); name.className = "table-person-name"; name.textContent = student.name || "Aluno";
            person.appendChild(name); personCell.appendChild(person); row.appendChild(personCell);
            row.appendChild(makeCell(student.email));
            row.appendChild(makeCell(student.className));
            const statusCell = document.createElement("td");
            const status = document.createElement("span");
            const active = Number(student.active) === 1;
            status.className = `badge ${active ? "badge-success" : "badge-neutral"}`;
            status.textContent = active ? "Ativo" : "Inativo";
            statusCell.appendChild(status); row.appendChild(statusCell);
            const actionCell = document.createElement("td");
            const detailsButton = document.createElement("button");
            detailsButton.type = "button"; detailsButton.className = "btn btn-ghost btn-sm"; detailsButton.textContent = "Detalhes";
            detailsButton.addEventListener("click", () => showStudentDetails(student));
            actionCell.appendChild(detailsButton); row.appendChild(actionCell);
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Erro ao listar alunos:", error);
        tbody.innerHTML = '<tr><td colspan="5" class="table-message">Não foi possível carregar os alunos. Confira sua conexão e tente novamente.</td></tr>';
    }
}

openModalButton?.addEventListener("click", openModal);
closeModalButton?.addEventListener("click", closeModal);
cancelModalButton?.addEventListener("click", closeModal);
choosePhotoButton?.addEventListener("click", () => photoInput?.click());
photoInput?.addEventListener("change", () => updatePhotoPreview(photoInput.files?.[0]));
modal?.addEventListener("click", event => { if (event.target === modal) closeModal(); });

document.addEventListener("click", event => {
    const dialog = document.getElementById("userDetailsDialog");
    if (dialog && event.target === dialog) dialog.close();
});

form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    if (!formData.get("name") || !formData.get("class_id") || !formData.get("email") || !formData.get("dateBirth")) {
        alert("Preencha nome, turma, e-mail e data de nascimento.");
        return;
    }
    formData.set("enrollment", "estudante");
    try {
        const response = await users.register(formData);
        if (![200, 201].includes(Number(response?.code))) throw new Error(response?.message || "Não foi possível cadastrar o aluno.");
        alert("Aluno cadastrado com sucesso!");
        form.reset(); resetPhotoPreview(); closeModal();
        await loadStudents();
    } catch (error) {
        console.error("Erro ao cadastrar aluno:", error);
        alert(error.message || "Erro ao cadastrar aluno. Confira o console para mais detalhes.");
    }
});

if (checkAuth()) {
    loadClasses();
    loadStudents();
}
