import express from "express";
import cookieParser from 'cookie-parser';
import mysql from 'mysql2/promise';
import bcryptjs from "bcryptjs";
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import session from 'express-session';
import path from 'path';
import geoip from 'geoip-lite';
import dotenv from "dotenv";
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { methods as authentication } from "./controllers/authentication.controller.js";
import { methods as authorization } from "./middlewares/authorization.js";


// Fix para __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Server
const app = express();
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sephorapagos@gmail.com',
        pass: 'rinroxhojfmcjprx'
    }
});
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET, // Use a secret key from your .env file
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

const router = express.Router();

// Conexion con la base de datos
const conexion = await mysql.createConnection({
    host: 'localhost',
    database: 'dbcarrito',
    user: 'root',
    //password: 'n0m3l0'
    password: 'jaghSQL2806.'
    //password: 'Sally2007.'
});
// Configuracion
app.use(express.static(__dirname + "/public"));

app.set("port", 4000);
app.listen(app.get("port"));
console.log("Servidor corriendo en puerto", app.get("port"));

// Rutas
//app.get("/", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/index.html"));
app.get("/", (req, res) => res.sendFile(__dirname + "/pages/index.html"));
app.get("/carrito", (req, res) => res.sendFile(__dirname + "/pages/shoping-cart.html"));
app.get("/checkout", (req, res) => res.sendFile(__dirname + "/pages/checkout.html"));
app.get("/admin", (req, res) => res.sendFile(__dirname + "/pages/admin.html"));
//app.get("/admin", authorization.soloAdmin, (req, res) => res.sendFile(__dirname + "/pages/admin.html"));

//solo almacenista
app.get("/almacenista", (req, res) => res.sendFile(__dirname + "/pages/almacenista.html"));
//app.get("/admin", authorization.solo, (req, res) => res.sendFile(__dirname + "/pages/admin.html"));


//solo admin
app.get("/escogerreportes", (req, res) => res.sendFile(__dirname + "/pages/adminreporte.html"));
//app.get("/escogerreportes", authorization.soloAdmin, (req, res) => res.sendFile(__dirname + "/pages/adminnreporte.html"));
app.get("/escogeradd", (req, res) => res.sendFile(__dirname + "/pages/adminadd.html"));
//app.get("/escogeradd", authorization.soloAdmin, (req, res) => res.sendFile(__dirname + "/pages/adminadd.html"));

//admin y almacenista
app.get("/reporteproductos", (req, res) => res.sendFile(__dirname + "/pages/reporteproductos.html"));


//solo admin
//app.get("/reporteventas", authorization.soloAdmin, (req, res) => res.sendFile(__dirname + "/pages/adminreporte.html"));
app.get("/reporteventas", (req, res) => res.sendFile(__dirname + "/pages/reporteventas.html"));
app.get("/reporteusuarios", (req, res) => res.sendFile(__dirname + "/pages/reporteusuarios.html"));


//admin y almacenista
app.get("/anadirprods", (req, res) => res.sendFile(__dirname + "/pages/addproduct.html"));
//solo admin
//app.get("/añadircats", authorization.soloAdmin, (req, res) => res.sendFile(__dirname + "/pages/addcategory.html"));
app.get("/anadircats", (req, res) => res.sendFile(__dirname + "/pages/addcategory.html"));

