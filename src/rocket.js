const rocketCanvas = document.getElementById('rocketCanvas');
const rocketScene = new THREE.Scene();
const rocketCamera = new THREE.PerspectiveCamera(75, rocketCanvas.clientWidth / rocketCanvas.clientHeight, 0.1, 1000);
const rocketRenderer = new THREE.WebGLRenderer({ canvas: rocketCanvas, alpha: true });
rocketRenderer.setSize(rocketCanvas.clientWidth, rocketCanvas.clientHeight);

const rocketLight = new THREE.DirectionalLight(0xffffff, 1);
rocketLight.position.set(5, 5, 5).normalize();
rocketScene.add(rocketLight);

const rocketLoader = new THREE.GLTFLoader();
let rocket;
rocketLoader.load('rocket.glb', function(gltf) {
    rocket = gltf.scene;
    rocket.scale.set(0.5, 0.5, 0.5); // Augmenter encore la taille du modèle
    rocket.position.set(0, -1.5, 0); // Positionner la fusée en bas
    rocketScene.add(rocket);
    rocketAnimate(); // Commencer l'animation dès que la fusée est chargée
});

rocketCamera.position.z = 5;

function rocketAnimate() {
    requestAnimationFrame(rocketAnimate);
    rocketRenderer.render(rocketScene, rocketCamera);
}

rocketCanvas.addEventListener('click', () => {
    if (rocket) {
        rocket.position.y = -1.5; // S'assurer que la fusée commence en bas
        const interval = setInterval(() => {
            rocket.position.y += 0.05;
            if (rocket.position.y >= 4) { // Arrêter l'animation après que la fusée ait décollé
                clearInterval(interval);
                setTimeout(() => {
                    window.location.href = 'src/landing.html';
                }, 2000); // Redirection après 2 secondes
            }
        }, 30); // Ajuster la vitesse de décollage
    }
});
