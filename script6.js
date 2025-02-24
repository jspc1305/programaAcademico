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

    if (!panel || !desempenoTexto || !accionesTexto || !guardarAccionesBtn) {
        console.error("Error: No se encontraron los elementos necesarios en el DOM.");
        return;
    }

    let valores = [];
    let sumaTotal = 0;
    let totalCategorias = 0;

    // Se recorre cada sección definida y se buscan en localStorage las claves que contengan el nombre del archivo
    Object.keys(secciones).forEach(pagina => {
        let sumaValoracion = 0;
        let cantidadValoraciones = 0;
        let observaciones = [];

        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            if (key && key.includes(pagina)) {
                if (key.includes("-valoracion-")) {
                    let colorValoracion = localStorage.getItem(key);
                    if (colorValoracion && valoracionesPuntos.hasOwnProperty(colorValoracion)) {
                        sumaValoracion += valoracionesPuntos[colorValoracion];
                        cantidadValoraciones++;
                    }
                }
                if (key.includes("-observacion-")) {
                    let obs = localStorage.getItem(key);
                    if (obs) {
                        observaciones.push(obs);
                    }
                }
            }
        }

        let promedioValoracion = cantidadValoraciones > 0 ? (sumaValoracion / cantidadValoraciones).toFixed(1) : "Sin evaluación";
        let observacionesTexto = observaciones.length > 0 ? observaciones.join(" | ") : "Sin observaciones";
        
        valores.push(promedioValoracion === "Sin evaluación" ? 0 : parseFloat(promedioValoracion));

        if (promedioValoracion !== "Sin evaluación") {
            sumaTotal += parseFloat(promedioValoracion);
            totalCategorias++;
        }

        const card = document.createElement("div");
        card.className = "card p-4 border rounded-lg shadow-md bg-gray-50";
        card.innerHTML = `
            <h3 class="font-semibold">${secciones[pagina]}</h3>
            <p><strong>Valoración:</strong> ${promedioValoracion}</p>
            <p><strong>Observaciones:</strong> ${observacionesTexto}</p>
        `;
        panel.appendChild(card);
    });

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

    accionesTexto.value = localStorage.getItem("acciones") || "";
    guardarAccionesBtn.addEventListener("click", function() {
        localStorage.setItem("acciones", accionesTexto.value);
    });

    function generarReporteImpresion() {
        const ct = localStorage.getItem("nombreCT") || "N/A";
        const acciones = localStorage.getItem("acciones") || "";

        const printContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Reporte ${ct}</title>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <style>
                @media print {
                    body { margin: 0; padding: 20px; }
                    canvas { width: 100% !important; height: 100% !important; }
                }
            </style>
        </head>
        <body>
            <h1>Reporte: ${ct}</h1>
            <div>
                <h2>Acciones a Realizar</h2>
                <p>${acciones}</p>
            </div>
            <canvas id="chartPrint"></canvas>
            <script>
                document.addEventListener('DOMContentLoaded', function() {
                    const ctx = document.getElementById('chartPrint').getContext('2d');
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: ${JSON.stringify(Object.values(secciones))},
                            datasets: [{
                                label: 'Desempeño',
                                data: ${JSON.stringify(valores)},
                                backgroundColor: ["#4CAF50", "#FFEB3B", "#F44336", "#2196F3", "#9C27B0"]
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: { y: { beginAtZero: true, min: -10, max: 10 } }
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

    const imprimirBtn = document.getElementById('imprimirBtn');
    if (imprimirBtn) {
        imprimirBtn.addEventListener('click', generarReporteImpresion);
    }
});
