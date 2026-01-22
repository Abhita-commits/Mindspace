// --- 1. SETUP 3D SCENE ---
const canvas = document.getElementById('universe-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = window.innerWidth < 768 ? 40 : 30;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const starsGroup = new THREE.Group();
const scrollsGroup = new THREE.Group();
scene.add(starsGroup);
scene.add(scrollsGroup);

// Stars
const starMat = new THREE.PointsMaterial({ color: 0x4488ff, size: 0.6, transparent:true });
const starGeo = new THREE.BufferGeometry();
const starPos = [];
for(let i=0; i<600; i++) starPos.push((Math.random()-0.5)*90, (Math.random()-0.5)*70, (Math.random()-0.5)*60);
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
starsGroup.add(new THREE.Points(starGeo, starMat));

// Scrolls
const scrollMat = new THREE.MeshBasicMaterial({ color: 0xffcc88, side: THREE.DoubleSide, opacity: 0.9, transparent: true });
const scrollGeo = new THREE.PlaneGeometry(2.5, 3.5);
for(let i=0; i<20; i++) {
    const s = new THREE.Mesh(scrollGeo, scrollMat);
    s.position.set((Math.random()-0.5)*70, (Math.random()-0.5)*50, (Math.random()-0.5)*30);
    s.rotation.set(Math.random(), Math.random(), Math.random());
    s.userData = { speed: Math.random()*0.01 + 0.002 };
    scrollsGroup.add(s);
}

scrollsGroup.visible = false;
starsGroup.visible = true;

function animate() {
    requestAnimationFrame(animate);
    if(starsGroup.visible) { starsGroup.rotation.y += 0.0005; starsGroup.rotation.z -= 0.0002; }
    if(scrollsGroup.visible) {
        scrollsGroup.children.forEach(s => {
            s.rotation.x += s.userData.speed;
            s.position.y += Math.sin(Date.now()*0.001)*0.01;
        });
    }
    renderer.render(scene, camera);
}
animate();

// --- 2. SETTINGS PANEL LOGIC ---
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');

// Toggle Panel on Button Click
settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent document click from closing immediately
    settingsPanel.classList.toggle('open');
});

// Close Panel when clicking outside
document.addEventListener('click', (e) => {
    if (!settingsPanel.contains(e.target) && e.target !== settingsBtn) {
        settingsPanel.classList.remove('open');
    }
});

// --- 3. FEATURES IMPLEMENTATION ---

// A. SOUND (Browser generated Brown Noise - No files needed)
let audioContext, oscillator, gainNode;
function setSound(isOn) {
    updateToggleButtons(0, isOn ? 0 : 1); // Update UI
    
    if (isOn) {
        if (!audioContext) {
            // Init Audio Engine
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            
            // Create Brown Noise (Deep Space Hum)
            const bufferSize = 4096;
            const brownNoise = (function() {
                const lastOut = 0;
                const node = audioContext.createScriptProcessor(bufferSize, 1, 1);
                node.onaudioprocess = function(e) {
                    const output = e.outputBuffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) {
                        const white = Math.random() * 2 - 1;
                        output[i] = (lastOut + (0.02 * white)) / 1.02;
                        output[i] *= 3.5; 
                    }
                };
                return node;
            })();

            gainNode = audioContext.createGain();
            gainNode.gain.value = 0.05; // Low volume
            brownNoise.connect(gainNode);
            gainNode.connect(audioContext.destination);
        }
        audioContext.resume();
    } else {
        if (audioContext) audioContext.suspend();
    }
}

// B. THEME
function setTheme(mode) {
    const isLight = mode === 'light';
    updateToggleButtons(1, isLight ? 1 : 0);
    
    if (isLight) {
        document.body.classList.add('light-theme');
        scene.fog = new THREE.FogExp2(0xf0f2f5, 0.02);
        renderer.setClearColor(0xf0f2f5);
        starMat.color.setHex(0x224488);
    } else {
        document.body.classList.remove('light-theme');
        scene.fog = new THREE.FogExp2(0x050510, 0.02);
        renderer.setClearColor(0x050510);
        starMat.color.setHex(0x4488ff);
    }
}

// C. FOCUS MODE
function setFocus(isHide) {
    updateToggleButtons(2, isHide ? 1 : 0);
    if(isHide) document.body.classList.add('focus-mode');
    else document.body.classList.remove('focus-mode');
}

// Helper to update button visual state
function updateToggleButtons(rowIndex, activeIndex) {
    const row = document.querySelectorAll('.setting-row')[rowIndex];
    const buttons = row.querySelectorAll('.tgl-btn');
    buttons.forEach((btn, idx) => {
        if (idx === activeIndex) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

// --- 4. ANALYZE & SEARCH LOGIC ---
const sentimentWords = {
    sad: -1, lonely: -1, depressed: -1, cry: -1, pain: -1, anxious: -1,
    happy: 1, joy: 1, love: 1, great: 1, hope: 1, smile: 1
};
const intellectualWords = ['how', 'what', 'why', 'who', 'history', 'fact', 'science'];

const form = document.getElementById('mind-form');
const input = document.getElementById('mind-input');
const clearBtn = document.getElementById('clear-btn');
const cards = [document.getElementById('card-negative'), document.getElementById('card-positive'), document.getElementById('card-intellectual')];

input.addEventListener('input', () => clearBtn.style.display = input.value.length ? 'flex' : 'none');
clearBtn.addEventListener('click', () => { input.value = ''; clearBtn.style.display = 'none'; });

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value.trim().toLowerCase();
    if(!val) return;

    let score = 0, isInt = false;
    if (intellectualWords.some(w => val.includes(w)) || val.includes('?')) isInt = true;
    else {
        val.split(' ').forEach(w => { for(let k in sentimentWords) if(w.includes(k)) score += sentimentWords[k]; });
    }

    cards.forEach(c => { c.style.opacity = '0'; c.style.transform = 'translateX(-50%) translateY(50px)'; });
    
    setTimeout(() => {
        if (!isInt && score < 0) {
            starsGroup.visible = true; scrollsGroup.visible = false;
            cards[0].style.opacity = '1'; cards[0].style.transform = 'translateX(-50%) translateY(0)';
        } else if (!isInt && score > 0) {
            starsGroup.visible = true; scrollsGroup.visible = false;
            cards[1].style.opacity = '1'; cards[1].style.transform = 'translateX(-50%) translateY(0)';
        } else {
            starsGroup.visible = false; scrollsGroup.visible = true;
            cards[2].style.opacity = '1'; cards[2].style.transform = 'translateX(-50%) translateY(0)';
        }
    }, 100);
    input.blur();
});

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
