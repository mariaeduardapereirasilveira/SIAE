import Users from "../../_common/classes/Users";
let currentRole = 'admin';

        // function setRole(role) {
        //     currentRole = role;
        //     document.getElementById('tabProfessional').classList.toggle('active', role === 'professional');
        //     document.getElementById('tabAdmin').classList.toggle('active', role === 'admin');
        // }

        // function togglePassword() {
        //     const input = document.getElementById('passwordInput');
        //     const icon = document.getElementById('eyeIcon');

        //     if (input.type === 'password') {
        //         input.type = 'text';
        //         icon.innerHTML = `
        //             <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        //             <line x1="1" y1="1" x2="23" y2="23"/>
        //         `;
        //     } else {
        //         input.type = 'password';
        //         icon.innerHTML = `
        //             <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        //             <circle cx="12" cy="12" r="3"/>
        //         `;
        //     }
        // }

        // function handleLogin(event) {
        //     event.preventDefault();

        //     // Save role to localStorage
        //     localStorage.setItem('siae_user_role', currentRole);
        //     localStorage.setItem('siae_role', currentRole);
        //     localStorage.setItem('siae_name', currentRole === 'admin' ? 'Admin SIAE' : 'Dra. Patricia Lima');
        //     localStorage.setItem('siae_is_logged_in', 'true');

        //     // Redirect to dashboard
        //     window.location.href = '../app/dashboard.html';
        // }

        // function handleGoogleLogin() {
        //     localStorage.setItem('siae_user_role', currentRole);
        //     localStorage.setItem('siae_role', currentRole);
        //     localStorage.setItem('siae_name', currentRole === 'admin' ? 'Admin SIAE' : 'Dra. Patricia Lima');
        //     localStorage.setItem('siae_is_logged_in', 'true');
        //     window.location.href = '../app/dashboard.html';
        // }

        // // Check if already logged in
        // if (localStorage.getItem('siae_is_logged_in') === 'true') {
        //     window.location.href = '../app/dashboard.html';
        // }
const users = new Users();

const form = document.querySelector("#loginForm");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        const response = await users.loginFromForm(form);

        console.log("RESPOSTA COMPLETA:", response);

        if (response.code === 200) {
            console.log("LOGIN REALIZADO!");

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("userId", response.data.id);
            localStorage.setItem("userName", response.data.name);

            console.log("TOKEN SALVO:", localStorage.getItem("token"));

            window.location.href = "../app/dashboard.html";
        }

    } catch (error) {
        console.error("ERRO NO LOGIN:", error);
    }
});