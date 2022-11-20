import { db, firebase } from '../config/firebase';
import { handleAutores } from "./Auth/Firestore";

export const cargarNuevosLibros = async () => {
    const books = [];
    await db.collection("libros")
        .get().then(querySnapshot => {
            querySnapshot.forEach(documentSnapshot => {
                books.push({
                    ...documentSnapshot.data(),
                    key: documentSnapshot.id,
                });
            })
        })
    return books

}
export const cargarDatosLibros = async () => {
    let libros = await cargarNuevosLibros();
    let librosInformacion = [];
    for (let i = 0, len = libros.length; i < len; i++) {

        let numCapitulos = await contarCapitulosDelLibro(libros[i].key);
        let numSeguidores = await getNumSeguidoresLibro(libros[i].key);

        librosInformacion.push({
            ...libros[i],
            NumCapitulo: numCapitulos,
            NumSeguidores: numSeguidores,
        });

    }
    return librosInformacion;
}

export const getNumSeguidoresLibro = async (idbook) => {

    let numSeguidores = 0;
    let autores = await handleAutores();
    for (let i = 0, len = autores.length; i < len; i++) {

        await db.collection("usuarios").doc(autores[i].Nombre).collection("MeGusta")
            .where("Nombre", "==", idbook).get().then(qS => {

                numSeguidores = qS.size + numSeguidores;

            })
    }

    return numSeguidores;

}
export const getFavoritos = async (favoritosUsuario) => {

    let favoritos = [];
    for (let i = 0, len = favoritosUsuario.length; i < len; i++) {
        await db.collection("libros").doc("" + favoritosUsuario[i].Nombre).get().then(async documentSnapshot => {
            let numCapitulos = await contarCapitulosDelLibro(documentSnapshot.id);
            favoritos.push({ ...documentSnapshot.data(), NumCapitulos: numCapitulos, UltimoCapitulo: favoritosUsuario[i].UltimoCapitulo, key: documentSnapshot.id });

        })
    }

    return favoritos

}
export const cargarDatosLibro = async (bookId) => {
    let data = "";
    await db.collection("libros").doc(bookId).get().then(documentSnapshot => {
        data = documentSnapshot.data();
    })
    return data;
}

export const crearLibroFirebase = async (titulo, descripción, email) => {
    let id = "";
    await db
        .collection('libros')
        .add({
            Autor: email,
            Titulo: titulo,
            Descripción: descripción,
            Portada: "",
            FechaCreación: firebase.firestore.Timestamp.fromDate(new Date()),
            borrador: false,
        })
        .then(function (docRef) {
            id = docRef.id;
        });

    return id;
}


export const cambiarPortadadeLibro = async (id, image) => {
    await db.collection('libros').doc(id)
        .update({
            Portada: "" + image
        })
}

export const cambiarTitulo = async (bookId, titulo) => {
    await db.collection('libros').doc(bookId)
        .update({
            Titulo: "" + titulo,
        })
}

export const cambiarContenidoCapitulo = async (bookId, chapterId, contenido) => {
    await db.collection('libros').doc(bookId).collection("Capitulos").doc(chapterId)
        .update({
            Contenido: "" + contenido,
        })
}

export const cambiarDescripcion = async (bookId, descripcion) => {
    await db.collection('libros').doc(bookId)
        .update({
            Descripción: "" + descripcion,
        })
}


export const cargarBooksAutor = async (email) => {
    const books = [];
    const snapshot = await db.collection('libros').get();
    await snapshot.docs.map(async doc => {
        if (doc.data().Autor == email) {
            books.push({
                ...doc.data(),
                key: doc.id,
            });
        }
    });
    return books;
}
export const cargarBooks = async () => {
    const books = [];
    const snapshot = await db.collection('libros').get();
    await snapshot.docs.map(async doc => {

        books.push({
            ...doc.data(),
            key: doc.id,
        });

    });
    return books;
}
export const getAutorLibro = async (bookId) => {
    let autor = "";
   await db.collection('libros').doc(bookId).get().then(snap => {
        autor = snap.data().Autor
    });
 
    return autor;
}
//--------------------------------CAPITULOS------------------------------
export const uploadCapitulo = async (bookId, numeroCapitulo, titulo, contenido, borrador) => {

    await db.collection('libros').doc(bookId).collection('Capitulos')
        .add({
            Titulo: titulo,
            Contenido: contenido,
            FechaCreación: firebase.firestore.Timestamp.fromDate(new Date()),
            borrador: borrador,
            Numero: numeroCapitulo,
        })
}

