// Initialisation de la scène, de la caméra et du renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ajout des contrôles d'orbite pour la navigation
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 10;
controls.maxDistance = 1500;

// Ajout de la musique de fond
const music = document.getElementById('background-music');
music.volume = 0.5;
music.play();

// Raycaster pour détecter les clics et les survols d'objets
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;
const suns = []; // Liste des soleils

// Fonction pour afficher les informations des objets survolés
function onMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(suns, true);
    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData.name) {
            displayInfo(object.userData);
        }
    } else {
        document.getElementById('info').style.display = 'none';
    }
}
window.addEventListener('mousemove', onMouseMove, false);

// Chargement du modèle de la galaxie
const loader = new THREE.GLTFLoader();
loader.load('/models/need_some_space.glb', function(gltf) {
    const galaxy = gltf.scene;
    galaxy.scale.set(10, 10, 10); // Ajuster l'échelle de la galaxie
    galaxy.position.set(-13, -14, 15); // Centrer la galaxie
    scene.add(galaxy);

    // Création de plusieurs soleils à l'intérieur de la galaxie
    const sunsData = [
        { color: 0xff0000, position: { x: -4, y: 1, z: 0 }, name: "soleil rouge" , link: "Explosion.html", description: "la fin approche ..." },
        { color: 0xffa500, position: { x: 1, y: 1, z: 0 }, name: "soleil orange", link: "carre.html", description: "Les minecraftiens sont la !"},
        { color: 0xffff00, position: { x: 7, y: 1, z: 0 }, name: "soleil jaune", link: "systeme-solaire.html", description: "Le systeme solaire" },
    ];

    sunsData.forEach(data => {
        let sunGeometry;
        if (data.name === "Soleil Orange") {
            sunGeometry = new THREE.BoxGeometry(1, 1, 1); // Utiliser une géométrie de cube pour le Soleil orange
        } else {
            sunGeometry = new THREE.SphereGeometry(0.5, 32, 32); // Utiliser une géométrie de sphère pour les autres soleils
        }
        const sunMaterial = new THREE.MeshBasicMaterial({ color: data.color });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.set(data.position.x, data.position.y, data.position.z);
        sun.userData = { name: data.name, description: data.description, link: data.link };
        scene.add(sun); // Ajouter les soleils directement à la scène pour pouvoir cliquer dessus
        suns.push(sun); // Ajouter le soleil à la liste des soleils cliquables
    });

});

camera.position.set(0, 0, 30);

// Ajout de l'éclairage
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(50, 50, 50);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0x404040); // Lumière ambiante douce
scene.add(ambientLight);

// Redimensionnement de la fenêtre
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Gestion des clics
function onMouseClick(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(suns, true);
    if (intersects.length > 0) {
        selectedObject = intersects[0].object;

        controls.enabled = false;
        new TWEEN.Tween(camera.position)
            .to({
                x: selectedObject.position.x,
                y: selectedObject.position.y,
                z: selectedObject.position.z + 5  // Ajustez cette valeur pour modifier le niveau de zoom
            }, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                camera.lookAt(selectedObject.position);
            })
            .onComplete(() => {
                controls.target.copy(selectedObject.position);
                controls.enabled = true;

                // Redirection si c'est le Soleil Jaune
                if (selectedObject.userData.link) {
                    window.location.href = selectedObject.userData.link;
                }
            })
            .start();

        displayInfo(selectedObject.userData);
    }
}
window.addEventListener('click', onMouseClick, false);

// Afficher les informations de l'objet
function displayInfo(data) {
    const info = document.getElementById('info');
    document.getElementById('object-name').textContent = data.name;
    document.getElementById('object-description').innerHTML = data.description;
    info.style.display = 'block';
}

// Fermer les informations de l'objet
document.getElementById('close-info').addEventListener('click', () => {
    document.getElementById('info').style.display = 'none';
});

// Animation
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    TWEEN.update();
    renderer.render(scene, camera);
}

animate();
