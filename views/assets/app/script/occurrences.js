import Occurrence from "../../_common/classes/Occurrence.js";
import OccurrenceService from "../../_common/classes/OccurrenceService.js";
import ServiceService from "../../_common/classes/ServiceService.js";
import SectorService from "../../_common/classes/SectorService.js";
import ShareService from "../../_common/classes/ShareService.js";
import Toast from "../../_common/prototypes/Toast.js";

(() => {
  "use strict";

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "../public/login.html";
    return;
  }

  const occurrenceService = new OccurrenceService();
  const serviceService = new ServiceService();
  const sectorService = new SectorService();
  const shareService = new ShareService();
  [occurrenceService, serviceService, sectorService, shareService].forEach(service => service.setAuthToken(token));

  const apiPrefix = (() => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    return parts.length ? `/${parts[0]}/api` : "/api";
  })();
  const apiBase = `${window.location.origin}${apiPrefix}`;

  const tabs = [...document.querySelectorAll("[data-occurrence-tab]")];
  const panels = [...document.querySelectorAll("[data-panel]")];
  const search = document.querySelector("#occurrenceSearch");
  const form = document.querySelector("#occurrenceForm");
  const formDialog = document.querySelector("#newOccurrenceDialog");
  const shareDialog = document.querySelector("#shareOccurrenceDialog");
  const detailsDialog = document.querySelector("#occurrenceDetailsDialog");
  const feedback = document.querySelector("#occurrenceFeedback");
  const studentSelect = document.querySelector("#occurrenceStudent");
  const sectorSelect = document.querySelector("#occurrenceSector");
  const classInput = document.querySelector("#occurrenceClass");
  const secrecySelect = document.querySelector("#occurrenceSecrecy");
  const initialShareFieldset = document.querySelector("#shareAfterCreateFieldset");
  const initialRecipients = document.querySelector("#occurrenceInitialShareRecipients");
  const shareRecipients = document.querySelector("#shareRecipients");

  let currentUserId = null;
  let currentTab = "created";
  let activeShareOccurrence = null;
  let occurrences = [];
  let shares = [];
  let students = [];
  let sectors = [];
  let professionals = [];
  const userById = new Map();
  const sectorById = new Map();
  const occurrenceById = new Map();

  const value = (item, ...keys) => {
    for (const key of keys) {
      if (item && item[key] !== undefined && item[key] !== null && String(item[key]).trim() !== "") {
        return item[key];
      }
    }
    return "";
  };
  const idOf = item => Number(value(item, "id"));
  const occurrenceIdOf = item => Number(value(item, "occurrence_id", "occurrenceId"));
  const userIdOf = item => Number(value(item, "user_id", "userId"));
  const studentIdOf = item => Number(value(item, "student_id", "studentId", "students_id", "studentsId"));
  const sectorIdOf = item => Number(value(item, "sectors_id", "sectorsId", "sector_id", "sectorId"));
  const dateLabel = raw => {
    if (!raw) return "Data não informada";
    const date = new Date(String(raw).replace(" ", "T"));
    return Number.isNaN(date.getTime()) ? String(raw) : date.toLocaleDateString("pt-BR");
  };

  
/**
 * Exibe mensagens do sistema.
 *
 * Sucesso, aviso e erro utilizam o Toast.
 * Mensagens informativas de carregamento
 * continuam aparecendo na própria página.
 */
