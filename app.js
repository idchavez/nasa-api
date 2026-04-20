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

btnBuscar.addEventListener("click", async () => {
    const fecha = inputFecha.value;
    if (!fecha) return;

    const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&date=${fecha}`);
    const data = await res.json();

    if (data.media_type !== "image") return;

    apodActual = data;

    fechaTexto.textContent = data.date;
    explicacion.textContent = data.explanation;

    contenedor.innerHTML = `
        <img src="${data.url}" alt="${data.title}">
    `;
});

btnGuardar.addEventListener("click", () => {
    if (!apodActual) return;

    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

    favoritos.push(apodActual);

    localStorage.setItem("favoritos", JSON.stringify(favoritos));

    mostrarFavoritos();
});

function mostrarFavoritos() {
    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

    listaFavoritos.innerHTML = favoritos.map(fav => `
        <div>
            <img src="${fav.url}">
            <p>${fav.date}</p>
        </div>
    `).join("");
}

mostrarFavoritos();