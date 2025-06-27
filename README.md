# 📝 THE BLOG - 2025

> Proyecto final de la materia Herramientas de Productividad
> Universidad de El Salvador

<div align="center">
  <img src="resources/theBlog.svg" alt="THE BLOG Logo" width="200">
</div>

## 📖 Descripción

THE BLOG es una aplicación web completa de blog desarrollada con tecnologías frontend modernas. Permite a los usuarios crear, leer, comentar y gestionar contenido de blog con un sistema de autenticación robusto y funcionalidades administrativas avanzadas.

##EQUIPO 
-Jefferson Alexis de la Cruz Ventra
-David Elías Romero Claros
-Walter Bryan Romero Hernández
-Pedro David Ramos García
-Cristian Alexis Ventura Ventura
-Manuel Melendez

## ✨ Características Principales

### 🔐 Sistema de Autenticación
- **Registro e inicio de sesión** seguro con validación de datos
- **Roles diferenciados**: Usuario regular y Administrador
- **Gestión de sesiones** con auto-logout por seguridad
- **Validación de contraseñas** con criterios de seguridad

### 📰 Gestión de Posts
- **Editor de contenido** rico con Toast UI Editor (Markdown)
- **Categorización** de posts con gestión dinámica de categorías
- **Subida de imágenes** como portadas de posts
- **Sistema de likes** y conteo de interacciones
- **Búsqueda avanzada** por título, contenido y categorías

### 💬 Sistema de Comentarios
- **Comentarios en tiempo real** en cada post
- **Moderación de comentarios** (aprobación/rechazo por administradores)
- **Vista diferenciada** entre comentarios propios y de otros usuarios

### 👤 Perfiles de Usuario
- **Perfiles personalizables** con foto, información personal y descripción
- **Estadísticas de usuario** (posts creados, comentarios realizados)
- **Edición de perfil** con validación de datos

### 🛡️ Panel de Administración
- **CRUD completo** de usuarios y posts
- **Sistema de baneado** (ShadowBan) de usuarios
- **Moderación de comentarios** con vista de pendientes y aprobados
- **Gestión de categorías** del blog
- **Dashboard** con estadísticas y controles administrativos

### 🔍 Funcionalidades de Navegación
- **Paginación inteligente** para una mejor experiencia de usuario
- **Búsqueda en tiempo real** con filtros
- **Navegación responsive** adaptada a dispositivos móviles
- **Interfaz moderna** con Bulma CSS Framework

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos personalizados
- **JavaScript ES6+** - Funcionalidad interactiva con módulos
- **Bulma CSS** - Framework CSS moderno y responsive

### Almacenamiento
- **IndexedDB** - Base de datos local del navegador para persistencia de datos
- **LocalStorage** - Gestión de sesiones y configuraciones

### Librerías y Herramientas
- **Toast UI Editor** - Editor de Markdown avanzado
- **Font Awesome** - Iconografía moderna
- **CryptoJS** - Encriptación de contraseñas (implementado)

## 📁 Estructura del Proyecto

```
BlogProject-HDP/
├── index.html                    # Página principal
├── README.md                     # Documentación del proyecto
│
├── js/                          # Lógica JavaScript
│   ├── autenticacion/           # Sistema de login/logout
│   ├── baneados/               # Gestión de usuarios baneados
│   ├── comentarios/            # Sistema de comentarios
│   ├── IndexedDB/              # Operaciones de base de datos
│   └── pagination/             # Sistema de paginación
│
├── resources/                   # Recursos estáticos
│   ├── theBlog.svg             # Logo principal
│   ├── theBlog_optimazdo.svg   # Logo optimizado
│   ├── No_imagen_disponible.png # Imagen por defecto
│   └── ...                     # Otras imágenes
│
└── views/                      # Vistas de la aplicación
    ├── admin_view/             # Panel de administración
    ├── autenticacion/          # Páginas de login/registro
    ├── busqueda/              # Sistema de búsqueda
    ├── crear_post/            # Editor de posts
    ├── home/                  # Página principal
    ├── perfil_usuario/        # Perfil de usuario
    ├── post/                  # Vista individual de posts
    └── shared/                # Componentes compartidos
```

