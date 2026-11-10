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
  const description = document.querySelector("#faqCategoryDescription");
  const search = document.querySelector("#faqSearch");
  const back = document.querySelector("#faqBackButton");

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

  let items = [...fallback];
  let activeCategory = "";

  function getValue(row, names) {
    for (const name of names) {
      const value = row?.[name];
      if (value !== undefined && value !== null && String(value).trim() !== "") return String(value).trim();
    }
    return "";
  }

  function normalize(row) {
    return {
      category: getValue(row, ["categoryName","category_name","category","nameCategory","categoryTitle"]) || "Outros",
      question: getValue(row, ["question","title","pergunta","name"]),
      answer: getValue(row, ["answer","response","description","resposta"])
    };
  }

  function renderCategories() {
    if (!categoriesContainer) return;
    const names = [...new Set([...fallback.map(x=>x.category), ...items.map(x=>x.category)])];
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
    row.append(summary,answer);
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
      const categoryNames = new Map(categoryRows.map(category => [
        String(category.id ?? category.faqs_category_id ?? category.faqsCategoryId),
        String(category.name || category.title || "Outros")
      ]));

      const rows = Array.isArray(faqPayload?.data) ? faqPayload.data : [];
      const mapped = rows.map(row => {
        const item = normalize(row);
        const categoryId = getValue(row, ["faqsCategoryId", "faqs_category_id", "category_id", "categoryId"]);
        if (!item.category || item.category === "Outros") {
          item.category = categoryNames.get(String(categoryId)) || "Outros";
        }
        return item;
      }).filter(item => item.question && item.answer);

      if (mapped.length) items = mapped;
    } catch (error) {
      console.warn("FAQ usando conteúdo local de apoio:", error);
    }
    renderCategories();
  }
  load();
})();