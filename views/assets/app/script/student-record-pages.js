(() => {
  "use strict";

  if (!localStorage.getItem("token")) {
    window.location.href = "../public/login.html";
    return;
  }

  const fallbackStudents = {
    "1": { id: 1, name: "Ana Paula Silva", ra: "2024001", className: "1º Info A", course: "Técnico em Informática", shift: "Manhã", status: "Ativo", birth: "15/04/2009", email: "ana.paula@aluno.exemplo", phone: "(51) 90000-0001", guardian: "Marcia Silva", history: [{ date: "12/06/2026", title: "Acompanhamento acadêmico", sector: "Orientação Educacional", summary: "Registro demonstrativo de acompanhamento da rotina de estudos." }, { date: "02/05/2026", title: "Encaminhamento para acolhimento", sector: "Psicologia", summary: "Registro demonstrativo de encaminhamento autorizado." }], documents: [{ name: "Ficha cadastral", type: "Cadastro", date: "10/02/2026" }, { name: "Autorização do responsável", type: "Responsável", date: "12/02/2026" }] },
    "2": { id: 2, name: "Bruno Santos", ra: "2024002", className: "2º Info B", course: "Técnico em Informática", shift: "Tarde", status: "Ativo", birth: "22/08/2008", email: "bruno.santos@aluno.exemplo", phone: "(51) 90000-0002", guardian: "Carlos Santos", history: [{ date: "10/06/2026", title: "Acolhimento", sector: "Psicologia", summary: "Registro demonstrativo de acolhimento." }], documents: [{ name: "Ficha cadastral", type: "Cadastro", date: "11/02/2026" }] }
  };

  const queryId = new URLSearchParams(window.location.search).get("id") || "1";
  let student = fallbackStudents[queryId] || fallbackStudents["1"];
  try {
    const saved = JSON.parse(sessionStorage.getItem("siae_selected_student") || "null");
    if (saved && String(saved.id) === String(queryId)) student = { ...student, ...saved };
  } catch (_) {}

  const initials = String(student.name || "Estudante").split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  document.querySelectorAll("#studentName").forEach(node => { node.textContent = student.name; });
  document.querySelectorAll("#studentMeta").forEach(node => { node.textContent = `Matrícula ${student.ra} · ${student.className}`; });
  document.querySelectorAll("#studentInitials").forEach(node => {
    if (student.photoUrl) {
      const image = document.createElement("img");
      image.src = student.photoUrl;
      image.alt = "";
      image.addEventListener("error", () => { image.remove(); node.textContent = initials; }, { once: true });
      node.replaceChildren(image);
    } else {
      node.textContent = initials;
    }
  });
  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = value || "Não informado";
  };

  setText("#studentStatus", student.status);
  setText("#studentFullName", student.name);
  setText("#studentBirth", student.birth);
  setText("#studentEmail", student.email);
  setText("#studentPhone", student.phone);
  setText("#studentGuardian", student.guardian);
  setText("#studentRa", student.ra);
  setText("#studentCourse", student.course);
  setText("#studentClass", student.className);
  setText("#studentShift", student.shift);

  const currentFile = window.location.pathname.split("/").pop();
  const currentTab = currentFile === "student-history.html" ? "history" :
    currentFile === "student-documents.html" ? "documents" : "details";
  document.querySelectorAll("[data-student-tab]").forEach(link => {
    const href = new URL(link.href);
    href.searchParams.set("id", queryId);
    link.href = href.href;
    link.classList.toggle("active", link.dataset.studentTab === currentTab);
    if (link.dataset.studentTab === currentTab) link.setAttribute("aria-current", "page");
  });

  const historyList = document.querySelector("#studentHistoryList");
  if (historyList) {
    historyList.replaceChildren();
    (student.history || []).forEach(item => {
      const entry = document.createElement("li");
      const time = document.createElement("time"); time.textContent = item.date;
      const content = document.createElement("section");
      const title = document.createElement("strong"); title.textContent = item.title;
      const sector = document.createElement("small"); sector.textContent = item.sector;
      const summary = document.createElement("p"); summary.textContent = item.summary;
      content.append(title, sector, summary); entry.append(time, content); historyList.appendChild(entry);
    });
    if (!student.history?.length) {
      const empty = document.createElement("li"); empty.className = "student-empty-state";
      empty.textContent = "Ainda não há registros disponíveis para este estudante.";
      historyList.appendChild(empty);
    }
  }

  const documentsList = document.querySelector("#studentDocumentsList");
  const emptyDocuments = document.querySelector("#documentsEmpty");
  if (documentsList) {
    documentsList.replaceChildren();
    (student.documents || []).forEach(item => {
      const row = document.createElement("li");
      const icon = document.createElement("span"); icon.className = "document-icon"; icon.textContent = "DOC";
      const content = document.createElement("section");
      const title = document.createElement("strong"); title.textContent = item.name;
      const meta = document.createElement("small"); meta.textContent = `${item.type} · ${item.date}`;
      content.append(title, meta);
      const status = document.createElement("span"); status.className = "document-status"; status.textContent = "Cadastrado";
      row.append(icon, content, status); documentsList.appendChild(row);
    });
    if (emptyDocuments) emptyDocuments.hidden = Boolean(student.documents?.length);
  }
})();