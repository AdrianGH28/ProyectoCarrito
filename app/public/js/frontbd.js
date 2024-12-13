


document.addEventListener("DOMContentLoaded", () => {
    // Realizar una solicitud para obtener las marcas
    fetch('/api/marcas')
        .then(response => response.json())
        .then(data => {
            if (data.status === "ok") {
                const droneGroup = document.getElementById('drone-group');
                droneGroup.innerHTML = ""; // Limpiar cualquier contenido previo

                // Crear el radio button para "TODO"
                const todoLi = document.createElement('li');
                todoLi.className = 'form-check'; // Clase para mantener el estilo

                const todoRadio = document.createElement('input');
                todoRadio.className = 'form-check-input';
                todoRadio.type = 'radio';
                todoRadio.id = 'todo';  // ID único para "TODO"
                todoRadio.name = 'drone';  // Todos los radio buttons comparten el mismo nombre
                todoRadio.value = 'todo';  // Valor único para "TODO"
                todoRadio.checked = true;  // Esto marca "TODO" como seleccionado por defecto

                const todoLabel = document.createElement('label');
                todoLabel.className = 'form-check-label';
                todoLabel.setAttribute('for', todoRadio.id);  // Asociamos el label con el radio button
                todoLabel.textContent = "Todo";  // Texto de la categoría "TODO"

                // Agregar el radio button y el label al <li>
                todoLi.appendChild(todoRadio);
                todoLi.appendChild(todoLabel);

                // Agregar el <li> de "TODO" al principio de la lista
                droneGroup.appendChild(todoLi);

                // Iteramos sobre las marcas obtenidas y las agregamos como radio buttons
                data.data.forEach((marca) => {
                    const li = document.createElement('li'); // Crear un <li> para cada marca
                    li.className = 'form-check';

                    // Crear un input tipo radio para cada marca
                    const radio = document.createElement('input');
                    radio.className = 'form-check-input';
                    radio.type = 'radio';
                    radio.id = `marca-${marca.id_marca}`;  
                    radio.name = 'drone';                   // Todos los radio buttons comparten el mismo nombre
                    radio.value = marca.id_marca;           // El valor será el id de la marca

                    // Crear el label para el radio button
                    const label = document.createElement('label');
                    label.className = 'form-check-label';
                    label.setAttribute('for', radio.id); // Asociamos el label con el radio button
                    label.textContent = marca.nom_marca;  // El texto del label es el nombre de la marca

                    // Agregar el radio button y el label al <li>
                    li.appendChild(radio);
                    li.appendChild(label);

                    // Agregar el <li> a la lista <ul>
                    droneGroup.appendChild(li);
                });
            } else {
                console.error('Error al obtener las marcas:', data.message);
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
        });
});



// Función para verificar si el usuario está logueado mediante el token JWT
function usuarioLogueado() {
    const token = document.cookie.split('; ').find(row => row.startsWith('jwt='));
    return token ? true : false;
}

// Función para obtener el ID del usuario desde el servidor
function obtenerUserId() {
    return fetch('/api/usuario')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok' && data.id_user) {
                return data.id_user;
            } else {
                console.error('Error al obtener el ID del usuario:', data.message);
                return null;
            }
        })
        .catch(error => {
            console.error('Error en la solicitud para obtener el ID del usuario:', error);
            return null;
        });
}




//MUESTRA PRODUCTOS

