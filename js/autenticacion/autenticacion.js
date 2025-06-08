import {
  crearIndexedDB,
  addUser,
  buscarUser,
  buscarEmail,
  hashPassword,
} from "../IndexedDB/indexDB.js";

//Administrar la accesibilidad a los métodos de admin/user
localStorage.setItem("adminId", "L");

localStorage.setItem("userId", "L");
async function main() {
  // Crear IndexedDB y usuario admin por defecto
  crearIndexedDB();
}

// --------------------------------------------------------------
// main
main();

// --------------------------------------------------------------
// Crear Cuenta
document
  .getElementById("register-form")
  .addEventListener("submit", crearCuenta);

async function crearCuenta(e) {
  e.preventDefault();

  const user = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value.trim();

  try {
    const userExiste = await buscarUser(user);
    const emailExiste = await buscarEmail(email);
    const passwordValido = validarPassword(password);

    // Validaciones =)
    if (!userExiste && !emailExiste && passwordValido) {
      console.log("Campos válidos");
      document.getElementById("emailExiste").classList.add("is-hidden");
      document.getElementById("usuarioExiste").classList.add("is-hidden");
      document.getElementById("passwordInvalido").classList.add("is-hidden");

      // --------------------------------------------------------------
      // Agregar usuario
      // Encriptar contraseña
      const hash = await hashPassword(password);
      const usuario = {
        usuario: user,
        tipo: "user",
        email: email,
        password: hash,
      };
      addUser(usuario); // Agregar
    } else if (userExiste && emailExiste) {
      console.log("Error --> El usuario y el email ya existen");
      document.getElementById("usuarioExiste").classList.remove("is-hidden");
      document.getElementById("emailExiste").classList.remove("is-hidden");
      document.getElementById("passwordInvalido").classList.add("is-hidden");
    } else if (userExiste && !passwordValido) {
      console.log("Error --> El usuario existe y el password es inválido");
      document.getElementById("usuarioExiste").classList.remove("is-hidden");
      document.getElementById("passwordInvalido").classList.remove("is-hidden");
      document.getElementById("emailExiste").classList.add("is-hidden");
    } else if (emailExiste && !passwordValido) {
      console.log("Error --> El email existe y el password es inválido");
      document.getElementById("emailExiste").classList.remove("is-hidden");
      document.getElementById("passwordInvalido").classList.remove("is-hidden");
      document.getElementById("usuarioExiste").classList.add("is-hidden");
    } else if (userExiste) {
      console.log("Error --> El usuario existe");
      document.getElementById("usuarioExiste").classList.remove("is-hidden");
      document.getElementById("emailExiste").classList.add("is-hidden");
      document.getElementById("passwordInvalido").classList.add("is-hidden");
    } else if (emailExiste) {
      console.log("Error --> El email existe");
      document.getElementById("emailExiste").classList.remove("is-hidden");
      document.getElementById("usuarioExiste").classList.add("is-hidden");
      document.getElementById("passwordInvalido").classList.add("is-hidden");
    } else if (!passwordValido) {
      console.log("Error --> El password es inválido");
      document.getElementById("passwordInvalido").classList.remove("is-hidden");
      document.getElementById("usuarioExiste").classList.add("is-hidden");
      document.getElementById("emailExiste").classList.add("is-hidden");
    } else {
      console.log("Esto no existe");
    }
  } catch (error) {
    console.error("Error al crear cuenta:", error);
  }
}

// --------------------------------------------------------------
// validad contraseña
function validarPassword(password) {
  // Explicación del regex:
  // ^                      → inicio de la cadena
  // (?=.*[!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]) → al menos un símbolo
  // (?!.*\s)               → no debe contener espacios
  // .{8,}                  → mínimo 8 caracteres
  // $                      → fin de la cadena

  const regex = /^(?=.*[!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?])(?!.*\s).{8,}$/;

  return regex.test(password);
}

// --------------------------------------------------------------
// Crear Cuenta
document.getElementById("login-form").addEventListener("submit", iniciarSesion);

async function iniciarSesion(e) {
  e.preventDefault();

  // Capturar datos
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  // Buscar usuario
  const usuario = await buscarEmail(email);

  if (usuario) {
    // Comprobar contraseña debe dar el mismo hash
    const hash = await hashPassword(password);
    if (hash === usuario.password) {
      console.log("Login exitoso");
      // Redirigir a dashboard admi o user
      if (usuario.tipo === "user") {
        console.log("Redirigir a dashboar de usuario");
         // Guarda el ID en localStorage
        localStorage.setItem("userId", usuario.id);
        // Redirigir al admin para el html
        window.location.href = "/views/home/home.html";
        // window.location.href = "";
      if (usuario.tipo === "admin") {
        // Guarda el ID en localStorage
        localStorage.setItem("adminId", usuario.id);
        // Redirigir al admin para el html
        window.location.href = "/views/admin_view/dashboard_admin.html";
        }
    } else {
      console.log("Error --> Password incorrecto");
      document.getElementById("passwordInvalida").classList.remove("is-hidden");
      document.getElementById("usuarioIncorrecto").classList.add("is-hidden");
    }
  } else {
    console.log("Error --> Password o email incorrectos");
    document.getElementById("usuarioIncorrecto").classList.remove("is-hidden");
    document.getElementById("passwordInvalida").classList.add("is-hidden");
  }
}
}
