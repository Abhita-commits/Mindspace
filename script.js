// --- 1. SETUP SCENE ---
const canvas = document.getElementById('universe-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Pull camera back further for mobile to see more items
camera.position.z = window.innerWidth < 768 ? 40 : 30;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize performance

const constellationGroup = new THREE.Group();
const archiveGroup = new THREE.Group();

scene.add(constellationGroup);
scene.add(archiveGroup);

// --- 2. CREATE EMOTIONAL WORLD ---
const starCount = 150;
const starGeo = new THREE.BufferGeometry();
const starPos = [];

for(let i=0; i<starCount; i++) {
    starPos.push((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
const starMat = new THREE.PointsMaterial({ color: 0x4488ff, size: 0.5 });
const stars = new THREE.Points(starGeo, starMat);
constellationGroup.add(stars);

const emotionalFog = new THREE.FogExp2(0x020210, 0.03);
const intellectualFog = new THREE.FogExp2(0x1a1500, 0.02);

// --- 3. CREATE INTELLECTUAL WORLD ---
const scrollGeo = new THREE.PlaneGeometry(3, 4);
const scrollMat = new THREE.MeshBasicMaterial({ 
    color: 0xeebb88, side: THREE.DoubleSide, transparent: true, opacity: 0.8
});

for(let i=0; i<15; i++) {
    const scroll = new THREE.Mesh(scrollGeo, scrollMat);
    scroll.position.set((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20);
    scroll.rotation.set(Math.random(), Math.random(), Math.random());
    scroll.userData = { rotSpeed: (Math.random() * 0.02), floatSpeed: (Math.random() * 0.01) };
    archiveGroup.add(scroll);
}

archiveGroup.visible = false;
constellationGroup.visible = true;

// --- 4. ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);

    if(constellationGroup.visible) {
        constellationGroup.rotation.y += 0.001;
        constellationGroup.rotation.z += 0.0005;
    }

    if(archiveGroup.visible) {
        archiveGroup.children.forEach(scroll => {
            scroll.rotation.x += scroll.userData.rotSpeed;
            scroll.rotation.y += scroll.userData.rotSpeed;
            scroll.position.y += Math.sin(Date.now() * 0.001) * 0.01;
        });
    }
    renderer.render(scene, camera);
}
animate();

// --- 5. INTERACTION LOGIC (Mobile Friendly) ---
const form = document.getElementById('mind-form'); // We now listen to the form
const input = document.getElementById('mind-input');
const emoCard = document.getElementById('emotional-card');
const intCard = document.getElementById('intellectual-card');

const emoWords = ['sad', 'lonely', 'stress', 'overwhelm', 'feel', 'love', 'hate', 'cry', 'happy'];
const intWords = ['history', 'taj mahal', 'science', 'fact', 'learn', 'study', 'why', 'how', 'what'];

// Use 'submit' to capture both Enter key and Mobile "Go" button
form.addEventListener('submit', (e) => {
    e.preventDefault(); // STOP page refresh
    
    const val = input.value.toLowerCase();
    let isEmotional = emoWords.some(w => val.includes(w));
    let isIntellectual = intWords.some(w => val.includes(w));
    
    // Reset cards
    emoCard.style.opacity = 0;
    emoCard.style.transform = "translateY(20px)";
    intCard.style.opacity = 0;
    intCard.style.transform = "translateY(20px)";

    setTimeout(() => {
        if (isEmotional) {
            constellationGroup.visible = true;
            archiveGroup.visible = false;
            scene.fog = emotionalFog;
            renderer.setClearColor(0x050510);
            
            emoCard.style.opacity = 1;
            emoCard.style.transform = "translateY(0)"; // CSS handles centering
            document.getElementById('emo-text').innerText = "Analyzing sentiment... Your thought '" + input.value + "' has been added to the constellation.";
        } 
        else if (isIntellectual) {
            constellationGroup.visible = false;
            archiveGroup.visible = true;
            scene.fog = intellectualFog;
            renderer.setClearColor(0x1a1005); 

            intCard.style.opacity = 1;
            intCard.style.transform = "translateY(0)"; // CSS handles centering
            document.getElementById('int-text').innerText = "Opening Archive... Retrieving knowledge regarding: " + input.value;
        }
        input.value = ""; 
        input.blur(); // Hide mobile keyboard after search
    }, 200);
});

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Adjust camera depth slightly for mobile vs desktop
    camera.position.z = window.innerWidth < 768 ? 40 : 30;
});
