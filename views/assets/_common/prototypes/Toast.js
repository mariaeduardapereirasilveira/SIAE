const ToastPrototype = {

    mostrar(mensagem, tipo = "success") {

        const toast = document.createElement("div");

        toast.className = `toast toast-${tipo}`;

        toast.textContent = mensagem;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    },

    mostrarResposta(resposta) {

    if (!resposta || typeof resposta !== "object") {
        this.mostrar(
            "Resposta inválida do servidor.",
            "error"
        );
        return;
    }

    const mensagem =
        typeof resposta.message === "string" && resposta.message.trim()
            ? resposta.message
            : "Operação realizada.";

    const tiposValidos = ["success", "warning", "error"];

    const tipo = tiposValidos.includes(resposta.status)
        ? resposta.status
        : "error";

    this.mostrar(mensagem, tipo);
}
};

export default ToastPrototype;

//quando a menssagem vier da api eu uso a função mostrarMensagem
//Isso é especialmente útil para:

// criar
// editar
// excluir
// fazer login
// cadastrar usuário
// qualquer requisição que tenha uma resposta padronizada da API



//qando a menssagem a criada elo front end usamos mostrar()