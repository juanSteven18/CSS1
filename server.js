const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para leer los datos del formulario POST
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname)));

// Conexion y creacion de la Base de Datos local
const db = new sqlite3.Database('./wiki.db', (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite (wiki.db).');
    }
});

// Crea la tabla e inserta un comentario inicial si esta vacia
db.run(`CREATE TABLE IF NOT EXISTS comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    opinion TEXT NOT NULL,
    valoracion INTEGER NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
    if (!err) {
        db.get(`SELECT COUNT(*) as count FROM comentarios`, (err, row) => {
            if (row && row.count === 0) {
                db.run(`INSERT INTO comentarios (nombre, opinion, valoracion) VALUES ('TheAR3GUY', 'La atmosfera en VR es increible!', 5)`);
            }
        });
    }
});

// --- Rutas de la api ---

//Ruta POST: Recibe los datos del formulario de Alyx y los guarda
app.post('/api/feedback', (req, res) => {
    const { nombre, opinion, valoracion } = req.body;

    const query = `INSERT INTO comentarios (nombre, opinion, valoracion) VALUES (?, ?, ?)`;
    db.run(query, [nombre, opinion, valoracion], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).send("Error al guardar el comentario en la base de datos.");
        }
        // Redirige de vuelta a la pagina de Alyx
        res.redirect('/alyx.html');
    });
});

//Ruta GET 
app.api = app.get('/api/comentarios', (req, res) => {
    db.all(`SELECT * FROM comentarios ORDER BY id DESC`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ comentarios: rows });
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});