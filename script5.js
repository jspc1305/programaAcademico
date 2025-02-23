function cambiarColor(boton) {
    const colores = ['gris', 'verde', 'amarillo', 'rojo'];
    const clases = {
        'gris': '',
        'verde': 'verde',
        'amarillo': 'amarillo',
        'rojo': 'rojo'
    };
    
    let colorActual = boton.classList.contains('verde') ? 'verde' :
                      boton.classList.contains('amarillo') ? 'amarillo' :
                      boton.classList.contains('rojo') ? 'rojo' : 'gris';
    
    let nuevoIndice = (colores.indexOf(colorActual) + 1) % colores.length;
    let nuevoColor = colores[nuevoIndice];
    
    boton.classList.remove('verde', 'amarillo', 'rojo');
    if (clases[nuevoColor]) {
        boton.classList.add(clases[nuevoColor]);
    }
    
    // Identificar la página actual
    const pagina = window.location.pathname;
    const index = boton.getAttribute('data-index');
    localStorage.setItem(`${pagina}-valoracion-${index}`, nuevoColor);
}

document.addEventListener("DOMContentLoaded", function () {
    const pagina = window.location.pathname;
    
    document.querySelectorAll(".valoracion-btn").forEach(boton => {
        const index = boton.getAttribute("data-index");
        const colorGuardado = localStorage.getItem(`${pagina}-valoracion-${index}`);
        if (colorGuardado) {
            boton.classList.add(colorGuardado);
        }
    });
    
    document.querySelectorAll(".observacion").forEach(textarea => {
        const index = textarea.getAttribute("data-index");
        const observacionGuardada = localStorage.getItem(`${pagina}-observacion-${index}`);
        if (observacionGuardada) {
            textarea.value = observacionGuardada;
        }
        textarea.addEventListener("input", function () {
            localStorage.setItem(`${pagina}-observacion-${index}`, textarea.value);
        });
    });
});

document.getElementById("guardarTxt").addEventListener("click", function () {
    const pagina = window.location.pathname;
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith(pagina)) {
            localStorage.removeItem(key);
        }
    });
    location.reload();
});
