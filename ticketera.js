
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
        this.arrayVentas.push( new Venta(nombreCliente, apellidoCliente, cantidad, importeEntradas) );

        // Devuelvo importe a abonar
        return importeEntradas;

    }

}

// Genero los eventos disponibles en la ticketera
const yoPienso = new Evento("Conferencia Yo Pienso", "EMPREN", "16/11/2022", 200, "Casino Magic", 1500, true, 0.20, "./img/yopienso.jpg");
const yoComo = new Evento("Evento Yo Como", "YC2022", "22/10/2022", 1500, "Paseo de la Costa", 800, true, 0.25,"./img/yocomo.jpg");
const gunsEnArgentina = new Evento("GnR en Argentina 2022", "GNR", "30/09/2022", 60000, "Estadio Monumental", 3500, false, 0, "./img/gnr.jpg");
const circoServian = new Evento("Servian - El circo", "SERVIAN", "02/12/2022", 1000, "Teatro Español", 2000, false, 0, "./img/servian.jpg");

// Inicializo la ticketera
const ticketera = [];
// Inicializo el carrito
let carrito = [];

// Cargo los eventos en la ticketera
ticketera.push(yoPienso);
ticketera.push(yoComo);
ticketera.push(gunsEnArgentina);
ticketera.push(circoServian);

const contenedorCards = document.getElementById("contenedorCards");
const mostrarCards = () => {
    ticketera.forEach( (evento) => {
        const card = document.createElement("div");
        card.classList.add("col-xl-3", "col-md-6", "col-xs-12");
        card.innerHTML = `
        <div class="card" style="width: 18rem;">
            <img src="${evento.img}" class="card-img-top" alt="${evento.nombre}">
            <div class="card-body">
                <h5 class="card-title">${evento.nombre}</h5>
                <p class="card-text">${evento.lugar} - ${evento.fecha}</p>
                <button class="btn btn-primary" id="boton${evento.codigo}">Quiero ir!</button>
            </div>
        </div>`;

        contenedorCards.appendChild(card);

        const boton = document.getElementById(`boton${evento.codigo}`);
        boton.addEventListener("click", () => {
            agregarAlCarrito(evento);
            Toastify({
                text: "Entrada agregada al carrito!",
                duration: 3000,
                gravity: "bottom",
                position: "left",
                /* style:
                {
                    background: "linear-gradient(to right, #b7950b, #fedbd0)"
                } */
                className: "toastBkg"
            }).showToast();
        });
    });

};

mostrarCards();

const contenedorCarrito = document.getElementById("contenedorCarrito");

/* const verCarrito = document.getElementById("verCarrito");

verCarrito.addEventListener("click", () => {
    mostrarCarrito();
}); */

const mostrarCarrito = () => {
    contenedorCarrito.innerHTML = "";
    carrito.forEach( ( compra ) => {
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
    const operacionEnCarrito = carrito.find( (operacion) => operacion.evento === evento );

    if ( operacionEnCarrito ) {
        // Si existe, incremento cantidad de entradas
        operacionEnCarrito.cantEntradas++;
    }
    else {
        // Si no existe, genero uno nueva compra (por default 1 entrada)
        carrito.push( new Compra(evento) );
    }

    // Actualizo carrito
    mostrarCarrito();

}

const vaciarCarrito = document.getElementById("vaciarCarrito");
vaciarCarrito.addEventListener( "click", () => {
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
    const compra = carrito.find( (compra) => compra.evento === evento );
    // Incremento la cantidad de entradas
    compra.cantEntradas++;
    // Actualizo carrito
    mostrarCarrito();
    
}

const restarEntradaDeCompra = (evento) => {

    // Busco si existe en el carrito una compra para ese evento
    const compra = carrito.find( (compra) => compra.evento === evento );
    
    // Si la cantidad de entradas es > 1 descuento una unidad
    if ( compra.cantEntradas > 1 ) {
        compra.cantEntradas--;
    }
    
    // Actualizo carrito
    mostrarCarrito();
    
}

const eliminarCompraDelCarrito = (evento) => {

    // Busco si existe en el carrito una compra para ese evento
    const compraSeleccion = carrito.find( (compra) => compra.evento === evento );

    // Elimino la compra del carrito
    let indice = carrito.indexOf( compraSeleccion );
    carrito.splice(indice, 1);

    // Actualizo carrito
    mostrarCarrito();

}

const calcularImporteCarrito = () => {
    let totalCompra = 0;
    carrito.forEach( (compra) => {
        // Sumarizo total entradas del evento
        totalCompra += calcularTotalEntradas(compra.cantEntradas, compra.evento);
    });
    total.innerHTML = `${totalCompra}`;
}

// ** Definicion de FUNCIONES ** //

function calcularTotalEntradas(cantidad, evento) {

    let importeEntradas = 0;
    const IVA = 1.21;

    // Calculo el importe total
    if ( evento.tieneDescuento && cantidad > 1 ) {
        importeEntradas = ((evento.valorEntrada * IVA) - ((evento.valorEntrada * IVA) * evento.descuento)) * cantidad;
    }
    else {
        importeEntradas = (evento.valorEntrada * IVA) * cantidad;
    }

    // Devuelvo importe a abonar
    return importeEntradas;

}