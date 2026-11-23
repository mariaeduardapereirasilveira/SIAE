
import Toast from "../../_common/prototypes/Toast.js";

// ============================================
// CONFIGURAÇÕES
// ============================================

// Identifica a pasta principal do SIAE.
const caminho = window.location.pathname
    .split("/")
    .filter(Boolean);

const projeto = caminho[0];

const API_BASE = `${window.location.origin}/${projeto}/api`;
const SITE_BASE = `${window.location.origin}/${projeto}/`;

// Recupera o token do administrador.
const token = localStorage.getItem("token");

// Recupera o ID informado na URL.
// Exemplo: professional-details.html?id=20
const parametros = new URLSearchParams(window.location.search);
const profissionalId = parametros.get("id");

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

// Preenche um elemento com um valor da API.
function preencherCampo(id, valor) {
    const elemento = document.getElementById(id);

    if (!elemento) return;

    elemento.textContent =
        valor !== null &&
        valor !== undefined &&
        String(valor).trim() !== ""
            ? String(valor)
            : "Não informado";
}

// Converte a data do MySQL para o formato brasileiro.
function formatarData(valor) {
    if (!valor) return null;

    const correspondencia = String(valor)
        .match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (!correspondencia) return valor;

    const [, ano, mes, dia] = correspondencia;

    return `${dia}/${mes}/${ano}`;
}

// Retorna as iniciais do profissional.
function obterIniciais(nome) {
    return String(nome || "?")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(parte => parte.charAt(0))
        .join("")
        .toUpperCase();
}

// Monta a URL da foto a partir do caminho
// utilizado pelo upload de usuários.
function resolverFoto(foto) {
    if (!foto || typeof foto !== "string") {
        return null;
    }

    const caminhoNormalizado = foto
        .trim()
        .replace(/\\/g, "/");

    const correspondencia = caminhoNormalizado.match(
        /(?:^|\/)uploads\/users\/([a-f0-9]{32}\.(?:jpg|png|webp))(?:[?#].*)?$/i
    );

    if (!correspondencia) return null;

    return new URL(
        `uploads/users/${correspondencia[1]}`,
        SITE_BASE
    ).href;
}

// Exibe a fotografia ou as iniciais.
function exibirFoto(profissional) {
    const avatar = document.getElementById(
        "professionalAvatar"
    );

    if (!avatar) return;

    const iniciais = obterIniciais(profissional.name);

    avatar.textContent = iniciais;

    const foto = resolverFoto(
        profissional.photoUrl || profissional.photo
    );

    if (!foto) return;

    const imagem = document.createElement("img");

    imagem.src = foto;
    imagem.alt = `Foto de ${profissional.name}`;

    // Caso a imagem não exista, mostra as iniciais.
    imagem.addEventListener("error", () => {
        avatar.textContent = iniciais;
    });

    avatar.replaceChildren(imagem);
}

// ============================================
// PREENCHIMENTO DA PÁGINA
// ============================================

let profissionalAtual = null;
function exibirProfissional(profissional) {
    profissionalAtual = profissional;
    const ativo = Number(profissional.active) === 1;
    // Guarda os dados do profissional carregado pela API.

    // Cabeçalho principal.
    preencherCampo(
        "professionalName",
        profissional.name
    );

    const resumo = [
        profissional.sectorName,
        profissional.professionalFunction
    ].filter(Boolean).join(" · ");

    preencherCampo("professionalMeta", resumo);

    preencherCampo(
        "professionalStatus",
        ativo ? "Ativo" : "Inativo"
    );

    exibirFoto(profissional);

    // Dados pessoais.
    preencherCampo(
        "professionalFullName",
        profissional.name
    );

    preencherCampo(
        "professionalBirth",
        formatarData(profissional.dateBirth)
    );

    preencherCampo(
        "professionalEmail",
        profissional.email
    );

    preencherCampo(
        "professionalPhone",
        profissional.professionalPhone
    );

    // Dados profissionais.
    preencherCampo(
        "professionalFunction",
        profissional.professionalFunction
    );

    preencherCampo(
        "professionalSector",
        profissional.sectorName
    );

    preencherCampo(
        "professionalRegister",
        profissional.professionalRegister
    );

    preencherCampo(
        "professionalActive",
        ativo ? "Ativo" : "Inativo"
    );

    // Se o profissional estiver desativado,
    // o retorno aponta para a listagem de inativos.
    const voltar = document.getElementById(
        "backToProfessionals"
    );

    if (!ativo && voltar) {
        voltar.href = "professionals-inactive.html";
        voltar.textContent =
            "← Voltar para profissionais desativados";
    }
}

// ============================================
// CONSULTA À API
// ============================================

async function carregarProfissional() {

    // Verifica se existe uma sessão.
    if (!token) {
        window.location.href = "../public/login.html";
        return;
    }

    // Verifica se o ID é válido.
    if (!profissionalId || !/^[1-9]\d*$/.test(profissionalId)) {
        preencherCampo(
            "professionalName",
            "Profissional não identificado"
        );

        Toast.mostrar(
            "ID do profissional inválido.",
            "warning"
        );

        return;
    }

    try {
        const resposta = await fetch(
            `${API_BASE}/users/list`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json"
                }
            }
        );

        const resultado = await resposta.json();

        if (
            !resposta.ok ||
            Number(resultado.code) !== 200 ||
            !Array.isArray(resultado.data)
        ) {
            throw new Error(
                resultado.message ||
                "Não foi possível consultar os profissionais."
            );
        }

        // Procura somente o profissional correspondente
        // ao ID recebido pela URL.
        const profissional = resultado.data.find(usuario =>
            String(usuario.id) === String(profissionalId) &&
            usuario.enrollment === "profissional"
        );

        if (!profissional) {
            preencherCampo(
                "professionalName",
                "Profissional não encontrado"
            );

            Toast.mostrar(
                "Não foi possível encontrar esse profissional.",
                "warning"
            );

            return;
        }

        // Preenche os elementos do HTML.
        exibirProfissional(profissional);

    } catch (erro) {
        console.error(
            "Erro ao carregar profissional:",
            erro
        );

        preencherCampo(
            "professionalName",
            "Erro ao carregar profissional"
        );

        Toast.mostrar(
            erro.message ||
            "Não foi possível carregar os detalhes.",
            "error"
        );
    }
}

