const phrases = [
    "¡ALISTENSE!",
    "¡APURENSE!",
    "¡DESPIERTEN!",
    "¡YA ES HORA!",
    "¡LEVANTENSE!",
    "¡PONGANSE LAS PILAS!",
    "¡DESPIERTEN, DORMILONES!",
    "¡MUEVANSE!",
    "¡YA ES HORA!",
    "¡APURENSE!"
];

function getRandomPhrase() {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex];
}

module.exports = {
    getRandomPhrase
}; 