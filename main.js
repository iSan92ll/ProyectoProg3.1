document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    document.getElementById("btnAgregar").addEventListener("click", agregarProducto);
});
const API_URL = "https://proyectoprog3.onrender.com/backend.php";

function cargarProductos() {
    fetch("https://tu-backend-en-render.onrender.com/backend.php?action=read")
    .then(response => {
        if (!response.ok) {
            throw new Error("Error en la respuesta del servidor");
        }
        return response.json();
    })
    .then(data => {
        if (!Array.isArray(data)) {
            throw new Error("Respuesta no válida del servidor");
        }

        let listado = document.getElementById("listado");
        listado.innerHTML = "";

        data.forEach(producto => {
            listado.innerHTML += `
                <tr>
                    <td class="text-center">${producto.id}</td>
                    <td class="text-center">${producto.producto}</td>
                    <td class="text-center">${producto.precio}</td>
                    <td class="text-center">${producto.disponibilidad}</td>
                    <td class="text-center">
                        <button class="btn btn-warning btn-sm" onclick="editarProducto(${producto.id}, '${producto.producto}', ${producto.precio}, ${producto.disponibilidad})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${producto.id})">Eliminar</button>
                    </td>
                </tr>`;
        });
    })
    .catch(error => console.error("Error al cargar productos:", error));
}
    
function agregarProducto() {
    let producto = document.getElementById("producto").value;
    let precio = document.getElementById("precio").value;
    let disponibilidad = document.getElementById("disponibilidad").value;

    if (!producto || !precio || !disponibilidad) {
        alertify.error("Todos los campos son obligatorios");
        return;
    }

    fetch("https://tu-backend-en-render.onrender.com/backend.php?action=create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            producto: producto,
            precio: parseFloat(precio),
            disponibilidad: parseInt(disponibilidad)
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alertify.error(data.error);
        } else {
            alertify.success("Producto agregado");
            cargarProductos();  // Recargar la lista
        }
    })
    .catch(error => console.error("Error al agregar producto:", error));
}

function editarProducto(id, nombre, precio, disponibilidad) {
    document.getElementById("producto").value = nombre;
    document.getElementById("precio").value = precio;
    document.getElementById("disponibilidad").value = disponibilidad;
    document.getElementById("btnAgregar").innerHTML = "Actualizar";
    document.getElementById("btnAgregar").removeEventListener("click", agregarProducto);
    document.getElementById("btnAgregar").addEventListener("click", () => actualizarProducto(id));
}

function actualizarProducto(id) {
    let producto = document.getElementById("producto").value;
    let precio = document.getElementById("precio").value;
    let disponibilidad = document.getElementById("disponibilidad").value;
    
    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${id}&producto=${producto}&precio=${precio}&disponibilidad=${disponibilidad}`
    }).then(() => {
        alertify.success("Producto actualizado");
        cargarProductos();
        document.getElementById("producto").value = "";
        document.getElementById("precio").value = "";
        document.getElementById("disponibilidad").value = "";
        document.getElementById("btnAgregar").innerHTML = "Agregar";
        let nuevoBtn = document.getElementById("btnAgregar").cloneNode(true);
        document.getElementById("btnAgregar").parentNode.replaceChild(nuevoBtn, document.getElementById("btnAgregar"));
        nuevoBtn.addEventListener("click", agregarProducto);
    });
}

function eliminarProducto(id) {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `id=${id}`
        }).then(() => {
            alertify.error("Producto eliminado");
            cargarProductos();
        });
    }
}
