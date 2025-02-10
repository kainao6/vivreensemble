document.addEventListener('DOMContentLoaded', function() {
    const increaseFontSizeButton = document.getElementById('increaseFontSize');
    let currentFontSize = 16; // Taille de police par défaut en pixels

    if (increaseFontSizeButton) {
        increaseFontSizeButton.addEventListener('click', function() {
            currentFontSize += 2; // Augmente la taille de 2 pixels à chaque clic
            document.body.style.fontSize = currentFontSize + 'px';
        });
    }
});

