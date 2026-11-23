import FormController from "../../_common/prototypes/FormControllerPrototype.js";
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

/**
 * Identifica se estamos na página de alunos desativados.
 * Será false na página students.html.
 */
const isInactivePage = window.location.pathname
    .endsWith("/students-inactive.html");

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

if (form) {
    FormController.inicializar(form);
}

function checkAuth() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "../public/login.html";
        return false;
    }

    const enrollment = (
        localStorage.getItem("enrollment") || ""
    ).trim().toLowerCase();

    if (enrollment !== "administrador") {
        if (openModalButton) {
            openModalButton.hidden = true;
        }

        window.location.replace("../app/search.html");
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
        Toast.mostrar("Escolha uma imagem JPG, PNG ou WEBP.", "warning");
        resetPhotoPreview();
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        Toast.mostrar("A foto deve ter no máximo 5 MB.", "warning");
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
    const url = resolvePhotoUrl(photo);
    avatar.className = `table-person-avatar ${url ? "has-photo" : "is-placeholder"}`;
    avatar.textContent = initials(name);
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
    const id = Number(student.id);

    if (!Number.isInteger(id) || id <= 0) {
        Toast.mostrar(
            "Não foi possível identificar o aluno.",
            "error"
        );
        return;
    }

    window.location.href =
        `../app/student-details.html?id=${encodeURIComponent(id)}`;
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
        Toast.mostrar("Não foi possível carregar as turmas.", "error");
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


        // Reúne todos os estudantes recebidos da API,
        // independentemente de estarem ativos ou inativos.
        const allStudents = (result.data || []).filter(
            user => user.enrollment === "estudante"
        );

        // Calcula as quantidades.
        const total = allStudents.length;

        const activeCount = allStudents.filter(
            student => Number(student.active) === 1
        ).length;

        const inactiveCount = total - activeCount;

        // Atualiza os indicadores nas duas páginas.
        document.querySelector("#studentsTotal").textContent = total;

        document.querySelector("#studentsActive").textContent = activeCount;

        document.querySelector("#studentsInactive").textContent = inactiveCount;

        // Filtra os estudantes conforme a página atual.
        const students = (result.data || []).filter(user => {

            // Confirma que o usuário é estudante.
            const isStudent = user.enrollment === "estudante";

            // Verifica o status armazenado no banco.
            const isActive = Number(user.active) === 1;

            // A página de desativados mostra somente inativos.
            // A página principal mostra somente ativos.
            return isStudent && (
                isInactivePage ? !isActive : isActive
            );
        });

        // Mostra quantos estudantes estão na listagem atual.
        const countBadge = document.querySelector(
            "#studentsListCount"
        );

        if (countBadge) {
            countBadge.textContent = `${students.length} ${students.length === 1 ? "aluno" : "alunos"
                }`;
        }

        tbody.replaceChildren();

        if (!students.length) {
            const message = isInactivePage
                ? "Nenhum aluno desativado."
                : "Nenhum aluno ativo encontrado.";

            tbody.innerHTML = `
        <tr>
            <td colspan="5" class="table-message">
                ${message}
            </td>
        </tr>
    `;
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

            // Mantém o botão Detalhes.
            actionCell.appendChild(detailsButton);

            // Cria o botão de alteração do status.
            const statusButton = document.createElement("button");

            statusButton.type = "button";
            statusButton.className = "btn btn-outline btn-sm";
            statusButton.style.marginLeft = "8px";

            // Decide qual ação mostrar.
            statusButton.textContent = active
                ? "Desativar"
                : "Reativar";

            // Conecta o botão à API.
            statusButton.addEventListener("click", () => {
                changeStudentStatus(student, statusButton);
            });

            // Insere os botões na coluna Ações.
            actionCell.appendChild(statusButton);

            row.appendChild(actionCell);
            tbody.appendChild(row);

        });
    } catch (error) {
        Toast.mostrar(
            "Não foi possível carregar os alunos.",
            "error"
        );
        console.error("Erro ao listar alunos:", error);
        tbody.innerHTML = '<tr><td colspan="5" class="table-message">Não foi possível carregar os alunos. Confira sua conexão e tente novamente.</td></tr>';
    }
}


