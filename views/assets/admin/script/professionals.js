import Users from "../../_common/classes/Users.js";

const API_BASE = "http://localhost/SIAE/api";
const users = new Users();
const modal = document.querySelector("#professionalModal");
const form = document.querySelector("#professionalForm");
const openModalButton = document.querySelector("#openProfessionalModal");
const closeModalButton = document.querySelector("#closeProfessionalModal");
const cancelModalButton = document.querySelector("#cancelProfessionalModal");
const photoInput = document.querySelector("#profPhoto");
const photoPreview = document.querySelector("#professionalPhotoPreview");
const photoPreviewImage = document.querySelector("#professionalPhotoPreviewImage");
const photoPlaceholder = document.querySelector("#professionalPhotoPlaceholder");
const choosePhotoButton = document.querySelector("#professionalChoosePhoto");
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
    form?.reset(); resetPhotoPreview();
    modal?.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    modal?.classList.remove("active");
    document.body.style.overflow = "";
    form?.reset(); resetPhotoPreview();
}

function resetPhotoPreview() {
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
    if (photoInput) photoInput.value = "";
    if (photoPreviewImage) { photoPreviewImage.removeAttribute("src"); photoPreviewImage.hidden = true; }
    if (photoPlaceholder) photoPlaceholder.hidden = false;
    photoPreview?.classList.add("is-empty");
}

function updatePhotoPreview(file) {
    // Preserva o arquivo selecionado no input para o FormData do cadastro.
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
    if (photoPreviewImage) { photoPreviewImage.removeAttribute("src"); photoPreviewImage.hidden = true; }
    if (photoPlaceholder) photoPlaceholder.hidden = false;
    photoPreview?.classList.add("is-empty");

    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
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
    photoPreview?.classList.remove("is-empty");
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
        const image = document.createElement("img"); image.src = url; image.alt = `Foto de ${name}`;
        image.addEventListener("error", () => {
            console.warn(`Não foi possível carregar a foto de ${name}:`, url);
            image.remove();
        }, { once: true }); avatar.appendChild(image);
    }
    return avatar;
}

function makeCell(text) {
    const cell = document.createElement("td"); cell.textContent = text || "—"; return cell;
}

function showProfessionalDetails(professional) {
    const dialog = document.getElementById("userDetailsDialog") || document.createElement("dialog");
    dialog.id = "userDetailsDialog"; dialog.className = "user-details-dialog"; dialog.replaceChildren();
    const header = document.createElement("div"); header.className = "user-details-header";
    const avatar = createAvatar(professional.name, professional.photoUrl || professional.photo); avatar.classList.add("user-details-avatar"); header.appendChild(avatar);
    const titleWrap = document.createElement("div");
    const title = document.createElement("h2"); title.textContent = professional.name || "Profissional";
    const subtitle = document.createElement("p"); subtitle.textContent = "Informações do profissional";
    titleWrap.append(title, subtitle); header.appendChild(titleWrap);
    const close = document.createElement("button"); close.type = "button"; close.className = "btn btn-ghost btn-sm"; close.textContent = "Fechar";
    close.addEventListener("click", () => dialog.close()); header.appendChild(close); dialog.appendChild(header);

    const fields = [
        ["E-mail", professional.email],
        ["Setor", professional.sectorName],
        ["Data de nascimento", professional.dateBirth],
        ["Status", Number(professional.active) === 1 ? "Ativo" : "Inativo"]
    ];
    const list = document.createElement("dl"); list.className = "user-details-fields";
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

async function loadProfessionals() {
    const tbody = document.querySelector("#professionalsTable");
    tbody.innerHTML = '<tr><td colspan="5" class="table-message">Carregando profissionais...</td></tr>';
    try {
        const response = await fetch(`${API_BASE}/users/list`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const result = await response.json();
        if (!response.ok || result.code !== 200) throw new Error(result.message || "Não foi possível carregar os profissionais.");
        const professionals = (result.data || []).filter(user => user.enrollment === "profissional");
        tbody.replaceChildren();
        if (!professionals.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="table-message">Nenhum profissional cadastrado ainda.</td></tr>';
            return;
        }
        professionals.forEach(professional => {
            const row = document.createElement("tr");
            const personCell = document.createElement("td");
            const person = document.createElement("div"); person.className = "table-person-cell";
            person.append(createAvatar(professional.name, professional.photoUrl || professional.photo));
            const name = document.createElement("span"); name.className = "table-person-name"; name.textContent = professional.name || "Profissional";
            person.appendChild(name); personCell.appendChild(person); row.appendChild(personCell);
            row.appendChild(makeCell(professional.sectorName));
            row.appendChild(makeCell(professional.email));
            const statusCell = document.createElement("td");
            const status = document.createElement("span"); const active = Number(professional.active) === 1;
            status.className = `badge ${active ? "badge-success" : "badge-neutral"}`; status.textContent = active ? "Ativo" : "Inativo";
            statusCell.appendChild(status); row.appendChild(statusCell);
            const actionCell = document.createElement("td");
            const detailsButton = document.createElement("button"); detailsButton.type = "button"; detailsButton.className = "btn btn-ghost btn-sm"; detailsButton.textContent = "Detalhes";
            detailsButton.addEventListener("click", () => showProfessionalDetails(professional)); actionCell.appendChild(detailsButton); row.appendChild(actionCell);
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Erro ao listar profissionais:", error);
        tbody.innerHTML = '<tr><td colspan="5" class="table-message">Não foi possível carregar os profissionais. Confira sua conexão e tente novamente.</td></tr>';
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
    if (!formData.get("name") || !formData.get("sector") || !formData.get("email") || !formData.get("dateBirth")) {
        alert("Preencha nome, setor, e-mail e data de nascimento."); return;
    }
    formData.set("enrollment", "profissional");
    try {
        const response = await users.register(formData);
        if (![200, 201].includes(Number(response?.code))) throw new Error(response?.message || "Não foi possível cadastrar o profissional.");
        alert("Profissional cadastrado com sucesso!");
        form.reset(); resetPhotoPreview(); closeModal(); await loadProfessionals();
    } catch (error) {
        console.error("Erro ao cadastrar profissional:", error);
        alert(error.message || "Erro ao cadastrar profissional.");
    }
});

if (checkAuth()) loadProfessionals();
