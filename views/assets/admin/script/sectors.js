import Sector from "../../_common/classes/Sector.js";
import SectorService from "../../_common/classes/SectorService.js";

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
  const actions = document.createElement("footer");
  const edit = document.createElement("button");
  edit.type = "button"; edit.className = "btn btn-ghost btn-sm"; edit.textContent = "Editar";
  const remove = document.createElement("button");
  remove.type = "button"; remove.className = "btn btn-ghost btn-sm"; remove.textContent = "Excluir";
  edit.addEventListener("click", () => openEdit(sector));
  remove.addEventListener("click", () => removeSector(sector));
  actions.append(edit, remove);
  content.append(heading, description, actions);
  article.append(image, content);
  return article;
}

async function loadSectors() {
  if (!grid) return;
  grid.setAttribute("aria-busy", "true");
  try {
    const response = await service.list();
    if (response?.code === 404) {
      grid.replaceChildren();
      const empty = document.createElement("p");
      empty.className = "empty-appointments";
      empty.textContent = "Ainda não há setores cadastrados.";
      grid.appendChild(empty);
      return;
    }
    if (response?.code !== 200) {
      throw new Error(response?.message || "A API não conseguiu listar os setores.");
    }
    const rows = Array.isArray(response.data) ? response.data : [];
    grid.replaceChildren();
    if (!Array.isArray(rows) || rows.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-appointments";
      empty.textContent = "Nenhum setor cadastrado.";
      grid.appendChild(empty);
      return;
    }
    rows.map(row => new Sector(row)).forEach(sector => grid.appendChild(createSectorCard(sector)));
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

async function removeSector(sector) {
  if (!window.confirm(`Deseja excluir o setor "${sector.name}"?`)) return;
  try {
    await service.remove(sector.id);
    await loadSectors();
  } catch (error) {
    console.error("Erro ao excluir setor:", error);
    window.alert("Não foi possível excluir este setor.");
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