// Inicializa a página.
carregarProfissional();

// ==========================================
// EDIÇÃO DO PROFISSIONAL
// ==========================================

// Elementos principais.
const modalEdicao = document.getElementById("editProfessionalModal");
const formularioEdicao = document.getElementById("editProfessionalForm");
const botaoEditar = document.getElementById("editProfessionalButton");

const campoFoto = document.getElementById("editProfessionalPhoto");
const botaoEscolherFoto = document.getElementById("editProfessionalChoosePhoto");

const previaFoto = document.getElementById("editProfessionalPhotoPreview");
const imagemPrevia = document.getElementById("editProfessionalPhotoPreviewImage");
const textoSemFoto = document.getElementById("editProfessionalPhotoPlaceholder");

// Guarda a URL temporária de uma fotografia escolhida.
let urlFotoTemporaria = null;

// Preenche inputs e selects.
function preencherCampoEdicao(id, valor) {
    const campo = document.getElementById(id);

    if (!campo) return;

    campo.value = valor ?? "";
}

// Mostra uma foto ou o texto "Sem foto".
function atualizarPreviaFoto(url) {
    if (!imagemPrevia || !textoSemFoto || !previaFoto) return;

    if (url) {
        imagemPrevia.src = url;
        imagemPrevia.hidden = false;
        textoSemFoto.hidden = true;
        previaFoto.classList.remove("is-empty");
    } else {
        imagemPrevia.removeAttribute("src");
        imagemPrevia.hidden = true;
        textoSemFoto.hidden = false;
        previaFoto.classList.add("is-empty");
    }
}

// Libera a URL temporária criada pelo navegador.
function limparFotoTemporaria() {
    if (urlFotoTemporaria) {
        URL.revokeObjectURL(urlFotoTemporaria);
        urlFotoTemporaria = null;
    }
}

// ==========================================
// CARREGAMENTO DOS SETORES
// ==========================================

