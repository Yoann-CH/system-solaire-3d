// Assurez-vous que l'élément audio est correctement sélectionné
let musicStar = document.getElementById('musicStar');

// Vérifiez si l'élément audio existe
if (musicStar) {
    // Écoutez l'événement 'canplaythrough' pour démarrer la lecture une fois que l'audio est prêt
    musicStar.addEventListener('canplaythrough', function () {
        // Démarrer la lecture
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
}

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    

    ctx.restore();
    ctx.save();
    

