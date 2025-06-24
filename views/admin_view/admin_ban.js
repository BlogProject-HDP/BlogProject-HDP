//obtenemos aquí el id del admin
const adminId = localStorage.getItem("adminId");
if (adminId === "L") {
  // Si no hay adminId en localStorage, redirige o muestra error
  console.error("No estás logueado como admin.");
  window.location.href = "../autenticacion/auth.html";
} else {
  console.log("Admin logueado con ID:", adminId);
}
