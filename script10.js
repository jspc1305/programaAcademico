document.addEventListener("DOMContentLoaded", function () {
    const secciones = {
        "/ambientesAprendizaje.html": "Ambientes de Aprendizaje",
        "/cuadernosAlumnos.html": "Cuadernos de los Alumnos",
        "/evaluacionFormativa.html": "Evaluación Formativa",
        "/docente.html": "Docente",
        "/organizacionClase.html": "Organización de la Clase"
    };
    
    const valoracionesPuntos = {
        "verde": 2.5,
        "amarillo": 0,
        "rojo": -2.5
    };

    const panel = document.getElementById("evaluacionPanel");
    const accionesTexto = document.getElementById("accionesTexto");
    const guardarAccionesBtn = document.getElementById("guardarAcciones");
    const botonImprimir = document.getElementById("imprimirReporte");
    let valores = [];
    let sumaTotal = 0;
    let totalCategorias = 0;

    if (!panel) {
        console.error("Error: No se encontró el panel de evaluación.");
        return;
    }

    Object.keys(secciones).forEach(pagina => {
        let sumaValoracion = 0;
        let cantidadValoraciones = 0;
        let observaciones = [];

        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(pagina)) {
                if (key.includes("valoracion")) {
                    let colorValoracion = localStorage.getItem(key);
                    if (valoracionesPuntos.hasOwnProperty(colorValoracion)) {
                        sumaValoracion += valoracionesPuntos[colorValoracion];
                        cantidadValoraciones++;
                    }
                }
                if (key.includes("observacion")) {
                    observaciones.push(localStorage.getItem(key));
                }
            }
        });

        let promedioValoracion = cantidadValoraciones > 0 ? (sumaValoracion / cantidadValoraciones).toFixed(1) : "Sin evaluación";
        observaciones = observaciones.length > 0 ? observaciones.join(" | ") : "Sin observaciones";
        valores.push(promedioValoracion === "Sin evaluación" ? 0 : parseFloat(promedioValoracion));

        if (promedioValoracion !== "Sin evaluación") {
            sumaTotal += parseFloat(promedioValoracion);
            totalCategorias++;
        }

        const card = document.createElement("div");
        card.className = "p-4 border rounded-lg shadow-md bg-gray-50";
        card.innerHTML = `
            <h3 class="font-semibold">${secciones[pagina]}</h3>
            <p><strong>Valoración:</strong> ${promedioValoracion}</p>
            <p><strong>Observaciones:</strong> ${observaciones}</p>
        `;
        panel.appendChild(card);
    });

    const ctx = document.getElementById("graficoDesempeno")?.getContext("2d");
    if (ctx) {
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: Object.values(secciones),
                datasets: [{
                    label: "Desempeño",
                    data: valores,
                    backgroundColor: ["#4CAF50", "#FFEB3B", "#F44336", "#2196F3", "#9C27B0"],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true, min: -10, max: 10 } }
            }
        });
    }

    // Cargar y guardar acciones
    accionesTexto.value = localStorage.getItem("acciones") || "";
    guardarAccionesBtn.addEventListener("click", () => {
        localStorage.setItem("acciones", accionesTexto.value);
    });

    // Función para imprimir el reporte
    botonImprimir.addEventListener("click", function () {
        let ctNombre = localStorage.getItem("CT") || "Sin Nombre";
        let ventanaImpresion = window.open("", "_blank");

        ventanaImpresion.document.write(`
            <html>
            <head>
                <title>Reporte: ${ctNombre}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { text-align: center; }
                    .section { margin-bottom: 20px; }
                    .chart-container { text-align: center; }
                </style>
            </head>
            <body>
                <h1>Reporte: ${ctNombre}</h1>
                <div class="section">
                    <h2>Valoraciones y Observaciones</h2>
                    ${panel.innerHTML}
                </div>
                <div class="section chart-container">
                    <h2>Desempeño por Área</h2>
                    <canvas id="graficoReporte" width="400" height="200"></canvas>
                </div>
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                <script>
                    const ctx = document.getElementById("graficoReporte").getContext("2d");
                    new Chart(ctx, {
                        type: "bar",
                        data: {
                            labels: ${JSON.stringify(Object.values(secciones))},
                            datasets: [{
                                label: "Desempeño",
                                data: ${JSON.stringify(valores)},
                                backgroundColor: ["#4CAF50", "#FFEB3B", "#F44336", "#2196F3", "#9C27B0"],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: { y: { beginAtZero: true, min: -10, max: 10 } }
                        }
                    });
                </script>
            </body>
            </html>
        `);
        ventanaImpresion.document.close();
        setTimeout(() => ventanaImpresion.print(), 1000);
    });
});
