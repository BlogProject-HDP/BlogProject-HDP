// Tabs principales
document.querySelectorAll(".tabs ul li").forEach((tab) => {
  tab.addEventListener("click", function () {
    document
      .querySelectorAll(".tabs ul li")
      .forEach((t) => t.classList.remove("is-active"));
    this.classList.add("is-active");
    document
      .querySelectorAll(".tab-content")
      .forEach((c) => c.classList.add("is-hidden"));
    document
      .getElementById(this.getAttribute("data-tab"))
      .classList.remove("is-hidden");
  });
});
// Subtabs de comentarios
document.querySelectorAll(".tabs.is-toggle ul li").forEach((subtab) => {
  subtab.addEventListener("click", function () {
    document
      .querySelectorAll(".tabs.is-toggle ul li")
      .forEach((t) => t.classList.remove("is-active"));
    this.classList.add("is-active");
    document
      .querySelectorAll(".subtab-content")
      .forEach((c) => c.classList.add("is-hidden"));
    document
      .getElementById(this.getAttribute("data-subtab"))
      .classList.remove("is-hidden");
  });
});

//obtenemos aquí el id del admin
const adminId = localStorage.getItem("adminId");
if (adminId === "L") {
  // Si no hay adminId en localStorage, redirige o muestra error
  console.error("No estás logueado como admin.");
  window.location.href = "../autenticacion/auth.html";
} else {
  console.log("Admin logueado con ID:", adminId);
}
