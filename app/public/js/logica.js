const btnabrirmodalis = document.querySelector("#abrirmodalis");
const btncerrarmodalis = document.querySelector("#cerrarmodis");
const modalis = document.querySelector("#modaliniciodesesion");

// Verificar si el usuario está autenticado al cargar la página
const isAuthenticated = document.cookie.includes("jwt="); // Verifica si existe la cookie JWT

// Si el usuario está autenticado, evitar que se abra el modal
if (!isAuthenticated) {
    btnabrirmodalis.addEventListener("click", () => {
        modalis.showModal();
    });
} else {
    // Si el usuario está autenticado, cambiar el comportamiento del botón
    btnabrirmodalis.innerHTML = '<i class="fa fa-user"></i> Usuario'; // Cambiar el texto del botón
    btnabrirmodalis.href = "/usuario"; // Redirigir al perfil del usuario
}

// Cerrar el modal
btncerrarmodalis.addEventListener("click", () => {
    modalis.close();
});

const btnabrirmodalre = document.querySelector("#abrirregistro");
const btncerrarmodalre = document.querySelector("#volverre");
const modalre = document.querySelector("#modalregistro");

// Abrir modal de registro desde el modal de inicio de sesión
btnabrirmodalre.addEventListener("click", () => {
    modalis.close();  // Cerramos el modal de inicio de sesión
    modalre.showModal();  // Abrimos el modal de registro
});

btncerrarmodalre.addEventListener("click", () => {
    modalre.close(); // Cerramos el modal de registro
    modalis.showModal(); // Abrimos el modal de inicio de sesión
});
