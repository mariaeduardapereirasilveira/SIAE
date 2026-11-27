import FormControllerPrototype from "../../_common/prototypes/FormControllerPrototype.js";
import ToastPrototype from "../../_common/prototypes/Toast.js";
import HttpClientBase from "../../_common/classes/HttpClientBase.js";
import ConfirmModal from "../../_common/components/ConfirmModal.js";



(() => {
  "use strict";
  const root = window.location.pathname.split("/").filter(Boolean);
  const prefix = root.length ? `/${root[0]}` : "";
  const API_URL = `${window.location.origin}${prefix}/api/faqs/list`;
  const categoriesView = document.querySelector("#faqCategoryView");
  const subpageView = document.querySelector("#faqSubpageView");
  const categoriesContainer = document.querySelector("#faqCategories");
  const container = document.querySelector("#faqContainer");
  const title = document.querySelector("#faqCategoryTitle");
  // Identifica o perfil do usuário autenticado
// Recupera o perfil armazenado durante o login
const userRole = localStorage.getItem("enrollment");

// Verifica se o usuário é administrador
const isAdmin = ["admin", "administrator", "administrador"]
    .includes(userRole?.trim().toLowerCase());
  const description = document.querySelector("#faqCategoryDescription");
  const search = document.querySelector("#faqSearch");
  const back = document.querySelector("#faqBackButton");
  // Elementos do modal administrativo
const faqModal = document.querySelector("#faqModal");
const openFaqButton = document.querySelector("#createFaqButton");
const closeFaqButton = document.querySelector("#closeFaqModal");
const cancelFaqButton = document.querySelector("#cancelFaqModal");
const faqForm = document.querySelector("#faqForm");
// Cliente responsável pelas requisições à API
const faqApi = new HttpClientBase();

// Adiciona o token de autenticação às requisições
faqApi.setAuthToken(localStorage.getItem("token") || "");
// Cria uma instância do prototype de formulários
const faqFormController = Object.create(FormControllerPrototype);

// Associa o formulário HTML à instância
if (faqForm) {
    faqFormController.inicializar(faqForm);
}


// Abre o formulário de cadastro
function openFaqModal() {
    if (!faqModal) return;

    faqForm?.reset();

    // Garante que o formulário esteja no modo cadastro
editingFaqId = null;

// Restaura os textos originais
document.querySelector("#faqModalTitle").textContent = "Nova pergunta";
document.querySelector("#saveFaqButton").textContent = "Salvar pergunta";

    faqModal.hidden = false;
    faqModal.classList.add("active");

    document.querySelector("#faqCategoryInput")?.focus();
}

// Fecha o formulário
function closeFaqModal() {
    if (!faqModal) return;

    faqModal.classList.remove("active");
    faqModal.hidden = true;
}

// Abre o modal para editar uma pergunta existente
function editFaq(id) {
    // Procura a pergunta pelo ID
    const faq = items.find(item => item.id === Number(id));

    if (!faq) {
        ToastPrototype.mostrar(
            "Não foi possível encontrar a pergunta.",
            "error"
        );
        return;
    }

    // Identifica a pergunta que está sendo editada
    editingFaqId = faq.id;

    // Altera os textos do modal
    document.querySelector("#faqModalTitle").textContent =
        "Editar pergunta";

    document.querySelector("#saveFaqButton").textContent =
        "Salvar alterações";

    // Preenche os campos
    document.querySelector("#faqCategoryInput").value =
        String(faq.categoryId);

    document.querySelector("#faqQuestionInput").value =
        faq.question;

    document.querySelector("#faqAnswerInput").value =
        faq.answer;

    // Exibe o modal
    faqModal.hidden = false;
    faqModal.classList.add("active");

    document.querySelector("#faqQuestionInput").focus();
}

// Solicita confirmação antes de desativar uma FAQ
async function deactivateFaq(id) {

    // Localiza a pergunta selecionada
    const faq = items.find(item => item.id === Number(id));

    if (!faq) {
        ToastPrototype.mostrar(
            "Não foi possível encontrar a pergunta.",
            "error"
        );
        return;
    }

    // Solicita confirmação ao administrador
    const confirmou = await ConfirmModal.confirmar({
        titulo: "Desativar pergunta?",
        mensagem: `Deseja desativar a pergunta "${faq.question}"? Ela deixará de aparecer na FAQ dos profissionais.`,
        textoConfirmar: "Desativar",
        textoCancelar: "Cancelar",
        tipo: "danger"
    });

    // Interrompe a operação se o administrador cancelar
    if (!confirmou) return;

    // A requisição à API será implementada na próxima etapa
   try {
    // Solicita a desativação da FAQ
    const resposta = await faqApi.delete(`/faqs/${faq.id}`);

    // Verifica se a operação foi concluída
    if (Number(resposta.code) !== 200) {
        ToastPrototype.mostrarResposta(resposta);
        return;
    }

    // Informa que a pergunta foi desativada
    ToastPrototype.mostrarResposta(resposta);

    // Atualiza as perguntas exibidas
    await load();

    // Volta para a visualização das categorias
    closeCategory();

} catch (error) {
    console.error("Erro ao desativar FAQ:", error);

    ToastPrototype.mostrar(
        "Não foi possível desativar a pergunta.",
        "error"
    );
}
}



// Captura o envio do formulário de FAQ
faqForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Obtém os dados usando nosso prototype
    const dados = faqFormController.obterDados();
    // Converte o ID da categoria para número
dados.faqs_category_id = Number(dados.faqs_category_id);

    // Remove espaços desnecessários
    dados.question = dados.question.trim();
    dados.answer = dados.answer.trim();

    // Verifica se os campos foram preenchidos
    if (!dados.faqs_category_id || !dados.question || !dados.answer) {
        ToastPrototype.mostrar(
            "Preencha todos os campos obrigatórios.",
            "warning"
        );
        return;
    }

   try {
    // Envia os dados para a API
 // Verifica se estamos cadastrando ou editando uma pergunta
const isEditing = editingFaqId !== null;

// Define a requisição de acordo com a operação
const resposta = isEditing
    ? await faqApi.putForm(`/faqs/${editingFaqId}`, dados)
    : await faqApi.postForm("/faqs/", dados);
    // Verifica se a API confirmou o cadastro
  // Define o código de sucesso esperado
const successCode = isEditing ? 200 : 201;

// Verifica se a operação foi concluída
if (Number(resposta.code) !== successCode) {
    ToastPrototype.mostrarResposta(resposta);
    return;
}

    // Exibe a mensagem de sucesso
    ToastPrototype.mostrarResposta(resposta);

    // Fecha o formulário
    closeFaqModal();

    // Atualiza as perguntas e categorias
    await load();

} catch (error) {
    console.error("Erro ao cadastrar FAQ:", error);

    ToastPrototype.mostrar(
        "Não foi possível cadastrar a pergunta.",
        "error"
    );
}
});