async function carregarSetoresEdicao(profissional) {

    const campoSetor = document.getElementById(
        "editProfessionalSector"
    );

    if (!campoSetor) return;

    // Impede alterações enquanto os dados carregam.
    campoSetor.disabled = true;

    campoSetor.replaceChildren(
        new Option("Carregando setores...", "")
    );

    try {

        // Consulta os setores ativos cadastrados no SIAE.
        const resposta = await fetch(
            `${API_BASE}/sectors/list`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json"
                }
            }
        );

        const resultado = await resposta.json();

        // Verifica se a API retornou corretamente a lista.
        if (
            !resposta.ok ||
            Number(resultado.code) !== 200 ||
            !Array.isArray(resultado.data)
        ) {
            throw new Error(
                resultado.message ||
                "Não foi possível carregar os setores."
            );
        }

        // Limpa as opções antigas.
        campoSetor.replaceChildren(
            new Option("Selecione um setor", "")
        );

        // Insere os setores retornados pelo banco.
        resultado.data.forEach(setor => {

            const opcao = new Option(
                setor.name,
                String(setor.id)
            );

            campoSetor.add(opcao);

        });

        // Recupera o setor atualmente associado
        // ao profissional.
        const setorAtual = String(
            profissional.sectorId ??
            profissional.sector_id ??
            ""
        );

        // Verifica se o setor atual está na lista.
        const setorDisponivel = Array.from(
            campoSetor.options
        ).some(opcao => opcao.value === setorAtual);

        if (setorAtual && setorDisponivel) {

            // Seleciona automaticamente o setor atual.
            campoSetor.value = setorAtual;

        } else if (setorAtual) {

            // Preserva a informação caso o setor
            // tenha sido desativado.
            const opcaoAntiga = new Option(
                `${profissional.sectorName || "Setor atual"} (indisponível)`,
                setorAtual
            );

            // Exige selecionar um setor ativo
            // antes de salvar uma alteração.
            opcaoAntiga.disabled = true;

            campoSetor.add(opcaoAntiga);
            campoSetor.value = setorAtual;
        }

        // Libera a seleção dos setores.
        campoSetor.disabled = false;

    } catch (erro) {

        console.error(
            "Erro ao carregar setores:",
            erro
        );

        campoSetor.replaceChildren(
            new Option(
                "Não foi possível carregar os setores",
                ""
            )
        );

        Toast.mostrar(
            erro.message || "Erro ao consultar os setores.",
            "error"
        );
    }
}

// Abre a modal com as informações cadastradas.
async function abrirModalEdicao() {
    if (!profissionalAtual || !modalEdicao) {
        Toast.mostrar(
            "Os dados do profissional ainda não foram carregados.",
            "warning"
        );
        return;
    }

    const profissional = profissionalAtual;

    // Dados pessoais.
    preencherCampoEdicao("editProfessionalName", profissional.name);
    preencherCampoEdicao("editProfessionalEmail", profissional.email);

    preencherCampoEdicao(
        "editProfessionalBirth",
        String(profissional.dateBirth || "").slice(0, 10)
    );

    preencherCampoEdicao(
        "editProfessionalPhone",
        profissional.professionalPhone
    );

    // Dados profissionais.
    preencherCampoEdicao(
        "editProfessionalRegister",
        profissional.professionalRegister
    );

    // Função: seleciona a opção correspondente.
    const campoFuncao = document.getElementById("editProfessionalFunction");
    const funcaoAtual = profissional.professionalFunction || "";

    if (campoFuncao) {
        const existeOpcao = Array.from(campoFuncao.options)
            .some(opcao => opcao.value === funcaoAtual);

        if (funcaoAtual && !existeOpcao) {
            campoFuncao.add(new Option(funcaoAtual, funcaoAtual));
        }

        campoFuncao.value = funcaoAtual;
    }

     

    // Fotografia atual.
    limparFotoTemporaria();

    if (campoFoto) {
        campoFoto.value = "";
    }

    const fotoAtual = resolverFoto(
        profissional.photoUrl || profissional.photo
    );

    atualizarPreviaFoto(fotoAtual);

    // Abre a modal.
    modalEdicao.classList.add("active");
    document.body.style.overflow = "hidden";

    document.getElementById("editProfessionalName")?.focus();


    // Carrega os setores e seleciona o atual.
await carregarSetoresEdicao(profissional);
}

// Fecha a modal.
function fecharModalEdicao() {
    if (!modalEdicao) return;

    modalEdicao.classList.remove("active");
    document.body.style.overflow = "";

    formularioEdicao?.reset();
    limparFotoTemporaria();

    botaoEditar?.focus();
}

// ==========================================
// EVENTOS
// ==========================================

// Abrir edição.
botaoEditar?.addEventListener("click", abrirModalEdicao);

// Botões para fechar.
document.getElementById("closeEditProfessionalModal")
    ?.addEventListener("click", fecharModalEdicao);

document.getElementById("cancelEditProfessional")
    ?.addEventListener("click", fecharModalEdicao);

// Fechar clicando fora da janela.
modalEdicao?.addEventListener("click", evento => {
    if (evento.target === modalEdicao) {
        fecharModalEdicao();
    }
});

// Fechar pressionando Escape.
document.addEventListener("keydown", evento => {
    if (
        evento.key === "Escape" &&
        modalEdicao?.classList.contains("active")
    ) {
        fecharModalEdicao();
    }
});

// Abrir o seletor de arquivos.
botaoEscolherFoto?.addEventListener("click", () => {
    campoFoto?.click();
});

