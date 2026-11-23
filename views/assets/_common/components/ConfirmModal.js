
/**
 * Modal reutilizável de confirmação do SIAE.
 *
 * Exemplo:
 * const confirmou = await ConfirmModal.confirmar({
 *     titulo: "Desativar estudante?",
 *     mensagem: "Deseja continuar?",
 *     textoConfirmar: "Desativar"
 * });
 *
 * Retorna true para confirmar ou false para cancelar.
 */
export default class ConfirmModal {

    static confirmar({
        titulo = "Confirmar ação",
        mensagem = "Deseja continuar?",
        textoConfirmar = "Confirmar",
        textoCancelar = "Cancelar",
        tipo = "danger"
    } = {}) {

        // Reaproveita a mesma modal em todas as chamadas.
        let dialog = document.querySelector("#siaeConfirmDialog");

        if (!dialog) {
            dialog = document.createElement("dialog");
            dialog.id = "siaeConfirmDialog";
            dialog.className = "siae-confirm";
            dialog.setAttribute("aria-labelledby", "siaeConfirmTitle");
            dialog.setAttribute("aria-describedby", "siaeConfirmMessage");

            dialog.innerHTML = `
                <div class="siae-confirm__content">
                    <div class="siae-confirm__head">
                        <span class="siae-confirm__icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" stroke-width="1.8"
                                 stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 9v4"/>
                                <path d="M12 17h.01"/>
                                <path d="M10.3 3.9 2.1 18a2 2 0 0 0 1.7 3h16.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>
                            </svg>
                        </span>

                        <button type="button"
                                class="siae-confirm__close"
                                aria-label="Fechar confirmação">
                            ×
                        </button>
                    </div>

                    <h2 id="siaeConfirmTitle"
                        class="siae-confirm__title"></h2>

                    <p id="siaeConfirmMessage"
                       class="siae-confirm__message"></p>

                    <div class="siae-confirm__actions">
                        <button type="button"
                                class="siae-confirm__cancel"></button>

                        <button type="button"
                                class="siae-confirm__submit"></button>
                    </div>
                </div>
            `;

            document.body.appendChild(dialog);
        }

        // Impede abrir uma segunda confirmação sobre a primeira.
        if (dialog.open) {
            return Promise.resolve(false);
        }

        // Preenche os textos sem inserir HTML externo.
        dialog.querySelector("#siaeConfirmTitle").textContent = titulo;
        dialog.querySelector("#siaeConfirmMessage").textContent = mensagem;

        const cancelar = dialog.querySelector(".siae-confirm__cancel");
        const confirmar = dialog.querySelector(".siae-confirm__submit");
        const fechar = dialog.querySelector(".siae-confirm__close");

        cancelar.textContent = textoCancelar;
        confirmar.textContent = textoConfirmar;

        dialog.classList.toggle(
            "siae-confirm--positive",
            tipo === "positive"
        );

        const focoAnterior = document.activeElement;

        return new Promise((resolve) => {
            let finalizado = false;

            const finalizar = (resposta) => {
                if (finalizado) return;
                finalizado = true;

                dialog.close();
                cancelar.onclick = null;
                confirmar.onclick = null;
                fechar.onclick = null;
                dialog.oncancel = null;

                if (focoAnterior?.isConnected) {
                    focoAnterior.focus();
                }

                resolve(resposta);
            };

            cancelar.onclick = () => finalizar(false);
            fechar.onclick = () => finalizar(false);
            confirmar.onclick = () => finalizar(true);

            // Permite cancelar pressionando Escape.
            dialog.oncancel = (event) => {
                event.preventDefault();
                finalizar(false);
            };

            dialog.showModal();

            // Nas ações importantes, o foco inicial é Cancelar.
            cancelar.focus();
        });
    }
}
