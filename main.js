let usuarioActual = null;
let productosGlobal = [];

document.addEventListener("DOMContentLoaded", () => {
  verificarSesion();

  document.getElementById("btnTodos").addEventListener("click", () => cargarProductos());
  document.getElementById("btnRopa").addEventListener("click", () => cargarProductos("ropa"));
  document.getElementById("btnComida").addEventListener("click", () => cargarProductos("comida"));
  document.getElementById("btnTecnologia").addEventListener("click", () => cargarProductos("tecnologia"));

  document.getElementById("btnBuscar").addEventListener("click", () => cargarProductos(document.getElementById("busqueda").value.trim().toLowerCase()));
  document.getElementById("busqueda").addEventListener("keypress", function (event) {
    if (event.key === "Enter" && document.activeElement.id === "busqueda") {
      const terminoBusqueda = document.getElementById("busqueda").value.trim().toLowerCase();
      cargarProductos(terminoBusqueda);
    }
  });

  document.getElementById("btnAgregar").addEventListener("click", agregarProducto);

  document.getElementById("tipo").addEventListener("change", function() {
    const tallaContainer = document.getElementById("talla-container");
    tallaContainer.style.display = (this.value === "ropa") ? "block" : "none";
  });

  document.getElementById("btnLogin")?.addEventListener("click", login);
  document.getElementById("btnRegister")?.addEventListener("click", register);
  document.getElementById("btnLogout")?.addEventListener("click", logout);

  document.getElementById("btnVaciarCarrito")?.addEventListener("click", vaciarCarrito);

  cargarProductos();
});

//  Sesion y roles
function verificarSesion() {
  const userData = localStorage.getItem("usuario");
  if (userData) {
    usuarioActual = JSON.parse(userData);
    // Mostrar u ocultar secciones según el rol
    if (usuarioActual.rol === "admin") {
      document.getElementById("adminCrud").classList.remove("d-none");
      document.getElementById("carritoSection").classList.add("d-none");
    } else if (usuarioActual.rol === "usuario") {
      document.getElementById("adminCrud").classList.add("d-none");
      document.getElementById("carritoSection").classList.remove("d-none");
      cargarCarrito();
    }
    // Ocultar botones de login/registro y mostrar botón de logout
    document.getElementById("btnLoginModal").classList.add("d-none");
    document.getElementById("btnRegisterModal").classList.add("d-none");
    document.getElementById("btnLogout").classList.remove("d-none");
  } else {
    // No hay usuario logueado
    document.getElementById("adminCrud").classList.add("d-none");
    document.getElementById("carritoSection").classList.add("d-none");
    document.getElementById("btnLoginModal").classList.remove("d-none");
    document.getElementById("btnRegisterModal").classList.remove("d-none");
    document.getElementById("btnLogout").classList.add("d-none");
  }
}

function login() {
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  if (!username || !password) {
    alertify.error("Completa todos los campos");
    return;
  }

  fetch("https://proyectoprog3.onrender.com/backend.php?action=login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      usuarioActual = {
        id_usuario: data.id_usuario,
        username: data.username,
        rol: data.rol
      };
      localStorage.setItem("usuario", JSON.stringify(usuarioActual));
      alertify.success("Sesión iniciada");
      const loginModal = document.getElementById("loginModal");
      const modal = bootstrap.Modal.getInstance(loginModal);
      modal.hide();

      verificarSesion();
    } else {
      alertify.error(data.message || "Error al iniciar sesión");
    }
  })
  .catch(err => console.error("Error login:", err));
}

function register() {
  const username = document.getElementById("registerUsername").value;
  const password = document.getElementById("registerPassword").value;

  if (!username || !password) {
    alertify.error("Completa todos los campos");
    return;
  }

  fetch("https://proyectoprog3.onrender.com/backend.php?action=register", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alertify.success("Usuario registrado con éxito");
      const registerModal = document.getElementById("registerModal");
      const modal = bootstrap.Modal.getInstance(registerModal);
      modal.hide();
    } else {
      alertify.error(data.message || "Error al registrarse");
    }
  })
  .catch(err => console.error("Error register:", err));
}

function logout() {
  localStorage.removeItem("usuario");
  usuarioActual = null;
  alertify.success("Sesión cerrada");
  verificarSesion();
}


