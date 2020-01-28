function fetchComments() {
    let url = "/blog-api/comentarios";

    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        success: function(resposeJSON) {
            console.log(resposeJSON);
            displayComments(resposeJSON);
        },
        error: function(err) {
            alert("Error al obtener los comentarios");
            console.log(err);
        }
    });
}

function fetchCommentsName(name) {
    let url = `/blog-api/comentarios-por-autor?autor=${name}`;

    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        success: function(resposeJSON) {
            console.log(resposeJSON);
            displayComments(resposeJSON);
        },
        error: function(err) {
            if (err.status == 404) {
                alert("No se han encontrado autores con ese nombre");
            } else {
                alert("Error al obtener comentarios con autor proporcionado")
            }
            console.log(err.status);
        }
    });
}

function postComment(newComment) {
    let url = "/blog-api/nuevo-comentario";

    $.ajax({
        url: url,
        method: "POST",
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(newComment),
        success: function(resposeJSON) {
            console.log(resposeJSON);
            fetchComments();
        },
        error: function(err) {
            if (err.status == 406) {
                alert("Error: no se han proporcionado todos los datos para crear el comentario")
            } else {
                alert("Error al crear nuevo comentario");
            }
            console.log(err);
        }
    });
}

function updateComment(comment, id) {
    let url = "/blog-api/actualizar-comentario/" + id;

    $.ajax({
        url: url,
        method: "PUT",
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(comment),
        success: function(resposeJSON) {
            console.log(resposeJSON);
            fetchComments();
        },
        error: function(err) {
            if (err.status == 406) {
                alert("Error en los parametros para actualizar el comentario");
            } else if (err.status == 409) {
                alert("Error en los parametros para actualizar el comentario");
            } else if (err.status == 404) {
                alert("Error: ID proporcionado no existe");
            }
            console.log(err);
        }
    });
}

function deleteComment(id) {
    let url = "/blog-api/remover-comentario/" + id;

    $.ajax({
        url: url,
        method: "DELETE",
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function(resposeJSON) {
            console.log(resposeJSON);
            fetchComments();
        },
        error: function(err) {
            if (err.status == 404) {
                alert("Error: ID proporcionado no existe");
            }
            console.log(err);
            fetchComments();
        }
    });
}

function displayComments(resposeJSON) {
    let comments = resposeJSON;
    $('#comentariosContainer').empty();

    if (comments.length < 1) {
        $('#comentariosContainer').append(`
            <h2>Sin Comentarios</h2>
        `);
        return;
    }


    comments.forEach(c => {
        $('#comentariosContainer').append(`
            <div class="comentarioFormContainer">
                <div class="comentario">
                    <div>
                        <h2>${c.titulo}</h2>
                        <h4>By ${c.autor}</h4>
                        <p>${c.contenido}</p>
                        <p><i>${new Date(c.fecha)}</i></p>
                    </div>
                    <div>
                        <button value=${c._id} class="editbtn btn btn-warning btn-lg">Editar</button>
                        <button value=${c._id} class="deletebtn btn btn-danger btn-lg">Borrar</button>
                    </div>
                </div>
                <div class="editForm"></div>
            </div>
        `);
    });
}

function watchForms() {
    $('#formAdd').on('submit', function(event) {
        event.preventDefault();
        let titulo, autor, contenido;

        titulo = $('#titulo').val();
        autor = $('#autor').val();
        contenido = $('#contenido').val();

        if (titulo == "" || autor == "" || contenido == "") {
            alert("Favor de llenar todos los campos")
            console.log("Invalid form");
            return;
        }

        $('#titulo').val("");
        $('#autor').val("");
        $('#contenido').val("");

        let newComment = {
            titulo: titulo,
            autor: autor,
            contenido: contenido
        }

        postComment(newComment);
    });

    $('#nameSearch').on('submit', function(event) {
        event.preventDefault();
        let name = $('#buscarNombre').val();
        $('#buscarNombre').val("");
        console.log(name);

        if (name == "") {
            fetchComments();
            return;
        }

        fetchCommentsName(name);
    });

    $('#comentariosContainer').on('submit', '.editComment', function(event) {
        event.preventDefault();

        let titulo, autor, contenido;

        titulo = $('#tituloEdit').val();
        autor = $('#autorEdit').val();
        contenido = $('#contenidoEdit').val();

        if (titulo == "" && autor == "" && contenido == "") {
            fetchComments();
            return;
        }

        let newComment = {};

        if (titulo != "") {
            newComment.titulo = titulo;
        }
        if (autor != "") {
            newComment.autor = autor;
        }
        if (contenido != "") {
            newComment.contenido = contenido;
        }

        let id = $(this).parent().parent().find('.editbtn').val();

        newComment.id = id;

        updateComment(newComment, id);
    });
}

function watchButtons() {
    $('#comentariosContainer').on('click', '.editbtn', function(event) {
        $(this).parent().parent().parent().find('.editForm').empty();
        $(this).parent().parent().parent().find('.editForm').append(`
            <form class="editComment">
                <fieldset>
                    <legend>Edita el comentario</legend>
                    <div>
                        <label for="autor">Autor: </label>
                        <input type="text" name="autor" id="autorEdit">
                    </div>
                    <div>
                        <label for="titulo">Titulo: </label>
                        <input type="text" name="titulo" id="tituloEdit">
                    </div>
                    <div>
                        <label for="contenido">Contenido: </label>
                        <div>
                            <textarea name="contenido" id="contenidoEdit" cols="50" rows="5"></textarea>
                        </div>
                    </div>
                    <button class="btn btn-primary" type="submit">Editar</button>
                </fieldset>
            </form>
        `)
    });

    $('#comentariosContainer').on('click', '.deletebtn', function(event) {
        let id = $(this).val();
        deleteComment(id);
    });
}

function init() {
    watchForms();
    watchButtons();
    fetchComments();
}

init();