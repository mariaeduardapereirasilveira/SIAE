
/**
 * SIAE — Detalhes do Setor
 *
 * Responsabilidades:
 * - Identificar o setor pela URL;
 * - Consultar os dados administrativos;
 * - Mostrar informações e indicadores;
 * - Listar os profissionais vinculados;
 * - Permitir acessar o perfil de cada profissional.
 */

const token = localStorage.getItem("token");

const API_BASE = new URL(
    "../../api/",
    window.location.href
).href.replace(/\/$/, "");

// Elementos da página.
const sectorName = document.querySelector("#sectorDetailsName");
const sectorDescription = document.querySelector("#sectorDetailsDescription");
const sectorStatus = document.querySelector("#sectorDetailsStatus");

const totalElement = document.querySelector("#sectorProfessionalsTotal");
const activeElement = document.querySelector("#sectorProfessionalsActive");
const inactiveElement = document.querySelector("#sectorProfessionalsInactive");

const professionalsList = document.querySelector("#sectorProfessionalsList");

// Obtém o ID do setor informado na URL.
const params = new URLSearchParams(window.location.search);
const sectorId = Number(params.get("id"));

/**
 * Consulta uma rota da API com autenticação.
 */
async function requestApi(endpoint) {

    const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
        }
    });

    const result = await response.json();

    if (!response.ok || Number(result.code) !== 200) {
        throw new Error(
            result.message || "Não foi possível consultar os dados."
        );
    }

    return result.data;
}

/**
 * Retorna as iniciais do nome de um profissional.
 */
function getInitials(name) {

    return String(name || "?")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part[0] || "")
        .join("")
        .toUpperCase();
}

/**
 * Cria um avatar com a fotografia ou as iniciais.
 */
function createAvatar(professional) {

    const avatar = document.createElement("div");
    avatar.className = "table-person-avatar";
    avatar.textContent = getInitials(professional.name);

    // Aceita somente fotos armazenadas pelo upload do SIAE.
    const photo = String(
        professional.photoUrl || professional.photo || ""
    );

    const match = photo.match(
        /(?:^|\/)uploads\/users\/([a-f0-9]{32}\.(?:jpg|png|webp))(?:[?#]|$)/i
    );

    if (match) {
        const image = document.createElement("img");

        image.src = new URL(
            `../../uploads/users/${match[1]}`,
            window.location.href
        ).href;

        image.alt = `Foto de ${professional.name}`;

        image.addEventListener("error", () => image.remove(), {
            once: true
        });

        avatar.appendChild(image);
    }

    return avatar;
}

/**
 * Cria um item da lista de profissionais vinculados.
 */
function createProfessionalItem(professional) {

    const item = document.createElement("article");
    item.className = "sector-professional-item";

    const avatar = createAvatar(professional);

    const info = document.createElement("div");
    info.className = "sector-professional-info";

    const name = document.createElement("h3");
    name.textContent = professional.name || "Nome não informado";

    const functionText = document.createElement("p");
    functionText.textContent =
        professional.professionalFunction || "Função não informada";

    info.append(name, functionText);

    // Situação cadastral.
    const isActive = Number(professional.active) === 1;

    const status = document.createElement("span");

    status.className = isActive
        ? "badge badge-success"
        : "badge badge-neutral";

    status.textContent = isActive ? "Ativo" : "Inativo";

    // Link para os detalhes do profissional.
    const details = document.createElement("a");

    details.className = "btn btn-ghost btn-sm";
    details.textContent = "Ver perfil";

    details.href =
        `professional-details.html?id=${encodeURIComponent(professional.id)}`;

    item.append(avatar, info, status, details);

    return item;
}

/**
 * Carrega as informações do setor e seus profissionais.
 */
async function loadSectorDetails() {

    if (!Number.isSafeInteger(sectorId) || sectorId <= 0) {
        sectorName.textContent = "Setor inválido";
        sectorDescription.textContent = "O endereço não contém um ID válido.";
        professionalsList.textContent = "Não foi possível localizar o setor.";
        return;
    }

    try {

        // Consulta os setores e os usuários administrativos.
        const [sectors, users] = await Promise.all([
            requestApi("/sectors/manage"),
            requestApi("/users/list")
        ]);

        // Encontra o setor solicitado.
        const sector = sectors.find(
            item => Number(item.id) === sectorId
        );

        if (!sector) {
            throw new Error("Setor não encontrado.");
        }

        // Preenche as informações principais.
        sectorName.textContent = sector.name;

        sectorDescription.textContent =
            sector.description || "Sem descrição cadastrada.";

        document.title = `${sector.name} — SIAE`;

        const isActive = Number(sector.active) === 1;

        sectorStatus.textContent = isActive ? "Ativo" : "Inativo";

        // O botão voltar acompanha a situação do setor.
        const backLink = document.querySelector(".back-link");

        if (backLink) {
            backLink.href = isActive
                ? "sectors.html"
                : "sectors-inactive.html";
        }

        // Preenche os indicadores da API.
        totalElement.textContent = sector.professionalsTotal;
        activeElement.textContent = sector.professionalsActive;
        inactiveElement.textContent = sector.professionalsInactive;

        // Busca todos os profissionais vinculados ao setor.
        // Inclui ativos e inativos.
        const professionals = users.filter(user =>
            user.enrollment === "profissional" &&
            Number(user.sectorId) === sectorId
        );

        professionalsList.replaceChildren();

        // Mensagem caso o setor não possua profissionais.
        if (professionals.length === 0) {

            const empty = document.createElement("p");

            empty.className = "sector-professionals-empty";

            empty.textContent =
                "Este setor não possui profissionais vinculados.";

            professionalsList.appendChild(empty);

            return;
        }

        // Organiza os profissionais por nome.
        professionals.sort((a, b) =>
            String(a.name).localeCompare(
                String(b.name),
                "pt-BR"
            )
        );

        // Renderiza cada profissional.
        professionals.forEach(professional => {
            professionalsList.appendChild(
                createProfessionalItem(professional)
            );
        });

    } catch (error) {

        console.error("Erro ao carregar detalhes do setor:", error);

        sectorName.textContent = "Não foi possível carregar o setor";

        sectorDescription.textContent =
            error.message || "Ocorreu um erro ao buscar as informações.";

        professionalsList.textContent =
            "Não foi possível carregar os profissionais vinculados.";
    }
}

// Inicialização.
if (!token) {
    window.location.href = "../public/login.html";
} else {
    loadSectorDetails();
}
