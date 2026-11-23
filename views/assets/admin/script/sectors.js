import Sector from "../../_common/classes/Sector.js";
import SectorService from "../../_common/classes/SectorService.js";
import Toast from "../../_common/prototypes/Toast.js";
import ConfirmModal from "../../_common/components/ConfirmModal.js";

const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "../public/login.html";
}
const service = new SectorService();
if (token) service.setAuthToken(token);
const grid = document.querySelector("#sectorsGrid");
const dialog = document.querySelector("#sectorModal");
const form = document.querySelector("#sectorForm");
const title = document.querySelector(".modal-title");
const subtitle = document.querySelector(".modal-subtitle");
let editingId = null;

const sectorArtwork = name => {
  const normalized = String(name || "").toLocaleLowerCase("pt-BR");
  if (normalized.includes("psico")) return "../assets/public/images/brand/brain.svg";
  if (normalized.includes("enferm")) return "../assets/public/images/brand/Vector (3).svg";
  if (normalized.includes("orient")) return "../assets/public/images/brand/Group (2).svg";
  return "../assets/public/images/brand/Group (1).svg";
};

function createSectorCard(sector) {
  const article = document.createElement("article");
  article.className = "sector-management-card";
  const image = document.createElement("img");
  image.src = sectorArtwork(sector.name);
  image.alt = "";
  const content = document.createElement("section");
  const heading = document.createElement("h3");
  heading.textContent = sector.name;
  const description = document.createElement("p");
  description.textContent = sector.description || "Sem descrição cadastrada.";


  // Quantidade de profissionais vinculados ao setor.
  const professionalsCount = document.createElement("p");

  professionalsCount.className =
    "sector-professionals-count";

  const total = Number(sector.professionalsTotal || 0);

  professionalsCount.textContent =
    `${total} ${total === 1
      ? "profissional vinculado"
      : "profissionais vinculados"}`;


  const actions = document.createElement("footer");
  const edit = document.createElement("button");
  edit.type = "button"; edit.className = "btn btn-ghost btn-sm"; edit.textContent = "Editar";
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "btn btn-ghost btn-sm";
  remove.textContent = "Desativar";
  edit.addEventListener("click", () => openEdit(sector));
  remove.addEventListener("click", () => removeSector(sector));
  actions.append(edit, remove);
  content.append(
    heading,
    description,
    professionalsCount
  );
// Verifica se o setor está ativo ou desativado.
const isActive = Number(sector.active) === 1;

if (isActive) {

    // Setores ativos mantêm os botões
    // Editar e Desativar já existentes.
    content.appendChild(actions);

} else {

    // Cria o botão de reativação.
    const reactivateButton = document.createElement("button");

    reactivateButton.type = "button";
    reactivateButton.className = "btn btn-ghost btn-sm";
    reactivateButton.textContent = "Reativar";

    // Conecta o botão à função de reativação.
    reactivateButton.addEventListener("click", () => {
        reactivateSector(sector);
    });

    // Substitui as ações antigas pelo botão Reativar.
    actions.replaceChildren(reactivateButton);

    // Adiciona as ações ao cartão.
    content.appendChild(actions);
}

  
article.append(image, content);

// ==========================================
// BOTÃO DETALHES DO SETOR
// ==========================================

// Cria um link para a página de detalhes.
const detailsButton = document.createElement("a");

detailsButton.className = "btn btn-ghost btn-sm";
detailsButton.textContent = "Detalhes";

// Envia o ID do setor pela URL.
detailsButton.href =
    `sector-details.html?id=${encodeURIComponent(sector.id)}`;

// Coloca Detalhes como primeira ação do cartão.
// Funciona tanto para setores ativos quanto desativados.
actions.prepend(detailsButton);

return article;

}

async function loadSectors() {
  if (!grid) return;
  grid.setAttribute("aria-busy", "true");
  try {

    // Consulta a listagem administrativa.
    // Ela inclui setores ativos, inativos e quantidades
    // de profissionais vinculados.

    const apiUrl = new URL(
      "../../api/sectors/manage",
      window.location.href
    );

    const httpResponse = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      }
    });

    const response = await httpResponse.json();

    if (!httpResponse.ok || Number(response?.code) !== 200) {
      throw new Error(
        response?.message ||
        "Não foi possível carregar a gestão de setores."
      );
    }

    // Todos os setores, independentemente do status.
    const allSectors = Array.isArray(response.data)
      ? response.data
      : [];

    // Calcula os indicadores.
    const total = allSectors.length;

    const activeCount = allSectors.filter(
      sector => Number(sector.active) === 1
    ).length;

    const inactiveCount = total - activeCount;

    const professionalsCount = allSectors.reduce(
      (sum, sector) =>
        sum + Number(sector.professionalsTotal || 0),
      0
    );

    // Atualiza os quatro cartões.
    document.querySelector("#sectorsTotal").textContent = total;

    document.querySelector("#sectorsActive").textContent =
      activeCount;

    document.querySelector("#sectorsInactive").textContent =
      inactiveCount;

    document.querySelector("#sectorsProfessionals").textContent =
      professionalsCount;

    
/**
 * Identifica se estamos na página de setores desativados.
 *
 * sectors.html          -> setores ativos
 * sectors-inactive.html -> setores desativados
 */
const isInactivePage =
    window.location.pathname.split("/").pop() ===
    "sectors-inactive.html";

