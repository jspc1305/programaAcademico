document.addEventListener("DOMContentLoaded", function () {
    const tablaHistorial = document.getElementById("tablaHistorial");
    const btnAgregar = document.getElementById("agregarRegistro");
    const btnExportar = document.getElementById("exportarHistorial");
    const inputImportar = document.getElementById("importarHistorial");

    let historial = JSON.parse(localStorage.getItem("historialCT")) || [];

    // Mapeo de secciones
    const secciones = {
        "/ambientesAprendizaje.html": "Ambientes de Aprendizaje",
        "/cuadernosAlumnos.html": "Cuadernos de los Alumnos",
        "/evaluacionFormativa.html": "Evaluación Formativa",
        "/docente.html": "Docente",
        "/organizacionClase.html": "Organización de la Clase"
    };

    // Mapeo de valoraciones a números
    const valoracionesPuntos = {
        "verde": 2.5,
        "amarillo": 0,
        "rojo": -2.5
    };

    function calcularSuma(valoraciones) {
        const valores = valoraciones.map(v => valoracionesPuntos[v]).filter(v => v !== undefined);
        return valores.length ? valores.reduce((a, b) => a + b, 0).toFixed(2) : "0";
    }

    function obtenerDatosLocalStorage() {
        let datos = {};
        let totalSumas = 0;
        let totalSecciones = 0;

        Object.keys(secciones).forEach(seccion => {
            let valoraciones = [];
            let observaciones = [];

            // Obtener valoraciones y observaciones de cada sección
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(seccion)) {
                    if (key.includes("valoracion")) {
                        valoraciones.push(localStorage.getItem(key));
                    }
                    if (key.includes("observacion")) {
                        observaciones.push(localStorage.getItem(key));
                    }
                }
            });

            let suma = calcularSuma(valoraciones);
            datos[secciones[seccion]] = {
                suma: suma,
                valoraciones: valoraciones.length ? valoraciones.join(" | ") : "Sin datos",
                observaciones: observaciones.length ? observaciones.join(" | ") : "Sin observaciones"
            };

            if (!isNaN(parseFloat(suma))) {
                totalSumas += parseFloat(suma);
                totalSecciones++;
            }
        });

        datos["Generar Reporte"] = {
            promedio: totalSecciones > 0 ? (totalSumas / totalSecciones).toFixed(2) : "0"
        };

        console.log("Datos extraídos de localStorage:", datos);
        return datos;
    }

    function renderizarTabla() {
        tablaHistorial.innerHTML = "";
        historial.forEach((registro, index) => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td class="border p-2">${registro.nombreCT}</td>
                <td class="border p-2">${registro.fecha}</td>
                <td class="border p-2">${registro["Ambientes de Aprendizaje"].suma}</td>
                <td class="border p-2">${registro["Cuadernos de los Alumnos"].suma}</td>
                <td class="border p-2">${registro["Evaluación Formativa"].suma}</td>
                <td class="border p-2">${registro["Docente"].suma}</td>
                <td class="border p-2">${registro["Organización de la Clase"].suma}</td>
                <td class="border p-2 font-bold text-blue-600">${registro["Generar Reporte"].promedio}</td>
                <td class="border p-2">
                    <button class="bg-green-500 text-white py-1 px-2 rounded cargar-btn" data-index="${index}">Cargar</button>
                    <button class="bg-red-500 text-white py-1 px-2 rounded eliminar-btn" data-index="${index}">Eliminar</button>
                </td>
            `;
            tablaHistorial.appendChild(fila);
        });

        document.querySelectorAll(".cargar-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                cargarRegistro(this.dataset.index);
            });
        });

        document.querySelectorAll(".eliminar-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                eliminarRegistro(this.dataset.index);
            });
        });
    }

    function agregarRegistro() {
        const datosGuardados = obtenerDatosLocalStorage();
        
        // Obtener valores de nombreCT, nombreDocente y numVisita desde localStorage
        const nombreCT = localStorage.getItem("nombreCT") || "Sin nombre";
        const nombreDocente = localStorage.getItem("nombreDocente") || "Sin Docente";
        const numVisita = localStorage.getItem("numVisita") || "Sin Visita";

        // Formatear la información para la celda "Nombre CT"
        const nombreCompleto = `[${nombreCT}] [${nombreDocente}] [${numVisita}]`;

        const nuevoRegistro = {
            nombreCT: nombreCompleto,  // Se usa el formato con corchetes
            fecha: new Date().toISOString().split("T")[0],
            ...datosGuardados
        };

        historial.push(nuevoRegistro);
        localStorage.setItem("historialCT", JSON.stringify(historial));

        console.log("Historial actualizado:", historial);
        renderizarTabla();
    }

    function cargarRegistro(index) {
        const registro = historial[index];

        if (!registro) return;

        Object.keys(localStorage).forEach(key => {
            if (key.includes("valoracion") || key.includes("observacion")) {
                localStorage.removeItem(key);
            }
        });

        Object.keys(secciones).forEach(seccion => {
            const nombreSeccion = secciones[seccion];

            if (registro[nombreSeccion]) {
                registro[nombreSeccion].valoraciones.split(" | ").forEach((valor, i) => {
                    localStorage.setItem(`${seccion}-valoracion-${i}`, valor);
                });

                registro[nombreSeccion].observaciones.split(" | ").forEach((obs, i) => {
                    localStorage.setItem(`${seccion}-observacion-${i}`, obs);
                });
            }
        });

        localStorage.setItem("nombreCT", registro.nombreCT);
        alert("Datos cargados correctamente.");
        location.reload();
    }

    function eliminarRegistro(index) {
        historial.splice(index, 1);
        localStorage.setItem("historialCT", JSON.stringify(historial));
        renderizarTabla();
    }

    function exportarHistorial() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(historial));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "historialCT.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
    }

    function importarHistorial(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const registrosImportados = JSON.parse(e.target.result);
                historial = registrosImportados;
                localStorage.setItem("historialCT", JSON.stringify(historial));
                renderizarTabla();
                alert("Historial importado correctamente.");
            } catch (error) {
                alert("Error al importar el historial.");
            }
        };
        reader.readAsText(file);
    }

    btnAgregar.addEventListener("click", agregarRegistro);
    btnExportar.addEventListener("click", exportarHistorial);
    inputImportar.addEventListener("change", importarHistorial);

    renderizarTabla();
});