// Eventos do formulário
openFaqButton?.addEventListener("click", openFaqModal);

closeFaqButton?.addEventListener("click", closeFaqModal);

cancelFaqButton?.addEventListener("click", closeFaqModal);
  const fallback = [
    ["Acesso e conta","Como acessar o SIAE?","Utilize o e-mail cadastrado e a senha da sua conta. Os módulos disponíveis dependem do perfil e das permissões concedidas."],
    ["Acesso e conta","Como alterar minha foto de perfil?","Abra Meu perfil, escolha Alterar foto, selecione uma imagem JPG, PNG ou WEBP e confirme em Salvar foto."],
    ["Atendimentos","Como registrar um atendimento?","Acesse Atendimentos, selecione o estudante, informe o setor, a data e o tipo de registro. Preencha a descrição e salve o atendimento."],
    ["Atendimentos","Posso consultar atendimentos anteriores?","Sim. A consulta depende das permissões do seu perfil e das regras de confidencialidade aplicadas a cada registro."],
    ["Estudantes","Como encontrar um estudante?","Abra Busca e pesquise pelo nome ou código do estudante. Os resultados respeitam as permissões da sua conta."],
    ["Estudantes","Como cadastrar um novo estudante?","Administradores podem abrir Alunos, selecionar Novo aluno, preencher os dados obrigatórios e salvar o cadastro."],
    ["Compartilhamento","Como compartilhar uma ocorrência?","Na ocorrência desejada, selecione Compartilhar, escolha os profissionais autorizados e confirme o envio."],
    ["Compartilhamento","Quem pode visualizar uma ocorrência compartilhada?","Somente os profissionais selecionados e autorizados podem consultar o registro compartilhado."],
    ["Privacidade","Como funciona o nível de sigilo?","O nível de sigilo indica como o registro deve ser tratado. Compartilhe somente com profissionais que tenham autorização para consultá-lo."],
    ["Privacidade","A administração pode visualizar todos os registros?","O acesso continua condicionado às permissões e às regras de confidencialidade do sistema."],
    ["Notificações","Como marcar uma notificação como lida?","Abra Notificações e utilize a ação Marcar como lida no aviso correspondente."],
    ["Notificações","Como receber avisos de compartilhamentos?","As notificações são apresentadas de acordo com as preferências e permissões configuradas para sua conta."]
  ].map(([category, question, answer]) => ({ category, question, answer }));

  let items = [];
  let activeCategory = "";

  // Armazena o ID da FAQ que está sendo editada.
