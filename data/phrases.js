const phrases = [
    "¡ALISTENSE HIJUEPUTAS!",
    "¡APURENSE QUE YA EMPIEZA!",
    "¡DESPIERTEN MAMONES!",
    "¡MUEVAN EL CULITO!",
    "¡YA ES HORA, VAGOS!",
    "¡LEVANTENSE DE LA CAMA!",
    "¡NO SE DUERMAN, CABRONES!",
    "¡PONGANSE LAS PILAS!",
    "¡YA ESTÁN TARDANDO!",
    "¡DESPIERTEN, DORMILONES!",
    "¡MUEVANSE, FLOTADORES!",
    "¡YA ES HORA DE TRABAJAR!",
    "¡NO SE HAGAN LOS DORMIDOS!",
    "¡LEVANTENSE, VAGOS!",
    "¡APURENSE, LENTOS!"
];

function getRandomPhrase() {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex];
}

module.exports = {
    getRandomPhrase
}; 