/**
 * Desativa ou reativa um estudante.
 * Utiliza a modal de confirmação personalizada do SIAE.
 *
 * @param {Object} student - Dados do estudante.
 * @param {HTMLButtonElement} button - Botão clicado.
 */
async function changeStudentStatus(student, button) {

    // Identifica o status atual do estudante.
    const isActive = Number(student.active) === 1;

    // Abre a modal personalizada e aguarda a decisão.
    const confirmed = await ConfirmModal.confirmar({
        titulo: isActive
            ? "Desativar estudante?"
            : "Reativar estudante?",

        mensagem: isActive
            ? `Deseja realmente desativar ${student.name}? O cadastro será preservado e poderá ser reativado posteriormente.`
            : `Deseja reativar ${student.name}? O cadastro voltará à listagem de alunos ativos.`,

        textoConfirmar: isActive
            ? "Desativar"
            : "Reativar",

        tipo: isActive ? "danger" : "positive"
    });

    // Se clicar em Cancelar, não altera nada.
    if (!confirmed) {
        return;
    }

    // Bloqueia o botão para evitar múltiplos cliques.
    button.disabled = true;

    // Guarda o texto original para restaurá-lo depois.
    const originalText = button.textContent;

    button.textContent = isActive
        ? "Desativando..."
        : "Reativando...";

    try {
        // Executa a operação na API.
        const result = isActive
            ? await users.deactivate(student.id)
            : await users.reactivate(student.id);

        // Verifica se a API confirmou a operação.
        if (Number(result?.code) !== 200) {
            throw new Error(
                result?.message || "Erro ao alterar o status."
            );
        }

        // Exibe a mensagem de sucesso.
        Toast.mostrar(
            isActive
                ? "Aluno desativado com sucesso!"
                : "Aluno reativado com sucesso!",
            "success"
        );

        // Atualiza a tabela e os indicadores.
        await loadStudents();

    } catch (error) {
        console.error("Erro ao alterar status:", error);

        Toast.mostrar(
            error.message || "Não foi possível alterar o status.",
            "error"
        );

    } finally {
        // Restaura o botão após a operação.
        button.disabled = false;
        button.textContent = originalText;
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

    if (!form.reportValidity()) {
        Toast.mostrar(
            "Verifique os campos obrigatórios.",
            "warning"
        );
        return;
    }

    const dados = FormController.obterDados();

    if (
        !String(dados.name || "").trim() ||
        !dados.class_id ||
        !String(dados.email || "").trim() ||
        !dados.dateBirth
    ) {
        Toast.mostrar(
            "Preencha nome, turma, e-mail e data de nascimento.",
            "warning"
        );
        return;
    }

    // Mantemos FormData para incluir a fotografia no cadastro.
    const formData = new FormData(form);
    formData.set("enrollment", "estudante");

    const submitButton = form.querySelector('[type="submit"]');
    const originalText = submitButton?.textContent || "Cadastrar aluno";

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Cadastrando...";
    }

    try {
        const response = await users.register(formData);

        if (![200, 201].includes(Number(response?.code))) {
            throw new Error(
                response?.message || "Não foi possível cadastrar o aluno."
            );
        }

        Toast.mostrar(
            "Aluno cadastrado com sucesso!",
            "success"
        );

        FormController.limpar();
        resetPhotoPreview();
        closeModal();

        await loadStudents();

    } catch (error) {
        console.error("Erro ao cadastrar aluno:", error);

        Toast.mostrar(
            error.message || "Erro ao cadastrar aluno.",
            "error"
        );

    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }
});

if (checkAuth()) {
    loadClasses();
    loadStudents();
}