import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import TWEEN from '@tweenjs/tween.js';

// Initialisation de la scène, de la caméra et du renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ajout des contrôles d'orbite pour la navigation
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // activation de l'amortissement (inertie)
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false; // défilement dans l'espace de l'écran
controls.minDistance = 10; // distance de zoom minimale
controls.maxDistance = 1500; // distance de zoom maximale
let mouseX = 0, mouseY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

// Ajout de la musique de fond
const music = document.getElementById('background-music');
document.getElementById('toggle-music').addEventListener('click', () => {
    if (music.paused) {
        music.play();
        document.getElementById('toggle-music').textContent = 'Musique de fond : Off';
    } else {
        music.pause();
        document.getElementById('toggle-music').textContent = 'Musique de fond : On';
    }
});

document.getElementById('mute-music').addEventListener('click', () => {
    music.muted = !music.muted;
    document.getElementById('mute-music').textContent = music.muted ? 'Activer le son' : 'Couper le son';
});
document.addEventListener('mousemove', onMouseMove);

// Raycaster pour détecter les clics sur les objets
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;
let spaceshipView = false;

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
        0, 0,            // ax, aY
        radius, radius,   // xRadius, yRadius
        0, 2 * Math.PI,   // aStartAngle, aEndAngle
        false,            // aClockwise
        0                 // aRotation
    );

    const points = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({ color: 0xffffff });

    // Create the final object to add to the scene
    const ellipse = new THREE.Line(geometry, material);
    ellipse.rotation.x = Math.PI / 2; // Rotate to horizontal
    return ellipse;
}

// Création du soleil
const sunGeometry = new THREE.SphereGeometry(20, 32, 32); // Taille du soleil
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Ajout d'une lumière ponctuelle pour simuler la lumière du Soleil
const pointLight = new THREE.PointLight(0xffffff, 2, 3000);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

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

// Données des planètes (rayon en km et distance moyenne au Soleil en km)
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

planetData.forEach(data => {
    // Création de la planète
    const planetGeometry = new THREE.SphereGeometry(data.size, 32, 32);
    const planetMaterial = new THREE.MeshStandardMaterial({ map: data.texture });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
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
            const moonGeometry = new THREE.SphereGeometry(moonData.size, 32, 32);
            const moonMaterial = new THREE.MeshStandardMaterial({ map: moonData.texture });
            const moon = new THREE.Mesh(moonGeometry, moonMaterial);
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

// Ajout de l'Étoile de la Mort
const deathStarLoader = new GLTFLoader();
deathStarLoader.load('/models/death_star_-_star_wars.glb', function(gltf) {
    const deathStar = gltf.scene;
    deathStar.scale.set(2, 2, 2); // Réduire l'échelle si nécessaire
    deathStar.position.set(100, 100, 100); // Position éloignée du système solaire
    deathStar.userData = { name: "Étoile de la Mort", description: "L'Étoile de la Mort est une station spatiale fictive de l'univers de Star Wars." };
    scene.add(deathStar);
    celestialBodies.push(deathStar);
});

// Variables pour le vaisseau spatial
let spaceship;
const velocity = new THREE.Vector3();
const acceleration = 0.02;
const deceleration = 0.01;
const maxSpeed = 2;
const keys = {};

// Charger le modèle du vaisseau spatial
const spaceshipLoader = new GLTFLoader();
spaceshipLoader.load('/models/spaceship.glb', function(gltf) {
    spaceship = gltf.scene;
    spaceship.scale.set(0.01, 0.01, 0.01); // Ajuster l'échelle
    spaceship.position.set(0, 100, 0); // Positionner le vaisseau spatial
    scene.add(spaceship);
});

// Gérer les touches du clavier
window.addEventListener('keydown', function(event) {
    keys[event.key] = true;
});
window.addEventListener('keyup', function(event) {
    keys[event.key] = false;
});

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

function onMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) / windowHalfX;
    mouseY = (event.clientY - windowHalfY) / windowHalfY;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Mettre à jour la position du pointeur
    const pointer = document.getElementById('pointer');
    pointer.style.left = `${event.clientX - pointer.offsetWidth / 2}px`;
    pointer.style.top = `${event.clientY - pointer.offsetHeight / 2}px`;
}

// Animation
let animationSpeed = 0.0000000000001; // Vitesse d'animation initiale

