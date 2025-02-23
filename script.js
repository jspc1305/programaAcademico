document.addEventListener("DOMContentLoaded", function () {
    const popup = document.getElementById("popup");
    const form = document.getElementById("registroForm");
    const ctTitulo = document.getElementById("ctTitulo");
    const descargarBtn = document.getElementById("descargarRespaldo");
    const cargarInput = document.getElementById("cargarRespaldo");
    const fields = ["nombreCT", "cct", "fecha", "cicloEscolar", "horario", "gradoGrupo", "nombreDocente", "numAlumnos", "presentes", "ara"];
    
    function cargarDatos() {
        fields.forEach(field => {
            const input = document.getElementById(field);
            if (localStorage.getItem(field)) {
                input.value = localStorage.getItem(field);
            }
        });

        // Cargar selección del radio button "N° Visita"
        const numVisitaGuardado = localStorage.getItem("numVisita");
        if (numVisitaGuardado) {
            const radioSeleccionado = document.querySelector(`input[name='numVisita'][value='${numVisitaGuardado}']`);
            if (radioSeleccionado) {
                radioSeleccionado.checked = true;
            }
        }

        actualizarTituloCT();
    }

    function actualizarTituloCT() {
        const nombreCT = localStorage.getItem("nombreCT") || "No definido";
        ctTitulo.textContent = `CT: ${nombreCT}`;
    }

    cargarDatos(); // Cargar datos al inicio

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        fields.forEach(field => {
            localStorage.setItem(field, document.getElementById(field).value);
        });

        // Guardar selección del radio button "N° Visita"
        const numVisitaSeleccionado = document.querySelector("input[name='numVisita']:checked");
        if (numVisitaSeleccionado) {
            localStorage.setItem("numVisita", numVisitaSeleccionado.value);
        }

        actualizarTituloCT();
        popup.classList.add("hidden");
    });

    document.getElementById("openPopup").addEventListener("click", function() {
        cargarDatos();
        popup.classList.remove("hidden");
    });

    document.getElementById("closePopup").addEventListener("click", function() {
        popup.classList.add("hidden");
    });

    // Descargar respaldo en JSON
    descargarBtn.addEventListener("click", function () {
        const data = {};
        fields.forEach(field => {
            data[field] = localStorage.getItem(field) || "";
        });

        // Incluir "N° Visita" en el respaldo
        data["numVisita"] = localStorage.getItem("numVisita") || "";

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "respaldo_CT.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    // Cargar respaldo desde JSON
    cargarInput.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);
                fields.forEach(field => {
                    if (data[field]) {
                        localStorage.setItem(field, data[field]);
                        document.getElementById(field).value = data[field];
                    }
                });

                // Cargar "N° Visita" desde el respaldo
                if (data["numVisita"]) {
                    localStorage.setItem("numVisita", data["numVisita"]);
                    const radioSeleccionado = document.querySelector(`input[name='numVisita'][value='${data["numVisita"]}']`);
                    if (radioSeleccionado) {
                        radioSeleccionado.checked = true;
                    }
                }

                actualizarTituloCT();
                alert("Respaldo cargado con éxito.");
            } catch (error) {
                alert("Error al cargar el respaldo.");
            }
        };
        reader.readAsText(file);
    });
});
