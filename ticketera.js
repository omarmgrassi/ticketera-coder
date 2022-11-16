
/**
 * TRABAJO FINAL JAVASCRIPT
 * Ticketera CODER
 * 
 * Autor: OMG
 */


// ** Definicion de OBJETOS ** //

class Compra {
    constructor(evento) {
        this.evento = evento;
        this.cantEntradas = 1;
    }
}

class Venta {

    constructor(nombre, apellido, cantidadEntradas, importeAbonado, evento) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.cantidad = cantidadEntradas;
        this.total = importeAbonado;
        this.evento = evento;
    }
}

class Evento {

    constructor(nombre, codigo, fecha, cantEntradas, lugar, precioEntrada, tieneDescuento, porcenDescuento, img) {
        this.nombre = nombre;
        this.codigo = codigo;
        this.fecha = fecha;
        this.entradasDisponibles = cantEntradas;
        this.aforo = cantEntradas;
        this.lugar = lugar;
        this.valorEntrada = precioEntrada;
        this.tieneDescuento = tieneDescuento;
        this.descuento = porcenDescuento;
        this.recaudacion = 0;
        this.arrayVentas = [];
        this.img = img;
    }

    getPrecioEntrada() {
        return this.valorEntrada * 1.21;
    }

    comprarEntrada(cantidad, nombreCliente, apellidoCliente) {

        let importeEntradas = 0;
        const IVA = 1.21;

        // Calculo el importe total
        if (this.tieneDescuento && cantidad > 1) {
            importeEntradas = ((this.valorEntrada * IVA) - ((this.valorEntrada * IVA) * this.descuento)) * cantidad;
        }
        else {
            importeEntradas = (this.valorEntrada * IVA) * cantidad;
        }

        // Incremento la recaudación
        this.recaudacion = this.recaudacion + importeEntradas;

        // Descuento del stock las entradas vendidas
        this.entradasDisponibles = this.entradasDisponibles - cantidad;

        // Registro la venta realizada
        this.arrayVentas.push(new Venta(nombreCliente, apellidoCliente, cantidad, importeEntradas));

        // Devuelvo importe a abonar
        return importeEntradas;

    }

}

// Inicializo la ticketera
let ticketera = [];

// Inicializo el carrito
let carrito = [];

// Cargo los eventos en la ticketera
// Defino una funcion con async/await ya que necesito que termine la carga del JSON antes de mostrar las cards.

async function obtenerEventos() {

    const archivoEventosJson = "./json/eventos.json";
    const eventos = await fetch(archivoEventosJson);
    const datos = await eventos.json();
    datos.forEach(e => {
        // Recupero los datos del evento y creo nuevo objeto Evento
        let evento = new Evento(e.nombre, e.codigo, e.fecha, e.cantEntradas, e.lugar, e.precioEntrada, e.tieneDescuento, e.porcenDescuento, e.img);
        // Almaceno evento en el array 
        ticketera.push(evento);
    })

    // Luego de terminar la carga muestro las cards
    mostrarCards();

}

obtenerEventos();

// Contenedor de cards

const contenedorCards = document.getElementById("contenedorCards");
const mostrarCards = () => {
    ticketera.forEach((evento) => {
        const btnPromo = ( evento.tieneDescuento ) ? `<button class="btn btn-danger" id="promo${evento.codigo}">Ver promo</button>` : ``;
        const card = document.createElement("div");
        card.classList.add("col-xl-3", "col-md-6", "col-xs-12");
        card.innerHTML = `
            <div class="card" style="width: 18rem;">
                <img src="${evento.img}" class="card-img-top" alt="${evento.nombre}">
                <div class="card-body">
                    <h5 class="card-title">${evento.nombre}</h5>
                    <p class="card-text">${evento.lugar} - ${evento.fecha}</p>
                    <p class="card-text">Valor $${evento.valorEntrada} + IVA</p>
                    <button class="btn btn-primary" id="boton${evento.codigo}">Quiero ir!</button>
                    ${btnPromo}
                </div>
            </div>`;

        contenedorCards.appendChild(card);

        // Integro librería Toastify al oprimir boton
        const boton = document.getElementById(`boton${evento.codigo}`);
        boton.addEventListener("click", () => {
            agregarAlCarrito(evento);
            Toastify({
                text: "Entrada agregada al carrito!",
                duration: 3000,
                gravity: "bottom",
                position: "left",
                className: "toastBkg"
            }).showToast();
        });

        if (evento.tieneDescuento) {
            let porDescuento = evento.descuento * 100;
            // Integro librería SweetAlert si tiene descuento
            // Se calcula el total menos el descuento luego sobre eso aplica el IVA
            const botonPromo = document.getElementById(`promo${evento.codigo}`);
            botonPromo.addEventListener("click", () => {
                Swal.fire(
                    'Tenemos promo!',
                    'Comprando 2 o más entradas tendrás un ' + porDescuento + '% de descuento',
                    'success'
                  )
            });
        }
        
    });
};

