function mostrarFotoGrande(src) {
    const visor = document.getElementById("visorFoto");
    const img = document.getElementById("fotoAmpliada");
    img.src = src;
    visor.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function cerrarFoto() {
    const visor = document.getElementById("visorFoto");
    visor.style.display = "none";
    document.body.style.overflow = "auto";
}
