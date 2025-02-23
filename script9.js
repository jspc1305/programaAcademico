document.addEventListener("DOMContentLoaded", function () {
    const tablaHistorial = document.getElementById("tablaHistorial");
    const comparar1 = document.getElementById("comparar1");
    const comparar2 = document.getElementById("comparar2");
    const comparar3 = document.getElementById("comparar3");
    const compararBtn = document.getElementById("compararDatos");
    const graficosContainer = document.getElementById("graficosIndividuales");
    const btnImprimir = document.getElementById("imprimirComparacion"); // Botón de imprimir

    let graficoComparacion = null;
    let graficosIndividuales = [];

    let historial = JSON.parse(localStorage.getItem("historialCT")) || [];

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

    const colores = ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#9C27B0"]; // Definición de colores

    function calcularSuma(seccion) {
        let valores = [];
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(seccion) && key.includes("valoracion")) {
                let valor = localStorage.getItem(key);
                valores.push(valoracionesPuntos[valor] || 0);
            }
        });

        return valores.length ? valores.reduce((a, b) => a + b, 0).toFixed(2) : "0";
    }

    function obtenerDatosLocalStorage() {
        let datos = {};
        let totalSumas = 0;
        let totalSecciones = 0;

        Object.keys(secciones).forEach(seccion => {
            let suma = calcularSuma(seccion);
            datos[secciones[seccion]] = { suma: suma };

            if (!isNaN(parseFloat(suma))) {
                totalSumas += parseFloat(suma);
                totalSecciones++;
            }
        });

        datos["Generar Reporte"] = {
            promedio: totalSecciones > 0 ? (totalSumas / totalSecciones).toFixed(2) : "0"
        };

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
            `;
            tablaHistorial.appendChild(fila);
        });

        actualizarSelects();
    }

    function actualizarSelects() {
        let opciones = '<option value="">Seleccione un CT</option>';
        historial.forEach((r, i) => {
            opciones += `<option value="${i}">${r.nombreCT} - ${r.fecha}</option>`;
        });

        [comparar1, comparar2, comparar3].forEach(select => {
            select.innerHTML = opciones;
        });
    }

    function obtenerDatosSeleccionados() {
        return [comparar1.value, comparar2.value, comparar3.value]
            .filter(v => v !== "")
            .map(i => historial[parseInt(i)]);
    }

    function calcularMedia(datos) {
        let categorias = Object.values(secciones);
        return categorias.map(cat => {
            let suma = datos.reduce((acc, d) => acc + parseFloat(d[cat].suma), 0);
            return (suma / datos.length).toFixed(2);
        });
    }

    function generarGrafico(datos) {
        let ctx = document.getElementById("graficoComparacion").getContext("2d");

        if (graficoComparacion) {
            graficoComparacion.destroy();
        }

        let categorias = Object.values(secciones);

        let datasets = datos.map((d, index) => ({
            label: `${d.nombreCT} (${d.fecha})`,
            data: categorias.map(cat => parseFloat(d[cat].suma)),
            borderColor: colores[index % colores.length],
            borderWidth: 2,
            fill: false
        }));

        let media = calcularMedia(datos);
        datasets.push({
            label: "Media Ponderada",
            data: media,
            borderColor: "#00FF00",
            borderWidth: 3,
            borderDash: [5, 5],
            fill: false
        });

        graficoComparacion = new Chart(ctx, {
            type: "line",
            data: { labels: categorias, datasets: datasets },
            options: { responsive: true }
        });
    }

    // Función para generar el reporte imprimible
    function generarReporteImpresion() {
        const datos = obtenerDatosSeleccionados();
        if (datos.length === 0) {
            alert("Por favor, selecciona al menos un registro para comparar.");
            return;
        }

        const printContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Comparación de Registros</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <style>
                @media print {
                    body { width: 210mm; height: 297mm; margin: 0; padding: 20px; }
                    .a4-container { max-width: 794px; margin: 0 auto; }
                    .chart-container { width: 100%; height: 300px; }
                    canvas { width: 100% !important; height: 100% !important; }
                }
            </style>
        </head>
        <body class="bg-white a4-container">
            <h1 class="text-3xl font-bold mb-6">Comparación de Registros</h1>
            
            <!-- Registros Seleccionados -->
            <div class="mb-8">
                <h2 class="text-xl font-semibold mb-4">Registros Seleccionados</h2>
                <div class="grid gap-4">
                    ${datos.map(d => `
                        <div class="p-3 border rounded bg-gray-50">
                            <h3 class="font-semibold">${d.nombreCT} (${d.fecha})</h3>
                            <p><strong>Ambientes de Aprendizaje:</strong> ${d["Ambientes de Aprendizaje"].suma}</p>
                            <p><strong>Cuadernos de los Alumnos:</strong> ${d["Cuadernos de los Alumnos"].suma}</p>
                            <p><strong>Evaluación Formativa:</strong> ${d["Evaluación Formativa"].suma}</p>
                            <p><strong>Docente:</strong> ${d["Docente"].suma}</p>
                            <p><strong>Organización de la Clase:</strong> ${d["Organización de la Clase"].suma}</p>
                            <p><strong>Promedio:</strong> ${d["Generar Reporte"].promedio}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Gráfica de Comparación -->
            <div class="mb-8">
                <h2 class="text-xl font-semibold mb-4">Gráfica de Comparación</h2>
                <div class="chart-container">
                    <canvas id="chartPrint"></canvas>
                </div>
            </div>

            <script>
                document.addEventListener('DOMContentLoaded', function() {
                    const ctx = document.getElementById('chartPrint').getContext('2d');
                    const categorias = ${JSON.stringify(Object.values(secciones))};
                    const colores = ${JSON.stringify(colores)};

                    const datasets = ${JSON.stringify(datos.map((d, index) => ({
                        label: `${d.nombreCT} (${d.fecha})`,
                        data: Object.values(secciones).map(cat => parseFloat(d[cat].suma)),
                        borderColor: colores[index % colores.length],
                        borderWidth: 2,
                        fill: false
                    })))};

                    const media = ${JSON.stringify(calcularMedia(datos))};
                    datasets.push({
                        label: "Media Ponderada",
                        data: media,
                        borderColor: "#00FF00",
                        borderWidth: 3,
                        borderDash: [5, 5],
                        fill: false
                    });

                    new Chart(ctx, {
                        type: 'line',
                        data: { labels: categorias, datasets: datasets },
                        options: { responsive: true, maintainAspectRatio: false }
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
    btnImprimir.addEventListener("click", generarReporteImpresion);

    compararBtn.addEventListener("click", function () {
        let datos = obtenerDatosSeleccionados();
        if (datos.length > 0) generarGrafico(datos);
    });

    renderizarTabla();
});