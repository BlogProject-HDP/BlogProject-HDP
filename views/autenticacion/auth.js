class AuthUI {
    constructor() {
        this.isLoginMode = true;
        this.init();
    }

    init() {
        this.bindUIEvents();
        this.applyInputEffects();
    }

    bindUIEvents() {
        const toggleBtn = document.getElementById('toggleBtn');
        toggleBtn.addEventListener('click', () => this.toggleForms());
    }

    toggleForms() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const authTitle = document.getElementById('authTitle');
        const authSubtitle = document.getElementById('authSubtitle');
        const toggleText = document.getElementById('toggleText');
        const toggleBtnText = document.getElementById('toggleBtnText');

        if (this.isLoginMode) {
            this.animateFormTransition(loginForm, registerForm);
            authTitle.textContent = 'Crear Cuenta';
            authSubtitle.textContent = 'Únete a nuestra comunidad';
            toggleText.textContent = '¿Ya tienes una cuenta?';
            toggleBtnText.textContent = 'Iniciar sesión';
            this.isLoginMode = false;
        } else {
            this.animateFormTransition(registerForm, loginForm);
            authTitle.textContent = 'Bienvenido';
            authSubtitle.textContent = 'Inicia sesión en tu cuenta';
            toggleText.textContent = '¿No tienes una cuenta?';
            toggleBtnText.textContent = 'Crear cuenta';
            this.isLoginMode = true;
        }
    }

    animateFormTransition(fromForm, toForm) {
        fromForm.classList.add('fade-out');

        setTimeout(() => {
            fromForm.classList.add('is-hidden');
            fromForm.classList.remove('fade-out');

            toForm.classList.remove('is-hidden');
            toForm.classList.add('fade-in');

            setTimeout(() => {
                toForm.classList.remove('fade-in');
            }, 400);
        }, 200);
    }

    applyInputEffects() {
        const inputs = document.querySelectorAll('.custom-input');

        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.style.transform = 'translateY(-2px)';
            });

            input.addEventListener('blur', () => {
                input.style.transform = 'translateY(0)';
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AuthUI();
});

// Animaciones globales para toasts (si decides reutilizarlos visualmente en otro contexto)
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
