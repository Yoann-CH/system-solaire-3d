// Initialisation de la scène, de la caméra et du renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

// Raycaster pour détecter les clics sur les objets
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;

// Chargement des textures
const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7VwyE5iw-iGoEvUj9BV5mnCSpmUi-By-42Q&s');
const mercuryTexture = textureLoader.load('https://cdn.pixabay.com/photo/2022/06/30/02/16/mercury-7292788_1280.jpg');
const venusTexture = textureLoader.load('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE7q_NoC49WiU1JYZAZdMEHD5sl_Bli3TiOw&s');
const earthTexture = textureLoader.load('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRcsZotWnRDclFnTDRvWMtW5GZb7XNSyQRdw&s');
const moonTexture = textureLoader.load('2k_moon.jpg');
const marsTexture = textureLoader.load('https://t4.ftcdn.net/jpg/03/38/48/79/360_F_338487951_noDUtHlzxljulqg525A9YZAup9IEpeNS.jpg');
const jupiterTexture = textureLoader.load('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3p6nx7Tq-PtVeyMwFQ60XVbQ2heMBFFbhQ&s');
const saturnTexture = textureLoader.load('https://upload.wikimedia.org/wikipedia/commons/1/1e/Solarsystemscope_texture_8k_saturn.jpg');
const uranusTexture = textureLoader.load('https://upload.wikimedia.org/wikipedia/commons/9/95/Solarsystemscope_texture_2k_uranus.jpg');
const neptuneTexture = textureLoader.load('https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Solarsystemscope_texture_2k_neptune.jpg/1200px-Solarsystemscope_texture_2k_neptune.jpg');
const ringTexture = textureLoader.load('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4GCJXXtHbCtEOkJvcfHJhqiFJp7wj-4yaqQ&s');

// Fonction pour créer des orbites
function createOrbit(radius) {
    const curve = new THREE.EllipseCurve(
        0, 0,
        radius, radius,
        0, 2 * Math.PI,
        false,
        0
    );

    const points = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });
    const ellipse = new THREE.Line(geometry, material);
    ellipse.rotation.x = Math.PI / 2;
    return ellipse;
}

// Fonction pour créer une sphère avec ombre
function createSphere(size, texture) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshStandardMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

// Fonction pour initialiser les objets célestes
function initCelestialBodies() {
    celestialBodies.length = 0;
    moonsAndRings.length = 0;
    orbits.length = 0;

    planetData.forEach(data => {
        // Création de la planète
        const planet = createSphere(data.size, data.texture);
        planet.userData = { distance: data.distance, period: data.period, angle: 0, name: data.name, description: data.description, rotationSpeed: data.rotationSpeed };
        celestialBodies.push(planet);
        scene.add(planet);

        // Ajout de l'orbite
        const orbit = createOrbit(data.distance);
        scene.add(orbit);
        orbits.push(orbit);

        // Création des anneaux de Saturne
        if (data.name === "Saturne") {
            const ringGeometry = new THREE.RingGeometry(10, 14, 64);
            const ringMaterial = new THREE.MeshBasicMaterial({ map: ringTexture, side: THREE.DoubleSide });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            planet.add(ring);
            moonsAndRings.push(ring);
        }

        // Création des lunes
        if (data.moons.length > 0) {
            data.moons.forEach(moonData => {
                const moon = createSphere(moonData.size, moonData.texture);
                moon.userData = { distance: moonData.distance, period: moonData.period, angle: 0, rotationSpeed: moonData.rotationSpeed };
                planet.add(moon);
                if (!planet.userData.moons) {
                    planet.userData.moons = [];
                }
                planet.userData.moons.push(moon);
                moonsAndRings.push(moon);
            });
        }
    });
}

