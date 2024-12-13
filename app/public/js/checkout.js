
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


document.addEventListener('DOMContentLoaded', async () => {
    const orderList = document.getElementById('order-list');
    const subtotalElement = document.getElementById('subtotalc');
    const form = document.getElementById('checkout-form'); // Asegúrate de tener el formulario con este ID

    // Verificar si los elementos existen
    if (!orderList || !subtotalElement || !form) {
        console.error('Uno o más elementos no se encontraron en el DOM');
        return;
    }

    const userId = await obtenerUserId(); // Este debería ser dinámico dependiendo del usuario logueado

    // Obtener el carrito del usuario
    fetch(`/api/carrito/${userId}`)
        .then(response => response.json())
        .then(data => {
            console.log('Data recibida de la API:', data);

            if (data.status === 'ok') {
                const cartInfo = data.data;

                // Verificar si hay productos en el carrito
                
                    orderList.innerHTML = '';
                    let subtotal = 0;

                    // Mostrar los productos en la lista
                    cartInfo.products.forEach(item => {
                        const listItem = document.createElement('li');
                        const itemTotal = item.precio_prod * item.cantidad;

                        listItem.innerHTML = `${item.nom_prod} <span>$${itemTotal.toFixed(2)}</span>`;
                        orderList.appendChild(listItem);

                        subtotal += itemTotal;
                    });

                    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
                

                // Manejar el submit del formulario
                form.addEventListener('submit', (e) => {
                    e.preventDefault(); // Evitar que el formulario se envíe normalmente

                    // Verificar si el carrito está vacío antes de proceder con el pago
                    if (!cartInfo || !cartInfo.products || cartInfo.products.length === 0) {
                        alert('Tu carrito está vacío, por favor agrega productos antes de proceder con el pago.');
                        console.error('El carrito está vacío');
                        return; // No continuar con el pago
                    }

                    // Validaciones del formulario
                    const nombre = document.getElementById('nombre') ? document.getElementById('nombre').value : '';
                    const apellido = document.getElementById('apellido') ? document.getElementById('apellido').value : '';
                    const calle = document.getElementById('ncalle') ? document.getElementById('ncalle').value : '';
                    const numinte = document.getElementById('numinte') ? document.getElementById('numinte').value : '';
                    const numexte = document.getElementById('numexte') ? document.getElementById('numexte').value : '';
                    const colonia = document.getElementById('ncol') ? document.getElementById('ncol').value : '';
                    const estado = document.getElementById('estado') ? document.getElementById('estado').value : '';
                    const ciudad = document.getElementById('ciudad') ? document.getElementById('ciudad').value : '';
                    const cp = document.getElementById('cp') ? document.getElementById('cp').value : '';

                    // Validaciones básicas
                    if (!nombre || !apellido || !calle || !numexte || !colonia || !estado || !ciudad || !cp) {
                        alert("Por favor, complete todos los campos obligatorios.");
                        return;
                    }

                    const direccion = {
                        numinte: numinte,
                        numexte: numexte,
                        colonia: colonia,
                        calle: calle,
                        ciudad: ciudad,
                        estado: estado,
                        cp: cp
                    };

                    const checkoutData = {
                        id_carr: cartInfo.id_carr,  // Asegúrate de que el ID del carrito se esté enviando correctamente
                        fecha_pago: new Date().toISOString().split('T')[0],  // Fecha actual en formato YYYY-MM-DD
                        nombrec: nombre,
                        apellidoc: apellido,
                        pago: subtotal.toFixed(2) // Total del carrito
                    };

                    console.log('Datos del checkout:', checkoutData);
                    console.log('Dirección:', direccion);

                    // Llamada a la API para guardar la dirección y el checkout
                    fetch('/api/direccion/insertar', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            datosCheckout: checkoutData,
                            datosDireccion: direccion,
                        }),
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.status === 'ok') {
                                alert('Pago exitoso');

                                // Vaciar el carrito después de un pago exitoso
                                fetch(`/api/carrito/vaciar/${userId}`, {
                                    method: 'DELETE', // Método para eliminar todos los productos del carrito
                                })
                                    .then(response => response.json())
                                    .then(data => {
                                        if (data.status === 'ok') {
                                            console.log('Productos del carrito eliminados correctamente');
                                            location.reload();
                                            // Aquí puedes redirigir o realizar cualquier otra acción después de vaciar el carrito
                                        } else {
                                            console.error('Error al eliminar los productos del carrito');
                                        }
                                    })
                                    .catch(error => {
                                        console.error('Error al vaciar los productos del carrito:', error);
                                    });

                                    window.location.replace('/');
                            } else {
                                alert('Hubo un error con el pago');
                            }
                        })
                        .catch(error => {
                            console.error('Error al procesar el pago:', error);
                            alert('Hubo un error en la solicitud');
                        });
                });
            } else {
                console.error('Error al cargar el carrito:', data.message);
                orderList.innerHTML = '<li>Error al cargar el carrito.</li>';
                subtotalElement.textContent = '$0.00';
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
            orderList.innerHTML = '<li>Error en la solicitud.</li>';
            subtotalElement.textContent = '$0.00';
        });
});
