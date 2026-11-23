import Toast from "../../_common/prototypes/Toast.js";
import ConfirmModal from "../../_common/components/ConfirmModal.js";

function resolveSiaeApiBase() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const projectPrefix = parts.length ? `/${parts[0]}` : "";
    return `${window.location.origin}${projectPrefix}/api`;
}

import Users from "../../_common/classes/Users.js";


const API_BASE = resolveSiaeApiBase();
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
        Toast.mostrar(
            "Escolha uma imagem JPG, PNG ou WEBP.",
            "warning"
        );
        resetPhotoPreview();
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        Toast.mostrar(
            "A foto deve ter no máximo 5 MB.",
            "warning"
        );
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
    const url = resolvePhotoUrl(photo);
    avatar.className = `table-person-avatar ${url ? "has-photo" : "is-placeholder"}`;
    avatar.textContent = initials(name);
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



async function loadProfessionalSectors() {
    const select = document.querySelector("#profSector");
    if (!select) return;
    try {
        const response = await fetch(`${API_BASE}/sectors/list`, {
            headers: { Accept: "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const payload = await response.json();
        if (!response.ok || payload?.code !== 200 || !Array.isArray(payload.data)) {
            throw new Error(payload?.message || "Não foi possível carregar os setores.");
        }
        const selected = select.value;
        select.replaceChildren();
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "Selecione";
        select.appendChild(placeholder);
        payload.data.forEach(sector => {
            const option = document.createElement("option");
            option.value = sector.name;
            option.textContent = sector.name;
            select.appendChild(option);
        });
        if (payload.data.some(sector => sector.name === selected)) select.value = selected;
    } catch (error) {
        console.warn("Não foi possível atualizar as opções de setor do formulário:", error);
    }
}





/**
 * Desativa ou reativa um profissional.
 *
 * Reutiliza os métodos e a modal de confirmação
 * que já utilizamos na gestão dos estudantes.
 */
async function changeProfessionalStatus(professional) {

    const isActive = Number(professional.active) === 1;

    // Define as informações de acordo com a situação atual.
    const action = isActive ? "desativar" : "reativar";

    const confirmed = await ConfirmModal.confirmar({
        titulo: isActive
            ? "Desativar profissional?"
            : "Reativar profissional?",

        mensagem: isActive
            ? `Deseja desativar ${professional.name}? O cadastro será preservado e poderá ser reativado posteriormente.`
            : `Deseja reativar ${professional.name}? O cadastro voltará a ficar ativo.`,

        textoConfirmar: isActive
            ? "Desativar"
            : "Reativar",

        tipo: isActive ? "danger" : "positive"
    });

    // O administrador cancelou a operação.
    if (!confirmed) return;

    try {

        // Reutiliza os métodos existentes da classe Users.
        const result = isActive
            ? await users.deactivate(professional.id)
            : await users.reactivate(professional.id);

        if (Number(result?.code) !== 200) {
            throw new Error(
                result?.message ||
                `Não foi possível ${action} o profissional.`
            );
        }

        Toast.mostrar(
            isActive
                ? "Profissional desativado com sucesso!"
                : "Profissional reativado com sucesso!",
            "success"
        );

        // Atualiza a listagem e os três indicadores.
        await loadProfessionals();

    } catch (error) {

        console.error(
            `Erro ao ${action} profissional:`,
            error
        );

        Toast.mostrar(
            error.message ||
            `Não foi possível ${action} o profissional.`,
            "error"
        );
    }
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


        // Obtém todos os profissionais retornados pela API.
        const allProfessionals = (result.data || []).filter(
            user => user.enrollment === "profissional"
        );

        // Calcula as quantidades.
        const total = allProfessionals.length;

        const activeCount = allProfessionals.filter(
            professional => Number(professional.active) === 1
        ).length;

        const inactiveCount = total - activeCount;

        // Atualiza os indicadores na interface.
        document.querySelector("#professionalsTotal").textContent =
            total;

        document.querySelector("#professionalsActive").textContent =
            activeCount;

        document.querySelector("#professionalsInactive").textContent =
            inactiveCount;


        const professionals = (result.data || []).filter(user => user.enrollment === "profissional");


        // ==========================================
        // FILTRO DE PROFISSIONAIS ATIVOS E INATIVOS
        // ==========================================

        // Identifica qual página está aberta.
        const isInactivePage =
            window.location.pathname.split("/").pop() ===
            "professionals-inactive.html";

        // Filtra os registros conforme a página atual.
        const visibleProfessionals = professionals.filter(professional => {

            const isActive = Number(professional.active) === 1;

            // Página de desativados: mostra apenas inativos.
            if (isInactivePage) {
                return !isActive;
            }

            // Página principal: mostra apenas ativos.
            return isActive;
        });


        tbody.replaceChildren();

        if (!visibleProfessionals.length) {

            const mensagem = isInactivePage
                ? "Nenhum profissional desativado."
                : "Nenhum profissional ativo cadastrado.";

            tbody.innerHTML = `
        <tr>
            <td colspan="5" class="table-message">
                ${mensagem}
            </td>
        </tr>
    `;

            return;
        }

        visibleProfessionals.forEach(professional => {
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

            detailsButton.addEventListener("click", () => {

                // Abre a página de detalhes passando
                // o ID do profissional selecionado.
                window.location.href =
                    `professional-details.html?id=${encodeURIComponent(professional.id)}`;

            });

// ==========================================
// BOTÃO DESATIVAR / REATIVAR
// ==========================================

// Identifica a ação disponível para este profissional.
const statusButton = document.createElement("button");

statusButton.type = "button";
statusButton.className = "btn btn-ghost btn-sm";

statusButton.textContent = active
    ? "Desativar"
    : "Reativar";

// Ao clicar, abre o ConfirmModal e executa a ação.
statusButton.addEventListener("click", () => {
    changeProfessionalStatus(professional);
});

// Organiza os dois botões lado a lado.
const actionsWrapper = document.createElement("div");

actionsWrapper.className = "professional-row-actions";

actionsWrapper.appendChild(detailsButton);
actionsWrapper.appendChild(statusButton);

// Insere as ações na última coluna da tabela.
actionCell.appendChild(actionsWrapper);
row.appendChild(actionCell);

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
        Toast.mostrar(
            "Preencha os campos obrigatórios do cadastro.",
            "warning"
        ); return;
    }
    formData.set("enrollment", "profissional");
    try {
        const response = await users.register(formData);
        if (![200, 201].includes(Number(response?.code))) throw new Error(response?.message || "Não foi possível cadastrar o profissional.");
        Toast.mostrar(
            "Profissional cadastrado com sucesso!",
            "success"
        ); form.reset(); resetPhotoPreview(); closeModal(); await loadProfessionals();
    } catch (error) {
        console.error("Erro ao cadastrar profissional:", error);
        Toast.mostrar(
            error.message || "Erro ao cadastrar profissional.",
            "error"
        );
    }
});

if (checkAuth()) { loadProfessionalSectors(); loadProfessionals(); }