// Création du soleil avec texture et lumière
const sunGeometry = new THREE.SphereGeometry(20, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Ajout d'une lumière ponctuelle pour simuler la lumière du Soleil
const pointLight = new THREE.PointLight(0xffffff, 2, 3000);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// Créer un plan pour recevoir l'ombre du soleil
const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -50;
plane.receiveShadow = true;
scene.add(plane);

// Création des étoiles lumineuses
const stars = [];
function createStar() {
    const starGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const star = new THREE.Mesh(starGeometry, starMaterial);
    const starLight = new THREE.PointLight(0xffffff, 1, 100);
    star.add(starLight);
    star.position.set(
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000
    );
    scene.add(star);
    stars.push(star);
}

// Ajouter plusieurs étoiles lumineuses à la scène
for (let i = 0; i < 50; i++) {
    createStar();
}

// Données des planètes
const planetData = [
    { name: "Mercure", texture: mercuryTexture, distance: 30, size: 1, period: 88, rotationSpeed: 0.01, description: "Mercure est la planète la plus proche du Soleil. <br>Taille: 4,880 km de diamètre. <br>Distance du Soleil: 57,910,000 km. <br>Nombre de lunes: 0.", moons: [] },
    { name: "Vénus", texture: venusTexture, distance: 40, size: 2, period: 225, rotationSpeed: 0.01, description: "Vénus est la deuxième planète du système solaire. <br>Taille: 12,104 km de diamètre. <br>Distance du Soleil: 108,200,000 km. <br>Nombre de lunes: 0.", moons: [] },
    { name: "Terre", texture: earthTexture, distance: 50, size: 2.5, period: 365, rotationSpeed: 0.01, description: "La Terre est notre planète, la seule avec de la vie connue. <br>Taille: 12,742 km de diamètre. <br>Distance du Soleil: 149,600,000 km. <br>Nombre de lunes: 1 (Lune).", moons: [{ name: "Lune", texture: moonTexture, size: 0.7, distance: 3, period: 27, rotationSpeed: 0.01 }] },
    { name: "Mars", texture: marsTexture, distance: 60, size: 1.5, period: 687, rotationSpeed: 0.01, description: "Mars est souvent appelée la planète rouge. <br>Taille: 6,779 km de diamètre. <br>Distance du Soleil: 227,900,000 km. <br>Nombre de lunes: 2 (Phobos, Deimos).", moons: [{ name: "Phobos", texture: moonTexture, size: 0.3, distance: 2, period: 0.3, rotationSpeed: 0.01 }, { name: "Deimos", texture: moonTexture, size: 0.2, distance: 4, period: 1.3, rotationSpeed: 0.01 }] },
    { name: "Jupiter", texture: jupiterTexture, distance: 80, size: 8, period: 4333, rotationSpeed: 0.01, description: "Jupiter est la plus grande planète du système solaire. <br>Taille: 139,820 km de diamètre. <br>Distance du Soleil: 778,500,000 km. <br>Nombre de lunes: 79 (Io, Europe, Ganymède, Callisto, etc.).", moons: [{ name: "Io", texture: moonTexture, size: 1, distance: 4, period: 1.8, rotationSpeed: 0.01 }, { name: "Europa", texture: moonTexture, size: 0.8, distance: 6, period: 3.5, rotationSpeed: 0.01 }, { name: "Ganymède", texture: moonTexture, size: 1.2, distance: 8, period: 7.1, rotationSpeed: 0.01 }, { name: "Callisto", texture: moonTexture, size: 1.1, distance: 10, period: 16.7, rotationSpeed: 0.01 }] },
    { name: "Saturne", texture: saturnTexture, distance: 110, size: 7, period: 10759, rotationSpeed: 0.01, description: "Saturne est célèbre pour ses anneaux impressionnants. <br>Taille: 116,460 km de diamètre. <br>Distance du Soleil: 1,429,400,000 km. <br>Nombre de lunes: 83 (Titan, etc.).", moons: [{ name: "Titan", texture: moonTexture, size: 1, distance: 5, period: 16, rotationSpeed: 0.01 }] },
    { name: "Uranus", texture: uranusTexture, distance: 140, size: 5, period: 30687, rotationSpeed: 0.01, description: "Uranus a une rotation unique, inclinée sur le côté. <br>Taille: 50,724 km de diamètre. <br>Distance du Soleil: 2,870,990,000 km. <br>Nombre de lunes: 27 (Titania, Oberon, etc.).", moons: [{ name: "Titania", texture: moonTexture, size: 0.6, distance: 3, period: 8.7, rotationSpeed: 0.01 }, { name: "Oberon", texture: moonTexture, size: 0.6, distance: 3.6, period: 13.5, rotationSpeed: 0.01 }] },
    { name: "Neptune", texture: neptuneTexture, distance: 160, size: 5, period: 60190, rotationSpeed: 0.01, description: "Neptune est la planète la plus éloignée du Soleil. <br>Taille: 49,244 km de diamètre. <br>Distance du Soleil: 4,498,250,000 km. <br>Nombre de lunes: 14 (Triton, etc.).", moons: [{ name: "Triton", texture: moonTexture, size: 0.8, distance: 3, period: 5.9, rotationSpeed: 0.01 }] },
];

const celestialBodies = [];
const moonsAndRings = [];
const orbits = [];

// Initialiser les objets célestes
initCelestialBodies();

// Ajout d'un fond étoilé
const starsGeometry = new THREE.BufferGeometry();
const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff });
const starVertices = [];
for (let i = 0; i < 10000; i++) {
    const x = THREE.MathUtils.randFloatSpread(2000);
    const y = THREE.MathUtils.randFloatSpread(2000);
    const z = THREE.MathUtils.randFloatSpread(2000);
    starVertices.push(x, y, z);
}
starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const starPoints = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starPoints);

celestialBodies.push(sun); // Ajouter le Soleil aux objets cliquables

camera.position.z = 300;

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
    const intersects = raycaster.intersectObjects(celestialBodies, true);
    if (intersects.length > 0) {
        selectedObject = intersects[0].object;
        controls.enabled = false; // Désactive les contrôles d'orbite pendant l'animation

        new TWEEN.Tween(camera.position)
            .to({
                x: selectedObject.position.x + 20,
                y: selectedObject.position.y + 20,
                z: selectedObject.position.z + 20
            }, 2000) // Durée de l'animation en millisecondes
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                camera.lookAt(selectedObject.position);
            })
            .onComplete(() => {
                controls.target.copy(selectedObject.position);
                controls.enabled = true; // Réactive les contrôles d'orbite après l'animation
            })
            .start();

        displayInfo(selectedObject.userData);
    }
}
window.addEventListener('click', onMouseClick, false);

