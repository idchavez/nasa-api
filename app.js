const API_KEY = "3f38bc39ylKXHyVWWRZLFRg6efC5HUFsnmXYW1Jd";

const inputFecha = document.getElementById("campoFechaBusqueda");
const btnBuscar = document.getElementById("botonBuscarApod");
const btnGuardar = document.getElementById("botonGuardarFavorito");

const contenedor = document.getElementById("contenedorImagen-Video");
const explicacion = document.getElementById("explicacionApodActual");
const fechaTexto = document.getElementById("fechaApodActual");

const listaFavoritos = document.getElementById("listaDeFavoritos");

let apodActual = null;

inputFecha.max = new Date().toISOString().split("T")[0];

const URL_BASE_APOD = "https://api.nasa.gov/planetary/apod";
const CLAVE_LOCAL_STORAGE_FAVORITOS = "favoritos";
const FECHA_MINIMA_APOD = "1995-06-16";

const MENSAJE_FECHA_INVALIDA = "Debes seleccionar una fecha válida.";
const MENSAJE_FECHA_FUTURA = "No puedes consultar fechas futuras.";
const MENSAJE_FECHA_ANTERIOR_AL_ARCHIVO = "La fecha debe ser igual o posterior a 1995-06-16.";
const MENSAJE_ERROR_CONSULTA = "No fue posible consultar la información de la NASA.";
const MENSAJE_ERROR_IMAGEN = "La APOD seleccionada no es una imagen disponible para mostrar en esta versión.";
const MENSAJE_SIN_APOD = "Primero debes cargar una APOD antes de guardarla.";
const MENSAJE_APOD_REPETIDA = "Esta APOD ya fue guardada en favoritos.";
const MENSAJE_SIN_FAVORITOS = "Aún no has guardado favoritos.";

const TIPO_CONTENIDO_IMAGEN = "image";
const TIPO_CONTENIDO_VIDEO = "video";

inputFecha.min = FECHA_MINIMA_APOD;
/*
   - Endpoint: https://api.nasa.gov/planetary/apod
   - Parámetro api_key
   - Parámetro date en formato YYYY-MM-DD
   - Campo media_type
   - Campos de respuesta usados: title, date, explanation, url
*/
btnBuscar.addEventListener("click", async () => {
    const fecha = inputFecha.value;

    if (!validarFechaIngresada(fecha)) return;

    try {
        limpiarContenedorMensajeTemporal();

        const data = await obtenerDatosApodPorFecha(fecha);

        if (data.media_type !== TIPO_CONTENIDO_IMAGEN) {
            apodActual = null;
            renderizarMensajeEnContenedor(MENSAJE_ERROR_IMAGEN);
            explicacion.textContent = data.explanation || "";
            fechaTexto.textContent = data.date || "";
            return;
        }

        apodActual = data;
        renderizarApodPrincipal(data);
    } catch (error) {
        apodActual = null;
        renderizarMensajeEnContenedor(MENSAJE_ERROR_CONSULTA);
        explicacion.textContent = "";
        fechaTexto.textContent = "";
    }
});

/*
   Guardar la foto o video actual en localStorage para que se conserve
   al recargar la página.
*/
btnGuardar.addEventListener("click", () => {
    if (!apodActual) {
        alert(MENSAJE_SIN_APOD);
        return;
    }

    let favoritos = obtenerFavoritosDesdeLocalStorage();

    const yaExiste = favoritos.some(favorito => favorito.date === apodActual.date);

    if (yaExiste) {
        alert(MENSAJE_APOD_REPETIDA);
        return;
    }

    favoritos.push(apodActual);

    localStorage.setItem(CLAVE_LOCAL_STORAGE_FAVORITOS, JSON.stringify(favoritos));

    mostrarFavoritos();
});

/* función que encapsula la consulta al endpoint oficial APOD.*/

async function obtenerDatosApodPorFecha(fechaConsultada) {
    const urlConsulta = `${URL_BASE_APOD}?api_key=${API_KEY}&date=${fechaConsultada}`;

    const respuesta = await fetch(urlConsulta);

    if (!respuesta.ok) {
        throw new Error(MENSAJE_ERROR_CONSULTA);
    }

    const datosApod = await respuesta.json();
    return datosApod;
}

/* funcion que valida si exista una fecha, que no sea anterior a 1995
   y que no sea futura*/

function validarFechaIngresada(fecha) {
    if (!fecha) {
        alert(MENSAJE_FECHA_INVALIDA);
        return false;
    }

    if (fecha < FECHA_MINIMA_APOD) {
        alert(MENSAJE_FECHA_ANTERIOR_AL_ARCHIVO);
        return false;
    }

    if (fecha > inputFecha.max) {
        alert(MENSAJE_FECHA_FUTURA);
        return false;
    }

    return true;
}


function renderizarApodPrincipal(datosApod) {
    fechaTexto.textContent = datosApod.date;
    explicacion.textContent = datosApod.explanation;

    contenedor.innerHTML = `
        <img src="${datosApod.url}" alt="${datosApod.title}">
    `;
}


function renderizarMensajeEnContenedor(mensajeMostrar) {
    contenedor.innerHTML = `
        <div class="mensaje-contenedor-apod">
            <p>${mensajeMostrar}</p>
        </div>
    `;
}


function obtenerFavoritosDesdeLocalStorage() {
    return JSON.parse(localStorage.getItem(CLAVE_LOCAL_STORAGE_FAVORITOS)) || [];
}


function mostrarFavoritos() {
    let favoritos = obtenerFavoritosDesdeLocalStorage();

    if (favoritos.length === 0) {
        listaFavoritos.innerHTML = `
            <p>${MENSAJE_SIN_FAVORITOS}</p>
        `;
        return;
    }

    listaFavoritos.innerHTML = favoritos.map((fav, indice) => `
        <div class="tarjeta-favorito" onclick="cargarFavoritoSeleccionado(${indice})">
            <img src="${fav.url}" alt="${fav.title}">
            <p>${fav.date}</p>
        </div>
    `).join("");
}


function cargarFavoritoSeleccionado(indiceFavorito) {
    const favoritos = obtenerFavoritosDesdeLocalStorage();
    const favoritoElegido = favoritos[indiceFavorito];

    if (!favoritoElegido) return;

    apodActual = favoritoElegido;
    renderizarApodPrincipal(favoritoElegido);
}

function limpiarContenedorMensajeTemporal() {
    contenedor.innerHTML = "";
}

mostrarFavoritos();