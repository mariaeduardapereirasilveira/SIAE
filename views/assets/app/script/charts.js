(() => {
  "use strict";
  if (!localStorage.getItem("token")) {
    window.location.href = "../public/login.html";
    return;
  }
  const period = document.querySelector("#chartPeriod");
  const values = {
    week: { total: "32", students: "24", active: "11", closed: "21" },
    month: { total: "128", students: "76", active: "34", closed: "94" },
    quarter: { total: "346", students: "182", active: "89", closed: "257" }
  };
  period?.addEventListener("change", () => {
    const data = values[period.value] || values.month;
    document.querySelector("#metricTotal").textContent = data.total;
    document.querySelector("#metricStudents").textContent = data.students;
    document.querySelector("#metricActive").textContent = data.active;
    document.querySelector("#metricClosed").textContent = data.closed;
  });
})();