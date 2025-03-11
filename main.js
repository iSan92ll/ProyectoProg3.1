document.addEventListener("DOMContentLoaded", () => {
    cargarProductos(); 
    document.getElementById("btnTodos").addEventListener("click", () => cargarProductos());
    document.getElementById("btnRopa").addEventListener("click", () => cargarProductos("ropa"));
    document.getElementById("btnComida").addEventListener("click", () => cargarProductos("comida"));
    document.getElementById("btnAgregar").addEventListener("click", agregarProducto);
});

function cargarProductos(filtro = "") {
    fetch("https://proyectoprog3.onrender.com/backend.php?action=read")
    .then(response => response.json())
    .then(jsonData => {
        let listado = document.getElementById("listado");
        listado.innerHTML = "";
        
        let productosFiltrados = filtro ? jsonData.filter(producto => producto.tipo === filtro) : jsonData;
        
        productosFiltrados.forEach(producto => {
            let row = document.createElement("tr");
            row.classList.add("fade-in");
            
            let tallaColumna = producto.tipo === "ropa" ? `<td>${producto.talla || "-"}</td>` : `<td>-</td>`;
            
            row.innerHTML = `
                <td>${producto.id}</td>
                <td>${producto.producto}</td>
                <td>$${producto.precio}</td>
                <td>${producto.disponibilidad}</td>
                ${tallaColumna}
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editarProducto(${producto.id}, '${producto.tipo}', '${producto.producto}', ${producto.precio}, ${producto.disponibilidad}, '${producto.talla || ''}')"><i class="bi bi-pencil-square"></i> Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${producto.id}, '${producto.tipo}')"><i class="bi bi-trash"></i> Eliminar</button>
                </td>
            `;
            listado.appendChild(row);
        });
    })
    .catch(error => alertify.error("Error al cargar productos"));
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

    fetch("https://proyectoprog3.onrender.com/backend.php?action=create", {
        method: "POST",
        body: formData
    })
    .then(() => {
        alertify.success("Producto agregado");
        cargarProductos();
        document.getElementById("form").reset();
    })
    .catch(error => alertify.error("Error al agregar producto"));
}

function editarProducto(id, tipo, producto, precio, disponibilidad, talla) {
    document.getElementById("producto").value = producto;
    document.getElementById("precio").value = precio;
    document.getElementById("disponibilidad").value = disponibilidad;
    document.getElementById("tipo").value = tipo;
    document.getElementById("talla").value = talla;
    document.getElementById("talla-container").style.display = (tipo === "ropa") ? "none" : "block";
    
    document.getElementById("btnAgregar").innerHTML = "<i class='bi bi-pencil-square'></i> Actualizar";
    document.getElementById("btnAgregar").onclick = () => actualizarProducto(id, tipo);
}

function actualizarProducto(id, tipo) {
    let producto = document.getElementById("producto").value;
    let precio = document.getElementById("precio").value;
    let disponibilidad = document.getElementById("disponibilidad").value;
    let talla = tipo === "ropa" ? document.getElementById("talla").value : "";

    fetch("https://proyectoprog3.onrender.com/backend.php?action=update", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${id}&tipo=${tipo}&producto=${producto}&precio=${precio}&disponibilidad=${disponibilidad}&talla=${talla}`
    }).then(() => {
        alertify.success("Producto actualizado");
        cargarProductos();
        document.getElementById("form").reset();
        document.getElementById("btnAgregar").innerHTML = "<i class='bi bi-plus-circle'></i> Agregar";
        document.getElementById("btnAgregar").onclick = agregarProducto;
    });
}

function eliminarProducto(id, tipo) {
    alertify.confirm("Eliminar Producto", "¿Estás seguro?", () => {
        fetch("https://proyectoprog3.onrender.com/backend.php?action=delete", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `id=${id}&tipo=${tipo}`
        })
        .then(() => {
            alertify.success("Producto eliminado");
            cargarProductos();
        })
        .catch(error => alertify.error("Error al eliminar producto"));
    }, () => {
        alertify.error("Acción cancelada");
    });
}
