
(async () => {
  "use strict";

  // ==========================================
  // 1. AUTENTICAÇÃO
  // ==========================================

  const token = localStorage.getItem("token");

  if (!token) {
    window.location.replace("../public/login.html");
    return;
  }

  // ==========================================
  // 2. FUNÇÕES AUXILIARES
  // ==========================================

  // Atualiza os textos da página.
  function setText(selector, value) {
    document.querySelectorAll(selector).forEach(node => {
      node.textContent =
        value === null ||
          value === undefined ||
          value === ""
          ? "Não informado"
          : String(value);
    });
  }

  // Limpa possíveis dados fictícios do HTML.
  function showPageMessage(message) {
    setText("#studentName", message);
    setText("#studentMeta", "");
    setText("#studentStatus", "");
    setText("#studentInitials", "—");
  }

  const dataSelectors = [
    "#studentFullName",
    "#studentBirth",
    "#studentEmail",
    "#studentPhone",
    "#studentGuardian",
    "#studentRa",
    "#studentCourse",
    "#studentClass",
    "#studentShift"
  ];

  dataSelectors.forEach(selector => setText(selector, ""));

  showPageMessage("Carregando estudante...");

  // ==========================================
  // 3. HISTÓRICO
  // ==========================================

  const historyList = document.querySelector(
    "#studentHistoryList"
  );

  function showHistoryMessage(message) {
    if (!historyList) return;

    const item = document.createElement("li");

    item.className = "student-empty-state";
    item.textContent = message;

    historyList.replaceChildren(item);
  }

  showHistoryMessage(
    "Carregando informações do estudante..."
  );

  // ==========================================
  // 4. IMPORTAÇÃO DAS CLASSES E PROTOTYPES
  // ==========================================

  let Users;
  let Toast;
  let FormControllerPrototype;

  try {
    const modules = await Promise.all([
      import("../../_common/classes/Users.js"),
      import("../../_common/prototypes/Toast.js"),
      import("../../_common/prototypes/FormControllerPrototype.js")
    ]);

    Users = modules[0].default;
    Toast = modules[1].default;
    FormControllerPrototype = modules[2].default;

  } catch (error) {
    console.error(
      "Erro ao carregar módulos do SIAE:",
      error
    );

    showPageMessage(
      "Não foi possível iniciar a página"
    );

    showHistoryMessage(
      "Não foi possível carregar as informações."
    );

    return;
  }

  // ==========================================
  // 5. IDENTIFICAÇÃO DO ESTUDANTE
  // ==========================================

  // O ID é recebido pela URL.
  const studentId = new URLSearchParams(
    window.location.search
  ).get("id");

  if (
    !studentId ||
    !/^[1-9]\d*$/.test(studentId)
  ) {
    showPageMessage(
      "Estudante não identificado"
    );

    showHistoryMessage(
      "Não foi possível identificar o estudante."
    );

    Toast.mostrar(
      "O ID do estudante é inválido ou não foi informado.",
      "warning"
    );

    return;
  }

  // ==========================================
  // 6. FORMATAÇÃO DOS DADOS
  // ==========================================

  function formatBirthDate(date) {
    if (!date) return "";

    const match = String(date).match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

    return match
      ? `${match[3]}/${match[2]}/${match[1]}`
      : String(date);
  }

  // ==========================================
  // 7. FOTO DO ESTUDANTE
  // ==========================================

  function showStudentAvatar(student) {
    const initials = student.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part[0] || "")
      .join("")
      .toUpperCase();

    document.querySelectorAll(
      "#studentInitials"
    ).forEach(node => {

      node.textContent = initials || "?";

      if (!student.photoUrl) return;

      const image = document.createElement("img");

      image.src = student.photoUrl;
      image.alt = "";

      image.addEventListener(
        "error",
        () => {
          image.remove();
          node.textContent = initials || "?";
        },
        { once: true }
      );

      node.replaceChildren(image);
    });
  }

  // ==========================================
  // 8. NAVEGAÇÃO ENTRE PÁGINAS
  // ==========================================

  function updateStudentLinks() {
    // descobrir qual página estamos
    // Expressão	O que faz
    // window.location	Contém informações sobre o endereço da página atual
    // .pathname	Retorna o caminho da URL, sem os parâmetros de consulta
    // .split("/")	Divide o caminho em partes, utilizando / como separador
    // .pop()	Retira e retorna o último elemento do array
    const currentFile = window.location.pathname.split("/").pop();

    const currentTab =
      currentFile === "student-history.html"
        ? "history"
        : currentFile === "student-documents.html"
          ? "documents"
          : "details";

    // Mantém o ID do estudante em todas as abas.
    // procuro os links que estão com id data-student-tab
    document.querySelectorAll(
      "[data-student-tab]"
    ).forEach(link => {

      const href = new URL(link.href);

      href.searchParams.set("id", studentId);

      link.href = href.href;

      const active =
        link.dataset.studentTab === currentTab;

      link.classList.toggle("active", active);

      if (active) {
        link.setAttribute(
          "aria-current",
          "page"
        );
      } else {
        link.removeAttribute("aria-current");
      }
    });

    // Atualiza o ID usado em Novo Atendimento.
    const appointmentLink = document.querySelector(
      'a[href^="appointments.html?student="]'
    );

    if (appointmentLink) {
      const href = new URL(
        appointmentLink.href
      );

      href.searchParams.set(
        "student",
        studentId
      );

      appointmentLink.href = href.href;
    }
  }

  // ==========================================
  // 9. RENDERIZAÇÃO DO ESTUDANTE
  // ==========================================

  function renderStudent(student) {

    // Informações do cabeçalho.
    setText("#studentName", student.name);

    if (student.ra) {
      setText(
        "#studentMeta",
        `Matrícula ${student.ra} · ${student.className || "Turma não informada"
        }`
      );
    } else {
      setText(
        "#studentMeta",
        student.className
          ? `Turma: ${student.className}`
          : "Turma não informada"
      );
    }

    // Informações do cadastro.
    setText("#studentStatus", student.status);
    setText("#studentFullName", student.name);
    setText("#studentBirth", student.birth);
    setText("#studentEmail", student.email);
    setText("#studentPhone", student.phone);
    setText("#studentGuardian", student.guardian);
    setText("#studentRa", student.ra);
    setText("#studentCourse", student.course);
    setText("#studentClass", student.className);
    setText("#studentShift", student.shift);

    // Foto de perfil.
    showStudentAvatar(student);

    // Ainda não integramos a API de histórico.
    // Não exibimos registros demonstrativos.
    showHistoryMessage(
      "O histórico de atendimentos ainda não foi integrado nesta página."
    );

    // Os documentos são carregados pelo arquivo
    // student-documents.js, que já possui sua
    // própria integração com a API.
  }



  function configurarEdicao(student) {

    // Elementos da interface
    const botaoEditar = document.querySelector(
      "#editStudentButton"
    );

    const modal = document.querySelector(
      "#editStudentModal"
    );

    const formulario = document.querySelector(
      "#editStudentForm"
    );

    // Esta função só atua na página de detalhes.
    if (!botaoEditar || !modal || !formulario) {
      return;
    }

    // Cria um objeto que utiliza nosso prototype Form.
    const form = Object.create(FormControllerPrototype);

    form.inicializar(formulario);

    // Elementos do campo de fotografia
    const inputFoto = document.querySelector("#editStudentPhoto");
    const imagemFoto = document.querySelector("#editStudentPhotoPreviewImage");
    const placeholderFoto = document.querySelector("#editStudentPhotoPlaceholder");
    const escolherFoto = document.querySelector("#editStudentChoosePhoto");

    let urlTemporaria = null;

    function limparFotoTemporaria() {
      if (urlTemporaria) {
        URL.revokeObjectURL(urlTemporaria);
        urlTemporaria = null;
      }
    }

    function mostrarFoto(url) {
      if (!imagemFoto || !placeholderFoto) return;

      if (url) {
        imagemFoto.src = url;
        imagemFoto.hidden = false;
        placeholderFoto.hidden = true;
      } else {
        imagemFoto.removeAttribute("src");
        imagemFoto.hidden = true;
        placeholderFoto.hidden = false;
      }
    }

    escolherFoto?.addEventListener("click", () => {
      inputFoto?.click();
    });

    inputFoto?.addEventListener("change", () => {
      const arquivo = inputFoto.files?.[0];

      if (!arquivo) return;

      const tiposPermitidos = [
        "image/jpeg",
        "image/png",
        "image/webp"
      ];

      if (!tiposPermitidos.includes(arquivo.type) ||
        arquivo.size > 5 * 1024 * 1024) {

        Toast.mostrar(
          "Escolha uma imagem JPG, PNG ou WEBP de até 5 MB.",
          "warning"
        );

        inputFoto.value = "";
        return;
      }

      limparFotoTemporaria();

      urlTemporaria = URL.createObjectURL(arquivo);
      mostrarFoto(urlTemporaria);
    });


    // Preenche um campo existente.
    const preencherCampo = (id, valor) => {
      const campo = document.getElementById(id);

      if (campo) {
        campo.value = valor ?? "";
      }
    };


    /**
     * Carrega as turmas cadastradas no banco
     * e seleciona a turma atual do estudante.
     */
    async function carregarTurmas() {
      const select = document.querySelector("#editStudentClass");

      if (!select) return;

      // Bloqueia a seleção durante o carregamento.
      select.disabled = true;
      select.replaceChildren(
        new Option("Carregando turmas...", "")
      );

      try {
        const usersApi = new Users();
        usersApi.setAuthToken(token);

        // Consulta as turmas cadastradas.
        const response = await usersApi.get("/classes/list");

        if (
          Number(response?.code) !== 200 ||
          !Array.isArray(response?.data)
        ) {
          throw new Error("Não foi possível carregar as turmas.");
        }

        // Remove as opções anteriores.
        select.replaceChildren(
          new Option("Selecione uma turma", "")
        );

        // Cria uma opção para cada turma cadastrada.
        response.data.forEach(turma => {
          const option = new Option(turma.name, turma.id);
          select.add(option);
        });

        // Seleciona a turma atual do estudante.
        select.value = String(student.classId ?? "");

        // Libera o campo para edição.
        select.disabled = false;

      } catch (error) {
        console.error("Erro ao carregar turmas:", error);

        select.replaceChildren(
          new Option("Não foi possível carregar as turmas", "")
        );

        Toast.mostrar(
          "Não foi possível carregar as turmas.",
          "error"
        );
      }
    }

    // Abre a modal com os dados atuais.
    async function abrirModal() {

      if (document.body.dataset.role !== "admin") {
        Toast.mostrar(
          "Somente administradores podem editar alunos.",
          "error"
        );
        return;
      }

      form.limpar();

      limparFotoTemporaria();
      mostrarFoto(student.photoUrl || "");


      preencherCampo("editStudentName", student.name);
      preencherCampo("editStudentEmail", student.email);

      // Converte DD/MM/AAAA para AAAA-MM-DD.
      let nascimento = "";

      if (student.birth) {
        const partes = student.birth.split("/");

        if (partes.length === 3) {
          nascimento =
            `${partes[2]}-${partes[1]}-${partes[0]}`;
        }
      }

      preencherCampo("editStudentBirth", student.dateBirth);
      preencherCampo("editStudentPhone", student.phone);
      preencherCampo("editStudentGuardian", student.guardian);
      preencherCampo("editStudentCourse", student.course);
      preencherCampo("editStudentShift", student.shift);

      preencherCampo("editStudentRegistration", student.ra);



      // Busca as turmas disponíveis e seleciona a atual.

      modal.classList.add("active");

      document.querySelector("#editStudentName")?.focus();
      await carregarTurmas();
    }

    // Fecha a modal sem alterar os dados.
    function fecharModal() {
      modal.classList.remove("active");
      form.limpar();
      limparFotoTemporaria();
      botaoEditar.focus();
    }

    botaoEditar.addEventListener("click", abrirModal);

    document.querySelector(
      "#closeEditStudentModal"
    )?.addEventListener("click", fecharModal);

    document.querySelector(
      "#cancelEditStudent"
    )?.addEventListener("click", fecharModal);

    // Fecha ao clicar fora da janela.
    modal.addEventListener("click", event => {
      if (event.target === modal) {
        fecharModal();
      }
    });

    // Fecha utilizando a tecla Escape.
    document.addEventListener("keydown", event => {
      if (
        event.key === "Escape" &&
        modal.classList.contains("active")
      ) {
        fecharModal();
      }
    });

    // Impede o envio antes da integração com a API.

formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    // 1. Valida os campos obrigatórios do HTML.
    if (!formulario.reportValidity()) {
        Toast.mostrar(
            "Verifique os campos obrigatórios.",
            "warning"
        );
        return;
    }

    // 2. Obtém os dados usando nosso prototype Form.
    const dados = form.obterDados();

    // Monta apenas os campos permitidos pela API.
    const payload = {
        name: String(dados.name || "").trim(),
        email: String(dados.email || "").trim(),
        registration_number: String(
            dados.registration_number || ""
        ).trim(),
        phone: String(dados.phone || "").trim(),
        guardian: String(dados.guardian || "").trim(),
        class_id: dados.class_id,
        course: String(dados.course || "").trim(),
        shift: String(dados.shift || "").trim()
    };

    // A data é enviada quando preenchida.
    if (dados.dateBirth) {
        payload.dateBirth = dados.dateBirth;
    }

    // 3. Obtém a nova fotografia, se houver.
    const photoFile = inputFoto?.files?.[0] ?? null;

    // 4. Prepara a comunicação com a API.
    const usersApi = new Users();
    usersApi.setAuthToken(token);

    const saveButton = formulario.querySelector(
        '[type="submit"]'
    );

    const originalText = saveButton?.textContent;

    if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = "Salvando...";
    }

    let dadosSalvos = false;

    try {
        // 5. Salva os dados pessoais e acadêmicos.
        const response = await usersApi.update(
            student.id,
            payload
        );

        if (Number(response?.code) !== 200) {
            throw new Error(
                response?.message ||
                "Não foi possível atualizar o estudante."
            );
        }

        dadosSalvos = true;

        // 6. Atualiza as informações exibidas.
        student.name = payload.name;
        student.email = payload.email;
        student.ra = payload.registration_number;
        student.phone = payload.phone;
        student.guardian = payload.guardian;
        student.course = payload.course;
        student.shift = payload.shift;
        student.classId = payload.class_id;

        if (payload.dateBirth) {
            student.birth = formatBirthDate(
                payload.dateBirth
            );
        }

        const turmaSelect = document.querySelector(
            "#editStudentClass"
        );

        student.className =
            turmaSelect?.selectedOptions?.[0]?.textContent ||
            student.className;

        // 7. Envia a fotografia apenas quando alterada.
        if (photoFile) {
            const photoData = new FormData();
            photoData.append("photo", photoFile);

            const photoResponse =
                await usersApi.uploadStudentPhoto(
                    student.id,
                    photoData
                );

            if (Number(photoResponse?.code) !== 200) {
                throw new Error(
                    photoResponse?.message ||
                    "Não foi possível atualizar a fotografia."
                );
            }

            if (photoResponse?.data?.photoUrl) {
                student.photoUrl =
                    photoResponse.data.photoUrl;
            }
        }

        // 8. Atualiza a página sem recarregá-la.
        renderStudent(student);

        // Fecha a modal.
        fecharModal();

        Toast.mostrar(
            "Estudante atualizado com sucesso!",
            "success"
        );

    } catch (error) {
        console.error("Erro ao salvar estudante:", error);

        // Se os dados foram salvos, mas a foto falhou,
        // preserva as alterações na interface.
        if (dadosSalvos) {
            renderStudent(student);

            Toast.mostrar(
                "Os dados cadastrais foram salvos, mas houve um erro na fotografia.",
                "warning"
            );
        } else {
            Toast.mostrar(
                error.message ||
                "Não foi possível salvar o estudante.",
                "error"
            );
        }

    } finally {
        // Libera o botão mesmo quando ocorre um erro.
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.textContent = originalText;
        }
    }
});


  }





  // Atualiza os links antes de consultar os dados.
  updateStudentLinks();

  // ==========================================
  // 10. CONSULTA À API
  // ==========================================

  try {

    // Utiliza a classe Users do SIAE.
    const users = new Users();

    // Adiciona o token de autenticação.
    users.setAuthToken(token);

    // Busca os usuários cadastrados.
    const response = await users.get(
      "/users/list"
    );

    // Verifica o retorno da API.
    if (
      Number(response?.code) !== 200 ||
      !Array.isArray(response?.data)
    ) {
      throw new Error(
        response?.message ||
        "Não foi possível consultar os estudantes."
      );
    }

    // Localiza somente o estudante selecionado.
    const record = response.data.find(user =>
      String(user.id) === studentId &&
      user.enrollment === "estudante"
    );

    if (!record) {
      throw new Error(
        "Estudante não encontrado ou sem permissão de consulta."
      );
    }

    // ========================================
    // 11. ORGANIZAÇÃO DO REGISTRO
    // ========================================


    const student = {
      id: record.id,
      name: record.name || "Estudante",

      // Matrícula institucional.
      ra: record.registrationNumber
        ?? record.registration_number
        ?? record.enrollmentNumber
        ?? record.ra
        ?? "",

      // Turma.
      classId: record.classId ?? record.class_id ?? null,
      className: record.className || "",

      // Dados acadêmicos.
      course: record.course ?? record.courseName ?? "",
      shift: record.shift || "",

      // Situação cadastral.
      status: Number(record.active) === 1
        ? "Ativo"
        : "Inativo",

      // Dados pessoais.
      birth: formatBirthDate(
        record.dateBirth ?? record.date_birth
      ),
      email: record.email || "",
      phone: record.phone || "",
      guardian: record.guardian || "",

      // Fotografia.
      photoUrl: record.photoUrl || ""
    };


    // Renderiza os dados do estudante na página.
    renderStudent(student);

    // Configura o formulário de edição.
    configurarEdicao(student);

  } catch (error) {

    console.error(
      "Erro ao carregar estudante:",
      error
    );

    showPageMessage(
      "Não foi possível carregar o estudante"
    );

    showHistoryMessage(
      "Não foi possível carregar as informações do estudante."
    );

    // Utiliza o prototype Toast do projeto.
    Toast.mostrar(
      error.message ||
      "Erro ao carregar os dados do estudante.",
      "error"
    );
  }

})();
