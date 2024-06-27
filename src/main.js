document.addEventListener('DOMContentLoaded', (event) => {
    const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Code Konami en séquences de keycodes
    let konamiCodePosition = 0;

    // Fonction à exécuter lorsque le code Konami est saisi correctement
    function konamiCodeActivated() {
        alert('Code Konami activé!');
        // Ajoutez ici l'action que vous souhaitez effectuer
    }

    // Écouteur d'événement pour les touches enfoncées
    document.addEventListener('keydown', (event) => {
        if (event.keyCode === konamiCode[konamiCodePosition]) {
            konamiCodePosition++;
            if (konamiCodePosition === konamiCode.length) {
                konamiCodeActivated();
                konamiCodePosition = 0; // Réinitialiser la position pour permettre une nouvelle saisie
            }
        } else {
            konamiCodePosition = 0;
        }
    });
});