// Afficher les informations de l'objet
function displayInfo(data) {
    const info = document.getElementById('info');
    document.getElementById('planet-name').textContent = data.name;
    document.getElementById('planet-description').innerHTML = data.description;
    info.style.display = 'block';
}

// Fermer les informations de l'objet
document.getElementById('close-info').addEventListener('click', () => {
    document.getElementById('info').style.display = 'none';
});

// Fonction pour agrandir le soleil et "dévorer" les planètes
const maxSunScale = 50; // Taille maximale du soleil
const expandSpeed = 0.005; // Vitesse d'agrandissement

function expandSun() {
    if (sun.scale.x < maxSunScale) {
        sun.scale.x += expandSpeed;
        sun.scale.y += expandSpeed;
        sun.scale.z += expandSpeed;

        celestialBodies.forEach(body => {
            if (body !== sun && sun.scale.x * 10 >= body.position.distanceTo(sun.position)) {
                scene.remove(body);
                celestialBodies.splice(celestialBodies.indexOf(body), 1);
            }
        });

        stars.forEach(star => {
            if (sun.scale.x * 10 >= star.position.distanceTo(sun.position)) {
                scene.remove(star);
                stars.splice(stars.indexOf(star), 1);
            }
        });
    }
}

// Animation
let animationSpeed = 0.0000000000001; // Vitesse d'animation initiale

function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * animationSpeed;
    celestialBodies.forEach(body => {
        if (body.userData.period) {
            const angularSpeed = (2 * Math.PI) / body.userData.period;
            body.userData.angle += angularSpeed * time;
            body.position.x = Math.cos(body.userData.angle) * body.userData.distance;
            body.position.z = Math.sin(body.userData.angle) * body.userData.distance;

            body.rotation.y += body.userData.rotationSpeed;

            if (body.userData.moons) {
                body.userData.moons.forEach(moon => {
                    const moonSpeed = (2 * Math.PI) / moon.userData.period;
                    moon.userData.angle += moonSpeed * time;
                    moon.position.x = Math.cos(moon.userData.angle) * moon.userData.distance;
                    moon.position.z = Math.sin(moon.userData.angle) * moon.userData.distance;

                    moon.rotation.y += moon.userData.rotationSpeed;
                });
            }
        }
    });

    expandSun(); // Appeler la fonction pour agrandir le soleil

    if (selectedObject) {
        controls.target.copy(selectedObject.position);
    }
    controls.update();
    TWEEN.update();
    renderer.render(scene, camera);
}

animate();

// Panneau de contrôle
const speedControl = document.getElementById('speed');
speedControl.addEventListener('input', (event) => {
    animationSpeed = parseFloat(event.target.value);
});

const toggleOrbitsButton = document.getElementById('toggle-orbits');
let orbitsVisible = true;
toggleOrbitsButton.addEventListener('click', () => {
    orbitsVisible = !orbitsVisible;
    moonsAndRings.forEach(obj => {
        obj.visible = orbitsVisible;
    });
});

const toggleLinesButton = document.getElementById('toggle-lines');
let linesVisible = true;
toggleLinesButton.addEventListener('click', () => {
    linesVisible = !linesVisible;
    orbits.forEach(orbit => {
        orbit.visible = linesVisible;
    });
});

const resetButton = document.createElement('button');
resetButton.textContent = 'Reset';
resetButton.style.position = 'absolute';
resetButton.style.top = '10px';
resetButton.style.left = '10px';
resetButton.addEventListener('click', () => {
    // Réinitialiser la scène
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
    // Réinitialiser le Soleil
    sun.scale.set(1, 1, 1);
    scene.add(sun);
    scene.add(pointLight);
    scene.add(plane);

    // Réinitialiser les étoiles
    stars.length = 0;
    for (let i = 0; i < 50; i++) {
        createStar();
    }

    // Réinitialiser les objets célestes
    initCelestialBodies();
    scene.add(starPoints); // Ré-ajouter le fond étoilé
});
document.body.appendChild(resetButton);

// Musique de fond
const backgroundMusic = document.getElementById('background-music');
backgroundMusic.volume = 0.5;
backgroundMusic.play();

const musicButton = document.getElementById('toggle-music');
musicButton.addEventListener('click', () => {
    if (backgroundMusic.paused) {
        backgroundMusic.play();
        musicButton.textContent = 'Musique de fond : On';
    } else {
        backgroundMusic.pause();
        musicButton.textContent = 'Musique de fond : Off';
    }
});

const muteButton = document.getElementById('mute-music');
muteButton.addEventListener('click', () => {
    backgroundMusic.muted = !backgroundMusic.muted;
    muteButton.textContent = backgroundMusic.muted ? 'Activer le son' : 'Couper le son';
});
