import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';
import mysql from 'mysql2/promise';

dotenv.config();

const conexion = await mysql.createConnection({
    host: 'localhost',
    database: 'dbcarrito',
    user: 'root',
    //password: 'n0m3l0'
    password: 'jaghSQL2806.'
    //password: 'Sally2007.'
});

export const usuarios = [{
    emaillabelre: "a@a.com",
    passwordlabelre: "$2a$05$lar7vRY9OSa1d4cQzWxy9OFix5j.JoRFH44lQXgXOEsCvwti98y2u"
}];

async function login(req, res) {
    const { emaillabelre, passwordlabelre } = req.body;

    if (!emaillabelre || !passwordlabelre) {
        return res.status(400).send({ status: "Error", message: "Los campos están incompletos" });
    }

    try {
        // Verificar si el usuario existe
        const [rows] = await conexion.execute('SELECT * FROM musuario WHERE correo_user = ?', [emaillabelre]);
        if (rows.length === 0) {
            return res.status(404).send({ status: "Error", message: "Usuario no encontrado" });
        }

        const user = rows[0];

        // Verificar la contraseña
        const isMatch = await bcryptjs.compare(passwordlabelre, user.contra_user);
        if (!isMatch) {
            return res.status(400).send({ status: "Error", message: "Contraseña incorrecta" });
        }

        // Obtener el rol del usuario basado en el id_rol
        const [rolRows] = await conexion.execute('SELECT nom_rol FROM crol WHERE id_rol = ?', [user.id_rol]);
        const userRole = rolRows.length > 0 ? rolRows[0].nom_rol : null;

        if (!userRole) {
            return res.status(404).send({ status: "Error", message: "Rol de usuario no encontrado" });
        }

        const token = jsonwebtoken.sign(
            { id_user: user.id_user, correo: user.correo_user, rol: user.id_rol },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        const cookieOption = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
            path: "/"
        };

        res.cookie("jwt", token, cookieOption);
        console.log('Usuario loggeado correctamente');

        // Redirigir según el rol del usuario
        let redirectUrl = "/";
        if (user.id_rol === 3) {
            redirectUrl = "/admin"; // Admin
        } else if (user.id_rol === 2) {
            redirectUrl = "/almacenista"; // Almacenista
        }

        return res.status(200).send({ status: "ok", redirect: redirectUrl });

    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return res.status(500).send({ status: "Error", message: "Error al iniciar sesión." });
    }
}

async function registro(req, res) {
    const { emaillabelre, passwordlabelre, confpasswordlabelre } = req.body;
    console.log(req.body);

    if (!emaillabelre || !passwordlabelre || !confpasswordlabelre) {
        
        return res.status(400).send({ status: "Error", message: "Los campos están incompletos" });
        
        
    }

    if (passwordlabelre.length < 8 || passwordlabelre.length > 12) {
        
        return res.status(400).send({ status: "Error", message: "La contraseña debe tener entre 8 y 12 caracteres." });
    }

    if (passwordlabelre !== confpasswordlabelre) {
        
        return res.status(400).send({ status: "Error", message: "Las contraseñas no coinciden" });
    }

    try {
        // Verificar si el correo ya existe
        const [rows] = await conexion.execute('SELECT correo_user FROM musuario WHERE correo_user = ?', [emaillabelre]);
        console.log('Resultado de búsqueda del correo:', rows);

        if (rows.length > 0) {
           
            return res.status(400).send({ status: "Error", message: "Este usuario ya existe" });
        }

        // Verificar el correo utilizando Hunter API
        const apiKey = process.env.HUNTER_API_KEY;
        const apiURL = `https://api.hunter.io/v2/email-verifier?email=${emaillabelre}&api_key=${apiKey}`;

        const response = await fetch(apiURL);
        const data = await response.json();
        console.log('Respuesta de Hunter.io:', data);
        if (!data || !data.data || !(data.data.status === 'valid' || data.data.status === 'accept_all')) {
           
            return res.status(400).send({ status: "Error", message: "El correo no es válido." });
        }
        

        // Generar el hash de la contraseña
        const salt = await bcryptjs.genSalt(5);
        const hashPassword = await bcryptjs.hash(passwordlabelre, salt);
        console.log('Hash generado para la contraseña:', hashPassword);

        // Insertar el nuevo usuario
        const [result] = await conexion.execute(
            'INSERT INTO musuario (correo_user, contra_user, id_rol) VALUES (?, ?, ?)',
            [emaillabelre, hashPassword, 1]  // Aquí asignamos 1 como el valor de id_rol
        );
        console.log('Resultado de la inserción:', result);

        return res.status(201).send({ status: "ok", message: `Usuario ${emaillabelre} agregado`, redirect: "/" });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        return res.status(500).send({ status: "Error", message: "Error al registrar usuario." });
    }
}

/*


    const nuevoUsuario = {
        nombre,
        appat,
        apmat,
        pais,
        ciudad,
        colonia,
        calle,
        numero,
        correo,
        password: hashPassword
    };

    usuarios.push(nuevoUsuario);
    console.log(usuarios);
    return res.status(201).send({ status: "ok", message: `Usuario ${nuevoUsuario.nombre} agregado`, redirect: "/" });
*/ 


export const forgotPassword = async (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).send({ status: "Error", message: "El campo de correo está vacío" });
    }

    try {
        const [rows] = await conexion.execute('SELECT * FROM mcliente WHERE correo_cli = ?', [correo]);
        if (rows.length === 0) {
            return res.status(400).send({ status: "Error", message: "El correo no está registrado" });
        }

        req.session.resetEmail = correo;
        return res.status(200).send({ status: "ok", message: "Correo verificado", redirect: "/resetpass" });
    } catch (error) {
        console.error('Error durante forgotPassword:', error);
        return res.status(500).send({ status: "Error", message: "Error durante forgotPassword" });
    }
};

export const resetPassword = async (req, res) => {
    const { correo, password, confpass } = req.body;

    if (!correo || !password || !confpass) {
        return res.status(400).send({ status: "Error", message: "Los campos están incompletos" });
    }

    if (password !== confpass) {
        return res.status(400).send({ status: "Error", message: "Las contraseñas no coinciden" });
    }

    try {
        const [rows] = await conexion.execute('SELECT * FROM mcliente WHERE correo_cli = ?', [correo]);
        if (rows.length === 0) {
            return res.status(400).send({ status: "Error", message: "Correo no encontrado" });
        }

        const salt = await bcryptjs.genSalt(5);
        const hashPassword = await bcryptjs.hash(password, salt);

        await conexion.execute('UPDATE mcliente SET contra_cli = ? WHERE correo_cli = ?', [hashPassword, correo]);

        return res.status(200).send({ status: "ok", message: "Contraseña restablecida correctamente", redirect: "/" });
    } catch (error) {
        console.error('Error durante resetPassword:', error);
        return res.status(500).send({ status: "Error", message: "Error durante resetPassword" });
    }
};

export const methods = {
    login,
    registro,
    forgotPassword,
    resetPassword
};
