// Assurez-vous que l'élément audio est correctement sélectionné
let musicStar = document.getElementById('musicStar');

// Vérifiez si l'élément audio existe
if (musicStar) {
    console.log('Élément audio trouvé');

    // Écoutez l'événement 'canplaythrough' pour démarrer la lecture une fois que l'audio est prêt
    musicStar.addEventListener('canplaythrough', function () {
        console.log('L\'audio peut être joué jusqu\'au bout');
        musicStar.play()
            .then(() => {
                console.log('Lecture audio démarrée avec succès');
            })
            .catch(error => {
                console.error('Erreur lors du démarrage de la lecture audio:', error.message);
            });
    });

    // Gestion de l'erreur si la lecture automatique est bloquée par le navigateur
    musicStar.addEventListener('error', function (event) {
        console.error('Erreur lors de la lecture de l\'audio:', event.target.error);
    });

    // Écoute l'événement de pression des touches du clavier
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            musicStar.play()
                .then(() => {
                    console.log('Lecture audio démarrée avec succès');
                    window.location.href = 'Galaxie.html';
                })
                .catch(error => {
                    console.error('Erreur lors du démarrage de la lecture audio:', error.message);
                    window.location.href = 'Galaxie.html';
                });
        }
    });
} else {
    console.error('Élément audio non trouvé');
}

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
ctx.restore();
ctx.save();