// null significa que estamos cadastrando uma nova pergunta.
let editingFaqId = null;

  function getValue(row, names) {
    for (const name of names) {
      const value = row?.[name];
      if (value !== undefined && value !== null && String(value).trim() !== "") return String(value).trim();
    }
    return "";
  }

  function normalize(row) {
    return {
      id: Number(row.id ?? row.faq_id),
      categoryId: Number(
    row.faq_category_id ??
    row.faqs_category_id ??
    row.faqsCategoryId ??
    row.category_id
),
      category: getValue(row, ["categoryName","category_name","category","nameCategory","categoryTitle"]) || "Outros",
      question: getValue(row, ["question","title","pergunta","name"]),
      answer: getValue(row, ["answer","response","description","resposta"])
    };
  }

  function renderCategories() {
    if (!categoriesContainer) return;
   // Exibe somente categorias que possuem perguntas carregadas.
const names = [
    ...new Set(items.map(item => item.category))
];
    categoriesContainer.replaceChildren();
    names.forEach((name, index) => {
      const count = items.filter(item=>item.category===name).length;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "faq-category-card";
      button.dataset.category = name;
      const number = document.createElement("span"); number.className="faq-category-index"; number.textContent=String(index+1).padStart(2,"0");
      const heading = document.createElement("strong"); heading.textContent=name;
      const hint = document.createElement("small"); hint.textContent=`${count} ${count===1?"pergunta":"perguntas"}`;
      const arrow = document.createElement("span"); arrow.className="faq-category-arrow"; arrow.textContent="→";
      button.append(number,heading,hint,arrow);
      categoriesContainer.appendChild(button);
    });
  }

  function openCategory(category) {
    activeCategory=category;
    if (title) title.textContent=category;
    if (description) description.textContent=`Perguntas e orientações sobre ${category.toLocaleLowerCase("pt-BR")}.`;
    if (categoriesView) categoriesView.hidden=true;
    if (subpageView) subpageView.hidden=false;
    if (search) search.value="";
    renderQuestions();
  }

  function closeCategory() {
    activeCategory="";
    if (categoriesView) categoriesView.hidden=false;
    if (subpageView) subpageView.hidden=true;
    if (search) search.value="";
  }

  function createQuestion(item) {
    const row=document.createElement("details");
    row.className="faq-question-row";
    const summary=document.createElement("summary");
    const label=document.createElement("span"); label.textContent=item.question;
    const action=document.createElement("span"); action.className="faq-expand"; action.setAttribute("aria-hidden","true"); action.textContent="+";
    summary.append(label,action);
    const answer=document.createElement("div"); answer.className="faq-answer"; answer.textContent=item.answer;
    // Ações disponíveis exclusivamente para administradores
const actions = document.createElement("div");
actions.className = "faq-question-actions admin-only";

// Botão de edição
const editButton = document.createElement("button");
editButton.type = "button";
editButton.className = "btn btn-outline btn-sm";
editButton.textContent = "Editar";
editButton.dataset.action = "edit";
editButton.dataset.id = item.id;


// Botão de desativação
const deactivateButton = document.createElement("button");
deactivateButton.type = "button";
deactivateButton.className = "btn btn-outline btn-sm";
deactivateButton.textContent = "Desativar";
deactivateButton.dataset.action = "deactivate";
deactivateButton.dataset.id = item.id;

// Agrupa os botões
// Adiciona os botões somente para administradores
if (isAdmin) {
    actions.append(editButton, deactivateButton);
    row.append(summary, answer, actions);
} else {
    row.append(summary, answer);
}
    return row;
  }

  function renderQuestions() {
    if (!container) return;
    const term=(search?.value||"").trim().toLocaleLowerCase("pt-BR");
    const filtered=items.filter(item=>item.category===activeCategory && `${item.question} ${item.answer}`.toLocaleLowerCase("pt-BR").includes(term));
    container.replaceChildren();
    if (!filtered.length) {
      const empty=document.createElement("p"); empty.className="faq-empty"; empty.textContent="Nenhuma pergunta encontrada neste assunto.";
      container.appendChild(empty); return;
    }
    filtered.forEach(item=>container.appendChild(createQuestion(item)));
  }

  categoriesContainer?.addEventListener("click",event=>{
    const button=event.target.closest("[data-category]");
    if(button) openCategory(button.dataset.category);
  });
  back?.addEventListener("click",closeCategory);
  search?.addEventListener("input",renderQuestions);
  // Gerencia os cliques nos botões das perguntas