function cargarProductos(filtro = "") {
  fetch("https://proyectoprog3.onrender.com/backend.php?action=read", {
    method: "GET",
    mode: "cors" 
    })

    .then(res => res.json())
    .then(response => {
      if (!Array.isArray(response)) {
      console.error("La respuesta del servidor no es un array:", response);
      return;
      }
      let data = response;
      let listado = document.getElementById("listado");
      listado.innerHTML = "";
      let productosFiltrados = filtro 
          ? data.filter(producto => 
              producto.tipo?.toLowerCase().includes(filtro) ||
              producto.producto?.toLowerCase().includes(filtro)
          ) 
          : data;
        
      if (!Array.isArray(productosFiltrados)) {
          console.error("Error: productosFiltrados no es un array.", productosFiltrados);
          return;
      }
    
      if (productosFiltrados.length === 0) {
          listado.innerHTML = "<p>No se encontraron productos con el término de búsqueda : "+filtro+".</p>";
          return;
      }
    
      productosFiltrados.forEach(producto => {
          let card = document.createElement("div");
          card.classList.add("product-card");
      
          card.innerHTML = `
              <img src="${producto.imagen}" alt="${producto.producto}" class="product-img">
              <h3 class="txtProducto">${producto.producto}</h3>
              <p class="tipoP"><strong>Tipo:</strong> ${producto.tipo}</p>
              <p class="precioP"><strong>Precio:</strong> $${producto.precio}</p>
              <p class="disponibleP"><strong>Disponibles:</strong> ${producto.disponibilidad}</p>
              <button class="btn-primary btn-sm me-2" onclick="agregarAlCarrito(${producto.id})" id="btnCarrito">
                  <i class="bi bi-cart-plus"></i> Añadir al Carrito
              </button>
          `;
      
          listado.appendChild(card);
      });
    
      // Listado admin
      const listadoAdmin = document.getElementById("listadoAdmin");
      listadoAdmin.innerHTML = "";
      data.forEach(producto => {
          const trAdmin = document.createElement("tr");
          trAdmin.innerHTML = `
              <td>${producto.id}</td>
              <td>${producto.producto}</td>
              <td>$${producto.precio}</td>
              <td>${producto.disponibilidad}</td>
              <td>${producto.tipo === "ropa" ? (producto.talla || "-") : "-"}</td>
              <td>
                  <button class="btn btn-warning btn-sm" onclick="editarProducto(${producto.id}, '${producto.tipo}', '${producto.producto}', ${producto.precio}, ${producto.disponibilidad})">
                      <i class="bi bi-pencil-square"></i> Editar
                  </button>
                  <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${producto.id}, '${producto.tipo}')">
                      <i class="bi bi-trash"></i> Eliminar
                  </button>
              </td>
          `;
          listadoAdmin.appendChild(trAdmin);
      });
    })
    .catch(error => console.error("Error al cargar productos:", error));
}

//  CRUD para Admin
function agregarProducto() {
  const tipo = document.getElementById("tipo").value;
  const producto = document.getElementById("producto").value;
  const precio = document.getElementById("precio").value;
  const disponibilidad = document.getElementById("disponibilidad").value;
  const talla = (tipo === "ropa") ? document.getElementById("talla").value : "";

  if (!producto || !precio || !disponibilidad || (tipo === "ropa" && !talla)) {
    alertify.error("Todos los campos son obligatorios");
    return;
  }

  const formData = new FormData();
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
    document.getElementById("form").reset();
    cargarProductos();
  })
  .catch(err => console.error("Error al agregar producto:", err));
}

function editarProducto(id, tipo, nombre, precio, disp, talla) {
  document.getElementById("tipo").value = tipo;
  document.getElementById("producto").value = nombre;
  document.getElementById("precio").value = precio;
  document.getElementById("disponibilidad").value = disp;
  document.getElementById("talla").value = talla;
  document.getElementById("talla-container").style.display = (tipo === "ropa") ? "block" : "none";

  const btnAgregar = document.getElementById("btnAgregar");
  btnAgregar.textContent = "Actualizar";
  btnAgregar.classList.remove("btn-success");
  btnAgregar.classList.add("btn-warning");

  const newBtn = btnAgregar.cloneNode(true);
  btnAgregar.parentNode.replaceChild(newBtn, btnAgregar);

  newBtn.addEventListener("click", () => {
    actualizarProducto(id, tipo);
  });
}

