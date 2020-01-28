let mongoose = require('mongoose');
let uuid = require('uuid/v4');

mongoose.Promise = global.Promise;

let commentCollection = mongoose.Schema({
    titulo: String,
    contenido: String,
    autor: String,
    fecha: Date,
});

let Comment = mongoose.model('comment', commentCollection);

let CommentController = {
    getAll: function() {
        return Comment.find()
            .then(comments => {
                return comments;
            })
            .catch(error => {
                throw Error(error);
            });
    },
    getByAutor: function(autor) {
        return Comment.find({autor: autor})
            .then(comments => {
                return comments;
            })
            .catch(error => {
                throw Error(error);
            });
    },
    create: function(newComentario) {
        return Comment.create(newComentario)
            .then(nc => {
                return nc;
            })
            .catch(error => {
                throw Error(error);
            });
    },
    delete: function(id) {
        return Comment.findByIdAndRemove(id)
            .then(rc => {
                return rc;
            })
            .catch(error => {
                throw Error(error);
            });
    },
    update: function(id, nuevoComentario) {
        return Comment.findByIdAndUpdate(id, nuevoComentario)
            .then(uc => {
                return uc;
            })
            .catch(error => {
                throw Error(error);
            });
    },
    getById: function(id) {
        return Comment.findById(id)
            .then(c => {
                return c;
            })
            .catch(error => {
                console.log("model catch");
                throw Error(error);
            });
    }
}

module.exports = {CommentController}