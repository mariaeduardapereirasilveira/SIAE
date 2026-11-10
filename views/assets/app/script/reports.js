const initialReports = [
  { id: 1, title: "Acompanhamento emocional do 2B", content: "Resumo dos atendimentos psicológicos realizados com estudantes do 2B no período.", creator: "Equipe de Psicologia", sector: "Psicologia", date: "17/06/2026" },
  { id: 2, title: "Rendimento e rotina de estudos", content: "Relatório de acompanhamento acadêmico, frequência e estratégias de estudo.", creator: "Orientação Educacional", sector: "Orientação Educacional", date: "14/06/2026" },
  { id: 3, title: "Atendimentos de enfermaria", content: "Consolidado demonstrativo de atendimentos e encaminhamentos.", creator: "Equipe de Enfermaria", sector: "Enfermaria", date: "12/06/2026" }
];

const currentProfessionalName = localStorage.getItem("userName") || "Profissional";
const currentProfessionalSector = localStorage.getItem("userSector") || "Psicologia";
const currentRole = (localStorage.getItem("enrollment") || "").toLocaleLowerCase("pt-BR");
const isAdmin = ["admin", "administrador", "administrator"].includes(currentRole);
let reports = JSON.parse(localStorage.getItem("siae_reports") || "null") || initialReports;

function checkAuth() {
  if (!localStorage.getItem("token")) {
    window.location.href = "../public/login.html";
    return false;
  }
  return true;
}

function updateUIByRole() {
  const roleName = isAdmin ? "Administrador" : "Profissional";
  document.querySelectorAll("#userName").forEach(node => { node.textContent = currentProfessionalName; });
  document.querySelectorAll("#userRole").forEach(node => { node.textContent = roleName; });
  const avatar = currentProfessionalName.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  document.querySelectorAll("#userAvatar, #headerAvatar").forEach(node => { node.textContent = avatar; });
  document.querySelectorAll(".admin-only").forEach(node => { node.hidden = !isAdmin; });
  document.querySelectorAll(".professional-only").forEach(node => { node.hidden = isAdmin; });
  const subtitle = document.querySelector("#reportsSubtitle");
  if (subtitle) subtitle.textContent = isAdmin ? "Relatórios disponíveis conforme as permissões administrativas." : "Relatórios relacionados à sua atuação.";
}

function saveReports() {
  localStorage.setItem("siae_reports", JSON.stringify(reports));
}

function getVisibleReports() {
  return isAdmin ? reports : reports.filter(report => report.creator === currentProfessionalName || report.sector === currentProfessionalSector);
}

function renderReports() {
  const container = document.querySelector("#reportsList");
  if (!container) return;
  const visible = getVisibleReports();
  container.replaceChildren();

  if (!visible.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Nenhum relatório disponível. Crie um novo registro para começar.";
    container.appendChild(empty);
    return;
  }

  visible.forEach(report => {
    const article = document.createElement("article");
    article.className = "report-item";
    const icon = document.createElement("span");
    icon.className = "report-icon";
    icon.textContent = String(report.sector || "R").slice(0, 2).toUpperCase();

    const content = document.createElement("section");
    content.className = "report-content";
    const heading = document.createElement("h3");
    heading.textContent = report.title;
    const description = document.createElement("p");
    description.textContent = report.content;
    const meta = document.createElement("small");
    meta.textContent = `${report.creator} · ${report.sector} · ${report.date}`;
    content.append(heading, description, meta);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-ghost btn-sm";
    button.textContent = "Visualizar";
    button.dataset.reportId = String(report.id);
    article.append(icon, content, button);
    container.appendChild(article);
  });
}

function viewReport(id) {
  const report = reports.find(item => String(item.id) === String(id));
  if (!report) return;
  document.querySelector("#viewReportTitle").textContent = report.title;
  document.querySelector("#viewReportContent").textContent = report.content;
  document.querySelector("#viewReportCreator").textContent = report.creator;
  document.querySelector("#viewReportSector").textContent = report.sector;
  document.querySelector("#viewReportDate").textContent = report.date;
  document.querySelector("#viewReportModal").classList.add("active");
}

function openReportModal() {
  document.querySelector("#reportTitle").value = "";
  document.querySelector("#reportContent").value = "";
  document.querySelector("#reportModalTitle").textContent = "Criar relatório";
  document.querySelector("#reportCreator").value = currentProfessionalName;
  document.querySelector("#reportSector").value = currentProfessionalSector;
  document.querySelector("#reportModal").classList.add("active");
}

function closeModal(id) {
  document.querySelector(`#${id}`)?.classList.remove("active");
}

function saveReport() {
  const title = document.querySelector("#reportTitle").value.trim();
  const content = document.querySelector("#reportContent").value.trim();
  const creator = document.querySelector("#reportCreator").value.trim();
  const sector = document.querySelector("#reportSector").value;
  if (!title || !content || !creator || !sector) {
    window.alert("Preencha todos os campos do relatório.");
    return;
  }
  reports.unshift({ id: Date.now(), title, content, creator, sector, date: new Date().toLocaleDateString("pt-BR") });
  saveReports();
  renderReports();
  closeModal("reportModal");
}

document.querySelector("#openReportModal")?.addEventListener("click", openReportModal);
document.querySelector("#saveReportButton")?.addEventListener("click", saveReport);
document.querySelectorAll("[data-close-modal]").forEach(button => {
  button.addEventListener("click", () => closeModal(button.dataset.closeModal));
});
document.querySelector("#reportsList")?.addEventListener("click", event => {
  const button = event.target.closest("[data-report-id]");
  if (button) viewReport(button.dataset.reportId);
});
["reportModal", "viewReportModal"].forEach(id => {
  document.querySelector(`#${id}`)?.addEventListener("click", event => {
    if (event.target.id === id) closeModal(id);
  });
});

if (checkAuth()) {
  updateUIByRole();
  renderReports();
}