document.addEventListener("DOMContentLoaded", async () => {
    if (!usuarioLogueado()) {
        console.error("El usuario no está logueado.");
        return;
    }

    const userId = await obtenerUserId();
if (!userId || isNaN(userId)) {
    console.error("ID de usuario inválido");
    return;
}
    if (!userId) {
        console.error("No se pudo obtener el ID del usuario.");
        return;
    }

    // Realizar una solicitud para obtener los productos
    fetch('/api/productos')
        .then(response => response.json())
        .then(data => {
            if (data.status === "ok" && Array.isArray(data.data)) {
                const productContainer = document.querySelector('.product__list');
                productContainer.innerHTML = ""; // Limpiar los productos previos

                // Iterar sobre los productos obtenidos
                data.data.forEach(producto => {
                    const col = document.createElement('div');
                    col.className = 'col-lg-4 col-md-6 col-sm-6';

                    const productItem = document.createElement('div');
                    productItem.className = 'product__item';

                    // Imagen del producto
                    const productPic = document.createElement('div');
                    productPic.className = 'product__item__pic set-bg';
                    productPic.style.backgroundImage = `url(${producto.img_prod})`;

                    // Iconos de hover
                    const hoverList = document.createElement('ul');
                    hoverList.className = 'product__item__pic__hover';

                    const cartIcon = document.createElement('li');
                    const cartLink = document.createElement('a');
                    cartLink.href = '#';
                    const cartIconElem = document.createElement('i');
                    cartIconElem.className = 'fa fa-shopping-cart';

                    // Agregar evento de clic para agregar al carrito
                    cartIconElem.addEventListener('click', () => {
                        const productData = {
                            id_user: userId, // Usar el ID obtenido del servidor
                            id_prod: producto.id_prod,
                        };

                        fetch('/api/carrito/agregar', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(productData),
                        })
                            .then(response => response.json())
                            .then(data => {
                                if (data.status === 'ok') {
                                    alert('Producto agregado al carrito.');
                                    actualizarContadorCarrito();
                                } else {
                                    alert('Error al agregar al carrito: ' + data.message);
                                }
                            })
                            .catch(error => {
                                console.error('Error en la solicitud:', error);
                                alert('Error al agregar al carrito.');
                            });
                    });

                    cartLink.appendChild(cartIconElem);
                    cartIcon.appendChild(cartLink);
                    hoverList.appendChild(cartIcon);

                    productPic.appendChild(hoverList);

                    // Texto del producto
                    const productText = document.createElement('div');
                    productText.className = 'product__item__text';

                    const productName = document.createElement('h6');
                    const productLink = document.createElement('a');
                    productLink.href = '#';
                    productLink.textContent = producto.nom_prod;
                    productName.appendChild(productLink);

                    const productPrice = document.createElement('h5');
                    productPrice.textContent = `$${producto.precio_prod}`;

                    productText.appendChild(productName);
                    productText.appendChild(productPrice);

                    // Añadir al contenedor
                    productItem.appendChild(productPic);
                    productItem.appendChild(productText);

                    col.appendChild(productItem);
                    productContainer.appendChild(col);
                });
            } else {
                console.error('Error al obtener los productos:', data.message || 'Datos no válidos');
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
        });

    function actualizarContadorCarrito() {
        fetch(`/api/carrito/${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok') {
                    const totalItems = data.data.total_car; // Total de productos en el carrito
                    const cartCountElement = document.getElementById('no.carrito');
                    cartCountElement.textContent = totalItems;
                } else {
                    console.error('Error al obtener los datos del carrito:', data.message);
                }
            })
            .catch(error => {
                console.error('Error en la solicitud:', error);
            });
    }
    actualizarContadorCarrito();
});







//FILTRA POR MARCA 
document.addEventListener("DOMContentLoaded", () => {

    const productContainer = document.querySelector('.product__list');
    const userId = obtenerUserId(); // Función para obtener el ID dinámico del usuario
    console.log("ID de usuario logueado:", userId);

    // Escuchar cambios en los radio buttons de marca
    document.getElementById("drone-group").addEventListener("change", (event) => {
        if (event.target.name === "drone") {
            const marcaId = event.target.value; // Obtener el ID de la marca seleccionada
            cargarProductosFiltrados(marcaId); // Llamar a la función de carga de productos
        }
    });

    // Función para cargar productos filtrados por marca
    function cargarProductosFiltrados(id_marca) {
        const url = id_marca === "todo" 
            ? "/api/productos" 
            : `/api/productos/filtrar?id_marca=${id_marca}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.status === "ok" && Array.isArray(data.data)) {
                    productContainer.innerHTML = ""; // Limpiar los productos previos

                    // Iterar sobre los productos obtenidos
                    data.data.forEach(producto => {
                        const col = document.createElement('div');
                        col.className = 'col-lg-4 col-md-6 col-sm-6';

                        const productItem = document.createElement('div');
                        productItem.className = 'product__item';

                        // Imagen del producto
                        const productPic = document.createElement('div');
                        productPic.className = 'product__item__pic set-bg';
                        productPic.style.backgroundImage = `url(${producto.img_prod})`;

                        // Iconos de hover
                        const hoverList = document.createElement('ul');
                        hoverList.className = 'product__item__pic__hover';

                        const cartIcon = document.createElement('li');
                        const cartLink = document.createElement('a');
                        cartLink.href = '#';
                        const cartIconElem = document.createElement('i');
                        cartIconElem.className = 'fa fa-shopping-cart';

                        // Agregar evento de clic para agregar al carrito
                        cartIconElem.addEventListener('click', () => {
                            agregarAlCarrito(userId, producto.id_prod);
                        });

                        cartLink.appendChild(cartIconElem);
                        cartIcon.appendChild(cartLink);
                        hoverList.appendChild(cartIcon);

                        productPic.appendChild(hoverList);

                        // Texto del producto
                        const productText = document.createElement('div');
                        productText.className = 'product__item__text';

                        const productName = document.createElement('h6');
                        const productLink = document.createElement('a');
                        productLink.href = '#';
                        productLink.textContent = producto.nom_prod;
                        productName.appendChild(productLink);

                        const productPrice = document.createElement('h5');
                        productPrice.textContent = `$${producto.precio_prod}`;

                        productText.appendChild(productName);
                        productText.appendChild(productPrice);

                        // Añadir al contenedor
                        productItem.appendChild(productPic);
                        productItem.appendChild(productText);

                        col.appendChild(productItem);
                        productContainer.appendChild(col);
                    });
                } else {
                    console.error('Error al obtener los productos:', data.message || 'Datos no válidos');
                }
            })
            .catch(error => {
                console.error('Error en la solicitud:', error);
            });
    }

    // Función para agregar un producto al carrito
    function agregarAlCarrito(userId, productId) {
        const productData = {
            id_user: userId, // Usar el ID del usuario logueado
            id_prod: productId,
        };

        fetch('/api/carrito/agregar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok') {
                    alert('Producto agregado al carrito.');
                    actualizarContadorCarrito();
                } else {
                    alert('Error al agregar al carrito: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error en la solicitud:', error);
                alert('Error al agregar al carrito.');
            });
    }

    // Función para actualizar el contador del carrito
    function actualizarContadorCarrito() {
        fetch(`/api/carrito/${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok') {
                    const totalItems = data.data.total_car; // Total de productos en el carrito
                    const cartCountElement = document.getElementById('no.carrito');
                    cartCountElement.textContent = totalItems;
                } else {
                    console.error('Error al obtener los datos del carrito:', data.message);
                }
            })
            .catch(error => {
                console.error('Error en la solicitud:', error);
            });
    }

    // Inicializar la página cargando todos los productos y actualizando el carrito
    cargarProductosFiltrados("todo");
    actualizarContadorCarrito();
});










//FILTRAR POR TIPO


document.addEventListener("DOMContentLoaded", () => {

    
    const categoriesList = document.getElementById("categories-list");
    const selectedCategory = document.getElementById("selected-category");
    const productContainer = document.querySelector(".product__list");

    // Suponemos que el ID del usuario está en una variable llamada userId
    const userId = obtenerUserId(); // Esta función debe obtener el ID del usuario de manera dinámica
    console.log(userId);

    // Escuchar clics en los elementos del menú
    categoriesList.addEventListener("click", (event) => {
        event.preventDefault();

        const target = event.target;
        if (target.tagName === "A" && target.hasAttribute("data-type-id")) {
            console.log("Elemento clicado:", target);
            const tipoId = target.getAttribute("data-type-id");
            console.log("ID de tipo seleccionado:", tipoId);
            
            selectedCategory.textContent = target.textContent;

            // Cargar productos basados en la categoría seleccionada
            cargarProductosPorTipo(tipoId);
        }
    });

    function cargarProductosPorTipo(id_tipoprod) {
        
        const url = id_tipoprod === "todo"
            ? "/api/productos"
            : `/api/productos/filtrar-tipo?id_tipoprod=${id_tipoprod}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log("Respuesta de la API:", data);
                if (data.status === "ok" && Array.isArray(data.data)) {
                    productContainer.innerHTML = ""; // Limpiar el contenedor

                    data.data.forEach(producto => {
                        const col = document.createElement('div');
                        col.className = 'col-lg-4 col-md-6 col-sm-6';

                        const productItem = document.createElement('div');
                        productItem.className = 'product__item';

                        // Imagen del producto
                        const productPic = document.createElement('div');
                        productPic.className = 'product__item__pic set-bg';
                        productPic.style.backgroundImage = `url(${producto.img_prod})`;

                        // Iconos de hover
                        const hoverList = document.createElement('ul');
                        hoverList.className = 'product__item__pic__hover';

                        const cartIcon = document.createElement('li');
                        const cartLink = document.createElement('a');
                        cartLink.href = '#';
                        const cartIconElem = document.createElement('i');
                        cartIconElem.className = 'fa fa-shopping-cart';

                        // Agregar evento de clic para agregar al carrito
                        cartIconElem.addEventListener('click', () => {
                            const productData = {
                                id_user: userId, // Usar el ID del usuario logueado
                                id_prod: producto.id_prod,
                            };

                            fetch('/api/carrito/agregar', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(productData),
                            })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.status === 'ok') {
                                        alert('Producto agregado al carrito.');
                                        actualizarContadorCarrito();
                                    } else {
                                        alert('Error al agregar al carrito: ' + data.message);
                                    }
                                })
                                .catch(error => {
                                    console.error('Error en la solicitud:', error);
                                    alert('Error al agregar al carrito.');
                                });
                                console.log(data);
                        });

                        cartLink.appendChild(cartIconElem);
                        cartIcon.appendChild(cartLink);
                        hoverList.appendChild(cartIcon);

                        productPic.appendChild(hoverList);

                        // Texto del producto
                        const productText = document.createElement('div');
                        productText.className = 'product__item__text';

                        const productName = document.createElement('h6');
                        const productLink = document.createElement('a');
                        productLink.href = '#';
                        productLink.textContent = producto.nom_prod;
                        productName.appendChild(productLink);

                        const productPrice = document.createElement('h5');
                        productPrice.textContent = `$${producto.precio_prod}`;

                        productText.appendChild(productName);
                        productText.appendChild(productPrice);

                        // Añadir al contenedor
                        productItem.appendChild(productPic);
                        productItem.appendChild(productText);

                        col.appendChild(productItem);
                        productContainer.appendChild(col);
                    });
                } else {
                    console.error('Error al obtener los productos:', data.message || 'Datos no válidos');
                }
            })
            .catch(error => {
                console.error('Error en la solicitud:', error);
            });
    }

    function actualizarContadorCarrito() {
        fetch(`/api/carrito/${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok') {
                    const totalItems = data.data.total_car; // Total de productos en el carrito
                    const cartCountElement = document.getElementById('no.carrito');
                    cartCountElement.textContent = totalItems;
                } else {
                    console.error('Error al obtener los datos del carrito:', data.message);
                }
            })
            .catch(error => {
                console.error('Error en la solicitud:', error);
            });
    }

    // Cargar todos los productos inicialmente
    cargarProductosPorTipo("todo");
    actualizarContadorCarrito();
});







//FILTRAR POR TEXTO

document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input");
    const productContainer = document.querySelector(".product__list");

    // Suponemos que el ID del usuario está en una variable llamada userId
    const userId = obtenerUserId(); // Esta función debe obtener el ID del usuario de manera dinámica

    // Escuchar el evento submit del formulario
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Previene la recarga de la página
        const searchText = searchInput.value.trim().toLowerCase();

        if (searchText) {
            // Cargar productos basados en el nombre ingresado
            cargarProductosPorNombre(searchText);
        }
    });

    function cargarProductosPorNombre(nombreProducto) {
        const url = `/api/productos/filtrar-nombre?nombre=${nombreProducto}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.status === "ok" && Array.isArray(data.data)) {
                    productContainer.innerHTML = ""; // Limpiar el contenedor

                    data.data.forEach(producto => {
                        const col = document.createElement('div');
                        col.className = 'col-lg-4 col-md-6 col-sm-6';

                        const productItem = document.createElement('div');
                        productItem.className = 'product__item';

                        // Imagen del producto
                        const productPic = document.createElement('div');
                        productPic.className = 'product__item__pic set-bg';
                        productPic.style.backgroundImage = `url(${producto.img_prod})`;

                        // Iconos de hover
                        const hoverList = document.createElement('ul');
                        hoverList.className = 'product__item__pic__hover';

                        const cartIcon = document.createElement('li');
                        const cartLink = document.createElement('a');
                        cartLink.href = '#';
                        const cartIconElem = document.createElement('i');
                        cartIconElem.className = 'fa fa-shopping-cart';

                        // Agregar evento de clic para agregar al carrito
                        cartIconElem.addEventListener('click', () => {
                            const productData = {
                                id_user: userId, // Usar el ID del usuario logueado
                                id_prod: producto.id_prod,
                            };

                            fetch('/api/carrito/agregar', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(productData),
                            })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.status === 'ok') {
                                        alert('Producto agregado al carrito.');
                                        actualizarContadorCarrito();
                                    } else {
                                        alert('Error al agregar al carrito: ' + data.message);
                                    }
                                })
                                .catch(error => {
                                    console.error('Error en la solicitud:', error);
                                    alert('Error al agregar al carrito.');
                                });
                        });

                        cartLink.appendChild(cartIconElem);
                        cartIcon.appendChild(cartLink);
                        hoverList.appendChild(cartIcon);

                        productPic.appendChild(hoverList);

                        // Texto del producto
                        const productText = document.createElement('div');
                        productText.className = 'product__item__text';

                        const productName = document.createElement('h6');
                        const productLink = document.createElement('a');
                        productLink.href = '#';
                        productLink.textContent = producto.nom_prod;
                        productName.appendChild(productLink);

                        const productPrice = document.createElement('h5');
                        productPrice.textContent = `$${producto.precio_prod}`;

                        productText.appendChild(productName);
                        productText.appendChild(productPrice);

                        // Añadir al contenedor
                        productItem.appendChild(productPic);
                        productItem.appendChild(productText);

                        col.appendChild(productItem);
                        productContainer.appendChild(col);
                    });
                } else {
                    console.error('Error al obtener los productos:', data.message || 'Datos no válidos');
                }
            })
            .catch(error => {
                console.error('Error en la solicitud:', error);
            });
    }

    function actualizarContadorCarrito() {
        fetch(`/api/carrito/${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok') {
                    const totalItems = data.data.total_car; // Total de productos en el carrito
                    const cartCountElement = document.getElementById('no.carrito');
                    cartCountElement.textContent = totalItems;
                } else {
                    console.error('Error al obtener los datos del carrito:', data.message);
                }
            })
            .catch(error => {
                console.error('Error en la solicitud:', error);
            });
    }
});












// AÑADIR AL CARRITO
// Empieza carrito ---------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
    const userId = await obtenerUserId(); // Usamos la función para obtener el userId dinámico
    console.log("ID de usuario:", userId);
    
    if (!userId) {
        alert('No has iniciado sesión');
        return;
    }

    // Cargar los productos en el carrito
    fetch(`/api/carrito/${userId}`)
        .then(response => response.json())
        .then(data => {
            console.log('Datos del carrito:', data);
            if (data.status === 'ok') {
                const cartTableBody = document.querySelector('.shoping__cart__table tbody');
                const cartInfo = data.data; // Obtiene la información del carrito (total, costo, productos)
                cartTableBody.innerHTML = ''; // Limpiar la tabla previa

                cartInfo.products.forEach(item => {
                    const row = document.createElement('tr');

                    row.innerHTML = `
                        <td class="shoping__cart__item">
                            <img src="${item.img_prod}" alt="${item.nom_prod}">
                            <h5>${item.nom_prod}</h5>
                        </td>
                        <td class="shoping__cart__price">
                            $${item.precio_prod}
                        </td>
                        <td class="shoping__cart__quantity">
                            <div class="quantity">
                                <div class="pro-qty">
                                    <input type="text" value="${item.cantidad}" readonly>
                                </div>
                            </div>
                        </td>
                        <td class="shoping__cart__total">
                            $${(item.precio_prod * item.cantidad).toFixed(2)}
                        </td>
                        <td class="shoping__cart__item__close">
                            <span class="icon_close" data-id_prod="${item.id_prod}"></span>
                        </td>
                    `;

                    cartTableBody.appendChild(row);
                });

                // También puedes mostrar el total y el costo total en algún lugar del UI
                document.querySelector('.shoping__checkout ul li:last-child span').textContent = `$${cartInfo.costo_total}`;

                // Delegar el evento de eliminación a la tabla del carrito
                cartTableBody.addEventListener('click', (e) => {
                    if (e.target && e.target.matches('.icon_close')) {
                        const productId = e.target.getAttribute('data-id_prod'); // Obtener el ID del producto a eliminar

                        // Enviar una solicitud para eliminar el producto
                        fetch(`/api/carrito/eliminar/${userId}/${productId}`, {
                            method: 'DELETE',
                        })
                            .then(response => response.json())
                            .then(data => {
                                if (data.status === 'ok') {
                                    // Eliminar el producto de la tabla sin recargar la página
                                    const rowToDelete = e.target.closest('tr');
                                    rowToDelete.remove(); // Eliminar la fila de la tabla

                                    // Actualizar el total y el costo total en el UI
                                    actualizarCarrito();
                                    alert('Producto eliminado del carrito.');
                                } else {
                                    alert('Error al eliminar el producto: ' + data.message);
                                }
                            })
                            .catch(error => {
                                console.error('Error en la solicitud:', error);
                                alert('Error al eliminar el producto.');
                            });
                    }
                });

                const updateCostButton = document.querySelector('.cart-btn-right');
                updateCostButton.addEventListener('click', (e) => {
                    e.preventDefault(); // Evitar que el enlace recargue la página
                    actualizarCarrito();
                });

            } else {
                console.error('Error al cargar el carrito:', data.message);
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
        });
});

// Función para actualizar el carrito
function actualizarCarrito() {
    const userId = obtenerUserId(); // Obtenemos el ID del usuario dinámico

    if (!userId) {
        alert('No has iniciado sesión');
        return;
    }

    fetch(`/api/carrito/${userId}`) // Usamos el userId dinámico
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                const cartTableBody = document.querySelector('.shoping__cart__table tbody');
                const cartInfo = data.data;
                cartTableBody.innerHTML = ''; // Limpiar los productos previos

                if (cartInfo.products.length === 0) {
                    // Si el carrito está vacío, muestra un mensaje adecuado y el costo total a $0
                    document.querySelector('.shoping__checkout ul li:last-child span').textContent = '$0.00';
                    return;
                }

                cartInfo.products.forEach(item => {
                    const row = document.createElement('tr');

                    row.innerHTML = `
                        <td class="shoping__cart__item">
                            <img src="${item.img_prod}" alt="${item.nom_prod}">
                            <h5>${item.nom_prod}</h5>
                        </td>
                        <td class="shoping__cart__price">
                            $${item.precio_prod}
                        </td>
                        <td class="shoping__cart__quantity">
                            <div class="quantity">
                                <div class="pro-qty">
                                    <input type="text" value="${item.cantidad}" readonly>
                                </div>
                            </div>
                        </td>
                        <td class="shoping__cart__total">
                            $${item.precio_prod * item.cantidad}
                        </td>
                        <td class="shoping__cart__item__close">
                            <span class="icon_close" data-id_prod="${item.id_prod}"></span>
                        </td>
                    `;

                    cartTableBody.appendChild(row);
                });

                // Actualizar total
                document.querySelector('.shoping__checkout ul li:last-child span').textContent = `$${cartInfo.costo_total}`;
            }
        })
        .catch(error => {
            console.error('Error al actualizar el carrito:', error);
        });
}

/*
// Función para eliminar el producto del carrito
function eliminarProductoDelCarrito(id_prod) {
    const userId = 1; // Este debería ser dinámico dependiendo del usuario logueado

    fetch(`/api/carrito/eliminar/${userId}/${id_prod}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            // El producto fue eliminado correctamente, actualizar la vista
            alert('Producto eliminado del carrito.');
            location.reload();  // Recargar la página para actualizar la tabla del carrito
        } else {
            console.error('Error al eliminar el producto:', data.message);
        }
    })
    .catch(error => {
        console.error('Error en la solicitud de eliminación:', error);
    });
}
*/
/*
document.addEventListener('DOMContentLoaded', () => {
    const userId = 1; // Este debería ser dinámico dependiendo del usuario logueado

    // Realizar una solicitud GET para obtener los datos del carrito
    fetch(`/api/carrito/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                // Suponiendo que "total_car" es el total de productos en el carrito
                const totalItems = data.data.total_car; 

                // Actualizar el contenido del span con el id "no.carrito"
                const cartCountElement = document.getElementById('no.carrito');
                cartCountElement.textContent = totalItems;
            } else {
                console.error('Error al cargar el carrito:', data.message);
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
        });
});
*/
/*
document.addEventListener('DOMContentLoaded', () => {
    const userId = 1; // Este debería ser dinámico dependiendo del usuario logueado

    // Realizar una solicitud GET para obtener los datos del carrito
    fetch(`/api/carrito/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                // Suponiendo que "costo_total" es el costo total del carrito
                const cartTotal = data.data.costo_total; 

                // Actualizar los elementos del carrito con el costo total
                const subtotalElement = document.querySelector('.shoping__checkout ul li:first-child span');
                const totalElement = document.querySelector('.shoping__checkout ul li:last-child span');

                // Aquí puedes hacer que el subtotal y el total sean iguales, ya que ambas variables usan el mismo valor
                subtotalElement.textContent = `$${cartTotal.toFixed(2)}`;
                totalElement.textContent = `$${cartTotal.toFixed(2)}`;
            } else {
                console.error('Error al cargar el carrito:', data.message);
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
        });
});
*/




