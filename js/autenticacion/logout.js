export function logout() {
  // Limpia los datos de usuario y admin
  localStorage.setItem("userId", "L");
  localStorage.setItem("userRol", "LL");
  localStorage.setItem("adminId", "L");
  localStorage.setItem("adminRol", "LL");
  // Redirige al login
  window.location.href = "../../views/autenticacion/auth.html";
}

export function startAutoLogout() {
  let logoutTimer;
  const ONE_HOUR = 60 * 60 * 1000;

  function resetLogoutTimer() {
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
      alert("Por seguridad, tu sesión ha expirado.");
      logout();
    }, ONE_HOUR);
  }

  // Reinicia el temporizador en cualquier interacción
  ["click", "mousemove", "keydown", "scroll"].forEach(evt =>
    window.addEventListener(evt, resetLogoutTimer)
  );
  // Inicia el temporizador al cargar la página
  resetLogoutTimer();
}