// Seleciona somente os registros correspondentes à página.
const rows = allSectors.filter(sector => {

    const isActive = Number(sector.active) === 1;

    return isInactivePage ? !isActive : isActive;
});


    grid.replaceChildren();
    
if (rows.length === 0) {

    const empty = document.createElement("p");

    empty.className = "empty-appointments";

    empty.textContent = isInactivePage
        ? "Nenhum setor desativado."
        : "Nenhum setor ativo cadastrado.";

    grid.appendChild(empty);

    return;
}

    rows.forEach(
    sector => grid.appendChild(createSectorCard(sector))
);
  } catch (error) {
    console.error("Erro ao carregar setores:", error);
    const message = document.createElement("p");
    message.className = "empty-appointments";
    message.textContent = "Não foi possível carregar os setores. Verifique a API e tente novamente.";
    grid.replaceChildren(message);
  } finally {
    grid.setAttribute("aria-busy", "false");
  }
}

function openCreate() {
  editingId = null;
  form?.reset();
  title.textContent = "Novo setor";
  subtitle.textContent = "Informe os dados da área de atuação.";
  dialog?.showModal();
}

function openEdit(sector) {
  editingId = sector.id;
  form.elements.name.value = sector.name || "";
  form.elements.description.value = sector.description || "";
  title.textContent = "Editar setor";
  subtitle.textContent = "Atualize os dados desta área.";
  dialog?.showModal();
}


/**
 * Desativa um setor após confirmação.
 *
 * Regras:
 * - Solicita confirmação ao administrador.
 * - O backend verifica os profissionais vinculados.
 * - Caso existam vínculos, a desativação é bloqueada.
 * - O registro não é excluído do banco.
 */
async function removeSector(sector) {

  // 1. Solicita confirmação antes de alterar o setor.
  const confirmou = await ConfirmModal.confirmar({
    titulo: "Desativar setor?",

    mensagem:
      `Deseja desativar o setor "${sector.name}"? ` +
      "Esta ação só será permitida se não houver " +
      "profissionais vinculados.",

    textoConfirmar: "Desativar",
    textoCancelar: "Cancelar",
    tipo: "danger"
  });

  // 2. Interrompe caso o administrador cancele.
  if (!confirmou) {
    return;
  }

  try {

    // 3. Solicita a desativação à API.
    const response = await service.remove(sector.id);

    // 4. Trata o bloqueio por profissionais vinculados.
    if (Number(response?.code) === 409) {

      Toast.mostrar(
        response.message ||
        "Não é possível desativar este setor.",
        "warning"
      );

      return;
    }

    // 5. Verifica outros erros retornados pela API.
    if (Number(response?.code) !== 200) {
      throw new Error(
        response?.message ||
        "Não foi possível desativar o setor."
      );
    }

    // 6. Informa o sucesso da operação.
    Toast.mostrar(
      "Setor desativado com sucesso!",
      "success"
    );

    // 7. Atualiza os setores exibidos.
    await loadSectors();

  } catch (error) {

    console.error(
      "Erro ao desativar setor:",
      error
    );

    Toast.mostrar(
      error.message ||
      "Ocorreu um erro ao desativar o setor.",
      "error"
    );
  }
}

/**
 * Reativa um setor desativado.
 *
 * Solicita confirmação, envia a requisição à API
 * e atualiza a listagem após o sucesso.
 */
async function reactivateSector(sector) {

    // 1. Solicita confirmação ao administrador.
    const confirmou = await ConfirmModal.confirmar({
        titulo: "Reativar setor?",

        mensagem:
            `Deseja reativar o setor "${sector.name}"? ` +
            "Ele voltará a ficar disponível para a instituição.",

        textoConfirmar: "Reativar",
        textoCancelar: "Cancelar",
        tipo: "positive"
    });

    // Cancela a operação se o usuário não confirmar.
    if (!confirmou) return;

    try {

        // 2. Monta o endereço da rota de reativação.
        const url = new URL(
            `../../api/sectors/id/${encodeURIComponent(sector.id)}/reactivate`,
            window.location.href
        );

        // 3. Envia a requisição autenticada.
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        });

        const result = await response.json();

        // 4. Confere se a API confirmou a reativação.
        if (!response.ok || Number(result?.code) !== 200) {
            throw new Error(
                result?.message ||
                "Não foi possível reativar o setor."
            );
        }

        // 5. Informa o sucesso.
        Toast.mostrar(
            result.message || "Setor reativado com sucesso!",
            "success"
        );

        // 6. Atualiza a listagem e os indicadores.
        await loadSectors();

    } catch (error) {

        console.error("Erro ao reativar setor:", error);

        Toast.mostrar(
            error.message || "Erro ao reativar o setor.",
            "error"
        );
    }
}


document.querySelector("#btnNovoSetor")?.addEventListener("click", openCreate);
document.querySelector("#btnFecharModal")?.addEventListener("click", () => dialog?.close());
document.querySelector("#btnCancelar")?.addEventListener("click", () => dialog?.close());
dialog?.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });

form?.addEventListener("submit", async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    const sector = new Sector({ id: editingId, ...data });
    const response = editingId
      ? await service.update(editingId, sector.toJSON())
      : await service.create(sector.toJSON());
    if (![200, 201].includes(Number(response?.code))) {
      throw new Error(response?.message || "Não foi possível salvar o setor.");
    }
    dialog.close();
    form.reset();
    await loadSectors();
  } catch (error) {
    console.error("Erro ao salvar setor:", error);
    window.alert(error.message || "Não foi possível salvar o setor.");
  }
});

loadSectors();