export const publicarCapituloDelLibro = async (bookId, chapterId) => {
    await db.collection('libros').doc(bookId).collection("Capitulos").doc(chapterId)
        .update({
            borrador: true
        })
}
export const enviarComentarioCapitulo = async (bookId, capituloId,texto,autor,) => {

    await db.collection('libros').doc(bookId).collection('Capitulos').doc(capituloId).collection("Mensajes").add({
        Autor: autor,
        Comentario:texto,
        FechaCreación:firebase.firestore.Timestamp.fromDate(new Date()),
    })
   
   
}
export const getComentariosCapitulo = async (bookId, capituloId) => {
    let comentarios = []

    await db.collection('libros').doc(bookId).collection('Capitulos').doc(capituloId).collection("Mensajes")
    .orderBy("FechaCreación", "desc").get().then(querySnapshot => {
        querySnapshot.forEach(documentSnapshot => {
    
            comentarios.push({
                Autor:documentSnapshot.data().Autor,
                Comentario:documentSnapshot.data().Comentario,
                key: documentSnapshot.id,
            });
        })
    })

    return comentarios
}

export const getCapituloId = async (bookId, numeroCapitulo) => {

    let id = "";
    await db.collection('libros').doc(bookId).collection('Capitulos').where("Numero", "==", numeroCapitulo).get().then(snap => {
        snap.forEach(documentSnapshot => {
            id= documentSnapshot.id;
          
        })
    });
    return id;
}

export const getNumeroCapitulo = async (bookId, capituloId) => {

   let doc= await db.collection('libros').doc(bookId).collection('Capitulos').doc(capituloId).get();
    return doc.data().Numero;
}


export const cambiarTituloCapitulo = async (bookId, chapterId, titulo) => {
    await db.collection('libros').doc(bookId).collection("Capitulos").doc(chapterId)
        .update({
            Titulo: "" + titulo,
        })
}
export const mirarSiTieneOtrosCapitulos = async (bookId, titulo, contenido, borrador) => {
    let numberCapitulos = 0;
    await db.collection('libros').doc(bookId).collection('Capitulos').get().then(snap => {
        numberCapitulos = snap.size
    });
    await uploadCapitulo(bookId, numberCapitulos + 1, titulo, contenido, borrador);
}


export const contarCapitulosDelLibro = async (bookId) => {
    let numberCapitulos = 0;
    await db.collection('libros').doc(bookId).collection('Capitulos').get().then(snap => {
        numberCapitulos = snap.size
    });
    return numberCapitulos;
}


export const cargarCapitulosLibro = async (bookId) => {
    const caps = [];
    await db.collection("libros").doc(bookId).collection("Capitulos")
        .onSnapshot(querySnapshot => {
            querySnapshot.forEach(documentSnapshot => {
                caps.push({
                    ...documentSnapshot.data(),
                    key: documentSnapshot.id,
                });

            })
            return caps;
        })

}

export const eliminarCapituloLibro = async (bookId, chapterId, n) => {

    /*Cambiar el numero de los anteriores */
    await db.collection("libros").doc(bookId).collection("Capitulos").where("Numero", ">", n)
        .onSnapshot(async querySnapshot => {
            await querySnapshot.forEach(async documentSnapshot => {
                await db.collection('libros').doc(bookId).collection("Capitulos").doc(documentSnapshot.id)
                    .update({
                        Numero: documentSnapshot.data().Numero - 1
                    })
            })
        })
    /*Eliminar el capitulo */
    await db.collection("libros").doc(bookId).collection("Capitulos").doc(chapterId).delete()

}