app.get("/usuario", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/infouser.html"));




app.get("/historial", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/historial.html"));
app.get("/principal", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/principal.html"));
app.get("/vincular", authorization.proteccion, (req, res) => res.sendFile(__dirname + "/pages/vincular.html"));
app.get("/inicio", authorization.soloPublico, (req, res) => res.sendFile(__dirname + "/pages/inicio.html"));


app.post("/api/registro", authentication.registro);
app.post("/api/login", authentication.login);
app.post("/api/forgot-password", authentication.forgotPassword);
app.post("/api/reset-password", authentication.resetPassword);


dotenv.config();

//RUTAS PARA EL ADMIN DE AGREGAR COSITAS
app.get("/api/tipos-producto", async (req, res) => {
    try {
        // Realizar la consulta a la base de datos para obtener todos los tipos de productos
        const [rows] = await conexion.execute('SELECT id_tipoprod, nom_tipoprod FROM ctipoprod');
        console.log(rows);
        // Verificar si no se encontraron tipos de productos
        if (rows.length === 0) {
            return res.status(404).send({ status: "Error", message: "No se encontraron tipos de productos" });
        }

        // Devolver los tipos de productos en formato JSON
        res.send({ status: "ok", data: rows });
    } catch (error) {
        // Capturar errores y mostrarlos en la consola
        console.error('Error al obtener los tipos de productos:', error);
        return res.status(500).send({ status: "Error", message: "Error al obtener los tipos de productos" });
    }
});

app.get("/api/tipos-productos", async (req, res) => {
    try {
        const [rows] = await conexion.execute('SELECT id_tipoprod, nom_tipoprod FROM ctipoprod');
        if (rows.length === 0) {
            return res.status(404).json({ status: "Error", message: "No se encontraron tipos de productos" });
        }
        res.json({ status: "ok", data: rows });
    } catch (error) {
        console.error('Error al obtener los tipos de productos:', error);
        res.status(500).json({ status: "Error", message: "Error al obtener los tipos de productos" });
    }
});


//MARCAS
app.get("/api/marca", async (req, res) => {
    try {
        const [rows] = await conexion.execute('SELECT id_marca, nom_marca FROM cmarca');
        if (rows.length === 0) {
            return res.status(404).send({ status: "Error", message: "No se encontraron marcas" });
        }
        res.send({ status: "ok", data: rows });
    } catch (error) {
        console.error('Error al obtener las marcas:', error);
        res.status(500).send({ status: "Error", message: "Error al obtener las marcas" });
    }
});

//SUBTIPO
app.get("/api/subtipos-productos", async (req, res) => {
    try {
        const [rows] = await conexion.execute('SELECT id_subtipop, nom_subtipop FROM csubtipop');
        if (rows.length === 0) {
            return res.status(404).send({ status: "Error", message: "No se encontraron subtipos de productos" });
        }
        res.send({ status: "ok", data: rows });
    } catch (error) {
        console.error('Error al obtener los subtipos de productos:', error);
        res.status(500).send({ status: "Error", message: "Error al obtener los subtipos de productos" });
    }
});




// Ruta para agregar la subcategoría
app.post('/api/agregar-subcategoria', async (req, res) => {
    const { nom_subtipop, id_tipoprod } = req.body;

    // Validación de datos
    if (!nom_subtipop || !id_tipoprod) {
        return res.status(400).send({ status: 'Error', message: 'Datos incompletos' });
    }

    try {
        // Realizar la inserción en la base de datos
        const query = 'INSERT INTO csubtipop (nom_subtipop, id_tipoprod) VALUES (?, ?)';
        const [result] = await conexion.execute(query, [nom_subtipop, id_tipoprod]);

        if (result.affectedRows > 0) {
            return res.send({ status: 'ok', message: 'Subcategoría agregada con éxito' });
        } else {
            return res.status(500).send({ status: 'Error', message: 'No se pudo agregar la subcategoría' });
        }
    } catch (error) {
        console.error('Error al agregar la subcategoría:', error);
        return res.status(500).send({ status: 'Error', message: 'Error al agregar la subcategoría' });
    }
});

app.post('/api/agregar-producto', async (req, res) => {
    const {
        codbar_prod,
        nom_prod,
        precio_prod,
        cantidad,
        descripcion,
        img_prod,
        id_marca,
        id_subtipop,
    } = req.body;

    // Validación de datos
    if (!codbar_prod || !nom_prod || !precio_prod || !cantidad || !id_marca || !id_subtipop) {
        return res.status(400).send({ status: 'Error', message: 'Datos incompletos' });
    }

    try {
        // Realizar la inserción en la base de datos
        const query = `
            INSERT INTO cproductos (
                codbar_prod, nom_prod, precio_prod, cantidad, descripcion, img_prod, id_marca, id_subtipop
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await conexion.execute(query, [
            codbar_prod, nom_prod, precio_prod, cantidad, descripcion, img_prod, id_marca, id_subtipop
        ]);

        if (result.affectedRows > 0) {
            return res.send({ status: 'ok', message: 'Producto agregado con éxito' });
        } else {
            return res.status(500).send({ status: 'Error', message: 'No se pudo agregar el producto' });
        }
    } catch (error) {
        console.error('Error al agregar el producto:', error);
        return res.status(500).send({ status: 'Error', message: 'Error al agregar el producto' });
    }
});



app.get("/api/subtipos-producto", authorization.proteccion, async (req, res) => {
    try {
        // Realizar la consulta a la base de datos para obtener todos los tipos de productos
        const [rows] = await conexion.execute('SELECT id_subtipop, nom_subtipop, id_tipoprod FROM csubtipop');

        // Verificar si no se encontraron tipos de productos
        if (rows.length === 0) {
            return res.status(404).send({ status: "Error", message: "No se encontraron los subtipos de productos" });
        }

        // Devolver los tipos de productos en formato JSON
        res.send({ status: "ok", data: rows });
    } catch (error) {
        // Capturar errores y mostrarlos en la consola
        console.error('Error al obtener los tipos de productos:', error);
        return res.status(500).send({ status: "Error", message: "Error al obtener los subtipos de productos" });
    }
});


//ADMIN 
app.get("/api/productosreporte", async (req, res) => {
    try {
        const query = `
                select codbar_prod, nom_prod, precio_prod, cantidad, nom_tipoprod, nom_subtipop, nom_marca from cproductos prod
                inner join csubtipop sbtp on prod.id_subtipop = sbtp.id_subtipop
                inner join ctipoprod tipr on sbtp.id_tipoprod = tipr.id_tipoprod
                inner join cmarca marc on prod.id_marca = marc.id_marca;
            `;
        const [rows] = await conexion.execute(query);
        res.send(rows);
    } catch (error) {
        console.error('Error al obtener datos del reporte:', error.message);
        res.status(500).send('Error al obtener datos del reporte');
    }
});

app.get("/api/ventasreporte", async (req, res) => {
    try {
        const query = `
                select nombrec, apellidoc, fecha_pago, pago, correo_user, concat (ncalle_direc," ", numexte_direc,", ", numinte_direc,", ", ncol_direc," ", alcaldia_dir," ", cp_dir," ", nciudad_direc," ") as direccion from dcheckout chec
                inner join ccarrito carr on chec.id_carr = carr.id_carr
                inner join musuario usua on carr.id_user = usua.id_user
                inner join ddireccion dirc on chec.id_direc = dirc.id_direc;
            `;
        const [rows] = await conexion.execute(query);
        res.send(rows);
    } catch (error) {
        console.error('Error al obtener datos del reporte:', error.message);
        res.status(500).send('Error al obtener datos del reporte');
    }
});
app.get("/api/usersreporte", async (req, res) => {
    try {
        const query = `
                SELECT correo_user  FROM musuario;
            `;
        const [rows] = await conexion.execute(query);
        res.send(rows);
    } catch (error) {
        console.error('Error al obtener datos del reporte:', error.message);
        res.status(500).send('Error al obtener datos del reporte');
    }
});

app.post('/api/add-marca', async (req, res) => {
    console.log('Recibida una solicitud para agregar una marca:', req.body);

    const { nom_marca } = req.body; // Obtener el nombre de la marca desde el cuerpo de la solicitud

    try {
        // Validar que el nombre de la marca no esté vacío
        if (!nom_marca || !nom_marca.trim()) {
            console.log('El campo nom_marca es obligatorio');
            return res.status(400).json({ status: 'error', message: 'El campo nom_marca es obligatorio' });
        }

        // Insertar la marca en la tabla cmarca
        console.log('Insertando la marca en la tabla cmarca...');
        const marcaQuery = 'INSERT INTO cmarca (nom_marca) VALUES (?)';
        const [marcaResult] = await conexion.execute(marcaQuery, [nom_marca]);

        // Verificar si se insertó correctamente la marca
        if (marcaResult.affectedRows === 0) {
            console.log('No se insertaron filas en la tabla cmarca');
            return res.status(500).json({ status: 'error', message: 'Error al insertar datos en la tabla cmarca' });
        }

        console.log('Marca agregada correctamente en la base de datos');
        res.status(200).json({ status: 'ok', message: `Marca "${nom_marca}" agregada correctamente.` });
    } catch (error) {
        console.error('Error al insertar datos en la base de datos:', error.message);
        res.status(500).json({ status: 'error', message: 'Error al insertar datos en la base de datos' });
    }
});
app.post('/api/add-categoria', async (req, res) => {
    console.log('Recibida una solicitud para agregar una categoria:', req.body);

    const { nom_tipoprod } = req.body; // Obtener el nombre de la marca desde el cuerpo de la solicitud

    try {
        // Validar que el nombre de la marca no esté vacío
        if (!nom_tipoprod || !nom_tipoprod.trim()) {
            console.log('El campo nom_marca es obligatorio');
            return res.status(400).json({ status: 'error', message: 'El campo nom_tipoprod es obligatorio' });
        }

        // Insertar la marca en la tabla cmarca
        console.log('Insertando la marca en la tabla ctipoprod...');
        const categoriaQuery = 'INSERT INTO ctipoprod (nom_tipoprod) VALUES (?)';
        const [categoriaResult] = await conexion.execute(categoriaQuery, [nom_tipoprod]);

        // Verificar si se insertó correctamente la marca
        if (categoriaResult.affectedRows === 0) {
            console.log('No se insertaron filas en la tabla ctipoprod');
            return res.status(500).json({ status: 'error', message: 'Error al insertar datos en la tabla cmarca' });
        }

        console.log('Categoria agregada correctamente en la base de datos');
        res.status(200).json({ status: 'ok', message: `Categoria "${nom_tipoprod}" agregada correctamente.` });
    } catch (error) {
        console.error('Error al insertar datos en la base de datos:', error.message);
        res.status(500).json({ status: 'error', message: 'Error al insertar datos en la base de datos' });
    }
});



// Ruta para obtener las marcas desde la base de datos
app.get("/api/marcas", async (req, res) => {
    try {
        // Realizar la consulta a la base de datos para obtener las marcas
        const [rows] = await conexion.execute('SELECT id_marca, nom_marca FROM cmarca');

        // Verificar si no se encontraron marcas
        if (rows.length === 0) {
            return res.status(404).send({ status: "Error", message: "No se encontraron marcas" });
        }

        // Devolver las marcas en formato JSON
        res.send({ status: "ok", data: rows });
    } catch (error) {
        // Capturar errores y mostrarlos en la consola
        console.error('Error al obtener las marcas:', error);
        return res.status(500).send({ status: "Error", message: "Error al obtener las marcas" });
    }
});

// Ruta para obtener los productos desde la base de datos
app.get("/api/productos", async (req, res) => {
    try {
        const [rows] = await conexion.execute('SELECT id_prod, nom_prod, precio_prod, img_prod FROM cproductos');

        if (rows.length === 0) {
            return res.status(404).send({ status: "Error", message: "No se encontraron productos" });
        }

        // Devolver los productos en formato JSON
        res.send({ status: "ok", data: rows });
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        return res.status(500).send({ status: "Error", message: "Error al obtener los productos" });
    }
});

// Ruta para obtener los tipos de productos desde la base de datos
app.get("/api/tipos-productos", async (req, res) => {
    try {
        // Realizar la consulta a la base de datos para obtener los tipos de productos
        const [rows] = await conexion.execute(
            'SELECT id_tipoprod, nom_tipoprod FROM ctipoprod'
        );

        // Verificar si no se encontraron tipos de productos
        if (rows.length === 0) {
            return res.status(404).send({ status: "Error", message: "No se encontraron tipos de productos" });
        }

        // Devolver los tipos de productos en formato JSON
        res.send({ status: "ok", data: rows });
    } catch (error) {
        // Capturar errores y mostrarlos en la consola
        console.error('Error al obtener los tipos de productos:', error);
        return res.status(500).send({ status: "Error", message: "Error al obtener los tipos de productos" });
    }
});

// Ruta para obtener los subtipos por tipo de producto
app.get("/api/subtipos-productos", async (req, res) => {
    try {
        // Obtener el parámetro 'tipo' de la solicitud
        const tipoId = req.query.tipo || "todo";

        // Definir la consulta y los parámetros dinámicamente
        let query = 'SELECT id_subtipop, nom_subtipop FROM csubtipop';
        const params = [];

        // Si se especifica un tipo y no es "todo", filtrar por tipo
        if (tipoId && tipoId.toLowerCase() !== "todo") {
            query += ' WHERE id_tipoprod = ?';
            params.push(tipoId);
        }

        // Ejecutar la consulta
        const [rows] = await conexion.execute(query, params);

        // Verificar si no se encontraron subtipos
        if (rows.length === 0) {
            return res.status(404).send({ status: "Error", message: "No se encontraron subtipos" });
        }

        // Devolver los subtipos en formato JSON
        res.send({ status: "ok", data: rows });
    } catch (error) {
        // Capturar errores y mostrarlos en la consola
        console.error('Error al obtener los subtipos:', error);
        return res.status(500).send({ status: "Error", message: "Error al obtener los subtipos" });
    }
});



// Ruta para obtener productos filtrados por marca
app.get("/api/productos/filtrar", async (req, res) => {
    try {
        const { id_marca } = req.query; // Obtener el ID de la marca desde los parámetros de consulta

        // Consulta SQL
        const query = id_marca
            ? 'SELECT id_prod, nom_prod, precio_prod, img_prod FROM cproductos WHERE id_marca = ?'
            : 'SELECT id_prod, nom_prod, precio_prod, img_prod FROM cproductos';

        const params = id_marca ? [id_marca] : [];
        const [rows] = await conexion.execute(query, params);

        if (rows.length === 0) {
            return res.status(404).send({ status: "Error", message: "No se encontraron productos para esta marca" });
        }

        res.send({ status: "ok", data: rows });
    } catch (error) {
        console.error('Error al filtrar los productos:', error);
        return res.status(500).send({ status: "Error", message: "Error al filtrar los productos" });
    }
});


// API para filtrar productos por tipo
app.get("/api/productos/filtrar-tipo", async (req, res) => {
    try {
        const { id_tipoprod } = req.query; // Obtener el ID del tipo de producto desde los parámetros de consulta
        console.log("ID del tipo de producto recibido:", id_tipoprod)

        // Verificar que se haya proporcionado un ID
        if (!id_tipoprod) {
            return res.status(400).send({ status: "Error", message: "El ID del tipo de producto es obligatorio." });
        }

        // Consulta SQL con INNER JOIN para filtrar por tipo de producto
        const query = `
            SELECT 
                p.id_prod, 
                p.nom_prod, 
                p.precio_prod, 
                p.img_prod 
            FROM 
                cproductos p
            INNER JOIN 
                csubtipop st ON p.id_subtipop = st.id_subtipop
            INNER JOIN 
                ctipoprod tp ON st.id_tipoprod = tp.id_tipoprod
            WHERE 
                tp.id_tipoprod = ?;
        `;

        const [rows] = await conexion.execute(query, [id_tipoprod]);

        if (rows.length === 0) {
            console.warn("No se encontraron productos para el ID de tipo proporcionado:", id_tipoprod);
            return res.status(404).send({ status: "Error", message: "No se encontraron productos para este tipo." });
        }

        res.send({ status: "ok", data: rows });
    } catch (error) {
        console.error("Error al filtrar los productos por tipo:", error);
        return res.status(500).send({ status: "Error", message: "Error interno del servidor." });
    }
});



// Ruta para filtrar productos por nombre
app.get("/api/productos/filtrar-nombre", async (req, res) => {
    try {
        const { nombre } = req.query; // Obtener el nombre del producto desde los parámetros de consulta
        console.log("Nombre de producto recibido:", nombre);

        if (!nombre) {
            return res.status(400).send({ status: "Error", message: "El nombre del producto es obligatorio." });
        }

        // Consulta SQL para buscar productos cuyo nombre coincida (ignorando mayúsculas/minúsculas)
        const query = `
            SELECT 
                p.id_prod, 
                p.nom_prod, 
                p.precio_prod, 
                p.img_prod 
            FROM 
                cproductos p
            WHERE 
                LOWER(p.nom_prod) LIKE LOWER(?)`;

        const [rows] = await conexion.execute(query, [`%${nombre}%`]);

        if (rows.length === 0) {
            console.warn("No se encontraron productos para el nombre:", nombre);
            return res.status(404).send({ status: "Error", message: "No se encontraron productos con ese nombre." });
        }

        res.send({ status: "ok", data: rows });
    } catch (error) {
        console.error("Error al filtrar los productos por nombre:", error);
        return res.status(500).send({ status: "Error", message: "Error interno del servidor." });
    }
});
app.get('/api/usuario', async (req, res) => {
    const token = req.cookies.jwt;

    console.log('Token recibido:', token);

    if (!token) {
        return res.status(401).json({ status: 'error', message: 'No autorizado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verificación del token
        console.log('Token decodificado:', decoded);

        const id_user = decoded.id_user;  // Extrae el ID del usuario

        // Llamar a la función para obtener el correo por id_user
        const userEmail = await obtenerCorreoPorId(id_user);  // Uso de await para obtener el correo

        if (userEmail) {
            res.json({ status: 'ok', id_user, correo_user: userEmail });
        } else {
            res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al verificar el token:', error);
        res.status(403).json({ status: 'error', message: 'Token inválido' });
    }
});


const obtenerCorreoPorId = async (id_user) => {
    try {
        // Consulta SQL para obtener el correo del usuario por su ID
        const query = 'SELECT correo_user FROM musuario WHERE id_user = ?';
        const [rows] = await conexion.execute(query, [id_user]);

        // Verifica si se encontró el usuario
        if (rows.length > 0) {
            return rows[0].correo_user;  // Devuelve el correo del usuario
        } else {
            return null;  // Si no se encuentra el usuario
        }
    } catch (error) {
        console.error('Error al obtener el correo del usuario:', error);
        throw error;  // Lanza el error para ser capturado por el manejador de errores
    }
};

app.post("/api/carrito/agregar", async (req, res) => {
    const { id_user, id_prod } = req.body;

    // Verificar que los parámetros obligatorios estén presentes
    if (!id_user || !id_prod) {
        return res.status(400).send({ status: "Error", message: "Faltan parámetros obligatorios." });
    }
    console.log("ID de usuario recibido:", id_user);
    if (!id_user || isNaN(id_user)) {
        return res.status(400).send({ status: "Error", message: "ID de usuario inválido." });
    }


    try {
        // Verificar si ya existe un carrito para el usuario
        const queryCheckCart = 'SELECT * FROM ccarrito WHERE id_user = ?';
        const [existingCart] = await conexion.execute(queryCheckCart, [id_user]);

        let cartId;

        if (existingCart.length > 0) {
            // Si el carrito ya existe, obtenemos el id del carrito
            cartId = existingCart[0].id_carr;
        } else {
            // Si no existe el carrito, creamos uno
            const queryCreateCart = 'INSERT INTO ccarrito (id_user, total_car, costo_total) VALUES (?, 0, 0)';
            const [result] = await conexion.execute(queryCreateCart, [id_user]);
            cartId = result.insertId; // Obtenemos el ID del nuevo carrito
        }

        // Obtener el precio del producto
        const queryGetProductPrice = 'SELECT precio_prod FROM cproductos WHERE id_prod = ?';
        const [product] = await conexion.execute(queryGetProductPrice, [id_prod]);

        if (product.length === 0) {
            return res.status(404).send({ status: "Error", message: "Producto no encontrado." });
        }

        const productPrice = product[0].precio_prod;

        // Verificar si el producto ya está en el carrito
        const queryCheckProductInCart = 'SELECT * FROM carrito_productos WHERE id_carr = ? AND id_prod = ?';
        const [productInCart] = await conexion.execute(queryCheckProductInCart, [cartId, id_prod]);

        if (productInCart.length > 0) {
            // Si el producto ya está en el carrito, solo actualizamos la cantidad
            const queryUpdateProduct = 'UPDATE carrito_productos SET cantidad = cantidad + 1 WHERE id_carr = ? AND id_prod = ?';
            await conexion.execute(queryUpdateProduct, [cartId, id_prod]);

            // Actualizar el total del carrito (cantidad de productos)
            const queryUpdateTotal = 'UPDATE ccarrito SET total_car = total_car + 1 WHERE id_carr = ?';
            await conexion.execute(queryUpdateTotal, [cartId]);

            // Actualizar el costo total del carrito
            const queryUpdateCost = 'UPDATE ccarrito SET costo_total = costo_total + ? WHERE id_carr = ?';
            await conexion.execute(queryUpdateCost, [productPrice, cartId]);

        } else {
            // Si el producto no está en el carrito, lo agregamos
            const queryAddProduct = 'INSERT INTO carrito_productos (id_carr, id_prod, cantidad) VALUES (?, ?, 1)';
            await conexion.execute(queryAddProduct, [cartId, id_prod]);

            // Actualizar el total del carrito (cantidad de productos)
            const queryUpdateTotal = 'UPDATE ccarrito SET total_car = total_car + 1 WHERE id_carr = ?';
            await conexion.execute(queryUpdateTotal, [cartId]);

            // Actualizar el costo total del carrito
            const queryUpdateCost = 'UPDATE ccarrito SET costo_total = costo_total + ? WHERE id_carr = ?';
            await conexion.execute(queryUpdateCost, [productPrice, cartId]);
        }

        return res.send({ status: "ok", message: "Producto agregado al carrito correctamente." });

    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        return res.status(500).send({ status: "Error", message: "Error al agregar el producto al carrito." });
    }
});

app.get("/api/carrito/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const query = 'SELECT * FROM ccarrito WHERE id_user = ?';
        const [cart] = await conexion.execute(query, [userId]);

        if (cart.length === 0) {
            return res.status(404).send({ status: 'Error', message: 'El carrito está vacío.' });
        }

        // Obtener los productos del carrito
        const queryProducts = 'SELECT * FROM carrito_productos WHERE id_carr = ?';
        const [products] = await conexion.execute(queryProducts, [cart[0].id_carr]);

        let totalCar = 0;
        let costoTotal = 0;

        // Calcular totales si hay productos
        const productsDetails = await Promise.all(products.map(async (product) => {
            const queryProduct = 'SELECT * FROM cproductos WHERE id_prod = ?';
            const [productDetails] = await conexion.execute(queryProduct, [product.id_prod]);

            if (productDetails.length > 0) {
                const productInfo = productDetails[0];
                totalCar += product.cantidad;
                costoTotal += product.cantidad * productInfo.precio_prod;

                return {
                    id_prod: product.id_prod,
                    nom_prod: productInfo.nom_prod,
                    precio_prod: productInfo.precio_prod,
                    cantidad: product.cantidad,
                    img_prod: productInfo.img_prod,
                };
            }

            return null;
        }));

        // Devolver el carrito con el id_carr
        return res.send({
            status: 'ok',
            data: {
                id_carr: cart[0].id_carr, // Añadir el ID del carrito
                products: productsDetails.filter(p => p !== null),
                total_car: totalCar,
                costo_total: costoTotal,
            }
        });
    } catch (error) {
        console.error('Error al obtener carrito:', error);
        return res.status(500).send({ status: 'Error', message: 'Error al obtener carrito.' });
    }
});


// Ruta para eliminar un producto del carrito
app.delete("/api/carrito/eliminar/:id_user/:id_prod", async (req, res) => {
    const { id_user, id_prod } = req.params;  // Usar req.params para obtener los parámetros de la URL

    // Verificar que los parámetros obligatorios estén presentes
    if (!id_user || !id_prod) {
        return res.status(400).send({ status: "Error", message: "Faltan parámetros obligatorios." });
    }

    try {
        // Verificar si el usuario tiene un carrito
        const queryCheckCart = 'SELECT * FROM ccarrito WHERE id_user = ?';
        const [existingCart] = await conexion.execute(queryCheckCart, [id_user]);

        if (existingCart.length === 0) {
            return res.status(404).send({ status: "Error", message: "El usuario no tiene un carrito activo." });
        }

        const cartId = existingCart[0].id_carr;

        // Verificar si el producto está en el carrito
        const queryCheckProductInCart = 'SELECT * FROM carrito_productos WHERE id_carr = ? AND id_prod = ?';
        const [productInCart] = await conexion.execute(queryCheckProductInCart, [cartId, id_prod]);

        if (productInCart.length === 0) {
            return res.status(404).send({ status: "Error", message: "El producto no está en el carrito." });
        }

        const currentQuantity = productInCart[0].cantidad;

        // Obtener el precio del producto
        const queryGetProductPrice = 'SELECT precio_prod FROM cproductos WHERE id_prod = ?';
        const [product] = await conexion.execute(queryGetProductPrice, [id_prod]);

        if (product.length === 0) {
            return res.status(404).send({ status: "Error", message: "Producto no encontrado." });
        }

        const productPrice = product[0].precio_prod;

        // Si hay más de 1 producto, solo reducimos la cantidad
        if (currentQuantity > 1) {
            const queryUpdateProduct = 'UPDATE carrito_productos SET cantidad = cantidad - 1 WHERE id_carr = ? AND id_prod = ?';
            await conexion.execute(queryUpdateProduct, [cartId, id_prod]);

            // Actualizamos el total del carrito y el costo total
            const queryUpdateTotal = 'UPDATE ccarrito SET total_car = total_car - 1 WHERE id_carr = ?';
            await conexion.execute(queryUpdateTotal, [cartId]);

            const queryUpdateCost = 'UPDATE ccarrito SET costo_total = costo_total - ? WHERE id_carr = ?';
            await conexion.execute(queryUpdateCost, [productPrice, cartId]);

        } else {
            // Si la cantidad es 1, eliminamos el producto del carrito
            const queryDeleteProduct = 'DELETE FROM carrito_productos WHERE id_carr = ? AND id_prod = ?';
            await conexion.execute(queryDeleteProduct, [cartId, id_prod]);

            // Actualizamos el total del carrito y el costo total
            const queryUpdateTotal = 'UPDATE ccarrito SET total_car = total_car - 1 WHERE id_carr = ?';
            await conexion.execute(queryUpdateTotal, [cartId]);

            const queryUpdateCost = 'UPDATE ccarrito SET costo_total = costo_total - ? WHERE id_carr = ?';
            await conexion.execute(queryUpdateCost, [productPrice, cartId]);
        }

        return res.send({ status: "ok", message: "Producto eliminado del carrito correctamente." });

    } catch (error) {
        console.error('Error al eliminar del carrito:', error);
        return res.status(500).send({ status: "Error", message: "Error al eliminar el producto del carrito." });
    }
});

// Ruta para insertar la dirección y luego el checkout
app.post("/api/direccion/insertar", async (req, res) => {
    const { datosCheckout, datosDireccion } = req.body;
    const { numinte, numexte, colonia, calle, ciudad, estado, cp } = datosDireccion;
    const { id_carr, fecha_pago, nombrec, apellidoc, pago, correo } = datosCheckout;
    
    try {
        // Primero, obtener los productos en el carrito
        const queryProducts = 'SELECT * FROM carrito_productos WHERE id_carr = ?';
        const [products] = await conexion.execute(queryProducts, [id_carr]);

        // Verificar las cantidades de los productos antes de realizar el pago
        for (const product of products) {
            const queryProductDetails = 'SELECT * FROM cproductos WHERE id_prod = ?';
            const [productDetails] = await conexion.execute(queryProductDetails, [product.id_prod]);

            console.log('Productos:', products);
            
            if (productDetails.length > 0) {
                const productInfo = productDetails[0];

                // Verificar si el producto está agotado
                if (productInfo.cantidad === 0) {
                    // Log del error
                    console.error(`Error: El producto "${productInfo.nom_prod}" está agotado. No hay unidades disponibles.`);
                    return res.status(400).send({
                        status: 'error',
                        message: `El producto "${productInfo.nom_prod}" está agotado. No hay unidades disponibles.`
                    });
                }

                // Verificar si hay suficiente cantidad en stock
                if (productInfo.cantidad < product.cantidad) {
                    // Log del error
                    console.error(`Error: No hay suficiente stock para el producto "${productInfo.nom_prod}". Solo hay ${productInfo.cantidad} unidades disponibles.`);
                    return res.status(400).send({
                        status: 'error',
                        message: `No hay suficiente stock para el producto: ${productInfo.nom_prod}. Solo hay ${productInfo.cantidad} unidades disponibles.`
                    });
                }
            }
        }
        
        // Insertar la dirección en la tabla ddireccion, añadiendo 'México' como país por defecto
        const insertDireccionQuery = `INSERT INTO ddireccion (numinte_direc, numexte_direc, ncol_direc, ncalle_direc, alcaldia_dir, npais, cp_dir, nciudad_direc) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const [direccionResult] = await conexion.execute(insertDireccionQuery, [
            numinte, numexte, colonia, calle, ciudad, 'México', cp, estado
        ]);

        // Obtener el id_direc recién insertado
        const id_direc = direccionResult.insertId;

        // Insertar los datos del checkout, utilizando el id_direc obtenido, y el pago (total del carrito)
        const insertCheckoutQuery = `INSERT INTO dcheckout (id_carr, fecha_pago, id_direc, nombrec, apellidoc, pago) VALUES (?, ?, ?, ?, ?, ?)`;
        const [checkoutResult] = await conexion.execute(insertCheckoutQuery, [
            id_carr, fecha_pago, id_direc, nombrec, apellidoc, pago
        ]);

        if (checkoutResult.affectedRows > 0) {
            // Si el pago fue procesado correctamente, actualizamos las cantidades de productos y enviamos al correo
            for (const product of products) {
                const queryProductDetails = 'SELECT * FROM cproductos WHERE id_prod = ?';
                const [productDetails] = await conexion.execute(queryProductDetails, [product.id_prod]);

                if (productDetails.length > 0) {
                    const productInfo = productDetails[0];
                    const newQuantity = productInfo.cantidad - product.cantidad;

                    // Actualizar la cantidad en la tabla cproductos
                    const updateQuery = 'UPDATE cproductos SET cantidad = ? WHERE id_prod = ?';
                    await conexion.execute(updateQuery, [newQuantity, product.id_prod]);
                }
            }
            if (checkoutResult.affectedRows > 0) {
                // Configuración para el correo
                const emailConfig = {
                    from: 'sephorapagos@gmail.com',
                    to: correo, // Usa el correo dinámico
                    subject: 'Confirmación de compra',
                    html: `
                        <h1>Gracias por tu compra, ${nombrec} ${apellidoc}</h1>
                        <p>Tu pago de $${pago} ha sido procesado exitosamente.</p>
                        <p>Detalles de tu compra:</p>
                        <ul>
                            ${products
                                .map(
                                    (product) => `<li>${product.nom_prod} - Cantidad: ${product.cantidad} - Total: $${product.cantidad * product.precio_prod}</li>`
                                )
                                .join('')}
                        </ul>
                        <p>¡Gracias por confiar en nosotros!</p>
                    `,
                };
    
                // Lógica para enviar el correo (usa nodemailer o cualquier librería que utilices)
                transporter.sendMail(emailConfig, (error, info) => {
                    if (error) {
                        console.error('Error al enviar el correo:', error);
                    } else {
                        console.log('Correo enviado:', info.response);
                    }
                });
            }

            // Todo está correcto, responder con éxito
            return res.send({
                status: 'ok',
                message: 'Pago procesado exitosamente, cantidades actualizadas y correo enviado.',
            });
        } else {
            return res.status(500).send({
                status: 'error',
                message: 'Error al procesar el pago',
            });
        }
    } catch (error) {
        console.error('Error al insertar dirección o checkout:', error);
        return res.status(500).send({
            status: 'error',
            message: 'Error al procesar la solicitud',
        });
    }
});


app.delete("/api/carrito/vaciar/:id_user", async (req, res) => {
    const { id_user } = req.params;  // Usar req.params para obtener el ID del usuario

    // Verificar que el parámetro obligatorio esté presente
    if (!id_user) {
        return res.status(400).send({ status: "Error", message: "Falta el parámetro de ID de usuario." });
    }

    try {
        // Verificar si el usuario tiene un carrito activo
        const queryCheckCart = 'SELECT * FROM ccarrito WHERE id_user = ?';
        const [existingCart] = await conexion.execute(queryCheckCart, [id_user]);

        if (existingCart.length === 0) {
            return res.status(404).send({ status: "Error", message: "El usuario no tiene un carrito activo." });
        }

        const cartId = existingCart[0].id_carr;

        // Obtener todos los productos del carrito
        const queryGetAllProducts = 'SELECT * FROM carrito_productos WHERE id_carr = ?';
        const [productsInCart] = await conexion.execute(queryGetAllProducts, [cartId]);

        if (productsInCart.length === 0) {
            return res.status(404).send({ status: "Error", message: "El carrito está vacío." });
        }

        let totalCost = 0;

        // Calcular el costo total de todos los productos
        for (const product of productsInCart) {
            const queryGetProductPrice = 'SELECT precio_prod FROM cproductos WHERE id_prod = ?';
            const [productDetails] = await conexion.execute(queryGetProductPrice, [product.id_prod]);

            if (productDetails.length === 0) {
                console.error('Producto no encontrado:', product.id_prod);
                continue;
            }

            totalCost += productDetails[0].precio_prod * product.cantidad;
        }

        // Eliminar todos los productos del carrito
        const queryDeleteAllProducts = 'DELETE FROM carrito_productos WHERE id_carr = ?';
        await conexion.execute(queryDeleteAllProducts, [cartId]);

        // Actualizar el total y el costo total del carrito
        const queryUpdateTotal = 'UPDATE ccarrito SET total_car = 0 WHERE id_carr = ?';
        await conexion.execute(queryUpdateTotal, [cartId]);

        const queryUpdateCost = 'UPDATE ccarrito SET costo_total = 0 WHERE id_carr = ?';
        await conexion.execute(queryUpdateCost, [cartId]);

        return res.send({ status: "ok", message: "Carrito vaciado correctamente." });

    } catch (error) {
        console.error('Error al vaciar el carrito:', error);
        return res.status(500).send({ status: "Error", message: "Error al vaciar el carrito." });
    }
});


app.get("/api/comprasreporte", async (req, res) => {
    try {
        const { id_user } = req.query;

        // Verificar si el parámetro id_user está presente
        if (!id_user) {
            return res.status(400).send({
                status: 'error',
                message: 'El parámetro id_user es obligatorio.'
            });
        }

        const query = `
            SELECT 
                nombrec, 
                apellidoc, 
                fecha_pago, 
                pago, 
                CONCAT(ncalle_direc, " ", numexte_direc, ", ", numinte_direc, ", ", ncol_direc, " ", alcaldia_dir, " ", cp_dir, " ", nciudad_direc, " ") AS direccion 
            FROM dcheckout chec
            INNER JOIN ccarrito carr ON chec.id_carr = carr.id_carr
            INNER JOIN musuario usua ON carr.id_user = usua.id_user
            INNER JOIN ddireccion dirc ON chec.id_direc = dirc.id_direc
            WHERE usua.id_user = ?;
        `;

        const [rows] = await conexion.execute(query, [id_user]);

        // Verificar si se encontraron resultados
        if (rows.length === 0) {
            return res.status(404).send({
                status: 'error',
                message: 'No se encontraron ventas para el usuario especificado.'
            });
        }

        res.send({
            status: 'ok',
            data: rows
        });
    } catch (error) {
        console.error('Error al obtener datos del reporte:', error.message);
        res.status(500).send({
            status: 'error',
            message: 'Error al obtener datos del reporte'
        });
    }
});
