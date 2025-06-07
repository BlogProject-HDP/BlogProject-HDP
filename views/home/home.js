


document.addEventListener('DOMContentLoaded', () => {

  // Get all "navbar-burger" elements
  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
  const $navbarMenu = document.querySelector('.navbar-menu');
  // Add a click event on each of them
  $navbarBurgers.forEach( el => {
    el.addEventListener('click', () => {

      // Get the target from the "data-target" attribute
      const target = el.dataset.target;
      const $target = document.getElementById(target);

      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      el.classList.toggle('is-active');
      $target.classList.toggle('is-active');

    });
  });


   // Dropdown toggle logic
  const dropdowns = document.querySelectorAll('.navbar-item.has-dropdown');

  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.navbar-link');

    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        // Toggle current dropdown
        dropdown.classList.toggle('is-active');

        // Optional: close other dropdowns
        dropdowns.forEach(other => {
          if (other !== dropdown) {
            other.classList.remove('is-active');
          }
        });
      });
    }
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    const isClickInsideDropdown = e.target.closest('.navbar-item.has-dropdown');
    const isInsideMenu = e.target.closest('.navbar-menu');
    const isBurger = e.target.closest('.navbar-burger');

    if (!isClickInsideDropdown) {
      dropdowns.forEach(dropdown => {
        dropdown.classList.remove('is-active');
      });
    }


     // Close navbar menu if click is outside
    if (!isInsideMenu && !isBurger) {
      $navbarBurgers.forEach(el => el.classList.remove('is-active'));
      if ($navbarMenu) {
        $navbarMenu.classList.remove('is-active');
      }
    }
    
  });

});