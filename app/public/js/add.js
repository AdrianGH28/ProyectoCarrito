document.getElementById('agregarmarcaform').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evitar recargar la página

    const marca = document.getElementById('marcaInput').value; // Obtener el valor del input

    if (!marca.trim()) {
        alert('Por favor, ingresa un nombre para el proveedor.');
        return;
    }

    const response = await fetch('/api/add-marca', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({nom_marca: marca})
    });

    const result = await response.json(); // Recibir la respuesta como JSON
    
    if (result.status === "ok") {
        alert(result.message); // Mostrar el mensaje de éxito con el nombre de la marca
        document.getElementById('marcaInput').value = ''; // Limpiar el valor del input
        localStorage.removeItem('marcaInput');
        
    } else {
        document.querySelector('.error').classList.remove('escondido');
        document.querySelector('.error').textContent = result.message; // Mostrar el mensaje de error
    }
});

document.getElementById('agregarCategoriaForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evitar recargar la página

    const categoria = document.getElementById('categoriaInput').value; // Obtener el valor del input

    if (!categoria.trim()) {
        alert('Por favor, ingresa un nombre para la categoria.');
        return;
    }

    const response = await fetch('/api/add-categoria', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({nom_tipoprod: categoria})
    });

    const result = await response.json(); // Recibir la respuesta como JSON
    
    if (result.status === "ok") {
        alert(result.message); // Mostrar el mensaje de éxito con el nombre de la marca
        document.getElementById('categoriaInput').value = ''; // Limpiar el valor del input
        localStorage.removeItem('categoriaInput');
        
    } else {
        document.querySelector('.error').classList.remove('escondido');
        document.querySelector('.error').textContent = result.message; // Mostrar el mensaje de error
    }
});



document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded');  // Verifica si el evento se dispara
    const select = document.getElementById('catsel');
    select.style.display = 'block';
    
    try {
        const response = await fetch('/api/tipos-producto');
        const result = await response.json();
        
        console.log(result);  // Asegúrate de que la respuesta de la API sea correcta

        if (result.status === 'ok') {
            result.data.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id_tipoprod;
                option.textContent = categoria.nom_tipoprod;
                select.appendChild(option);
            });

            // Agregar la opción por defecto después de añadir las opciones
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Selecciona la Categoría';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            select.insertBefore(defaultOption, select.firstChild);  // Asegúrate de que aparezca en la parte superior
        } else {
            console.error('Error al cargar los tipos de productos:', result.message);
        }
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
    }
});




document.getElementById('agregarsubcatform').addEventListener('submit', async (event) => {
    event.preventDefault();  // Evitar que se recargue la página

    const subcatName = document.getElementById('subcatadd').value;
    const selectedCategory = document.getElementById('catsel').value;

    if (!subcatName || !selectedCategory) {
        alert('Por favor, completa todos los campos');
        return;
    }

    try {
        const response = await fetch('/api/agregar-subcategoria', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nom_subtipop: subcatName,
                id_tipoprod: selectedCategory,
            }),
        });

        const result = await response.json();
        if (result.status === 'ok') {
            alert('Subcategoría agregada con éxito');
            // Resetear el formulario o hacer algo después de agregar
        } else {
            alert('Error al agregar la subcategoría');
        }
    } catch (error) {
        console.error('Error al enviar la solicitud:', error);
        alert('Hubo un error al procesar tu solicitud');
    }
});




