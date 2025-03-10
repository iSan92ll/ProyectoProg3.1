document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();

    document.getElementById("btnTodos").addEventListener("click", () => cargarProductos());
    document.getElementById("btnRopa").addEventListener("click", () => cargarProductos("ropa"));
    document.getElementById("btnComida").addEventListener("click", () => cargarProductos("comida"));
});

function cargarProductos(filtro = "") {
    fetch("http://localhost/ProyectoProgramacion3/backend.php?action=read")
    .then(response => response.json())
    .then(data => {
        let listado = document.getElementById("listado");
        listado.innerHTML = "";

        let productosFiltrados = filtro ? data.filter(producto => producto.tipo === filtro) : data;

        productosFiltrados.forEach(producto => {
            let row = document.createElement("tr");
            row.classList.add("fade-in");

            let tallaColumna = producto.tipo === "ropa" ? `<td class="text-center">${producto.talla || "-"}</td>` : `<td class="text-center">-</td>`;

            row.innerHTML = `
                <td class="text-center">${producto.id}</td>
                <td class="text-center">${producto.producto}</td>
                <td class="text-center">$${producto.precio}</td>
                <td class="text-center">${producto.disponibilidad}</td>
                ${tallaColumna}
                <td class="text-center">
                    <button class="btn btn-warning btn-sm" onclick="editarProducto(${producto.id}, '${producto.tipo}', '${producto.producto}', ${producto.precio}, '${producto.disponibilidad}', '${producto.talla || ''}')"><i class="bi bi-pencil-square"></i> Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${producto.id}, '${producto.tipo}')"><i class="bi bi-trash"></i> Eliminar</button>
                </td>
            `;
            listado.appendChild(row);
        });
    })
    .catch(error => console.error("Error al cargar productos:", error));
}

function agregarProducto() {
    let tipo = document.getElementById("tipo").value;
    let producto = document.getElementById("producto").value;
    let precio = document.getElementById("precio").value;
    let disponibilidad = document.getElementById("disponibilidad").value;
    let talla = tipo === "ropa" ? document.getElementById("talla").value : "";

    if (!producto || !precio || !disponibilidad || (tipo === "ropa" && !talla)) {
        alertify.error("Todos los campos son obligatorios");
        return;
    }

    let formData = new FormData();
    formData.append("tipo", tipo);
    formData.append("producto", producto);
    formData.append("precio", precio);
    formData.append("disponibilidad", disponibilidad);
    if (tipo === "ropa") formData.append("talla", talla);

    fetch("http://localhost/ProyectoProgramacion3/backend.php?action=create", {
        method: "POST",
        body: formData
    })
    .then(() => {
        alertify.success("Producto agregado");
        cargarProductos();
        document.getElementById("form").reset();
    });
}

function editarProducto(id, producto, precio, disponibilidad, tipo, talla) {
    document.getElementById("producto").value = producto;
    document.getElementById("precio").value = precio;
    document.getElementById("disponibilidad").value = disponibilidad;
    document.getElementById("tipo").value = tipo;
    document.getElementById("talla").value = talla;
    document.getElementById("talla-container").style.display = tipo === "ropa" ? "block" : "none";

    document.getElementById("btnAgregar").innerHTML = "<i class='bi bi-pencil-square'></i> Actualizar";
    document.getElementById("btnAgregar").removeEventListener("click", agregarProducto);
    document.getElementById("btnAgregar").addEventListener("click", () => actualizarProducto(id, tipo));
}

function actualizarProducto(id, tipo) {
    let producto = document.getElementById("producto").value;
    let precio = document.getElementById("precio").value;
    let disponibilidad = document.getElementById("disponibilidad").value;
    let talla = tipo === "ropa" ? document.getElementById("talla").value : "";

    fetch("http://localhost/ProyectoProgramacion3/backend.php?action=update", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${id}&tipo=${tipo}&producto=${producto}&precio=${precio}&disponibilidad=${disponibilidad}&talla=${talla}`
    }).then(() => {
        alertify.success("Producto actualizado");
        cargarProductos();
        document.getElementById("form").reset();
        document.getElementById("btnAgregar").innerHTML = "<i class='bi bi-plus-circle'></i> Agregar";
        let nuevoBtn = document.getElementById("btnAgregar").cloneNode(true);
        document.getElementById("btnAgregar").parentNode.replaceChild(nuevoBtn, document.getElementById("btnAgregar"));
        nuevoBtn.addEventListener("click", agregarProducto);
    });
}

function eliminarProducto(id, tipo) {
    alertify.confirm("Eliminar Producto", "¿Estás seguro de eliminar este producto?",
        function() {
            fetch("http://localhost/ProyectoProgramacion3/backend.php?action=delete", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `id=${id}&tipo=${tipo}`
            }).then(() => {
                alertify.success("Producto eliminado");
                cargarProductos();
            });
        },
        function() {
            alertify.error("Acción cancelada");
        }
    );
}
