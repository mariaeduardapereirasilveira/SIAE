(() => {
  "use strict";

  const projectParts = window.location.pathname.split("/").filter(Boolean);
  const projectPrefix = projectParts.length ? `/${projectParts[0]}` : "";
  const API_URL = `${window.location.origin}${projectPrefix}/api/users/list`;
  const input = document.querySelector("#searchInput");
  const results = document.querySelector("#resultsContainer");
  const count = document.querySelector("#resultsCount");
  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  let activeFilter = "all";
  let students = [];

  function checkAuth() {
    if (!localStorage.getItem("token")) {
      window.location.href = "../public/login.html";
      return false;
    }
    return true;
  }

  function initials(name) {
    return String(name || "Estudante").split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  }

  function createStudentCard(student) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "student-card";
    button.setAttribute("aria-label", `Ver informações de ${student.name}`);

    const avatar = document.createElement("span");
    avatar.className = "student-avatar";
    if (student.photoUrl) {
      const image = document.createElement("img");
      image.src = student.photoUrl;
      image.alt = "";
      image.loading = "lazy";
      image.addEventListener("error", () => { image.remove(); avatar.textContent = initials(student.name); }, { once: true });
      avatar.appendChild(image);
    } else {
      avatar.textContent = initials(student.name);
    }

    const info = document.createElement("span");
    info.className = "student-info";
    const name = document.createElement("strong");
    name.className = "student-name";
    name.textContent = student.name;
    const meta = document.createElement("span");
    meta.className = "student-details";
    [`${student.className || "Turma não informada"}`, `Código ${student.id}`, student.sectorName || "Estudante"].forEach(value => {
      const item = document.createElement("span");
      item.className = "student-detail-item";
      item.textContent = value;
      meta.appendChild(item);
    });
    info.append(name, meta);

    const action = document.createElement("span");
    action.className = "student-card-action";
    action.setAttribute("aria-hidden", "true");
    action.textContent = "→";
    button.append(avatar, info, action);
    button.addEventListener("click", () => {
      try { sessionStorage.setItem("siae_selected_student", JSON.stringify(student)); } catch (_) {}
      window.location.href = `student-details.html?id=${encodeURIComponent(student.id)}`;
    });
    return button;
  }

  function renderStudents() {
    if (!results) return;
    const query = (input?.value || "").trim().toLocaleLowerCase("pt-BR");
    const filtered = students.filter(student => {
      const values = {
        name: student.name,
        class: student.className,
        ra: String(student.id)
      };
      const source = activeFilter === "all"
        ? `${values.name} ${values.class} ${values.ra}`
        : values[activeFilter];
      return String(source || "").toLocaleLowerCase("pt-BR").includes(query);
    });

    results.replaceChildren();
    if (count) count.textContent = `${filtered.length} ${filtered.length === 1 ? "estudante encontrado" : "estudantes encontrados"}`;
    if (!filtered.length) {
      const empty = document.createElement("article");
      empty.className = "no-results";
      const title = document.createElement("h2");
      title.textContent = students.length ? "Nenhum estudante encontrado" : "Nenhum estudante disponível";
      const message = document.createElement("p");
      message.textContent = students.length
        ? "Tente outro nome, turma ou código."
        : "Não foi possível encontrar estudantes para este perfil.";
      empty.append(title, message);
      results.appendChild(empty);
      return;
    }
    filtered.forEach(student => results.appendChild(createStudentCard(student)));
  }

  async function loadStudents() {
    if (!checkAuth()) return;
    results?.setAttribute("aria-busy", "true");
    try {
      const response = await fetch(API_URL, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      const payload = await response.json();
      if (!response.ok || payload?.code !== 200 || !Array.isArray(payload.data)) {
        throw new Error(payload?.message || "Não foi possível carregar os estudantes.");
      }

      students = payload.data
        .filter(user => user.enrollment === "estudante")
        .map(user => ({
          id: user.id,
          name: user.name,
          ra: String(user.id),
          className: user.className || "",
          course: "Técnico em Informática",
          shift: "",
          status: Number(user.active) === 1 ? "Ativo" : "Inativo",
          email: user.email || "",
          phone: "",
          guardian: "",
          birth: user.dateBirth || "",
          sectorName: user.sectorName || "",
          photoUrl: user.photoUrl || "",
          history: [],
          documents: []
        }));
      renderStudents();
    } catch (error) {
      console.error("Erro ao carregar estudantes:", error);
      if (results) {
        const message = document.createElement("p");
        message.className = "no-results";
        message.textContent = "Não foi possível carregar os estudantes. Verifique a conexão com a API e tente novamente.";
        results.replaceChildren(message);
      }
      if (count) count.textContent = "Falha ao consultar a lista";
    } finally {
      results?.setAttribute("aria-busy", "false");
    }
  }

  filterButtons.forEach(button => button.addEventListener("click", () => {
    activeFilter = button.dataset.filter || "all";
    filterButtons.forEach(item => item.classList.toggle("active", item === button));
    renderStudents();
  }));
  input?.addEventListener("input", renderStudents);
  loadStudents();
})();