const ToastPrototype = {

    mostrar(mensagem, tipo = "success") {

        const toast = document.createElement("div");

        toast.className = `toast toast-${tipo}`;

        toast.textContent = mensagem;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

};

export default ToastPrototype;