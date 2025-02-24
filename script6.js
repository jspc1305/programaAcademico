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
    const desempenoTexto = document.getElementById("desempenoTexto");
    const accionesTexto = document.getElementById("accionesTexto");
    const guardarAccionesBtn = document.getElementById("guardarAcciones");
    let valores = [];
    let sumaTotal = 0;
    let totalCategorias = 0;

    if (!panel || !desempenoTexto || !accionesTexto || !guardarAccionesBtn) {
        console.error("Error: No se encontraron los elementos necesarios en el DOM.");
        return;
    }

    Object.keys(secciones).forEach(pagina => {
        let sumaValoracion = 0;
        let cantidadValoraciones = 0;
        let observaciones = [];

        Object.keys(localStorage).forEach(key => {
            // Usar includes para localizar las claves aunque el path incluya subdirectorios
            if (key.includes(pagina)) {
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

        // Se muestra en el panel el promedio (para visualización) y en la gráfica la sumatoria
        let promedioValoracion = cantidadValoraciones > 0 ? (sumaValoracion).toFixed(1) : "Sin evaluación";
        observaciones = observaciones.length > 0 ? observaciones.join(" | ") : "Sin observaciones";
        valores.push(promedioValoracion === "Sin evaluación" ? 0 : parseFloat(sumaValoracion));
        
        if (promedioValoracion !== "Sin evaluación") {
            sumaTotal += parseFloat(promedioValoracion);
            totalCategorias++;
        }
        
        const card = document.createElement("div");
        card.className = "card p-4 border rounded-lg shadow-md bg-gray-50";
        card.innerHTML = `
            <h3 class="font-semibold">${secciones[pagina]}</h3>
            <p><strong>Valoración:</strong> ${promedioValoracion}</p>
            <p><strong>Observaciones:</strong> ${observaciones}</p>
        `;
        panel.appendChild(card);
    });

    // Calcular promedio total (se utiliza para determinar el desempeño global)
    let promedioTotal = totalCategorias > 0 ? (sumaTotal / totalCategorias).toFixed(1) : 0;
    let textoDesempeno = "Moderado";
    let colorClase = "text-yellow-600";

    if (promedioTotal >= 5) {
        textoDesempeno = "Bien";
        colorClase = "text-green-600";
    } else if (promedioTotal <= -5) {
        textoDesempeno = "Apoyo";
        colorClase = "text-red-600";
    }

    desempenoTexto.className = `text-lg font-bold ${colorClase}`;
    desempenoTexto.textContent = `Desempeño: ${textoDesempeno} (${promedioTotal})`;

    // Crear la gráfica con Chart.js usando la sumatoria de las valoraciones de cada sección
    const canvas = document.getElementById("graficoDesempeno");
    if (canvas) {
        const ctx = canvas.getContext("2d");
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
    } else {
        console.error("Error: No se encontró el elemento canvas para la gráfica.");
    }

    // Cargar y guardar acciones en localStorage
    accionesTexto.value = localStorage.getItem("acciones") || "";
    guardarAccionesBtn.addEventListener("click", () => {
        localStorage.setItem("acciones", accionesTexto.value);
    });

    // Función para generar el reporte imprimible
    function generarReporteImpresion() {
        const ct = localStorage.getItem("nombreCT") || "N/A";
        const acciones = localStorage.getItem("acciones") || "";
        
        // Calcular valores y contenido de las secciones para el reporte
        const seccionesImpresion = Object.keys(secciones).map(pagina => {
            let sumaValoracion = 0;
            let cantidadValoraciones = 0;
            let observaciones = [];

            Object.keys(localStorage).forEach(key => {
                if (key.includes(pagina)) {
                    if (key.includes("valoracion")) {
                        const color = localStorage.getItem(key);
                        sumaValoracion += valoracionesPuntos[color] || 0;
                        cantidadValoraciones++;
                    }
                    if (key.includes("observacion")) {
                        observaciones.push(localStorage.getItem(key));
                    }
                }
            });

            return {
                nombre: secciones[pagina],
                valoracion: cantidadValoraciones ? sumaValoracion.toFixed(1) : "Sin evaluación",
                observaciones: observaciones.join(" | ") || "Sin observaciones"
            };
        });

        const valoresImpresion = seccionesImpresion.map(s => s.valoracion === "Sin evaluación" ? 0 : parseFloat(s.valoracion));
        
        // Construir HTML del reporte
        const printContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Reporte ${ct}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <style>
                @media print {
                    body { width: 210mm; height: 297mm; margin: 0; padding: 20px; }
                    .a4-container { max-width: 794px; margin: 0 auto; }
                    .chart-container { width: 100%; height: 400px; }
                    canvas { width: 100% !important; height: 100% !important; }
                }
            </style>
        </head>
        <body class="bg-white a4-container">
            <h1 class="text-3xl font-bold mb-6">Reporte: ${ct}</h1>
            
            <!-- Valoraciones -->
            <div class="mb-8">
                <h2 class="text-xl font-semibold mb-4">Valoraciones y Observaciones</h2>
                <div class="grid gap-4">
                    ${seccionesImpresion.map(s => `
                        <div class="p-3 border rounded bg-gray-50">
                            <h3 class="font-semibold">${s.nombre}</h3>
                            <p><strong>Valoración:</strong> ${s.valoracion}</p>
                            <p><strong>Observaciones:</strong> ${s.observaciones}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Gráfica -->
            <div class="mb-8">
                <h2 class="text-xl font-semibold mb-4">Desempeño por Área</h2>
                <div class="chart-container">
                    <canvas id="chartPrint"></canvas>
                </div>
            </div>

            <!-- Acciones -->
            <div>
                <h2 class="text-xl font-semibold mb-4">Acciones a Realizar</h2>
                <div class="p-4 border rounded bg-gray-50 whitespace-pre-wrap">${acciones}</div>
            </div>

            <script>
                document.addEventListener('DOMContentLoaded', function() {
                    const ctx = document.getElementById('chartPrint').getContext('2d');
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: ${JSON.stringify(seccionesImpresion.map(s => s.nombre))},
                            datasets: [{
                                label: 'Desempeño',
                                data: ${JSON.stringify(valoresImpresion)},
                                backgroundColor: ["#4CAF50", "#FFEB3B", "#F44336", "#2196F3", "#9C27B0"]
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: { y: { beginAtZero: true, min: -10, max: 10 } },
                            plugins: {
                                legend: { display: false },
                                tooltip: { enabled: true }
                            },
                            layout: {
                                padding: { left: 20, right: 20, top: 20, bottom: 20 }
                            }
                        }
                    });
                });
            </script>
        </body>
        </html>
        `;

        const ventana = window.open('', '_blank');
        ventana.document.write(printContent);
        ventana.document.close();
    }

    // Evento para el botón de imprimir
    document.getElementById('imprimirBtn').addEventListener('click', generarReporteImpresion);
});
