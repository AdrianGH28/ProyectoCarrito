

//categoria opcion
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM completamente cargado.');

    const select = document.getElementById('marca');
    select.style.display = 'block';
    try {
        const response = await fetch('/api/marcas');
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        const result = await response.json();
        console.log('Respuesta de la API:', result);

        if (result.status === 'ok') {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Selecciona la Marca';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            select.appendChild(defaultOption);


            result.data.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id_marca;
                option.textContent = categoria.nom_marca;
                select.appendChild(option);
            });
        } else {
            console.error('Error en los datos de la API:', result.message);
        }
    } catch (error) {
        console.error('Error en el fetch:', error);
    }
});

//marca opcion
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM completamente cargado.');

    const select = document.getElementById('catsel');
    select.style.display = 'block';
    try {
        const response = await fetch('/api/tipos-productos');
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        const result = await response.json();
        console.log('Respuesta de la API:', result);

        if (result.status === 'ok') {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Selecciona la Categoría';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            select.appendChild(defaultOption);

            result.data.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id_tipoprod;
                option.textContent = categoria.nom_tipoprod;
                select.appendChild(option);
            });
        } else {
            console.error('Error en los datos de la API:', result.message);
        }
    } catch (error) {
        console.error('Error en el fetch:', error);
    }
});


//subtipo opcion
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM completamente cargado.');

    const select = document.getElementById('subtipo');
    select.style.display = 'block';
    try {
        const response = await fetch('/api/subtipos-productos');
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        const result = await response.json();
        console.log('Respuesta de la API:', result);

        if (result.status === 'ok') {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Selecciona el Subtipo';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            select.appendChild(defaultOption);

            result.data.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id_subtipop;
                option.textContent = categoria.nom_subtipop;
                select.appendChild(option);
            });
        } else {
            console.error('Error en los datos de la API:', result.message);
        }
    } catch (error) {
        console.error('Error en el fetch:', error);
    }
});

document.getElementById('agregarprodform').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evitar que se recargue la página

    // Obtener los valores de los inputs
    const prodCode = document.getElementById('prodcode').value;
    const prodName = document.getElementById('prodname').value;
    const prodPrice = document.getElementById('prodprice').value;
    const prodQty = document.getElementById('prodqty').value;
    const prodDesc = document.getElementById('proddesc').value;
    const prodImg = document.getElementById('prodimg').value;
    const marca = document.getElementById('marca').value; // Tomar el valor seleccionado
    const subtipo = document.getElementById('subtipo').value; // Tomar el valor seleccionado

    // Validar campos
    if (!prodCode || !prodName || !prodPrice || !prodQty || !marca || !subtipo) {
        alert('Por favor, completa todos los campos');
        return;
    }

    try {
        const response = await fetch('/api/agregar-producto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                codbar_prod: prodCode,
                nom_prod: prodName,
                precio_prod: prodPrice,
                cantidad: prodQty,
                descripcion: prodDesc,
                img_prod: prodImg,
                id_marca: parseInt(marca), // Convertir a número
                id_subtipop: parseInt(subtipo), // Convertir a número
            }),
        });

        const result = await response.json();
        if (result.status === 'ok') {
            alert('Producto agregado con éxito');
            document.getElementById('agregarprodform').reset();
        } else {
            alert('Error al agregar el producto');
        }
    } catch (error) {
        console.error('Error al enviar la solicitud:', error);
        alert('Hubo un error al procesar tu solicitud');
    }
});
