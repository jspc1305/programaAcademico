document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("docente").value = localStorage.getItem("nombreDocente") || "";
    document.getElementById("cct").value = localStorage.getItem("cct") || "";
    document.getElementById("modalidad").value = localStorage.getItem("modalidad") || "";
    document.getElementById("estrategia").value = localStorage.getItem("estrategia") || "";
    document.getElementById("horario").value = localStorage.getItem("horario") || "";

    const campos = ["fecha", "foco", "motivo", "proposito", "asesor", "lugar", "seguimiento", "acuerdos", "seguimientoAcuerdos"];
    
    campos.forEach(id => {
        document.getElementById(id).value = localStorage.getItem(id) || "";
    });

    document.querySelectorAll("input, textarea, select").forEach(elemento => {
        elemento.addEventListener("input", function () {
            localStorage.setItem(elemento.id, elemento.value);
        });
    });

    window.agregarFila = function(idTabla) {
        let tabla = document.getElementById(idTabla);
        let newRow = tabla.insertRow(-1);

        if (idTabla === "tablaSesiones") {
            let sesionCell = newRow.insertCell(0);
            sesionCell.textContent = tabla.rows.length - 1;

            let fechaCell = newRow.insertCell(1);
            let inputFecha = document.createElement("input");
            inputFecha.type = "date";
            inputFecha.addEventListener("input", guardarTabla);
            fechaCell.appendChild(inputFecha);
        } else if (idTabla === "tablaDetalles") {
            for (let i = 0; i < 5; i++) {
                let cell = newRow.insertCell(i);
                let textarea = document.createElement("textarea");
                textarea.classList.add("textarea-expandable");
                textarea.addEventListener("input", ajustarAltura);
                textarea.addEventListener("input", guardarTabla);
                cell.appendChild(textarea);
            }
        }

        let actionCell = newRow.insertCell(-1);
        let deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Eliminar";
        deleteBtn.classList.add("add-row");
        deleteBtn.addEventListener("click", function () {
            tabla.deleteRow(newRow.rowIndex);
            guardarTabla();
        });
        actionCell.appendChild(deleteBtn);

        guardarTabla();
    };

    function ajustarAltura(event) {
        event.target.style.height = "auto";
        event.target.style.height = event.target.scrollHeight + "px";
    }

    function guardarTabla() {
        let datosSesiones = [];
        document.querySelectorAll("#tablaSesiones tr").forEach((row, index) => {
            if (index > 0) {
                datosSesiones.push({ sesion: row.cells[0].textContent, fecha: row.cells[1].querySelector("input")?.value || "" });
            }
        });
        localStorage.setItem("tablaSesiones", JSON.stringify(datosSesiones));

        let datosDetalles = [];
        document.querySelectorAll("#tablaDetalles tr").forEach((row, index) => {
            if (index > 0) {
                let rowData = [];
                row.querySelectorAll("textarea").forEach(area => rowData.push(area.value));
                datosDetalles.push(rowData);
            }
        });
        localStorage.setItem("tablaDetalles", JSON.stringify(datosDetalles));
    }

    function cargarTablas() {
        let datosSesiones = JSON.parse(localStorage.getItem("tablaSesiones")) || [];
        datosSesiones.forEach(data => {
            agregarFila("tablaSesiones");
            let lastRow = document.getElementById("tablaSesiones").rows.length - 1;
            document.getElementById("tablaSesiones").rows[lastRow].cells[1].querySelector("input").value = data.fecha;
        });

        let datosDetalles = JSON.parse(localStorage.getItem("tablaDetalles")) || [];
        datosDetalles.forEach(data => {
            agregarFila("tablaDetalles");
            let lastRow = document.getElementById("tablaDetalles").rows.length - 1;
            let textareas = document.getElementById("tablaDetalles").rows[lastRow].querySelectorAll("textarea");
            data.forEach((value, index) => {
                textareas[index].value = value;
            });
        });
    }

    cargarTablas();

    document.getElementById("btnImprimir").addEventListener("click", function () {
        let nuevaVentana = window.open("", "_blank");
        let contenido = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Plan de Intervención Pedagógica</title>
            <style>
                @page { size: A4; margin: 2cm; }
                body { font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                display: flex;
                align-items: center; /* Alinea verticalmente los elementos */
                justify-content: flex-start; /* Alinea los elementos al inicio */
                padding: 20px;
                box-sizing: border-box;
                 }
                .container { max-width: 800px; margin: auto; }
                .main-table, .sub-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                .main-table td, .sub-table td, .main-table th, .sub-table th {
                    border: 1px solid black; padding: 5px; text-align: left;
                }
                .contenedor {
                    text-align: center; /* Centra el contenido del div */
                }
                .header { font-weight: bold; background-color: #f3f4f6; }
                th { background-color: #e0e0e0; }
                .escudo {
                    width: 100px; /* Ajusta el tamaño del escudo según sea necesario */
                    height: auto;
                    margin-right: 20px; /* Espacio entre el escudo y el cuadro de información */
                }
                .emblema {
                    width: 250px; /* Ajusta el tamaño del escudo según sea necesario */
                    height: auto;
                    margin-right: 20px; /* Espacio entre el escudo y el cuadro de información */
                }
                .info {
                    border: 0px;
                    padding: 10px;
                    text-align: center;
                    width: 350px; /* Ajusta el ancho del recuadro según sea necesario */
                    font-size: 8px; /* Tamaño de fuente reducido */
                }
                .info p {
                    margin: 5px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="contenedor">
                    <!-- Tabla de 3 columnas y 1 fila -->
                    <table>
                        <tr>
                            <!-- Celda izquierda: Escudo -->
                            <td>
                                <img src="escudo.png" alt="Escudo" class="escudo">
                            </td>
                            <!-- Celda central: Emblema -->
                            <td>
                                <img src="emblema.png" alt="Emblema" class="emblema">
                            </td>
                            <!-- Celda derecha: Información -->
                            <td class="info">
                                <p>Supervisión Escolar No. 533 Primarias</p>
                                <p>Callejón de las Mulas s/n, Colonia Pastita.</p>
                                <p>Guanajuato. Gto.</p>
                                <p>C.C.T. 11FIZ5033Z</p>
                                <p>Teléfono 4737313390</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <h2 class="title">PLAN DE INTERVENCIÓN PEDAGÓGICA</h2>
                
                <table class="main-table">
                    <tr><td class="header">FECHA:</td><td>${localStorage.getItem("fecha") || ""}</td><td class="header">MOTIVO:</td><td>${localStorage.getItem("motivo") || ""}</td></tr>
                    <tr><td class="header">FOCO DE ATENCIÓN:</td><td colspan="3">${localStorage.getItem("foco") || ""}</td></tr>
                    <tr><td class="header">PROPÓSITO:</td><td colspan="3">${localStorage.getItem("proposito") || ""}</td></tr>
                    <tr><td class="header">NOMBRE DEL ASESOR:</td><td>${localStorage.getItem("asesor") || ""}</td><td class="header">NOMBRE DEL DOCENTE:</td><td>${localStorage.getItem("nombreDocente") || ""}</td></tr>
                    <tr><td class="header">CCT:</td><td>${localStorage.getItem("cct") || ""}</td><td class="header">LUGAR:</td><td>${localStorage.getItem("lugar") || ""}</td></tr>
                </table>

                <table class="sub-table">
                    <tr>
                        <th>SESIONES</th><th>1</th><th>2</th><th>3</th>
                    </tr>
                    <tr>
                        <th>FECHAS</th>
                        <td>${JSON.parse(localStorage.getItem("tablaSesiones") || "[]")[0]?.fecha || ""}</td>
                        <td>${JSON.parse(localStorage.getItem("tablaSesiones") || "[]")[1]?.fecha || ""}</td>
                        <td>${JSON.parse(localStorage.getItem("tablaSesiones") || "[]")[2]?.fecha || ""}</td>
                    </tr>
                </table>

                <table class="sub-table">
                    <tr><th>MODALIDAD DE TRABAJO</th><th>INTERVENCIÓN/ESTRATEGIA UTILIZADA</th><th>HORARIO</th></tr>
                    <tr>
                        <td>${localStorage.getItem("modalidad") || ""}</td>
                        <td>${localStorage.getItem("estrategia") || ""}</td>
                        <td>${localStorage.getItem("horario") || ""}</td>
                    </tr>
                </table>
                <table class="sub-table">
                    <tr><th>TEMÁTICA</th><th>ACTIVIDADES</th><th>TIEMPO</th><th>MATERIALES</th><th>PRODUCTOS</th></tr>
                    ${JSON.parse(localStorage.getItem("tablaDetalles") || "[]").map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
                </table>
                <table class="sub-table">
                    <tr><th>SEGUIMIENTO</th></tr>
                    <tr><td>${localStorage.getItem("seguimiento") || ""}</td></tr>
                    <tr><th>ACUERDOS</th></tr>
                    <tr><td>${localStorage.getItem("acuerdos") || ""}</td></tr>
                </table>
                <table class="sub-table" style="margin-top: 50px;">
                    <tr>
                        <td style="border-top: 1px solid black; text-align: center; padding-top: 10px;">Supervisor Escolar</td>
                        <td style="border-top: 1px solid black; text-align: center; padding-top: 10px;">Asesor Técnico Pedagógico</td>
                        <td style="border-top: 1px solid black; text-align: center; padding-top: 10px;">Director(a)</td>
                        <td style="border-top: 1px solid black; text-align: center; padding-top: 10px;">Docente</td>
                    </tr>
                </table>
            </div>
            <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
        `;
        nuevaVentana.document.write(contenido);
        nuevaVentana.document.close();
    });
});