function showFeedback(message, type = "info") {

    // Limpa mensagens anteriores.
    if (feedback) {
        feedback.textContent = "";
        feedback.hidden = true;
    }

    // Não exibe nada quando a mensagem está vazia.
    if (!message) return;

    // Utiliza o Toast para feedback das operações.
    if (["success", "warning", "error"].includes(type)) {

        Toast.mostrar(message, type);

        return;
    }

    // Mantém mensagens de carregamento na página.
    if (feedback) {
        feedback.textContent = message;
        feedback.dataset.type = type;
        feedback.hidden = false;
    }
}

  function normalizeResponse(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  }



  /**
   * Valida o resultado de uma consulta de listagem.
   *
   * - 200: devolve os registros encontrados.
   * - 404: aceita lista vazia para compatibilidade.
   * - Outros erros: informa a falha real da API.
   */
  function validateListResult(result, resourceName) {

    // Erro de rede ou falha ao executar a requisição.
    if (result.status === "rejected") {
      throw new Error(
        `Não foi possível carregar ${resourceName}: ` +
        result.reason.message
      );
    }

    const response = result.value;
    const code = Number(response?.code);

    // Algumas rotas antigas ainda retornam 404
    // quando não encontram registros.
    if (code === 404) {
      return [];
    }

    // Impede que erros sejam interpretados como lista vazia.
    if (code >= 400) {
      throw new Error(
        response.message ||
        `Não foi possível carregar ${resourceName}.`
      );
    }

    return normalizeResponse(response);
  }


  async function apiGet(endpoint) {
    const response = await fetch(`${apiBase}${endpoint}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` }
    });
    const payload = await response.json();
    if (!response.ok && response.status !== 404) {
      throw new Error(payload?.message || `Erro ${response.status} ao consultar a API.`);
    }
    if (payload?.code && payload.code >= 400 && payload.code !== 404) {
      throw new Error(payload.message || "Não foi possível consultar a API.");
    }
    return normalizeResponse(payload);
  }


  /**
   * Identifica o usuário autenticado pela API.
   *
   * O token determina qual usuário está conectado.
   * Não confiamos apenas no ID salvo anteriormente.
   */
  async function loadCurrentUser() {

    const response = await fetch(`${apiBase}/users/me`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    const payload = await response.json();

    // Verifica se a autenticação está válida.
    if (
      !response.ok ||
      Number(payload?.code) !== 200 ||
      !payload?.data?.id
    ) {
      throw new Error(
        payload?.message ||
        "Não foi possível identificar o usuário autenticado."
      );
    }

    // Recupera o ID verdadeiro da sessão.
    currentUserId = Number(payload.data.id);

    // Mantém compatibilidade com outras páginas do SIAE.
    localStorage.setItem(
      "userId",
      String(currentUserId)
    );
  }


  async function loadReferenceData() {
    await loadCurrentUser();

    const results = await Promise.allSettled([
      apiGet("/users/list"),
      sectorService.list(),
      apiGet("/users/professionals/list"),
      occurrenceService.list(),
      shareService.list()
    ]);

    const [usersResult, sectorsResult, professionalsResult, occurrencesResult, sharesResult] = results;

    students = usersResult.status === "fulfilled"
      ? usersResult.value.filter(user => value(user, "enrollment") === "estudante")
      : [];
    sectors = sectorsResult.status === "fulfilled"
      ? normalizeResponse(sectorsResult.value)
      : [];
    professionals = professionalsResult.status === "fulfilled"
      ? professionalsResult.value
      : [];

    // Carrega as ocorrências, verificando erros da API.
    occurrences = validateListResult(
      occurrencesResult,
      "as ocorrências"
    );

    // Carrega os compartilhamentos, verificando erros da API.
    shares = validateListResult(
      sharesResult,
      "os compartilhamentos"
    );


    if (usersResult.status === "rejected") console.warn("Não foi possível carregar estudantes:", usersResult.reason);
    if (sectorsResult.status === "rejected") console.warn("Não foi possível carregar setores:", sectorsResult.reason);
    if (professionalsResult.status === "rejected") console.warn("Não foi possível carregar profissionais:", professionalsResult.reason);
    if (occurrencesResult.status === "rejected") console.warn("Não foi possível carregar ocorrências:", occurrencesResult.reason);
    if (sharesResult.status === "rejected") console.warn("Não foi possível carregar compartilhamentos:", sharesResult.reason);

    [...students, ...professionals].forEach(user => userById.set(idOf(user), user));
    sectors.forEach(sector => sectorById.set(idOf(sector), sector));
    occurrences.forEach(occurrence => occurrenceById.set(idOf(occurrence), occurrence));

    populateSelect(studentSelect, students, "Selecione o estudante");
    populateSelect(sectorSelect, sectors, "Selecione o setor");
    renderInitialRecipients();
    renderCurrentTab();
    updateCounts();
  }

  function populateSelect(select, items, placeholder) {
    if (!select) return;
    const current = select.value;
    select.replaceChildren();
    const first = document.createElement("option");
    first.value = "";
    first.textContent = placeholder;
    select.appendChild(first);
    items.forEach(item => {
      const option = document.createElement("option");
      option.value = String(idOf(item));
      option.textContent = value(item, "name") || `Registro ${idOf(item)}`;
      select.appendChild(option);
    });
    if (items.some(item => String(idOf(item)) === current)) select.value = current;
  }

  function renderInitialRecipients() {
    if (!initialRecipients) return;
    initialRecipients.replaceChildren();
    if (!professionals.length) {
      const hint = document.createElement("p");
      hint.className = "form-helper";
      hint.textContent = "Nenhum outro profissional disponível para compartilhamento.";
      initialRecipients.appendChild(hint);
      return;
    }
    professionals
      .filter(person => idOf(person) !== currentUserId)
      .forEach(person => initialRecipients.appendChild(createRecipientOption(person, "initialShare")));
  }

  function createRecipientOption(person, namePrefix = "share") {
    const label = document.createElement("label");
    label.className = "share-recipient-option";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = namePrefix;
    checkbox.value = String(idOf(person));
    const avatar = document.createElement("span");
    avatar.className = "share-recipient-avatar";
    avatar.textContent = String(value(person, "name") || "P").split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
    const text = document.createElement("span");
    text.className = "share-recipient-text";
    const name = document.createElement("strong");
    name.textContent = value(person, "name") || "Profissional";
    const sector = document.createElement("small");
    sector.textContent = value(person, "sectorName", "sector_name") || "Profissional";
    text.append(name, sector);
    label.append(checkbox, avatar, text);
    return label;
  }

  function studentFor(occurrence) {
    return userById.get(studentIdOf(occurrence)) || null;
  }

  function sectorFor(occurrence) {
    return sectorById.get(sectorIdOf(occurrence)) || null;
  }

  function sharesFor(occurrenceId) {
    return shares.filter(share => occurrenceIdOf(share) === Number(occurrenceId) && Number(value(share, "active") || 1) === 1);
  }

  function getCreated() {
    return occurrences.filter(item => userIdOf(item) === currentUserId);
  }

  function getReceived() {
    const ids = new Set(
      shares
        .filter(share => userIdOf(share) === currentUserId && Number(value(share, "active") || 1) === 1)
        .map(occurrenceIdOf)
    );
    return occurrences.filter(item =>
      userIdOf(item) !== currentUserId &&
      (ids.has(idOf(item)) || value(item, "secrecy_level", "secrecyLevel") === "Todas as entidades")
    );
  }

  function getShared() {
    const ownIds = new Set(getCreated().map(idOf));
    const ids = new Set(shares.filter(share => ownIds.has(occurrenceIdOf(share)) && Number(value(share, "active") || 1) === 1).map(occurrenceIdOf));
    return occurrences.filter(item => ids.has(idOf(item)));
  }

  function dataForTab(tab) {
    if (tab === "received") return getReceived();
    if (tab === "shared") return getShared();
    return getCreated();
  }

  function updateCounts() {
    const counts = {
      created: getCreated().length,
      received: getReceived().length,
      shared: getShared().length
    };
    Object.entries(counts).forEach(([key, count]) => {
      const node = document.querySelector(`#${key}Count`);
      if (node) node.textContent = String(count);
    });
  }

  function setTab(tab) {
    currentTab = tab;
    tabs.forEach(button => {
      const active = button.dataset.occurrenceTab === tab;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    panels.forEach(panel => {
      const active = panel.dataset.panel === tab;
      panel.classList.toggle("active", active);
      panel.hidden = !active;
    });
    renderCurrentTab();
  }

  function renderCurrentTab() {
    const list = document.querySelector(`#occurrenceList-${currentTab}`);
    if (!list) return;
    const term = (search?.value || "").trim().toLocaleLowerCase("pt-BR");
    const records = dataForTab(currentTab).filter(item => {
      const student = studentFor(item);
      const sector = sectorFor(item);
      const haystack = [
        value(item, "title"), value(item, "description"),
        value(student, "name"), value(sector, "name")
      ].join(" ").toLocaleLowerCase("pt-BR");
      return haystack.includes(term);
    });

    list.replaceChildren();
    if (!records.length) {
      const empty = document.createElement("article");
      empty.className = "occurrence-empty-state";
      const heading = document.createElement("h3");
      heading.textContent = term ? "Nenhuma ocorrência encontrada" : "Nada para mostrar por aqui";
      const body = document.createElement("p");
      body.textContent = term
        ? "Tente outra palavra ou nome de estudante."
        : currentTab === "created"
          ? "As ocorrências que você registrar aparecerão nesta página."
          : currentTab === "received"
            ? "Quando um profissional compartilhar uma ocorrência com você, ela aparecerá aqui."
            : "Quando você compartilhar uma ocorrência com outro profissional, ela aparecerá aqui.";
      empty.append(heading, body);
      list.appendChild(empty);
      return;
    }

    records
      .slice()
      .sort((a, b) => String(value(b, "created_at", "createdAt")).localeCompare(String(value(a, "created_at", "createdAt"))))
      .forEach(item => list.appendChild(createOccurrenceCard(item)));
  }

  function createOccurrenceCard(item) {
    const article = document.createElement("article");
    article.className = "occurrence-card";
    const header = document.createElement("header");
    header.className = "occurrence-card-header";
    const title = document.createElement("h3");
    title.textContent = value(item, "title") || "Ocorrência";
    const status = document.createElement("span");
    status.className = `occurrence-status ${String(value(item, "status")).toLocaleLowerCase("pt-BR") === "encerrado" ? "is-closed" : ""}`;
    status.textContent = value(item, "status") || "Ativo";
    header.append(title, status);

    const student = studentFor(item);
    const sector = sectorFor(item);
    const meta = document.createElement("div");
    meta.className = "occurrence-card-meta";
    const studentName = document.createElement("span");
    studentName.textContent = value(student, "name") || `Estudante #${studentIdOf(item) || "—"}`;
    const sectorName = document.createElement("span");
    sectorName.textContent = value(sector, "name") || "Setor não informado";
    const date = document.createElement("span");
    date.textContent = dateLabel(value(item, "created_at", "createdAt"));
    meta.append(studentName, sectorName, date);

    const excerpt = document.createElement("p");
    excerpt.className = "occurrence-card-excerpt";
    const description = String(value(item, "description") || "");
    excerpt.textContent = description.length > 180 ? `${description.slice(0, 177)}…` : description;

    const footer = document.createElement("footer");
    footer.className = "occurrence-card-footer";
    const visibility = document.createElement("span");
    visibility.className = "occurrence-card-privacy";
    visibility.textContent = value(item, "secrecy_level", "secrecyLevel") || "Sigilo não informado";
    const actions = document.createElement("div");
    actions.className = "occurrence-card-actions";
    const detailButton = document.createElement("button");
    detailButton.type = "button";
    detailButton.className = "btn btn-ghost btn-sm";
    detailButton.dataset.action = "details";
    detailButton.dataset.id = String(idOf(item));
    detailButton.textContent = "Ver detalhes";
    actions.appendChild(detailButton);

    
// Identifica o nível de sigilo da ocorrência.
const secrecyLevel = value(
    item,
    "secrecy_level",
    "secrecyLevel"
);

// Compartilhamento individual somente quando:
// 1. A ocorrência pertence ao profissional;
// 2. Não estamos na aba de recebidas;
// 3. O sigilo permite destinatários específicos.
const canShare =
    currentTab !== "received" &&
    userIdOf(item) === currentUserId &&
    secrecyLevel === "Entidades especificas";

if (canShare) {
    const shareButton = document.createElement("button");

    shareButton.type = "button";
    shareButton.className = "btn btn-outline btn-sm";
    shareButton.dataset.action = "share";
    shareButton.dataset.id = String(idOf(item));
    shareButton.textContent = "Compartilhar";

    actions.appendChild(shareButton);
}


    footer.append(visibility, actions);
    article.append(header, meta, excerpt, footer);
    return article;
  }

  


/**
 * Cria um cartão visual de profissional.
 */
function createAccessPersonCard(person, fallbackName, fallbackRole) {
    const card = document.createElement("article");
    card.className = "occurrence-access-card";

    const name = String(
        value(person, "name") || fallbackName
    );

    // Avatar com iniciais.
    const avatar = document.createElement("span");
    avatar.className = "occurrence-access-avatar";

    avatar.textContent = name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part.charAt(0))
        .join("")
        .toUpperCase();

    // Utiliza a fotografia cadastrada, se disponível.
    const photoUrl = String(value(person, "photoUrl") || "");

    if (photoUrl) {
        try {
            const url = new URL(photoUrl, window.location.href);

            if (
                url.origin === window.location.origin &&
                /\/uploads\/users\/[a-f0-9]{32}\.(?:jpg|png|webp)$/i
                    .test(url.pathname)
            ) {
                const image = document.createElement("img");
                image.src = url.href;
                image.alt = "";

                image.addEventListener(
                    "error",
                    () => image.remove(),
                    { once: true }
                );

                avatar.appendChild(image);
            }
        } catch (error) {
            console.warn("Foto de profissional inválida:", error);
        }
    }

    // Nome e setor.
    const info = document.createElement("div");
    info.className = "occurrence-access-info";

    const nameElement = document.createElement("strong");
    nameElement.textContent = name;

    const sectorElement = document.createElement("small");
    sectorElement.textContent =
        value(person, "sectorName", "sector_name") ||
        fallbackRole;

    info.append(nameElement, sectorElement);
    card.append(avatar, info);

    return card;
}

/**
 * Renderiza o responsável e os compartilhamentos
 * disponíveis para o usuário autenticado.
 */
function renderAccessList(item, shareRows = []) {
    const ownerContainer =
        document.querySelector("#detailsOwner");

    const recipientsContainer =
        document.querySelector("#detailsSharedWith");

    if (!ownerContainer || !recipientsContainer) return;

    ownerContainer.replaceChildren();
    recipientsContainer.replaceChildren();

    // 1. Identifica quem criou a ocorrência.
    const ownerId = userIdOf(item);
    const owner = userById.get(ownerId);

    ownerContainer.appendChild(
        createAccessPersonCard(
            owner,
            `Profissional #${ownerId}`,
            "Responsável pelo registro"
        )
    );

    // 2. Verifica o nível de sigilo.
    const secrecyLevel = value(
        item,
        "secrecy_level",
        "secrecyLevel"
    );

    // Exibe mensagens quando não há compartilhamento individual.
    if (secrecyLevel !== "Entidades especificas") {
        const message = document.createElement("p");
        message.className = "occurrence-access-hint";

        message.textContent =
            secrecyLevel === "Todas as entidades"
                ? "Registro com visibilidade geral autorizada."
                : "Registro restrito à entidade responsável.";

        recipientsContainer.appendChild(message);
        return;
    }

 
/*
 * Utiliza os compartilhamentos consultados
 * diretamente na API da ocorrência.
 *
 * O backend já verifica quais destinatários
 * o usuário autenticado pode visualizar.
 */
const recipientIds = [
    ...new Set(
        shareRows
            .filter(share => Number(share.active) === 1)
            .map(userIdOf)
            .filter(id => Number.isSafeInteger(id) && id > 0)
    )
];


    if (!recipientIds.length) {
        const message = document.createElement("p");
        message.className = "occurrence-access-hint";
        message.textContent =
            "Nenhum compartilhamento disponível para esta conta.";

        recipientsContainer.appendChild(message);
        return;
    }

    // 4. Cria um cartão para cada destinatário.
    recipientIds.forEach(id => {
        const person = userById.get(id);

        recipientsContainer.appendChild(
            createAccessPersonCard(
                person,
                `Profissional #${id}`,
                "Compartilhamento ativo"
            )
        );
    });
}



/**
 * Consulta e apresenta os detalhes de uma ocorrência.
 *
 * O backend verifica se o usuário possui permissão
 * para consultar o registro solicitado.
 */
async function openDetails(id) {

    const occurrenceId = Number(id);

    if (!detailsDialog) return;

    if (!Number.isSafeInteger(occurrenceId) || occurrenceId <= 0) {
        showFeedback("Ocorrência inválida.", "warning");
        return;
    }

    try {

        // 1. Consulta os detalhes pela API protegida.
        const response = await occurrenceService.find(occurrenceId);

        // 2. Verifica se a API autorizou a consulta.
        if (
            Number(response?.code) !== 200 ||
            !response?.data ||
            Array.isArray(response.data)
        ) {
            throw new Error(
                response?.message ||
                "Você não possui permissão para consultar esta ocorrência."
            );
        }

        const item = response.data;

        // 3. Localiza as informações relacionadas.
        const student = studentFor(item);
        const sector = sectorFor(item);

        // 4. Preenche o cabeçalho.
        document.querySelector("#detailsOccurrenceTitle").textContent =
            value(item, "title") || "Ocorrência";

        document.querySelector("#detailsOccurrenceMeta").textContent =
            `Criada em ${dateLabel(value(item, "created_at", "createdAt"))}`;

        // 5. Preenche as informações principais.
        document.querySelector("#detailsStudent").textContent =
            value(student, "name") ||
            `Estudante #${studentIdOf(item) || "—"}`;

        document.querySelector("#detailsSector").textContent =
            value(sector, "name") || "Não informado";

        document.querySelector("#detailsStatus").textContent =
            value(item, "status") || "Não informado";

        document.querySelector("#detailsSecrecy").textContent =
            value(item, "secrecy_level", "secrecyLevel") ||
            "Não informado";

        document.querySelector("#detailsDescription").textContent =
            value(item, "description") ||
            "Nenhuma descrição cadastrada.";

       

/*
 * 6. Consulta os compartilhamentos da ocorrência.
 *
 * A API determina quais destinatários podem
 * ser visualizados pelo usuário autenticado.
 */
let shareRows = [];
let sharesLoaded = false;

try {
    const shareResponse =
        await shareService.listByOccurrence(occurrenceId);

    // Temporário: permite verificar a resposta real da API.
    console.log(
        "Resposta da consulta de compartilhamentos:",
        shareResponse
    );

    if (Number(shareResponse?.code) !== 200) {
        throw new Error(
            shareResponse?.message ||
            `Falha na consulta. Código: ${shareResponse?.code ?? "desconhecido"}`
        );
    }

    if (!Array.isArray(shareResponse.data)) {
        throw new Error(
            "A API não retornou uma lista válida de compartilhamentos."
        );
    }

    shareRows = shareResponse.data;
    sharesLoaded = true;

} catch (error) {
    console.error(
        "Erro ao consultar os destinatários:",
        error
    );

    // Utiliza o Toast já existente no SIAE.
    showFeedback(
        error.message ||
        "Não foi possível consultar os compartilhamentos.",
        "warning"
    );
}

/*
 * 7. Renderiza o responsável e os destinatários.
 *
 * O responsável aparece mesmo se a consulta
 * dos compartilhamentos apresentar falha.
 */
renderAccessList(item, shareRows);

/*
 * Se a consulta falhar, não mostra uma mensagem
 * incorreta dizendo que não existem destinatários.
 */
if (!sharesLoaded) {
    const recipientsContainer =
        document.querySelector("#detailsSharedWith");

    if (recipientsContainer) {
        recipientsContainer.textContent =
            "Não foi possível consultar os profissionais compartilhados.";
    }
}

// 8. Abre a modal de detalhes.
detailsDialog.showModal();

    } catch (error) {

        console.error("Erro ao consultar ocorrência:", error);

        // Nossa função showFeedback já utiliza o Toast.
        showFeedback(
            error.message || "Não foi possível abrir a ocorrência.",
            "error"
        );
    }
}

  function openShare(id) {
    const item = occurrenceById.get(Number(id));
    if (!item || !shareDialog) return;
    activeShareOccurrence = item;
    document.querySelector("#shareOccurrenceTitle").textContent = value(item, "title") || "Selecione os profissionais que poderão consultar este registro.";
    shareRecipients.replaceChildren();
    const alreadyShared = new Set(sharesFor(id).map(userIdOf));
    const available = professionals.filter(person => idOf(person) !== currentUserId && !alreadyShared.has(idOf(person)));
    if (!available.length) {
      const empty = document.createElement("p");
      empty.className = "form-helper";
      empty.textContent = "Não há outros profissionais disponíveis para compartilhar este registro.";
      shareRecipients.appendChild(empty);
    } else {
      available.forEach(person => shareRecipients.appendChild(createRecipientOption(person, "shareRecipient")));
    }
    shareDialog.showModal();
  }

  tabs.forEach(button => button.addEventListener("click", () => setTab(button.dataset.occurrenceTab)));
  search?.addEventListener("input", renderCurrentTab);

  document.querySelectorAll(".occurrence-tab-panel").forEach(panel => {
    panel.addEventListener("click", event => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      if (button.dataset.action === "details") openDetails(button.dataset.id);
      if (button.dataset.action === "share") openShare(button.dataset.id);
    });
  });

  document.querySelector("#btnNewOccurrence")?.addEventListener("click", () => {
    form?.reset();
    if (formDialog?.showModal) formDialog.showModal();
    else showFeedback("Seu navegador não oferece suporte ao formulário de diálogo.", "error");
  });

  document.querySelectorAll("[data-dialog-close]").forEach(button => {
    button.addEventListener("click", () => {
      document.getElementById(button.dataset.dialogClose)?.close();
    });
  });

  studentSelect?.addEventListener("change", () => {
    const selected = students.find(student => idOf(student) === Number(studentSelect.value));
    if (classInput) classInput.value = value(selected, "className", "class_name") || "";
  });

  function updateInitialSharingVisibility() {
    const allowsSpecificSharing = secrecySelect?.value === "Entidades especificas";
    if (initialShareFieldset) initialShareFieldset.hidden = !allowsSpecificSharing;
    if (!allowsSpecificSharing) {
      initialRecipients?.querySelectorAll('input[name="initialShare"]').forEach(input => { input.checked = false; });
    }
  }
  secrecySelect?.addEventListener("change", updateInitialSharingVisibility);
  updateInitialSharingVisibility();

  form?.addEventListener("submit", async event => {
    event.preventDefault();
    const saveButton = document.querySelector("#saveOccurrenceButton");
    const formData = new FormData(form);
    const studentId = Number(formData.get("student_id"));
    const sectorId = Number(formData.get("sectors_id"));
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const type = String(formData.get("type") || "").trim();
    const status = String(formData.get("status") || "Ativo");
    const secrecy = String(formData.get("secrecy_level") || "Restrito");
    const selectedStudent = students.find(student => idOf(student) === studentId);

    if (!currentUserId) {
      showFeedback("Não foi possível identificar o usuário autenticado. Entre novamente no sistema.", "error");
      return;
    }
    if (!studentId || !sectorId || !title || !description || !type || !selectedStudent) {
      showFeedback("Preencha os campos obrigatórios antes de salvar.", "error");
      return;
    }

    if (saveButton) { saveButton.disabled = true; saveButton.textContent = "Salvando..."; }
    showFeedback("");
    let createdServiceId = null;
    try {
      const serviceResponse = await serviceService.create({
        user_id: currentUserId,
        student_id: studentId,
        observations: `${type}: ${title}`
      });
      if (![200, 201].includes(Number(serviceResponse?.code)) || !serviceResponse?.data?.id) {
        throw new Error(serviceResponse?.message || "Não foi possível registrar o vínculo do atendimento.");
      }
      createdServiceId = Number(serviceResponse.data.id);

      const occurrence = new Occurrence({
        services_id: createdServiceId,
        sectors_id: sectorId,
        user_id: currentUserId,
        student_id: studentId,
        title,
        description,
        status,
        secrecy_level: secrecy,
        class: value(selectedStudent, "className", "class_name")
      });
      const response = await occurrenceService.create(occurrence.toJSON());
      if (![200, 201].includes(Number(response?.code))) {
        await serviceService.remove(createdServiceId).catch(() => { });
        throw new Error(response?.message || "Não foi possível salvar a ocorrência.");
      }

      const recipientIds = secrecy === "Entidades especificas"
        ? [...document.querySelectorAll('input[name="initialShare"]:checked')].map(input => Number(input.value))
        : [];
      let shareErrors = 0;
      for (const recipientId of recipientIds) {
        const shareResponse = await shareService.create({ occurrence_id: response?.data?.id || 0, user_id: recipientId });
        if (![200, 201].includes(Number(shareResponse?.code))) shareErrors++;
      }

      formDialog.close();
      form.reset();
      if (shareErrors) showFeedback("Ocorrência salva, mas um ou mais compartilhamentos não foram concluídos.", "warning");
      else showFeedback("Ocorrência salva com sucesso.", "success");
      await loadReferenceData();
      setTab(recipientIds.length ? "shared" : "created");
    } catch (error) {
      console.error("Erro ao salvar ocorrência:", error);
      showFeedback(error.message || "Não foi possível salvar a ocorrência.", "error");
    } finally {
      if (saveButton) { saveButton.disabled = false; saveButton.textContent = "Salvar ocorrência"; }
    }
  });

  shareDialog?.querySelector("#shareOccurrenceForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    if (!activeShareOccurrence) return;
    const ids = [...shareRecipients.querySelectorAll('input[name="shareRecipient"]:checked')].map(input => Number(input.value));
    if (!ids.length) { showFeedback("Selecione ao menos um profissional para compartilhar.", "warning"); return; }
    const submit = shareDialog.querySelector('button[type="submit"]');
    if (submit) { submit.disabled = true; submit.textContent = "Compartilhando..."; }
    let failed = 0;
    try {
      for (const userId of ids) {
        const response = await shareService.create({ occurrence_id: idOf(activeShareOccurrence), user_id: userId });
        if (![200, 201].includes(Number(response?.code))) failed++;
      }
      shareDialog.close();
      showFeedback(failed ? "Alguns compartilhamentos não foram concluídos." : "Ocorrência compartilhada com sucesso.", failed ? "warning" : "success");
      await loadReferenceData();
      setTab("shared");
    } catch (error) {
      showFeedback(error.message || "Não foi possível compartilhar a ocorrência.", "error");
    } finally {
      if (submit) { submit.disabled = false; submit.textContent = "Confirmar compartilhamento"; }
      activeShareOccurrence = null;
    }
  });

  async function initialize() {
    showFeedback("Carregando informações de ocorrências...");
    try {
      await loadReferenceData();
      showFeedback("");
    } catch (error) {
      console.error("Erro ao inicializar ocorrências:", error);
      showFeedback(
        error.message || "Não foi possível carregar as ocorrências.",
        "error"
      );
    }
  }

  initialize();
})();