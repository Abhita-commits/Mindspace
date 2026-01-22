// --- 1. SETUP THREE.JS SCENE ---
const canvas = document.getElementById('universe-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Adjust camera based on screen size
camera.position.z = window.innerWidth < 768 ? 40 : 30;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Create Groups for the two worlds
const constellationGroup = new THREE.Group();
const archiveGroup = new THREE.Group();

scene.add(constellationGroup);
scene.add(archiveGroup);

// --- 2. DARK MODE: CONSTELLATIONS (Emotional) ---
const starGeo = new THREE.BufferGeometry();
const starPos = [];
for(let i=0; i<500; i++) {
    starPos.push((Math.random() - 0.5) * 90, (Math.random() - 0.5) * 70, (Math.random() - 0.5) * 60);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
const starMat = new THREE.PointsMaterial({ color: 0x4488ff, size: 0.6, transparent: true, opacity: 0.8 });
const stars = new THREE.Points(starGeo, starMat);
constellationGroup.add(stars);

// Fog and Background Colors
const darkFog = new THREE.FogExp2(0x050510, 0.025);
const lightFog = new THREE.FogExp2(0x2a1e10, 0.02);

// --- 3. LIGHT MODE: ARCHIVE SCROLLS (Intellectual) ---
const scrollGeo = new THREE.PlaneGeometry(2.5, 3.5);
const scrollMat = new THREE.MeshBasicMaterial({ color: 0xffcc88, side: THREE.DoubleSide, transparent: true, opacity: 0.75 });

for(let i=0; i<25; i++) {
    const scroll = new THREE.Mesh(scrollGeo, scrollMat);
    scroll.position.set((Math.random() - 0.5) * 70, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 30);
    scroll.rotation.set(Math.random(), Math.random(), Math.random());
    scroll.userData = { rotSpeed: (Math.random() * 0.01) + 0.005, ySpeed: (Math.random() * 0.01) };
    archiveGroup.add(scroll);
}

// Initial State (Dark Mode)
archiveGroup.visible = false;
constellationGroup.visible = true;
scene.fog = darkFog;

// --- 4. ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);

    if(constellationGroup.visible) {
        constellationGroup.rotation.y += 0.0008;
        stars.rotation.z -= 0.0002;
    }

    if(archiveGroup.visible) {
        archiveGroup.children.forEach(scroll => {
            scroll.rotation.x += scroll.userData.rotSpeed;
            scroll.rotation.y += scroll.userData.rotSpeed;
            scroll.position.y += Math.sin(Date.now() * 0.001) * 0.02;
        });
    }
    renderer.render(scene, camera);
}
animate();

// --- 5. LOGIC ENGINE ---
const form = document.getElementById('mind-form');
const input = document.getElementById('mind-input');
const toggle = document.getElementById('checkbox');
const emoCard = document.getElementById('emotional-card');
const intCard = document.getElementById('intellectual-card');

// Expanded Keywords
const emoKeywords = ['sad', 'happy', 'feel', 'lonely', 'depressed', 'anxious', 'scared', 'love', 'hate', 'cry', 'angry', 'upset', 'tired', 'overwhelmed', 'stress', 'hope', 'pain', 'emotion', 'heart', 'broken', 'smile', 'joy', 'fear', 'alone'];
const intKeywords = ['history', 'science', 'math', 'calculate', 'who', 'what', 'where', 'when', 'how', 'learn', 'study', 'fact', 'building', 'create', 'code', 'python', 'architecture', 'school', 'book', 'read', 'write', 'knowledge', 'brain', 'logic', 'taj mahal', 'pyramid'];

// Function to Switch Modes
function setMode(mode) {
    if (mode === 'light') {
        // Switch to Intellectual / Light
        constellationGroup.visible = false;
        archiveGroup.visible = true;
        scene.fog = lightFog;
        renderer.setClearColor(0x2a1e10); // Sepia Dark
        toggle.checked = true; // Sync Toggle
        
        // UI
        intCard.style.opacity = 1;
        intCard.style.transform = "translateY(0)";
        emoCard.style.opacity = 0;
        emoCard.style.transform = "translateY(20px)";
    } else {
        // Switch to Emotional / Dark
        constellationGroup.visible = true;
        archiveGroup.visible = false;
        scene.fog = darkFog;
        renderer.setClearColor(0x050510); // Deep Dark
        toggle.checked = false; // Sync Toggle
        
        // UI
        emoCard.style.opacity = 1;
        emoCard.style.transform = "translateY(0)";
        intCard.style.opacity = 0;
        intCard.style.transform = "translateY(20px)";
    }
}

// Handle Form Submit
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value.toLowerCase().trim();
    if(!val) return;

    let isEmotional = emoKeywords.some(w => val.includes(w)) || val.startsWith("i am") || val.startsWith("i feel");
    let isIntellectual = intKeywords.some(w => val.includes(w)) || val.startsWith("what") || val.startsWith("define");

    if (isEmotional) {
        setMode('dark');
        document.getElementById('emo-text').innerText = "I sense your feelings. You are now connected to the Star-Field. You are not alone.";
    } else if (isIntellectual) {
        setMode('light');
        document.getElementById('int-text').innerText = "Accessing the Archive... Retrieving wisdom and logic regarding: " + input.value;
    } else {
        // Default / Fallback
        alert("I am balancing between logic and emotion. Can you be more specific?");
    }
    input.blur();
});

// Handle Manual Toggle Switch
toggle.addEventListener('change', (e) => {
    if(e.target.checked) {
        // User manually switched to Sun (Light)
        constellationGroup.visible = false;
        archiveGroup.visible = true;
        scene.fog = lightFog;
        renderer.setClearColor(0x2a1e10);
        
        // Show general text for manual switch
        intCard.style.opacity = 1;
        intCard.style.transform = "translateY(0)";
        emoCard.style.opacity = 0;
        document.getElementById('int-text').innerText = "Manual Override: You have entered the Archive of Wisdom.";
    } else {
        // User manually switched to Cloud (Dark)
        constellationGroup.visible = true;
        archiveGroup.visible = false;
        scene.fog = darkFog;
        renderer.setClearColor(0x050510);
        
        emoCard.style.opacity = 1;
        emoCard.style.transform = "translateY(0)";
        intCard.style.opacity = 0;
        document.getElementById('emo-text').innerText = "Manual Override: You have returned to the Star-Field.";
    }
});

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = window.innerWidth < 768 ? 40 : 30;
});