function actualizarProducto(id, tipo) {
  const producto = document.getElementById("producto").value;
  const precio = document.getElementById("precio").value;
  const disponibilidad = document.getElementById("disponibilidad").value;
  const talla = (tipo === "ropa") ? document.getElementById("talla").value : "";

  fetch("https://proyectoprog3.onrender.com/backend.php?action=update", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `id=${id}&tipo=${tipo}&producto=${encodeURIComponent(producto)}&precio=${precio}&disponibilidad=${disponibilidad}&talla=${encodeURIComponent(talla)}`
  })
  .then(() => {
    alertify.success("Producto actualizado");
    document.getElementById("form").reset();
    const btnAgregar = document.getElementById("btnAgregar");
    btnAgregar.textContent = "Agregar";
    btnAgregar.classList.remove("btn-warning");
    btnAgregar.classList.add("btn-success");

    // Restaurar eventListener original
    const newBtn = btnAgregar.cloneNode(true);
    btnAgregar.parentNode.replaceChild(newBtn, btnAgregar);
    newBtn.addEventListener("click", agregarProducto);

    cargarProductos();
  })
  .catch(err => console.error("Error al actualizar producto:", err));
}

function eliminarProducto(id, tipo) {
  alertify.confirm("Eliminar Producto", "¿Estás seguro de eliminar este producto?",
    function() {
      fetch("https://proyectoprog3.onrender.com/backend.php?action=delete", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${id}&tipo=${tipo}`
      })
      .then(() => {
        alertify.success("Producto eliminado");
        cargarProductos();
      })
      .catch(err => console.error("Error al eliminar producto:", err));
    },
    function() {
      alertify.error("Acción cancelada");
    }
  );
}

function agregarAlCarrito(idProducto, tipo) {
  if (!usuarioActual || usuarioActual.rol !== "usuario") {
    alertify.error("Debes iniciar sesión como usuario para usar el carrito");
    return;
  }

  fetch("https://proyectoprog3.onrender.com/backend.php?action=addToCart", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `id_usuario=${usuarioActual.id_usuario}&id_producto=${idProducto}&tipo=${tipo}&cantidad=1`
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alertify.success("Producto agregado al carrito");
      cargarCarrito();
    } else {
      alertify.error(data.message || "Error al agregar al carrito");
    }
  })
  .catch(err => console.error("Error al agregar al carrito:", err));
}

function cargarCarrito() {
  if (!usuarioActual) return;

  fetch(`https://proyectoprog3.onrender.com/backend.php?action=getCart&id_usuario=${usuarioActual.id_usuario}`)
    .then(res => res.json())
    .then(data => {
      const listadoCarrito = document.getElementById("listadoCarrito");
      listadoCarrito.innerHTML = "";

      let total = 0;

      data.forEach(item => {
        const subtotal = item.cantidad * item.precio;
        total += subtotal;

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${item.producto}</td>
          <td>${item.cantidad}</td>
          <td>$${item.precio}</td>
          <td>$${subtotal}</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="eliminarDelCarrito(${item.id_carrito})">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        `;
        listadoCarrito.appendChild(tr);
      });

      document.getElementById("carritoTotal").textContent = total.toFixed(2);
    })
    .catch(err => console.error("Error al cargar carrito:", err));
}

function eliminarDelCarrito(idCarrito) {
  alertify.confirm("Eliminar del Carrito", "¿Deseas eliminar este producto del carrito?",
    function() {
      fetch("https://proyectoprog3.onrender.com/backend.php?action=removeFromCart", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id_carrito=${idCarrito}`
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alertify.success("Producto eliminado del carrito");
          cargarCarrito();
        } else {
          alertify.error(data.message || "Error al eliminar del carrito");
        }
      })
      .catch(err => console.error("Error removeFromCart:", err));
    },
    function() {
      alertify.error("Acción cancelada");
    }
  );
}

function vaciarCarrito() {
  if (!usuarioActual) return;

  alertify.confirm("Vaciar Carrito", "¿Deseas vaciar todo el carrito?",
    function() {
      fetch("https://proyectoprog3.onrender.com/backend.php?action=clearCart", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id_usuario=${usuarioActual.id_usuario}`
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alertify.success("Carrito vaciado");
          cargarCarrito();
        } else {
          alertify.error(data.message || "Error al vaciar carrito");
        }
      })
      .catch(err => console.error("Error clearCart:", err));
    },
    function() {
      alertify.error("Acción cancelada");
    }
  );
}