## 🚀 Instalación y Uso

### Prerrequisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Servidor web local (opcional, para mejor experiencia)

### Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/BlogProject-HDP/BlogProject-HDP.git
   cd BlogProject-HDP
   ```

2. **Inicia un servidor local** (recomendado)
   ```bash
   # Con Python
   python -m http.server 8000
   
   # Con Node.js (http-server)
   npx http-server
   
   # Con Live Server (VS Code)
   # Instala la extensión Live Server y haz clic derecho en index.html
   ```

3. **Abre la aplicación**
   - Navega a `http://localhost:8000` en tu navegador
   - O abre directamente `index.html` en tu navegador

### Primer Uso

1. **Usuario Administrador por Defecto**
   - Se crea automáticamente al inicializar la aplicación
   - Revisa el código en `js/IndexedDB/indexDB.js` para las credenciales

2. **Crear una Cuenta de Usuario**
   - Haz clic en "Acceder" en la navbar
   - Selecciona "Crear cuenta" en la página de autenticación
   - Completa el formulario de registro

3. **Explorar Funcionalidades**
   - **Como usuario**: Crear posts, comentar, dar likes, gestionar perfil
   - **Como administrador**: Acceso completo al panel de administración

## 👥 Funcionalidades por Rol

### 👤 Usuario Regular
- ✅ Crear y editar posts
- ✅ Comentar en posts
- ✅ Dar likes a posts
- ✅ Gestionar perfil personal
- ✅ Buscar contenido
- ✅ Ver posts y perfiles de otros usuarios

### 👑 Administrador
- ✅ **Todas las funciones de usuario regular**
- ✅ Gestionar usuarios (crear, editar, banear)
- ✅ Moderar comentarios
- ✅ Gestionar categorías del blog
- ✅ CRUD completo de posts
- ✅ Dashboard con estadísticas
- ✅ Sistema ShadowBan

## 🎨 Características de Diseño

- **Responsive Design** - Adaptado para móviles, tablets y desktop
- **Tema Oscuro/Claro** - Cambio dinámico de tema (implementado)
- **Interfaz Intuitiva** - Navegación clara y consistente
- **Animaciones Suaves** - Transiciones CSS para mejor UX
- **Tipografía Moderna** - Google Fonts integrado

## 🔒 Seguridad

- **Validación de Datos** - Sanitización de inputs del usuario
- **Encriptación de Contraseñas** - Hash seguro de credenciales
- **Gestión de Sesiones** - Auto-logout por seguridad
- **Validación de Roles** - Control de acceso basado en permisos

## 🐛 Funcionalidades Avanzadas

### Sistema de Búsqueda
- Búsqueda por título, contenido y categorías
- Filtros dinámicos
- Resultados en tiempo real

### Editor de Posts
- Editor Markdown con vista previa
- Subida de imágenes arrastrando y soltando
- Gestión de categorías múltiples
- Autoguardado (en desarrollo)

### Sistema de Comentarios
- Comentarios anidados (estructura preparada)
- Moderación administrativa
- Estados: Pendiente, Aprobado, Rechazado

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Equipo de Desarrollo

**Grupo de competriotas de la Universidad de El Salvador**

- Desarrolladores del curso de Herramientas de Productividad
- Universidad de El Salvador - 2025

## 🙏 Agradecimientos

- **Bendiciones pa to el mundo**
---

<div align="center">
  <p>Hecho con ❤️ por estudiantes de la Universidad de El Salvador</p>
  <p>
    <a href="https://github.com/BlogProject-HDP/BlogProject-HDP">⭐ Dale una estrella si te gustó el proyecto</a>
  </p>
</div>
