const FormControllerPrototype = {

    inicializar(formulario) {
        this.formulario = formulario;
    },

    obterDados() {
        const formData = new FormData(this.formulario);

        return Object.fromEntries(formData.entries());
    },

     limpar() {
        this.formulario.reset();
    }


};

export default FormControllerPrototype;