//------------------------------------------------------------------------------------------------------------------





//ELIMIAR PRODUCTO DEL CARRITO
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".icon_close").forEach((btn) => {
        btn.addEventListener("click", async (event) => {
            const idCarr = event.target.getAttribute("data-id");
            const row = event.target.closest("tr");

            if (idCarr) {
                try {
                    const response = await fetch("/api/carrito/eliminar", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ id_carr: idCarr }),
                    });

                    const result = await response.json();

                    if (response.ok) {
                        // Eliminar la fila del carrito en el frontend
                        row.remove();
                        alert(result.message);
                    } else {
                        alert(result.message || "Error al eliminar el producto.");
                    }
                } catch (error) {
                    console.error("Error al eliminar el producto:", error);
                    alert("Ocurrió un error. Inténtalo de nuevo.");
                }
            }
        });
    });
});


document.addEventListener("DOMContentLoaded", () => {
    const categoriesList = document.getElementById('categories-list');
    const selectedCategorySpan = document.getElementById('selected-category'); // Span a actualizar
    const subtiposList = document.getElementById('subtipos-list'); // Lista de subtipos

    // Cargar tipos de productos
    fetch('/api/tipos-productos')
        .then(response => response.json())
        .then(data => {
            if (data.status === "ok") {
                categoriesList.innerHTML = ""; // Limpiar contenido previo

                // Opción "Todo"
                const todoItem = document.createElement('li');
                const todoLink = document.createElement('a');
                todoLink.href = '#';
                todoLink.textContent = "Todo";
                todoLink.dataset.typeId = "todo";
                todoItem.appendChild(todoLink);
                categoriesList.appendChild(todoItem);

                // Agregar opciones dinámicas
                data.data.forEach(tipoProducto => {
                    const listItem = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = '#';
                    link.textContent = tipoProducto.nom_tipoprod;
                    link.dataset.typeId = tipoProducto.id_tipoprod;
                    listItem.appendChild(link);
                    categoriesList.appendChild(listItem);
                });

                console.log('Tipos de productos cargados correctamente.');
            } else {
                console.error('Error al obtener los tipos de productos:', data.message);
            }
        })
        .catch(error => console.error('Error en la solicitud:', error));

    // Manejar selección de categoría
    categoriesList.addEventListener('click', event => {
        event.preventDefault();
        const target = event.target;

        if (target.tagName === 'A') {
            const selectedText = target.textContent;
            const selectedTypeId = target.dataset.typeId;

            // Actualizar el span
            selectedCategorySpan.textContent = selectedText;
            selectedCategorySpan.dataset.selectedTypeId = selectedTypeId;

            console.log(`Seleccionaste: ${selectedText} (ID: ${selectedTypeId})`);

            // Cargar subtipos relacionados
            loadSubtipos(selectedTypeId);
        }
    });

    // Función para cargar subtipos
    const loadSubtipos = (typeId) => {
        fetch(`/api/subtipos-productos?tipo=${typeId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === "ok") {
                    subtiposList.innerHTML = ""; // Limpiar lista de subtipos

                    // Opción "Todo"
                    const todoItem = document.createElement('li');
                    todoItem.innerHTML = `
                            <input type="radio" id="todo" name="subtipo" value="todo" checked />
                            <label for="todo"> Todo</label>
                        `;
                    subtiposList.appendChild(todoItem);

                    // Agregar subtipos dinámicamente
                    data.data.forEach(subtipo => {
                        const listItem = document.createElement('li');
                        listItem.innerHTML = `
                                <input type="radio" id="subtipo-${subtipo.id_subtipop}" name="subtipo" value="${subtipo.id_subtipop}" />
                                <label for="subtipo-${subtipo.id_subtipop}"> ${subtipo.nom_subtipop}</label>
                            `;
                        subtiposList.appendChild(listItem);
                    });

                    console.log('Subtipos cargados correctamente.');
                } else {
                    console.error('Error al obtener subtipos:', data.message);
                }
            })
            .catch(error => console.error('Error en la solicitud:', error));
    };
});

document.getElementById("categories-list").addEventListener("click", async (event) => {
    if (event.target.tagName === "A") {
        const selectedCategory = event.target.textContent;
        document.getElementById("selected-category").textContent = selectedCategory;

        // Obtener el ID del tipo de producto (o "todo" si es la opción predeterminada)
        const tipo = selectedCategory.toLowerCase() === "todo" ? "todo" : event.target.dataset.tipoId;

        // Realizar la solicitud al servidor para obtener los subtipos
        try {
            const response = await fetch(`/api/subtipos-productos?tipo=${tipo}`);
            const data = await response.json();

            if (data.status === "ok") {
                const subtiposList = document.getElementById("subtipos-list");
                subtiposList.innerHTML = `
                        <li>
                            <input type="radio" id="todo" name="subtipo" value="todo" checked />
                            <label for="todo">Todo</label>
                        </li>
                    `;

                // Agregar los subtipos al listado
                data.data.forEach((subtipo) => {
                    const li = document.createElement("li");
                    li.innerHTML = `
                            <input type="radio" id="subtipo-${subtipo.id_subtipop}" name="subtipo" value="${subtipo.id_subtipop}" />
                            <label for="subtipo-${subtipo.id_subtipop}">${subtipo.nom_subtipop}</label>
                        `;
                    subtiposList.appendChild(li);
                });
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error("Error al obtener los subtipos:", error);
        }
    }
});


//REGISTRO
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM completamente cargado");
    document.getElementById("registro-form").addEventListener("submit", async (e) => {
        e.preventDefault();


        const emaillabelre = document.querySelector('#email').value;
        const passwordlabelre = document.querySelector('#password').value;
        const confpasswordlabelre = document.querySelector('#confpasswordlabelre').value;

        console.log('Email:', emaillabelre);
        console.log('Password:', passwordlabelre);

        // Validaciones en el frontend antes de enviar los datos al backend
        if (!emaillabelre || !passwordlabelre || !confpasswordlabelre) {
            alert('Los campos están incompletos');
            return;  // No continuar si los campos están vacíos
        }

        if (passwordlabelre.length < 8 || passwordlabelre.length > 12) {
            alert('La contraseña debe ser entre 8 y 12 caracteres');
            return;
        }

        if (passwordlabelre !== confpasswordlabelre) {
            alert('Las contraseñas no coinciden');
            return;
        }

        try {
            const res = await fetch("http://localhost:4000/api/registro", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    emaillabelre: emaillabelre,
                    passwordlabelre: passwordlabelre,
                    confpasswordlabelre: confpasswordlabelre
                })
            });

            const resJson = await res.json();
            console.log('Respuesta del servidor:', resJson);

            if (resJson.status === "Error") {
                // Mostrar el mensaje de error del servidor en una alerta
                alert(resJson.message);
            } else if (resJson.redirect) {
                window.location.href = resJson.redirect;
            }
        } catch (error) {
            console.log("Error:", error);
        }
    });
});


//INICIO DE SESION
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("inicio-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        // Selección de los valores de los inputs
        const emaillabelre = document.querySelector('#emaillabelre').value;
        const passwordlabelre = document.querySelector('#passwordlabelre').value;

        console.log('Email:', emaillabelre);
        console.log('Password:', passwordlabelre);

        // Validaciones en el frontend antes de enviar los datos al backend
        if (!emaillabelre || !passwordlabelre) {
            alert('Los campos están incompletos');
            return;  // No continuar si los campos están vacíos
        }

        try {
            const res = await fetch("http://localhost:4000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    emaillabelre,
                    passwordlabelre
                })
            });

            const resJson = await res.json();

            if (resJson.redirect) {
                // Redireccionar al usuario
                window.location.href = resJson.redirect;
            } else if (resJson.status === "ok") {
                // Reemplazar el botón de login por Usuario
                const loginButton = document.getElementById("abrirmodalis"); // ID del botón de inicio de sesión
                if (loginButton) {
                    const loginLink = loginButton.querySelector('a'); // Obtener el enlace dentro del botón

                    // Cambiar el texto y mantener el ícono
                    loginLink.innerHTML = '<i class="fa fa-user"></i> Usuario';

                    // Cambiar el enlace al perfil del usuario
                    loginLink.href = "/usuario";

                    // Agregar el evento para redirigir al perfil
                    loginLink.addEventListener("click", (e) => {
                        e.preventDefault();
                        window.location.href = "/usuario";
                    });
                }
            }

        } catch (error) {
            console.error('Error:', error);
        }
    });
});


// Verificar si el usuario está autenticado
document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("abrirmodalis"); // Seleccionar el botón actual de login

    const isAuthenticated = document.cookie.includes("jwt="); // Revisar si existe el token en cookies

    if (isAuthenticated) {
        // Si está autenticado, cambiamos el texto del botón y su redirección
        loginButton.innerHTML = '<i class="fa fa-user"></i> Usuario'; // Cambiar el texto manteniendo el ícono
        loginButton.href = "/usuario"; // Redirigir a la página de perfil o usuario

        // Redirigir a la página de usuario cuando se hace clic
        loginButton.addEventListener("click", (e) => {
            e.preventDefault(); // Evitar comportamiento predeterminado
            window.location.href = "/usuario"; // Redirigir
        });

        // Si el usuario ya está logueado, evitamos que el modal de inicio de sesión se muestre
        const modalIniciarSesion = document.getElementById('modaliniciodesesion');
        if (modalIniciarSesion) {
            modalIniciarSesion.close();  // Cerramos el modal si está abierto
        }
    } else {
        // Si no está autenticado, mostramos el modal
        const modalIniciarSesion = document.getElementById('modaliniciodesesion');
        if (modalIniciarSesion && !modalIniciarSesion.open) {
            modalIniciarSesion.showModal(); // Mostramos el modal de inicio de sesión
        }
    }
});