function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * animationSpeed; // Utilisation de la vitesse d'animation
    celestialBodies.forEach(body => {
        if (body.userData.period) {
            const angularSpeed = (2 * Math.PI) / body.userData.period;
            body.userData.angle += angularSpeed * time;
            body.position.x = Math.cos(body.userData.angle) * body.userData.distance;
            body.position.z = Math.sin(body.userData.angle) * body.userData.distance;

            // Rotation des planètes
            body.rotation.y += body.userData.rotationSpeed;

            // Animation des lunes
            if (body.userData.moons) {
                body.userData.moons.forEach(moon => {
                    const moonSpeed = (2 * Math.PI) / moon.userData.period;
                    moon.userData.angle += moonSpeed * time;
                    moon.position.x = Math.cos(moon.userData.angle) * moon.userData.distance;
                    moon.position.z = Math.sin(moon.userData.angle) * moon.userData.distance;

                    // Rotation des lunes
                    moon.rotation.y += moon.userData.rotationSpeed;
                });
            }
        }
    });

    if (spaceshipView) {
        updateSpaceship();
        if (spaceship) {
            const pointer = document.getElementById('pointer');
            pointer.style.display = 'block';
            const relativeCameraOffset = new THREE.Vector3(0, 2, -20); // Ajusté pour être juste derrière et légèrement au-dessus du vaisseau
            const cameraOffset = relativeCameraOffset.applyMatrix4(spaceship.matrixWorld);
            camera.position.copy(cameraOffset);
            camera.lookAt(spaceship.position);
        }
        controls.enabled = false;
    } else {
        controls.update();
        controls.enabled = true;
        const pointer = document.getElementById('pointer');
        pointer.style.display = 'none';
    }

    if (selectedObject) {
        controls.target.copy(selectedObject.position);
    }
    TWEEN.update();
    renderer.render(scene, camera);

    // Mise à jour du vaisseau spatial
    if (spaceship) {
        if (keys['w'] || keys['ArrowUp']) {
            velocity.add(new THREE.Vector3(0, 0, -acceleration).applyQuaternion(spaceship.quaternion));
        }
        if (keys['s'] || keys['ArrowDown']) {
            velocity.add(new THREE.Vector3(0, 0, acceleration).applyQuaternion(spaceship.quaternion));
        }
        if (keys['a'] || keys['ArrowLeft']) {
            spaceship.rotateY(acceleration);
        }
        if (keys['d'] || keys['ArrowRight']) {
            spaceship.rotateY(-acceleration);
        }
        if (keys['q']) {
            spaceship.rotateZ(acceleration);
        }
        if (keys['e']) {
            spaceship.rotateZ(-acceleration);
        }

        // Limiter la vitesse maximale
        if (velocity.length() > maxSpeed) {
            velocity.setLength(maxSpeed);
        }

        spaceship.position.add(velocity);

        // Appliquer la décélération
        velocity.multiplyScalar(1 - deceleration);
    }
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

const toggleViewButton = document.getElementById('toggleView');
toggleViewButton.addEventListener('click', () => {
    spaceshipView = !spaceshipView;
    if (spaceshipView) {
        toggleViewButton.textContent = "Switch to Orbit View";
        const pointer = document.getElementById('pointer');
        pointer.style.display = 'block';
    } else {
        toggleViewButton.textContent = "Switch to Spaceship View";
        const pointer = document.getElementById('pointer');
        pointer.style.display = 'none';
    }
});

function updateSpaceship() {
    const rotationSpeed = 0.02;

    if (spaceship) {
        // Calculate rotation based on mouse movement
        const targetRotationY = -mouseX * rotationSpeed; // Inverser la direction de lacet (yaw)
        const targetRotationX = mouseY * rotationSpeed; // Inverser la direction de tangage (pitch)

        // Apply rotations to spaceship
        spaceship.rotation.order = 'YXZ'; // Ensure yaw is applied first
        spaceship.rotation.y += targetRotationY; // Yaw
        spaceship.rotation.x = THREE.MathUtils.clamp(spaceship.rotation.x + targetRotationX, -Math.PI / 2, Math.PI / 2); // Pitch

        // Apply roll rotation based on "q" and "d" keys
        if (keys['q']) {
            spaceship.rotation.z += rotationSpeed; // Roll left
        } else if (keys['d']) {
            spaceship.rotation.z -= rotationSpeed; // Roll right
        }

        const forward = new THREE.Vector3();
        spaceship.getWorldDirection(forward);
        forward.normalize();

        if (keys['z']) {
            velocity.add(forward.multiplyScalar(acceleration));
            if (velocity.length() > maxSpeed) {
                velocity.setLength(maxSpeed);
            }
        } else {
            velocity.multiplyScalar(1 - deceleration);
            if (velocity.length() < 0.001) {
                velocity.set(0, 0, 0);
            }
        }

        spaceship.position.add(velocity);

        // Adjust camera position based on spaceship position
        const relativeCameraOffset = new THREE.Vector3(0, 0.5, -2); // Ajusté pour être juste derrière et légèrement au-dessus du vaisseau
        const cameraOffset = relativeCameraOffset.applyMatrix4(spaceship.matrixWorld);
        camera.position.copy(cameraOffset);
        camera.lookAt(spaceship.position);
    }
}
