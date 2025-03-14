document.addEventListener("DOMContentLoaded", () => {
    cargarProductos(); 

    document.getElementById("btnAgregar").addEventListener("click", agregarProducto);
    document.getElementById("btnCancelar").addEventListener("click", cancelarEdicion);
    document.getElementById("btnCancelar").style.display = "none";
    document.getElementById("btnTodos").addEventListener("click", () => cargarProductos());
    document.getElementById("btnRopa").addEventListener("click", () => cargarProductos("ropa"));
    document.getElementById("btnComida").addEventListener("click", () => cargarProductos("comida"));
});

function cargarProductos(filtro = "") {
    fetch("https://proyectoprog3.onrender.com/backend.php?action=read")
    .then(response => response.text())
    .then(data => {
        let jsonData = JSON.parse(data); 
        let listado = document.getElementById("listado");
        listado.innerHTML = "";

        let productosFiltrados = filtro ? jsonData.filter(producto => producto.tipo === filtro) : jsonData;

        productosFiltrados.forEach(producto => {
            let row = document.createElement("tr");
            row.classList.add("fade-in");

            let tallaColumna = producto.tipo === "ropa" ? `<td class="text-center">${producto.talla || "-"}</td>` : `<td class="text-center">-</td>`;

            row.innerHTML = `
                <td class="text-center">${producto.id_productos}</td>
                <td class="text-center">${producto.producto}</td>
                <td class="text-center">$${producto.precio}</td>
                <td class="text-center">${producto.disponibilidad}</td>
                ${tallaColumna}
                <td class="text-center">
                    <button class="btn btn-warning btn-sm" onclick="editarProducto(${producto.id_productos}, '${producto.tipo}', '${producto.producto}', ${producto.precio}, '${producto.disponibilidad}', '${producto.talla || ''}')"><i class="bi bi-pencil-square"></i> Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${producto.id_productos}, '${producto.tipo}')"><i class="bi bi-trash"></i> Eliminar</button>
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

    console.log("Agregando producto");

    fetch("https://proyectoprog3.onrender.com/backend.php?action=create", {
        method: "POST",
        body: formData
    })
    .then(data => {
        if (data.error) {
            alertify.error("Error: " + data.error);
        } else {
            alertify.success("Producto agregado");
            cargarProductos();
            document.getElementById("form").reset();
        }
    })
    .catch(error => console.error("Error en la creación:", error));
}

function editarProducto(id, tipo, producto, precio, disponibilidad, talla) {
    document.getElementById("producto").value = producto;
    document.getElementById("precio").value = precio;
    document.getElementById("disponibilidad").value = disponibilidad;
    document.getElementById("tipo").value = tipo;
    document.getElementById("talla").value = talla;
    if (tipo === "ropa") {
        document.getElementById("talla-container").style.display = "block";   
    } else {
        document.getElementById("talla-container").style.display = "none";
    }

    document.getElementById("btnAgregar").innerHTML = "<i class='bi bi-pencil-square'></i> Actualizar";
    document.getElementById("btnAgregar").removeEventListener("click", agregarProducto);
    document.getElementById("btnAgregar").addEventListener("click", () => actualizarProducto(id, tipo));
    document.getElementById("btnCancelar").style.display = "block";
}

function actualizarProducto(id, tipo) {
    let formData = new FormData();
    formData.append("id", id);
    formData.append("tipo", tipo);
    formData.append("producto", document.getElementById("producto").value);
    formData.append("precio", document.getElementById("precio").value);
    formData.append("disponibilidad", document.getElementById("disponibilidad").value);
    if (tipo === "ropa") {formData.append("talla", document.getElementById("talla").value);}

    console.log("Actualizando producto", id);

    fetch("https://proyectoprog3.onrender.com/backend.php?action=update", {
        method: "POST",
        body: formData
    }).then(response => response.json())
    .then(data => {
        if (data.error) {
            alertify.error("Error: " + data.error);
        } else {
            alertify.success("Producto actualizado");
            cargarProductos();
            document.getElementById("form").reset();
            document.getElementById("btnAgregar").innerHTML = "<i class='bi bi-plus-circle'></i> Agregar";
            let nuevoBtn = document.getElementById("btnAgregar").cloneNode(true);
            document.getElementById("btnAgregar").parentNode.replaceChild(nuevoBtn, document.getElementById("btnAgregar"));
            nuevoBtn.addEventListener("click", agregarProducto);
            document.getElementById("btnCancelar").style.display = "none";
        }
    }).catch(error => console.error("Error en la actualización:", error));
}

function eliminarProducto(id_productos, tipo) {
    alertify.confirm("Eliminar Producto", "¿Estás seguro de eliminar este producto?",
        function() {
            let formData = new FormData();
            formData.append("id", id_productos);
            formData.append("tipo", tipo);

            console.log("Eliminando producto", id_productos);

            fetch("https://proyectoprog3.onrender.com/backend.php?action=delete", {
                method: "POST",
                body: formData
            }).then(response => response.json())
            .then(data => {
                if (data.error) {
                    alertify.error("Error al eliminar: ");
                    console.log(data);
                } else {
                    alertify.success("Producto eliminado");
                    cargarProductos(); 
                }
            }).catch(error => console.error("Error en la eliminación:", error));
        },
        function() {
            alertify.error("Acción cancelada");
        }
    );
}

function cancelarEdicion() {
    document.getElementById("form").reset();
    document.getElementById("btnAgregar").innerHTML = "<i class='bi bi-plus-circle'></i> Agregar";
    
    let nuevoBtn = document.getElementById("btnAgregar").cloneNode(true);
    document.getElementById("btnAgregar").parentNode.replaceChild(nuevoBtn, document.getElementById("btnAgregar"));
    nuevoBtn.addEventListener("click", agregarProducto);

    document.getElementById("btnCancelar").style.display = "none";
}
