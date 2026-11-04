// ============================================================
// 1. INICIALIZAÇÃO DO SCRIPT
// ============================================================

// IIFE (Immediately Invoked Function Expression)
//
// É uma função criada e executada imediatamente.
//
// Ela serve para organizar o código e evitar que suas variáveis
// e funções fiquem disponíveis globalmente.
//
// O 'use strict' ativa o modo estrito do JavaScript,
// ajudando a evitar alguns erros de programação.

(() => {
    'use strict';


    // ========================================================
    // 2. CONFIGURAÇÕES E ELEMENTOS HTML
    // ========================================================

    // Endereço-base da API do SIAE.
    // Todos os endpoints serão acessados a partir desse endereço.
    const API_BASE = 'http://localhost/SIAE/api';

    // Recupera o token de autenticação armazenado no navegador.
    // Ele será enviado à API para identificar o usuário.
    const token = localStorage.getItem('token');


    // Recupera os elementos HTML que serão manipulados pelo JS.
    //
    // document.getElementById() procura um elemento pelo seu ID.

    const photoInput = document.getElementById('profilePhotoInput');
    const chooseButton = document.getElementById('chooseProfilePhoto');
    const cancelButton = document.getElementById('cancelProfilePhoto');
    const saveButton = document.getElementById('saveProfilePhoto');

    const photoElement = document.getElementById('profilePhoto');
    const initialsElement = document.getElementById('profilePhotoInitials');

    const feedback = document.getElementById('profilePhotoFeedback');


    // ========================================================
    // 3. VARIÁVEIS DE CONTROLE
    // ========================================================

    // Guarda os dados do perfil que foram recebidos da API.
    // Começa como null porque ainda não carregamos o perfil.
    let currentProfile = null;

    // Guarda temporariamente o arquivo de imagem escolhido.
    // Ele só será enviado ao servidor quando o usuário clicar em Salvar.
    let pendingFile = null;

    // Guarda o endereço temporário criado para mostrar a prévia da foto.
    let previewObjectUrl = null;


    // ========================================================
    // 4. VERIFICAÇÃO DE AUTENTICAÇÃO
    // ========================================================

    // Se não existe token, o usuário não possui uma sessão
    // disponível para acessar a página de perfil.
    if (!token) {

        // Redireciona o usuário para a página de login.
        window.location.href = '../public/login.html';

        // Interrompe a execução da IIFE.
        return;
    }


    // ========================================================
    // 5. FUNÇÕES AUXILIARES
    // ========================================================


    // --------------------------------------------------------
    // 5.1. Gerar iniciais do nome
    // --------------------------------------------------------

    // Recebe um nome e retorna as iniciais das duas primeiras palavras.
    //
    // Exemplo:
    // "Maria Eduarda Silveira" -> "ME"
    //
    // As iniciais serão utilizadas quando o usuário não tiver foto.

    const initials = (name) => {

        // Garante que o valor seja uma string.
        // Se não existir nome, utiliza "Usuário".
        const safeName = String(name || 'Usuário');

        // Separa o nome em palavras e remove espaços desnecessários.
        const words = safeName.trim().split(/\s+/);

        // Pega somente as duas primeiras palavras.
        const firstWords = words.slice(0, 2);

        // Pega a primeira letra de cada palavra.
        const letters = firstWords.map(word => word[0] || '');

        // Junta as letras e transforma em maiúsculas.
        return letters.join('').toUpperCase() || 'US';
    };


    // --------------------------------------------------------
    // 5.2. Construir o endereço da foto
    // --------------------------------------------------------

    // Recebe o caminho da foto armazenado no banco de dados
    // e transforma esse caminho em uma URL que o navegador consegue acessar.

    function resolvePhotoUrl(photo) {

        // Se não existe foto ou o valor não é uma string,
        // retorna uma string vazia.
        if (!photo || typeof photo !== 'string') {
            return '';
        }

        // Remove espaços nas extremidades e substitui barras invertidas
        // por barras normais.
        const normalized = photo.trim().replace(/\\/g, '/');

        let path = normalized;

        // Verifica se o valor recebido já é uma URL completa.
        if (/^https?:\/\//i.test(normalized)) {

            try {

                // Extrai apenas o caminho da URL.
                path = new URL(normalized).pathname;

            } catch (error) {

                // Se a URL for inválida, retorna vazio.
                return '';
            }
        }

        // Remove possíveis parâmetros e fragmentos da URL.
        path = path.split(/[?#]/, 1)[0];

        // Verifica se o caminho possui o formato esperado:
        //
        // uploads/users/identificador.jpg
        //
        // O identificador deve possuir 32 caracteres hexadecimais.
        // São aceitas imagens JPG, PNG e WEBP.

        const match =
            path.match(/(?:^|\/)uploads\/users\/([a-f0-9]{32}\.(?:jpg|png|webp))$/i)
            ||
            path.match(/^([a-f0-9]{32}\.(?:jpg|png|webp))$/i);

        // Se o caminho não corresponde ao formato esperado,
        // não considera a foto válida.
        if (!match) {
            return '';
        }

        // Obtém o endereço principal do site.
        // API_BASE termina em /api, então ../ retorna à raiz do SIAE.
        const siteBase = new URL('../', `${API_BASE}/`);

        // Monta a URL final da imagem.
        return new URL(`uploads/users/${match[1]}`, siteBase).href;
    }


    // --------------------------------------------------------
    // 5.3. Exibir a foto ou as iniciais
    // --------------------------------------------------------

    // Recebe:
    // photo: caminho da foto ou endereço temporário da prévia.
    // name: nome do usuário.
    // isPreview: indica se a imagem é uma prévia temporária.

    function setPhoto(photo, name, isPreview = false) {

        // Se for uma prévia, utiliza o endereço recebido diretamente.
        // Caso contrário, transforma o caminho em uma URL válida.
        const url = isPreview ? photo : resolvePhotoUrl(photo);

        // Atualiza as iniciais do usuário.
        initialsElement.textContent = initials(name);

        // Se não existe uma URL válida, exibe somente as iniciais.
        if (!url) {

            photoElement.removeAttribute('src');
            photoElement.hidden = true;
            initialsElement.hidden = false;

            return;
        }

        // Define o endereço da imagem.
        photoElement.src = url;

        // Define o texto alternativo da imagem.
        photoElement.alt = `Foto de ${name || 'usuário'}`;

        // Exibe a imagem e esconde as iniciais.
        photoElement.hidden = false;
        initialsElement.hidden = true;

        // Caso o navegador não consiga carregar a imagem,
        // esconde a foto e volta a exibir as iniciais.
        photoElement.onerror = () => {

            photoElement.hidden = true;
            initialsElement.hidden = false;
        };
    }


    // --------------------------------------------------------
    // 5.4. Exibir mensagens para o usuário
    // --------------------------------------------------------

    // Recebe uma mensagem e um tipo opcional.
    //
    // Os tipos podem ser:
    // 'success' -> mensagem de sucesso.
    // 'error'   -> mensagem de erro.
    // ''        -> mensagem sem classificação.

    function setFeedback(message, type = '') {

        // Define o texto da mensagem.
        feedback.textContent = message;

        // Remove as classes anteriores.
        feedback.classList.remove('is-success', 'is-error');

        // Se foi informado um tipo, adiciona a classe correspondente.
        if (type) {
            feedback.classList.add(`is-${type}`);
        }
    }


    // --------------------------------------------------------
    // 5.5. Formatar a data de nascimento
    // --------------------------------------------------------

    // Recebe uma data no formato AAAA-MM-DD
    // e transforma em DD/MM/AAAA.

    function showDate(value) {

        // Se não existe data, exibe um traço.
        if (!value) {
            return '—';
        }

        // Procura o ano, o mês e o dia.
        const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);

        // Se encontrou uma data válida no formato esperado,
        // reorganiza os valores.
        return match
            ? `${match[3]}/${match[2]}/${match[1]}`
            : String(value);
    }


    // --------------------------------------------------------
    // 5.6. Traduzir o tipo de usuário
    // --------------------------------------------------------

    // Recebe o valor de enrollment vindo da API
    // e retorna uma versão mais amigável para exibição.

    function roleName(enrollment) {

        const roles = {
            administrador: 'Administrador',
            profissional: 'Profissional',
            estudante: 'Estudante'
        };

        // Procura a tradução correspondente.
        // Se não encontrar, retorna o próprio valor recebido.
        return roles[String(enrollment || '').toLowerCase()]
            || enrollment
            || '—';
    }


    // ========================================================
    // 6. ATUALIZAÇÃO DOS ELEMENTOS DA NAVEGAÇÃO
    // ========================================================

    // Atualiza o nome, o tipo de usuário e os avatares
    // que aparecem no menu lateral e no cabeçalho.

    function updateNavigationAvatars(profile) {

        const name = profile.name || 'Usuário';
        const photo = profile.photoUrl || profile.photo || '';

        // Atualiza o nome completo.
        document.querySelectorAll('#userName, [data-user-name]')
            .forEach(element => {
                element.textContent = name;
            });

        // Atualiza o primeiro nome no cabeçalho.
        document.querySelectorAll('#headerName')
            .forEach(element => {
                element.textContent = name.split(/\s+/)[0] || name;
            });

        // Atualiza o tipo de usuário.
        document.querySelectorAll('#userRole')
            .forEach(element => {
                element.textContent = roleName(profile.enrollment);
            });

        // Localiza os elementos que representam os avatares.
        document.querySelectorAll(
            '.sidebar-avatar, .header-user-avatar, .topbar-user .avatar, [data-user-initials]'
        ).forEach(element => {

            // Primeiro, coloca as iniciais no elemento.
            // Isso também remove uma imagem anterior, se existir.
            element.textContent = initials(name);

            // Converte o caminho da foto em uma URL.
            const url = resolvePhotoUrl(photo);

            // Se não existe foto, mantém somente as iniciais.
            if (!url) {
                return;
            }

            // Cria um elemento HTML <img>.
            const image = document.createElement('img');

            image.className = 'user-avatar-image';
            image.alt = '';
            image.src = url;

            // Se a imagem não carregar, remove o elemento <img>.
            image.addEventListener('error', () => {
                image.remove();
            }, { once: true });

            // Insere a imagem dentro do avatar.
            element.appendChild(image);
        });
    }


    // ========================================================
    // 7. PREENCHER A PÁGINA COM OS DADOS DO PERFIL
    // ========================================================

    // Recebe o objeto profile enviado pela API
    // e preenche os elementos HTML com os dados do usuário.

    function fillProfile(profile) {

        // Guarda os dados recebidos para utilização posterior.
        currentProfile = profile;

        // Recupera o nome do perfil.
        // Se não existir, tenta utilizar o nome salvo no navegador.
        const name = profile.name
            || localStorage.getItem('userName')
            || 'Usuário';


        // ----------------------------------------------------
        // 7.1. Informações principais
        // ----------------------------------------------------

        document.getElementById('profileName').textContent = name;

        // Exibe o tipo de usuário e, quando existir,
        // o setor ou a turma correspondente.
        document.getElementById('profileRole').textContent =
            `${roleName(profile.enrollment)}${
                profile.sectorName
                    ? ` · ${profile.sectorName}`
                    : profile.className
                        ? ` · ${profile.className}`
                        : ''
            }`;


        // ----------------------------------------------------
        // 7.2. Informações pessoais
        // ----------------------------------------------------

        document.getElementById('fieldName').textContent = name;

        document.getElementById('fieldEmail').textContent =
            profile.email || '—';

        document.getElementById('fieldEnrollment').textContent =
            roleName(profile.enrollment);

        document.getElementById('fieldDateBirth').textContent =
            showDate(profile.dateBirth);

        document.getElementById('fieldSector').textContent =
            profile.sectorName || '—';

        document.getElementById('fieldClass').textContent =
            profile.className || '—';


        // ----------------------------------------------------
        // 7.3. Situação da conta
        // ----------------------------------------------------

        const status = document.getElementById('fieldStatus');

        // Verifica se o usuário está ativo.
        const active = Number(profile.active) === 1;

        // Define o texto correspondente.
        status.textContent = active ? 'Ativo' : 'Inativo';

        // Adiciona ou remove a classe de usuário inativo.
        status.classList.toggle('is-inactive', !active);


        // ----------------------------------------------------
        // 7.4. Exibição de setor e turma
        // ----------------------------------------------------

        // Estudantes não exibem a linha de setor.
        document.getElementById('profileSectorRow').hidden =
            profile.enrollment === 'estudante';

        // Somente estudantes exibem a linha de turma.
        document.getElementById('profileClassRow').hidden =
            profile.enrollment !== 'estudante';


        // ----------------------------------------------------
        // 7.5. Foto do perfil
        // ----------------------------------------------------

        // A API pode retornar photoUrl ou photo.
        const persistedPhoto = profile.photoUrl || profile.photo || '';

        // Exibe a foto ou as iniciais.
        setPhoto(persistedPhoto, name);


        // ----------------------------------------------------
        // 7.6. Armazenamento de informações no navegador
        // ----------------------------------------------------

        // Salva algumas informações para serem utilizadas
        // por outras páginas do sistema.
        localStorage.setItem('userName', name);

        localStorage.setItem(
            'enrollment',
            profile.enrollment || localStorage.getItem('enrollment') || ''
        );

        // Salva o caminho da foto, se existir.
        if (persistedPhoto) {

            localStorage.setItem('userPhoto', persistedPhoto);

        } else {

            localStorage.removeItem('userPhoto');
        }


        // Atualiza também o menu lateral e o cabeçalho.
        updateNavigationAvatars(profile);
    }


    // ========================================================
    // 8. CARREGAR OS DADOS DO PERFIL PELA API
    // ========================================================

    // async permite utilizar await dentro da função.
    //
    // await aguarda a conclusão de uma operação assíncrona,
    // como uma requisição HTTP.

    async function loadProfile() {

        try {

            // Faz uma requisição GET para o endpoint /users/me.
            //
            // O token é enviado no cabeçalho Authorization.
            // Bearer é o padrão utilizado para enviar esse token.

            const response = await fetch(`${API_BASE}/users/me`, {

                headers: {
                    Authorization: `Bearer ${token}`
                }
            });


            // Converte a resposta da API para um objeto JavaScript.
            const result = await response.json();


            // Verifica se a resposta foi bem-sucedida
            // e se a API retornou os dados do perfil.
            if (
                !response.ok ||
                result?.code !== 200 ||
                !result.data
            ) {

                throw new Error(
                    result?.message || 'Não foi possível carregar o perfil.'
                );
            }


            // Se tudo deu certo, preenche a página.
            fillProfile(result.data);


        } catch (error) {

            // Exibe o erro no console do navegador.
            console.error('Erro ao carregar perfil:', error);

            // Exibe uma mensagem na página.
            setFeedback(
                error.message || 'Erro ao carregar o perfil.',
                'error'
            );

            // Se a mensagem indicar problema de autenticação,
            // remove o token e redireciona para o login.
            if (
                error.message &&
                /sessão inválida|expirada|autenticado/i.test(error.message)
            ) {

                localStorage.removeItem('token');

                window.location.href = '../public/login.html';
            }
        }
    }


    // ========================================================
    // 9. CANCELAR OU REINICIAR A ALTERAÇÃO DA FOTO
    // ========================================================

    // Descarta o arquivo selecionado e limpa a prévia.
    //
    // restore = true significa que a foto original
    // deve voltar a ser exibida.

    function resetPendingPhoto(restore = true) {

        // Libera o endereço temporário da prévia,
        // evitando manter recursos desnecessariamente na memória.
        if (previewObjectUrl) {

            URL.revokeObjectURL(previewObjectUrl);
        }

        previewObjectUrl = null;
        pendingFile = null;

        // Limpa o campo de seleção de arquivo.
        if (photoInput) {
            photoInput.value = '';
        }

        // Restaura o botão de escolha da foto.
        chooseButton.hidden = false;
        chooseButton.textContent = 'Alterar foto';

        // Esconde os botões de cancelar e salvar.
        cancelButton.hidden = true;
        saveButton.hidden = true;

        // Se solicitado, volta a mostrar a foto original.
        if (restore && currentProfile) {

            setPhoto(
                currentProfile.photoUrl || currentProfile.photo || '',
                currentProfile.name || 'Usuário'
            );
        }
    }


    // ========================================================
    // 10. EVENTOS DOS BOTÕES DE FOTO
    // ========================================================


    // --------------------------------------------------------
    // 10.1. Escolher uma foto
    // --------------------------------------------------------

    // Quando o usuário clica no botão Alterar foto,
    // abre o seletor de arquivos do navegador.

    chooseButton.addEventListener('click', () => {

        photoInput.click();
    });


    // --------------------------------------------------------
    // 10.2. Cancelar a alteração
    // --------------------------------------------------------

    cancelButton.addEventListener('click', () => {

        // Descarta a nova foto e restaura a original.
        resetPendingPhoto(true);

        // Informa que a operação foi cancelada.
        setFeedback('Alteração cancelada.');
    });


    // --------------------------------------------------------
    // 10.3. Quando uma imagem é selecionada
    // --------------------------------------------------------

    photoInput.addEventListener('change', () => {

        // Recupera o primeiro arquivo selecionado.
        const file = photoInput.files?.[0];

        // Se nenhum arquivo foi escolhido, encerra.
        if (!file) {
            return;
        }

        // Limpa o input para permitir selecionar novamente
        // o mesmo arquivo caso seja necessário.
        //
        // O objeto file continua disponível na variável.
        photoInput.value = '';


        // ----------------------------------------------------
        // 10.3.1. Validar o formato do arquivo
        // ----------------------------------------------------

        // Aceita somente JPEG, PNG e WEBP.
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {

            setFeedback(
                'Escolha uma imagem JPG, PNG ou WEBP.',
                'error'
            );

            resetPendingPhoto(true);

            return;
        }


        // ----------------------------------------------------
        // 10.3.2. Validar o tamanho do arquivo
        // ----------------------------------------------------

        // 5 MB = 5 * 1024 * 1024 bytes.
        if (file.size > 5 * 1024 * 1024) {

            setFeedback(
                'A foto deve ter no máximo 5 MB.',
                'error'
            );

            resetPendingPhoto(true);

            return;
        }


        // ----------------------------------------------------
        // 10.3.3. Criar a prévia da imagem
        // ----------------------------------------------------

        // Se já existia uma prévia anterior, libera seu endereço.
        if (previewObjectUrl) {

            URL.revokeObjectURL(previewObjectUrl);
        }

        // Guarda o arquivo selecionado.
        pendingFile = file;

        // Cria um endereço temporário para mostrar a imagem
        // antes de enviá-la ao servidor.
        previewObjectUrl = URL.createObjectURL(file);

        // Mostra a nova foto na página.
        setPhoto(
            previewObjectUrl,
            currentProfile?.name || 'Usuário',
            true
        );


        // ----------------------------------------------------
        // 10.3.4. Atualizar os botões
        // ----------------------------------------------------

        chooseButton.textContent = 'Trocar foto';

        chooseButton.hidden = false;
        cancelButton.hidden = false;
        saveButton.hidden = false;


        // Informa que a prévia está pronta,
        // mas que ainda não foi salva.
        setFeedback(
            'Prévia atualizada. Salve para aplicar a nova foto.'
        );
    });


    // ========================================================
    // 11. SALVAR A NOVA FOTO NA API
    // ========================================================

    // Executa quando o usuário clica no botão Salvar foto.

    saveButton.addEventListener('click', async () => {

        // Se não existe arquivo selecionado, não há nada para salvar.
        if (!pendingFile) {
            return;
        }

        // Desabilita o botão para evitar vários envios simultâneos.
        saveButton.disabled = true;

        // Altera o texto do botão enquanto o envio acontece.
        saveButton.textContent = 'Salvando...';

        setFeedback('Enviando a foto…');


        try {

            // FormData permite enviar arquivos através de uma requisição HTTP.
            const payload = new FormData();

            // Adiciona o arquivo ao formulário.
            //
            // 'photo' é o nome do campo que a API espera receber.
            payload.append('photo', pendingFile);


            // Faz uma requisição POST para /users/photo.
            const response = await fetch(`${API_BASE}/users/photo`, {

                method: 'POST',

                headers: {
                    Authorization: `Bearer ${token}`
                },

                // Envia o arquivo.
                // Não definimos Content-Type manualmente:
                // o navegador configura o multipart/form-data.
                body: payload
            });


            // Converte a resposta da API para um objeto JavaScript.
            const result = await response.json();


            // Verifica se o servidor aceitou o envio
            // e se retornou os dados da nova foto.
            if (
                !response.ok ||
                result?.code !== 200 ||
                !result.data?.photo
            ) {

                throw new Error(
                    result?.message || 'Não foi possível salvar a foto.'
                );
            }


            // ------------------------------------------------
            // 11.1. Atualizar os dados do perfil
            // ------------------------------------------------

            // Atualiza o caminho da foto recebido da API.
            currentProfile.photo = result.data.photo || '';

            currentProfile.photoUrl =
                result.data.photoUrl || result.data.photo || '';


            // Atualiza a foto armazenada no navegador.
            localStorage.setItem(
                'userPhoto',
                currentProfile.photoUrl
            );


            // Exibe a foto definitiva.
            setPhoto(
                currentProfile.photoUrl,
                currentProfile.name || 'Usuário'
            );


            // Atualiza os avatares da navegação.
            updateNavigationAvatars(currentProfile);


            // Limpa os dados temporários sem restaurar a foto antiga.
            resetPendingPhoto(false);


            // Informa que a operação foi concluída.
            setFeedback(
                'Foto atualizada com sucesso.',
                'success'
            );


        } catch (error) {

            // Exibe o erro no console.
            console.error('Erro ao atualizar foto:', error);

            // Informa o usuário sobre o problema.
            setFeedback(
                error.message || 'Erro ao atualizar foto.',
                'error'
            );

            // A prévia é mantida para permitir uma nova tentativa.


        } finally {

            // O finally é executado independentemente de sucesso ou erro.
            //
            // Reabilita o botão e restaura seu texto.
            saveButton.disabled = false;

            saveButton.textContent = 'Salvar foto';
        }
    });


    // ========================================================
    // 12. ENCERRAR A SESSÃO
    // ========================================================

    // Remove os dados de autenticação e as informações do usuário
    // armazenadas no navegador.
    function handleLogout() {

        localStorage.removeItem('token');
        localStorage.removeItem('siae_is_logged_in');
        localStorage.removeItem('siae_user_role');

        localStorage.removeItem('userName');
        localStorage.removeItem('userPhoto');
        localStorage.removeItem('enrollment');

        // Redireciona para a tela de login.
        window.location.href = '../public/login.html';
    }


    // Procura o botão de sair no HTML.
    const btnSair = document.querySelector('#logoutButton');

    // Só adiciona o evento se o botão existir.
    if (btnSair) {

        btnSair.addEventListener('click', () => {

            handleLogout();
        });
    }


    // ========================================================
    // 13. INICIALIZAÇÃO
    // ========================================================

    // Ao executar o script, busca os dados do usuário na API.
    loadProfile();

})();