// Exibir a fotografia selecionada.
campoFoto?.addEventListener("change", () => {
    const arquivo = campoFoto.files?.[0];

    if (!arquivo) return;

    // Valida o formato.
    const formatosPermitidos = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!formatosPermitidos.includes(arquivo.type)) {
        campoFoto.value = "";

        Toast.mostrar(
            "Escolha uma imagem JPG, PNG ou WEBP.",
            "warning"
        );

        return;
    }

    // Valida o tamanho: máximo de 5 MB.
    if (arquivo.size > 5 * 1024 * 1024) {
        campoFoto.value = "";

        Toast.mostrar(
            "A fotografia deve ter no máximo 5 MB.",
            "warning"
        );

        return;
    }

    limparFotoTemporaria();

    urlFotoTemporaria = URL.createObjectURL(arquivo);

    atualizarPreviaFoto(urlFotoTemporaria);
});

// Não envia os dados até implementarmos o endpoint.

// ==========================================
// SALVAMENTO DA EDIÇÃO DO PROFISSIONAL
// ==========================================

formularioEdicao?.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    // Impede o envio se os dados ainda não carregaram.
    if (!profissionalAtual) {
        Toast.mostrar(
            "Não foi possível identificar o profissional.",
            "error"
        );
        return;
    }

    // Valida os campos obrigatórios do HTML.
    if (!formularioEdicao.reportValidity()) {
        return;
    }

    const botaoSalvar = document.getElementById(
        "saveProfessionalChanges"
    );

    const campoSetor = document.getElementById(
        "editProfessionalSector"
    );

    // O banco utiliza o ID do setor, não o nome.
    const sectorId = campoSetor?.value;

    if (!sectorId || !/^[1-9]\d*$/.test(sectorId)) {
        Toast.mostrar(
            "Selecione um setor válido.",
            "warning"
        );
        return;
    }

    // Evita vários envios simultâneos.
    if (botaoSalvar?.disabled) return;

    try {
        // Bloqueia o botão durante o salvamento.
        if (botaoSalvar) {
            botaoSalvar.disabled = true;
            botaoSalvar.textContent = "Salvando...";
        }

        // Recupera todos os campos do formulário.
        const dados = new FormData(formularioEdicao);

        // Identifica o profissional que será alterado.
        dados.set(
            "user_id",
            String(profissionalAtual.id)
        );

        // Envia o identificador do setor.
        dados.set("sector_id", sectorId);

        // Remove o campo antigo que contém o ID
        // com o nome "sector".
        dados.delete("sector");

        // Registro é opcional, mas a coluna do banco
        // precisa receber uma string.
        dados.set(
            "register",
            String(dados.get("register") ?? "").trim()
        );

        // Se nenhuma nova foto foi selecionada,
        // a API mantém a fotografia atual.
        const novaFoto = document.getElementById(
            "editProfessionalPhoto"
        )?.files?.[0];

        if (!novaFoto) {
            dados.delete("photo");
        }

        // Envia os dados para a nova rota.
        const resposta = await fetch(
            `${API_BASE}/users/professionals/update`,
            {
                method: "POST",

                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                },

                body: dados
            }
        );

        // A API deve responder em JSON.
        // Caso haja um erro de execução no PHP,
        // essa conversão também pode falhar.
        let resultado;

        try {
            resultado = await resposta.json();
        } catch {
            throw new Error(
                "O servidor não retornou uma resposta JSON válida. " +
                "Confira o Console e o log do PHP."
            );
        }

        // Verifica o código HTTP e a resposta da API.
        if (
            !resposta.ok ||
            Number(resultado.code) !== 200 ||
            resultado.status !== "success"
        ) {
            throw new Error(
                resultado.message ||
                "Não foi possível salvar as alterações."
            );
        }

        // Fecha a janela e libera seus recursos.
        fecharModalEdicao();

        // Mostra a mensagem retornada pela API.
        Toast.mostrarResposta(resultado);

        // Consulta novamente os dados do banco.
        // Isso atualiza nome, setor, função,
        // telefone, registro e fotografia na página.
        await carregarProfissional();

    } catch (erro) {

        console.error(
            "Erro ao atualizar profissional:",
            erro
        );

        Toast.mostrar(
            erro.message ||
            "Não foi possível atualizar o profissional.",
            "error"
        );

    } finally {

        // Restaura o botão independentemente
        // do resultado da operação.
        if (botaoSalvar) {
            botaoSalvar.disabled = false;
            botaoSalvar.textContent = "Salvar alterações";
        }
    }
});

