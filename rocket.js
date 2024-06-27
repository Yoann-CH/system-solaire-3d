const canvas = document.getElementById('rocketCanvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5).normalize();
scene.add(light);

const loader = new THREE.GLTFLoader();
let rocket;
loader.load('/models/rocket.glb', function(gltf) {
    rocket = gltf.scene;
    rocket.scale.set(0.1, 0.1, 0.1); // Réduire la taille du modèle
    rocket.position.set(1, -3, 0); // Positionner la fusée en bas de l'écran
    scene.add(rocket);
});

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

canvas.addEventListener('click', () => {
    if (rocket) {
        rocket.position.y = -3; // S'assurer que la fusée commence en bas
        const interval = setInterval(() => {
            rocket.position.y += 0.05;
            if (rocket.position.y >= 4) { // Arrêter l'animation après que la fusée ait décollé
                clearInterval(interval);
                setTimeout(() => {
                    window.location.href = 'landing.html';
                }, 100); // Redirection après 2 secondes
            }
        }, 30); // Ajuster la vitesse de décollage
    }
});
