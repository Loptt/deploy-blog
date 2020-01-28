let express = require('express');
let uuid = require('uuid/v4');
let morgan = require('morgan')
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let jsonParser = bodyParser.json();
let app = express();

let {CommentController} = require('./model');
let {DATABASE_URL, PORT} = require('./config');

app.use(express.static('public'));
app.use(morgan('dev'));

let comentarios = [
{
    id: uuid(),
    titulo: "Que buen blog",
    contenido: "Gracias por compartir. Me gustó mucho",
    autor: "Erick",
    fecha: new Date()
},
{
    id: uuid(),
    titulo: "Hola ",
    contenido: "Me embola",
    autor: "Erick",
    fecha: new Date()
},
{
    id: uuid(),
    titulo: "Pésimo blog",
    contenido: "Que asco",
    autor: "Moises",
    fecha: new Date()
}
];

app.get('/blog-api/comentarios', jsonParser, (req, res) => {
    CommentController.getAll()
        .then(comments => {
            return res.status(200).json(comments);
        })
        .catch(error => {
            console.log(error);
            res.statusMessage = "Database error";
            return res.status(500).send();
        });
});

app.get('/blog-api/comentarios-por-autor', jsonParser, (req, res) => {
    let autor = req.query.autor;
    if (autor == undefined) {
        res.statusMessage = "No hay autor proporcionado";
        return res.status(406).send();
    }

    CommentController.getByAutor(autor)
        .then(a => {
            return res.status(200).json(a);
        })
        .catch(error => {
            console.log(error);
            res.statusMessage = "Database error";
            return res.status(500).send();
        });
});

app.post('/blog-api/nuevo-comentario', jsonParser, (req, res) => {
    let titulo, contenido, autor;

    titulo = req.body.titulo;
    contenido = req.body.contenido;
    autor = req.body.autor;

    if (titulo == undefined) {
        res.statusMessage = "Titulo de comentario no proporcionado";
        return res.status(406).send();
    }
    if (contenido == undefined) {
        res.statusMessage = "Contenido de comentario no proporcionado";
        return res.status(406).send();
    }
    if (autor == undefined) {
        res.statusMessage = "Autor de comentario no proporcionado";
        return res.status(406).send();
    }

    let nuevoComentario = {
        titulo: titulo,
        contenido: contenido,
        autor: autor,
        fecha: new Date()
    };

    CommentController.create(nuevoComentario)
        .then(nc => {
            return res.status(201).json(nc);
        })
        .catch(error => {
            console.log(error);
            res.statusMessage = "Database error";
            return res.status(500).send();
        });
});

app.delete('/blog-api/remover-comentario/:id', jsonParser, (req, res) => {
    let id = req.params.id;

    CommentController.getById(id)
        .then(c => {
            CommentController.delete(id)
                .then(rc => {
                    return res.status(200).send();
                })
                .catch(error => {
                    console.log(error);
                    res.statusMessage = "Database error";
                    return res.status(500).send();
                });
        })
        .catch(error => {
            console.log(error);
            res.statusMessage = "ID no encontrado";
            return res.status(404).send();
        });

    
});

app.put('/blog-api/actualizar-comentario/:id', jsonParser, (req, res) => {
    if (req.params.id != req.body.id) {
        res.statusMessage = "IDs no coinciden";
        return res.status(406).send();
    }

    let id = req.params.id;

    let titulo, contenido, autor;

    titulo = req.body.titulo;
    contenido = req.body.contenido;
    autor = req.body.autor;

    if (titulo == undefined && contenido == undefined && autor == undefined) {
        res.statusMessage = "No hay parametros a modificar";
        return res.status(409).send();
    }

    let nuevoComentario = {};

    if (titulo != undefined) {
        nuevoComentario.titulo = titulo;
    }
    if (autor != undefined) {
        nuevoComentario.autor = autor;
    }
    if (contenido != undefined) {
        nuevoComentario.contenido = contenido;
    }

    CommentController.getById(id)
        .then(c => {
            CommentController.update(id, nuevoComentario)
                .then(nc => {
                    return res.status(202).json(nc);
                })
                .catch(error => {
                    console.log(error);
                    res.statusMessage = "Database error";
                    return res.status(500).send();
                });
        })
        .catch(error => {
            console.log(error);
            res.statusMessage = "ID no encontrado";
            return res.status(404).send();
        });
});

let server;

function runServer(port, databaseUrl) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true }, response => {
            if (response) {
                return reject(response);
            }
            else {
                server = app.listen(port, () => {
                    console.log("App is running on port " + port);
                    resolve();
                })
                    .on('error', err => {
                        mongoose.disconnect();
                        return reject(err);
                    })
            }
        });
    });
}

function closeServer() {
    return mongoose.disconnect()
        .then(() => {
            return new Promise((resolve, reject) => {
                console.log('Closing the server');
                server.close(err => {
                    if (err) {
                        return reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
}

runServer(PORT, DATABASE_URL);

module.exports = {app, runServer, closeServer};