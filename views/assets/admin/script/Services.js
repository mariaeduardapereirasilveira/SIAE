import ServiceService from "../../_common/classes/ServiceService.js";
import Users from "../../_common/classes/Users.js";

const serviceService = new ServiceService();
const usersService = new Users();

const token = localStorage.getItem("token");
const currentUserId = Number(localStorage.getItem("userId"));
const enrollment = (localStorage.getItem("enrollment") || "")
    .trim()
    .toLowerCase();

const isAdmin = enrollment === "administrador" || enrollment === "admin";

const table = document.querySelector("#servicesTable");
const modal = document.querySelector("#serviceModal");
const form = document.querySelector("#serviceForm");
const studentSelect = document.querySelector("#studentId");
const message = document.querySelector("#pageMessage");
const saveButton = document.querySelector("#saveButton");

function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? "#b42318" : "";
}

function getRows(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    return [];
}

function getField(record, ...names) {
    for (const name of names) {
        if (record?.[name] !== undefined && record[name] !== null) {
            return record[name];
        }
    }
    return "";
}

function openModal(service = null) {
    form.reset();
    form.dataset.userId = service
        ? String(getField(service, "userId", "user_id"))
        : String(currentUserId);

    document.querySelector("#serviceId").value =
        service ? getField(service, "id") : "";

    studentSelect.value = service
        ? String(getField(
            service,
            "studentId",
            "student_id",
            "studentsId",
            "students_id"
        ))
        : "";

    document.querySelector("#observations").value =
        service ? getField(service, "observations") : "";

    document.querySelector("#active").value =
        service ? String(getField(service, "active") ?? 1) : "1";

    document.querySelector("#activeField").hidden = !service;
    document.querySelector("#modalTitle").textContent =
        service ? "Editar atendimento" : "Novo atendimento";
    saveButton.textContent =
        service ? "Salvar alterações" : "Salvar atendimento";

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
}

async function loadStudents() {
    const response = await usersService.get("/users/list");

    const students = getRows(response).filter(
        (user) =>
            user.enrollment === "estudante" &&
            Number(user.active ?? 1) === 1
    );

    studentSelect.replaceChildren(
        new Option("Selecione um aluno", "")
    );

    students.forEach((student) => {
        studentSelect.add(
            new Option(`${student.name} (ID ${student.id})`, student.id)
        );
    });

    if (students.length === 0) {
        studentSelect.options[0].textContent =
            "Nenhum aluno ativo encontrado";
        document.querySelector("#newServiceButton").disabled = true;
        showMessage(
            "Não há alunos ativos cadastrados para vincular a um atendimento.",
            true
        );
    }
}

function renderServices(services, students, users) {
    const studentsById = new Map(
        students.map((student) => [String(student.id), student.name])
    );

    const usersById = new Map(
        users.map((user) => [String(user.id), user.name])
    );

    table.replaceChildren();

    if (services.length === 0) {
        const row = table.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 5;
        cell.textContent = "Nenhum atendimento cadastrado.";
        return;
    }

    services.forEach((service) => {
        const id = getField(service, "id");
        const studentId = getField(
            service,
            "studentId",
            "student_id",
            "studentsId",
            "students_id"
        );
        const userId = getField(service, "userId", "user_id");
        const active = Number(getField(service, "active") ?? 1) === 1;
        const row = table.insertRow();

        [
            studentsById.get(String(studentId)) || `Aluno #${studentId}`,
            usersById.get(String(userId)) || `Usuário #${userId}`,
            getField(service, "observations"),
            active ? "Ativo" : "Inativo"
        ].forEach((value) => {
            row.insertCell().textContent = String(value ?? "");
        });

        const actions = row.insertCell();

        const editButton = document.createElement("button");
        editButton.className = "btn btn-ghost btn-sm";
        editButton.type = "button";
        editButton.textContent = "Editar";
        editButton.addEventListener("click", () => openModal(service));
        actions.append(editButton);

        if (active) {
            const deactivateButton = document.createElement("button");
            deactivateButton.className = "btn btn-ghost btn-sm";
            deactivateButton.type = "button";
            deactivateButton.textContent = "Desativar";
            deactivateButton.addEventListener("click", () =>
                deactivateService(service)
            );
            actions.append(deactivateButton);
        }
    });
}

async function loadPage() {
    try {
        const [serviceResponse, userResponse] = await Promise.all([
            serviceService.list(),
            usersService.get("/users/list")
        ]);

        const users = getRows(userResponse);
        const students = users.filter(
            (user) => user.enrollment === "estudante"
        );

        renderServices(getRows(serviceResponse), students, users);
    } catch (error) {
        table.replaceChildren();
        const row = table.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 5;
        cell.textContent =
            "Não foi possível carregar os atendimentos. Confira a conexão com a API e tente novamente.";

        showMessage(error.message, true);
    }
}

async function deactivateService(service) {
    if (!window.confirm("Deseja desativar este atendimento?")) return;

    try {
        await serviceService.remove(getField(service, "id"));
        showMessage("Atendimento desativado.");
        await loadPage();
    } catch (error) {
        showMessage(
            `Não foi possível desativar o atendimento: ${error.message}`,
            true
        );
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = document.querySelector("#serviceId").value;

    const payload = {
        user_id: id ? Number(form.dataset.userId) : currentUserId,
        student_id: Number(studentSelect.value),
        observations: document.querySelector("#observations").value.trim(),
        active: Number(document.querySelector("#active").value)
    };

    if (!payload.user_id || !payload.student_id || !payload.observations) {
        showMessage("Selecione um aluno e preencha as observações.", true);
        return;
    }

    try {
        const result = id
            ? await serviceService.update(id, {
                service_id: Number(id),
                ...payload
            })
            : await serviceService.create(payload);

        if (result?.code && result.code >= 400) {
            throw new Error(
                result.message || "A API não salvou o atendimento."
            );
        }

        closeModal();
        showMessage(
            id
                ? "Atendimento atualizado com sucesso."
                : "Atendimento registrado com sucesso."
        );
        await loadPage();
    } catch (error) {
        showMessage(`Não foi possível salvar: ${error.message}`, true);
    }
});

document
    .querySelector("#newServiceButton")
    .addEventListener("click", () => openModal());

document
    .querySelector("#closeModalButton")
    .addEventListener("click", closeModal);

document
    .querySelector("#cancelButton")
    .addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
});

document.querySelector("#logoutButton").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "../public/login.html";
});

if (!token) {
    window.location.href = "../public/login.html";
} else if (!isAdmin) {
    window.location.href = "../app/dashboard.html";
} else if (!currentUserId) {
    showMessage(
        "Não encontrei o usuário da sessão. Saia e entre novamente para registrar atendimentos.",
        true
    );
} else {
    serviceService.setAuthToken(token);
    usersService.setAuthToken(token);

    Promise.all([loadStudents(), loadPage()]).catch((error) =>
        showMessage(error.message, true)
    );
}