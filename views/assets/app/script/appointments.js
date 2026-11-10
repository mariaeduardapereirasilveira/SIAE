(() => {
  "use strict";

  if (!localStorage.getItem("token")) {
    window.location.href = "../public/login.html";
    return;
  }

  // TODO: substituir a lista demonstrativa pela consulta autorizada à API.
  const appointments = [
    { id: 1, date: "2026-06-12", student: "Ana Paula Silva", className: "1º Info A", sector: "Orientação Educacional", title: "Acompanhamento acadêmico", status: "active" },
    { id: 2, date: "2026-06-10", student: "Bruno Santos", className: "2º Info B", sector: "Psicologia", title: "Acolhimento", status: "closed" },
    { id: 3, date: "2026-06-06", student: "Elena Rocha", className: "2º Info A", sector: "Enfermaria", title: "Atendimento de saúde", status: "closed" },
    { id: 4, date: "2026-06-03", student: "Diego Lima", className: "3º Info A", sector: "Orientação Educacional", title: "Acompanhamento", status: "active" }
  ];

  const list = document.querySelector("#appointmentList");
  const search = document.querySelector("#appointmentSearch");
  const statusFilter = document.querySelector("#appointmentStatus");
  const dialog = document.querySelector("#appointmentDialog");
  const form = document.querySelector("#appointmentForm");

  function formatDate(value) {
    const [year, month, day] = value.split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "").toUpperCase();
  }

  function createCard(item) {
    const article = document.createElement("article");
    article.className = "appointment-card";
    const date = document.createElement("time");
    date.className = "appointment-date";
    date.dateTime = item.date;
    date.innerHTML = `${formatDate(item.date)}<strong>${item.date.slice(0, 4)}</strong>`;

    const content = document.createElement("section");
    const sector = document.createElement("small"); sector.textContent = item.sector;
    const title = document.createElement("h3"); title.textContent = item.title;
    const student = document.createElement("p"); student.textContent = `${item.student} · ${item.className}`;
    content.append(sector, title, student);

    const status = document.createElement("span");
    status.className = `status-pill ${item.status === "closed" ? "is-closed" : ""}`;
    status.textContent = item.status === "closed" ? "Finalizado" : "Em acompanhamento";
    article.append(date, content, status);
    return article;
  }

  function render() {
    if (!list) return;
    const term = (search?.value || "").trim().toLocaleLowerCase("pt-BR");
    const status = statusFilter?.value || "all";
    const filtered = appointments.filter(item => {
      const matchesText = `${item.student} ${item.title} ${item.sector} ${item.className}`.toLocaleLowerCase("pt-BR").includes(term);
      return matchesText && (status === "all" || item.status === status);
    });
    list.replaceChildren();
    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.className = "empty-appointments";
      empty.textContent = "Nenhum atendimento encontrado com esses filtros.";
      list.appendChild(empty);
      return;
    }
    filtered.forEach(item => list.appendChild(createCard(item)));
  }

  const openButton = document.querySelector("#openAppointmentForm");
  const closeButton = document.querySelector("#closeAppointmentForm");
  const cancelButton = document.querySelector("#cancelAppointmentForm");
  const closeDialog = () => dialog?.close();
  openButton?.addEventListener("click", () => dialog?.showModal());
  closeButton?.addEventListener("click", closeDialog);
  cancelButton?.addEventListener("click", closeDialog);
  dialog?.addEventListener("click", event => {
    if (event.target === dialog) closeDialog();
  });

  form?.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(form);
    const student = String(data.get("student") || "").trim();
    const sector = String(data.get("sector") || "").trim();
    const title = String(data.get("type") || "").trim();
    const date = String(data.get("date") || "");
    if (!student || !sector || !title || !date) return;

    appointments.unshift({
      id: Date.now(), date, student, className: "Turma não informada",
      sector, title, status: String(data.get("status") || "active")
    });
    render();
    form.reset();
    closeDialog();
    const message = document.querySelector("#appointmentFeedback");
    if (message) message.textContent = "Registro demonstrativo adicionado à lista.";
  });

  search?.addEventListener("input", render);
  statusFilter?.addEventListener("change", render);

  const studentParam = new URLSearchParams(window.location.search).get("student");
  if (studentParam) {
    const saved = (() => { try { return JSON.parse(sessionStorage.getItem("siae_selected_student") || "null"); } catch (_) { return null; } })();
    const field = document.querySelector("#appointmentStudent");
    if (field && saved?.name) field.value = saved.name;
    else if (field) field.value = "Estudante selecionado";
  }

  render();
})();