container?.addEventListener("click", (event) => {

    // Identifica se o clique ocorreu em um botão de ação
    const button = event.target.closest("[data-action]");

    if (!button || !isAdmin) return;

    // Recupera a ação e o ID da pergunta
    const action = button.dataset.action;
    const id = Number(button.dataset.id);

    // Abre o formulário de edição
    if (action === "edit") {
        editFaq(id);
    }


    // Solicita confirmação para desativar a pergunta
if (action === "deactivate") {
    deactivateFaq(id);
}
});

  async function load() {
    renderCategories();
    try {
      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`
      };
      const [faqResponse, categoryResponse] = await Promise.all([
        fetch(API_URL, { headers }),
        fetch(`${window.location.origin}${prefix}/api/faqs-categories/list`, { headers })
      ]);

      const [faqPayload, categoryPayload] = await Promise.all([
        faqResponse.json(),
        categoryResponse.json()
      ]);

      const categoryRows = Array.isArray(categoryPayload?.data) ? categoryPayload.data : [];
      
      // Preenche as categorias disponíveis no formulário administrativo
const categorySelect = document.querySelector("#faqCategoryInput");

if (categorySelect) {
    categorySelect.innerHTML =
        '<option value="">Selecione uma categoria</option>';

    categoryRows
        .filter(category => Number(category.active) === 1)
        .forEach(category => {
            const option = document.createElement("option");

            option.value = category.id;
            option.textContent = category.name;

            categorySelect.appendChild(option);
        });
}
      const categoryNames = new Map(categoryRows.map(category => [
        String(category.id ?? category.faqs_category_id ?? category.faqsCategoryId),
        String(category.name || category.title || "Outros")
      ]));

      const rows = Array.isArray(faqPayload?.data) ? faqPayload.data : [];
      const mapped = rows.map(row => {
        const item = normalize(row);
       
const categoryId = getValue(row, [
    "faq_category_id",
    "faqsCategoryId",
    "faqs_category_id",
    "category_id",
    "categoryId"
]);

        if (!item.category || item.category === "Outros") {
          item.category = categoryNames.get(String(categoryId)) || "Outros";
        }
        return item;
     }).filter((item, index) => {
    return (
        item.question &&
        item.answer &&
        Number(rows[index].active ?? 1) === 1
    );
});

      // Não apresenta perguntas que foram desativadas.
items = mapped;
    } catch (error) {
      console.warn("FAQ usando conteúdo local de apoio:", error);
    }
    renderCategories();
  }
  load();
})();