
import HttpClientBase from "../../_common/classes/HttpClientBase.js";

(() => {
    "use strict";

    // Elementos da página
    const input = document.querySelector("#studentDocumentsInput");
    const selectedList = document.querySelector("#selectedDocumentsList");
    const uploadButton = document.querySelector("#uploadDocumentsButton");
    const uploadFeedback = document.querySelector("#documentsUploadFeedback");
    const documentsList = document.querySelector("#studentDocumentsList");
    const emptyDocuments = document.querySelector("#documentsEmpty");

    // Executa somente na página de documentos.
    if (
        !input ||
        !selectedList ||
        !uploadButton ||
        !documentsList ||
        !emptyDocuments
    ) {
        return;
    }

    const token = localStorage.getItem("token");
    const studentId = new URLSearchParams(window.location.search).get("id");

    if (!token) {
        window.location.href = "../public/login.html";
        return;
    }

    if (!studentId || !/^\d+$/.test(studentId) || Number(studentId) <= 0) {
        showFeedback("Não foi possível identificar o estudante.", "error");
        uploadButton.disabled = true;
        return;
    }

    // Cliente HTTP utilizado pelo restante do SIAE.
    const http = new HttpClientBase();
    http.setAuthToken(token);

    // Endereço base da API, seguindo a mesma lógica do HttpClientBase.
    const projectPrefix = window.location.pathname
        .split("/")
        .filter(Boolean)[0] || "";

    const apiBaseUrl =
        `${window.location.origin}/${projectPrefix}/api`;

    const MAX_FILES = 10;
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    let selectedFiles = [];

    function showFeedback(message, type = "") {
        uploadFeedback.textContent = message;
        uploadFeedback.className = type;
    }

    function formatBytes(bytes) {
        if (!bytes) return "0 KB";

        if (bytes >= 1024 * 1024) {
            return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
        }

        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    function formatDate(date) {
        if (!date) return "Data não informada";

        const parsedDate = new Date(
            String(date).replace(" ", "T")
        );

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleString("pt-BR");
    }

    function checkApiResponse(response) {
        if (!response || response.type !== "success") {
            throw new Error(
                response?.message || "Não foi possível concluir a operação."
            );
        }

        return response.data;
    }

    function createButton(text, className, callback) {
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = text;
        button.className = className;

        button.addEventListener("click", callback);

        return button;
    }

    // Exibe os arquivos que foram selecionados antes do envio.
    function renderSelectedFiles() {
        selectedList.replaceChildren();

        selectedFiles.forEach(file => {
            const item = document.createElement("li");

            const name = document.createElement("strong");
            name.textContent = file.name;

            const size = document.createElement("small");
            size.textContent = formatBytes(file.size);

            item.append(name, size);
            selectedList.appendChild(item);
        });

        uploadButton.disabled = selectedFiles.length === 0;
    }

    // Carrega os documentos cadastrados para o estudante.
    async function loadDocuments() {
        try {
            showFeedback("Carregando documentos...");

            const response = await http.get(
                `/student-documents/student/${studentId}`
            );

            const documents = checkApiResponse(response);

            renderDocuments(
                Array.isArray(documents) ? documents : []
            );

            showFeedback("");

        } catch (error) {
            console.error("Erro ao carregar documentos:", error);

            showFeedback(error.message, "error");
        }
    }

    // Cria os elementos da lista de documentos.
    function renderDocuments(documents) {
        documentsList.replaceChildren();

        emptyDocuments.hidden = documents.length > 0;

        documents.forEach(item => {
            const row = document.createElement("li");

            const extension = document.createElement("span");
            extension.className = "document-icon";
            extension.textContent = (
                item.extension || "FILE"
            ).toUpperCase();

            const content = document.createElement("section");

            const title = document.createElement("strong");
            title.textContent = item.originalName;

            const meta = document.createElement("small");
            meta.textContent =
                `${formatBytes(Number(item.sizeBytes))} · ` +
                `${formatDate(item.createdAt)}`;

            content.append(title, meta);

            const status = document.createElement("span");
            status.className = "document-status";
            status.textContent = "Disponível";

            const actions = document.createElement("div");
            actions.className = "document-actions";

            const downloadButton = createButton(
                "Baixar",
                "document-action-button",
                () => downloadDocument(item)
            );

            const renameButton = createButton(
                "Renomear",
                "document-action-button",
                () => renameDocument(item)
            );

            const deleteButton = createButton(
                "Excluir",
                "document-action-button document-delete-button",
                () => deleteDocument(item)
            );

            actions.append(
                downloadButton,
                renameButton,
                deleteButton
            );

            row.append(
                extension,
                content,
                status,
                actions
            );

            documentsList.appendChild(row);
        });
    }

    // Seleção de arquivos.
    input.addEventListener("change", () => {
        selectedFiles = Array.from(input.files || []);

        if (selectedFiles.length > MAX_FILES) {
            showFeedback(
                `Selecione no máximo ${MAX_FILES} arquivos por envio.`,
                "error"
            );

            selectedFiles = [];
            input.value = "";
            renderSelectedFiles();
            return;
        }

        const oversizedFile = selectedFiles.find(
            file => file.size > MAX_FILE_SIZE
        );

        if (oversizedFile) {
            showFeedback(
                `O arquivo "${oversizedFile.name}" ultrapassa 10 MB.`,
                "error"
            );

            selectedFiles = [];
            input.value = "";
            renderSelectedFiles();
            return;
        }

        renderSelectedFiles();

        showFeedback(
            selectedFiles.length
                ? `${selectedFiles.length} arquivo(s) selecionado(s).`
                : ""
        );
    });

    // Envia vários documentos para a API.
    uploadButton.addEventListener("click", async () => {
        if (selectedFiles.length === 0) {
            return;
        }

        const formData = new FormData();

        selectedFiles.forEach(file => {
            formData.append("documents[]", file);
        });

        uploadButton.disabled = true;
        showFeedback("Enviando documentos...");

        try {
            const response = await http.postForm(
                `/student-documents/student/${studentId}`,
                formData
            );

            checkApiResponse(response);

            selectedFiles = [];
            input.value = "";

            renderSelectedFiles();

            showFeedback(
                "Documentos enviados com sucesso!",
                "success"
            );

            await loadDocuments();

        } catch (error) {
            console.error("Erro no envio:", error);

            showFeedback(error.message, "error");

        } finally {
            uploadButton.disabled = selectedFiles.length === 0;
        }
    });

    // Baixa o arquivo através da API autenticada.
    async function downloadDocument(item) {
        try {
            const url =
                `${apiBaseUrl}/student-documents/download/${item.id}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                let message = "Não foi possível baixar o documento.";

                try {
                    const result = await response.json();
                    message = result.message || message;
                } catch (_) {}

                throw new Error(message);
            }

            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = objectUrl;
            link.download = item.originalName;

            document.body.appendChild(link);
            link.click();
            link.remove();

            URL.revokeObjectURL(objectUrl);

        } catch (error) {
            console.error("Erro ao baixar documento:", error);
            showFeedback(error.message, "error");
        }
    }

    // Altera somente o nome de exibição do documento.
    async function renameDocument(item) {
        const newName = window.prompt(
            "Informe o novo nome do documento:",
            item.originalName
        );

        if (newName === null || !newName.trim()) {
            return;
        }

        try {
            const response = await http.putForm(
                `/student-documents/id/${item.id}`,
                {
                    original_name: newName.trim()
                }
            );

            checkApiResponse(response);

            showFeedback(
                "Nome do documento atualizado!",
                "success"
            );

            await loadDocuments();

        } catch (error) {
            console.error("Erro ao renomear documento:", error);
            showFeedback(error.message, "error");
        }
    }

    // Exclui um documento.
    async function deleteDocument(item) {
        const confirmed = window.confirm(
            `Deseja realmente excluir "${item.originalName}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await http.delete(
                `/student-documents/id/${item.id}`
            );

            checkApiResponse(response);

            showFeedback(
                "Documento excluído com sucesso!",
                "success"
            );

            await loadDocuments();

        } catch (error) {
            console.error("Erro ao excluir documento:", error);
            showFeedback(error.message, "error");
        }
    }

    // Inicialização da página.
    loadDocuments();

})();