// Contenedor carrito de compras

const contenedorCarrito = document.getElementById("contenedorCarrito");
const mostrarCarrito = () => {
    contenedorCarrito.innerHTML = "";
    carrito.forEach((compra) => {
        const card = document.createElement("div");
        card.classList.add("col-xl-3", "col-md-6", "col-xs-12");
        card.innerHTML = `
            <div class="card" style="width: 18rem;">
                <img src="${compra.evento.img}" class="card-img-top" alt="${compra.evento.nombre}">
                <div class="card-body">
                    <h5 class="card-title">${compra.evento.nombre}</h5>
                    <p class="card-text">${compra.evento.lugar} - ${compra.evento.fecha}</p>
                    <p class="card-text">Entradas : 
                    <button class="btn btn-light border-0" id="btnAdd${compra.evento.codigo}"><i class="bi bi-plus"></i></button>
                    <span class="badge bg-primary rounded-pill">${compra.cantEntradas}</span>
                    <button class="btn btn-light border-0" id="btnSub${compra.evento.codigo}"><i class="bi bi-dash"></i></button>
                    <button class="btn btn-light border-0" id="btnDel${compra.evento.codigo}"><i class="bi bi-trash"></i></button></p>
                </div>
            </div>`;
        contenedorCarrito.appendChild(card);
        const botonAdd = document.getElementById(`btnAdd${compra.evento.codigo}`);
        botonAdd.addEventListener("click", () => {
            sumarEntradaACompra(compra.evento);
        });
        const botonSub = document.getElementById(`btnSub${compra.evento.codigo}`);
        botonSub.addEventListener("click", () => {
            restarEntradaDeCompra(compra.evento);
        });
        const botonDel = document.getElementById(`btnDel${compra.evento.codigo}`);
        botonDel.addEventListener("click", () => {
            eliminarCompraDelCarrito(compra.evento);
        });
    });

    // Actualizo importe total
    calcularImporteCarrito();
}

const agregarAlCarrito = (evento) => {

    // Busco si existe en el carrito una compra para ese evento
    const operacionEnCarrito = carrito.find((operacion) => operacion.evento === evento);

    if (operacionEnCarrito) {
        // Si existe, incremento cantidad de entradas
        operacionEnCarrito.cantEntradas++;
    }
    else {
        // Si no existe, genero uno nueva compra (por default 1 entrada)
        carrito.push(new Compra(evento));
    }

    // Actualizo carrito
    mostrarCarrito();

}

const vaciarCarrito = document.getElementById("vaciarCarrito");
vaciarCarrito.addEventListener("click", () => {
    eliminarTodoElCarrito();
});

const eliminarTodoElCarrito = () => {
    // Reseteo array
    carrito = [];
    // Actualizo contenedor cards carrito
    mostrarCarrito();
}

const sumarEntradaACompra = (evento) => {

    // Busco si existe en el carrito una compra para ese evento
    const compra = carrito.find((compra) => compra.evento === evento);
    // Incremento la cantidad de entradas
    compra.cantEntradas++;
    // Actualizo carrito
    mostrarCarrito();

}

const restarEntradaDeCompra = (evento) => {

    // Busco si existe en el carrito una compra para ese evento
    const compra = carrito.find((compra) => compra.evento === evento);

    // Si la cantidad de entradas es > 1 descuento una unidad
    if (compra.cantEntradas > 1) {
        compra.cantEntradas--;
    }

    // Actualizo carrito
    mostrarCarrito();

}

const eliminarCompraDelCarrito = (evento) => {

    // Busco si existe en el carrito una compra para ese evento
    const compraSeleccion = carrito.find((compra) => compra.evento === evento);

    // Elimino la compra del carrito
    let indice = carrito.indexOf(compraSeleccion);
    carrito.splice(indice, 1);

    // Actualizo carrito
    mostrarCarrito();

}

const calcularImporteCarrito = () => {
    let totalCompra = 0;
    carrito.forEach((compra) => {
        // Sumarizo total entradas del evento
        totalCompra += calcularTotalEntradas(compra.cantEntradas, compra.evento);
    });
    total.innerHTML = `${totalCompra}`;
}

// ** Funciones Auxiliares ** //

function calcularTotalEntradas(cantidad, evento) {

    let importeEntradas = 0;
    const IVA = 1.21;

    // Calculo el importe total
    if (evento.tieneDescuento && cantidad > 1) {
        importeEntradas = ((evento.valorEntrada * IVA) - ((evento.valorEntrada * IVA) * evento.descuento)) * cantidad;
    }
    else {
        importeEntradas = (evento.valorEntrada * IVA) * cantidad;
    }

    // Devuelvo importe a abonar
    return importeEntradas;

}