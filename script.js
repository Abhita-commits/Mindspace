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

// Default Dark Mode Stars
const starMat = new THREE.PointsMaterial({ color: 0x4488ff, size: 0.6, transparent:true });
const starGeo = new THREE.BufferGeometry();
const starPos = [];
for(let i=0; i<800; i++) starPos.push((Math.random()-0.5)*90, (Math.random()-0.5)*70, (Math.random()-0.5)*60);
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
starsGroup.add(new THREE.Points(starGeo, starMat));

// Scrolls
const scrollMat = new THREE.MeshBasicMaterial({ color: 0xD4AF37, side: THREE.DoubleSide, opacity: 0.9, transparent: true });
const scrollGeo = new THREE.PlaneGeometry(2.5, 3.5);
for(let i=0; i<25; i++) {
    const s = new THREE.Mesh(scrollGeo, scrollMat);
    s.position.set((Math.random()-0.5)*70, (Math.random()-0.5)*50, (Math.random()-0.5)*30);
    s.rotation.set(Math.random(), Math.random(), Math.random());
    s.userData = { speed: Math.random()*0.01 + 0.002 };
    scrollsGroup.add(s);
}

scrollsGroup.visible = false;
starsGroup.visible = true;

// Fog for depth (Initial Dark)
let currentFog = new THREE.FogExp2(0x050510, 0.02);
scene.fog = currentFog;

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

// --- 2. SETTINGS PANEL ---
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const resetBtn = document.getElementById('reset-btn');

settingsBtn.addEventListener('click', (e) => { e.stopPropagation(); settingsPanel.classList.toggle('open'); });
document.addEventListener('click', (e) => {
    if (!settingsPanel.contains(e.target) && e.target !== settingsBtn) settingsPanel.classList.remove('open');
});

// --- 3. NEW FEATURE: SOFT AMBIENT MUSIC (Web Audio API) ---
let audioCtx, masterGain;
let oscillators = [];

function setMusic(isOn) {
    updateToggleButtons(0, isOn ? 0 : 1);
    
    if (isOn) {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
            masterGain = audioCtx.createGain();
            masterGain.gain.value = 0.15; // Soft volume
            masterGain.connect(audioCtx.destination);
        }
        
        if (audioCtx.state === 'suspended') audioCtx.resume();
        if (oscillators.length > 0) return; // Already playing

        // Create a soft "Space Pad" chord (Cmaj7 spread out)
        // Frequencies: C3 (130.8), G3 (196.0), B3 (246.9), E4 (329.6)
        const freqs = [130.81, 196.00, 246.94, 329.63]; 
        
        freqs.forEach(f => {
            const osc = audioCtx.createOscillator();
            osc.type = 'sine'; // Sine waves are soft and pure
            osc.frequency.setValueAtTime(f, audioCtx.currentTime);
            
            // Slight detune for "spacey" drift
            osc.detune.setValueAtTime((Math.random() - 0.5) * 10, audioCtx.currentTime); 

            const gain = audioCtx.createGain();
            gain.gain.value = 1.0 / freqs.length;
            
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start();
            oscillators.push(osc);
        });

    } else {
        if (audioCtx) {
            oscillators.forEach(o => o.stop());
            oscillators = [];
        }
    }
}

// --- 4. THEME LOGIC (Warm/Dark) ---
function setTheme(mode) {
    const isLight = mode === 'light';
    updateToggleButtons(1, isLight ? 1 : 0);
    
    if (isLight) {
        // Intellectual / Warm Parchment Theme
        document.body.classList.add('light-theme');
        scene.fog = new THREE.FogExp2(0xF2EBD4, 0.02); // Warm Fog
        renderer.setClearColor(0xF2EBD4);
        starMat.color.setHex(0x3D2C1D); // Dark Brown stars
        starMat.opacity = 0.5;
    } else {
        // Emotional / Dark Theme
        document.body.classList.remove('light-theme');
        scene.fog = new THREE.FogExp2(0x050510, 0.02); // Dark Fog
        renderer.setClearColor(0x050510);
        starMat.color.setHex(0x4488ff); // Blue stars
        starMat.opacity = 0.8;
    }
}

// --- 5. FOCUS MODE ---
function setFocus(isHide) {
    updateToggleButtons(2, isHide ? 1 : 0);
    if(isHide) document.body.classList.add('focus-mode');
    else document.body.classList.remove('focus-mode');
}

function updateToggleButtons(rowIndex, activeIndex) {
    const row = document.querySelectorAll('.setting-row')[rowIndex];
    const buttons = row.querySelectorAll('.tgl-btn');
    buttons.forEach((btn, idx) => idx === activeIndex ? btn.classList.add('active') : btn.classList.remove('active'));
}

// --- 6. RESET / HOME LOGIC ---
resetBtn.addEventListener('click', () => {
    // 1. Clear Input
    input.value = '';
    clearBtn.style.display = 'none';
    
    // 2. Hide Cards
    [cardNeg, cardPos, cardInt].forEach(c => {
        c.style.opacity = '0';
        c.style.transform = 'translateX(-50%) translateY(50px)';
    });

    // 3. Reset 3D World to Default (Stars visible, Scrolls hidden)
    starsGroup.visible = true;
    scrollsGroup.visible = false;
});

// --- 7. SEARCH LOGIC ---
const sentimentWords = {
    sad: -1, lonely: -1, depressed: -1, cry: -1, pain: -1, anxious: -1, dark: -1,
    happy: 1, joy: 1, love: 1, great: 1, hope: 1, smile: 1, light: 1
};
const intellectualWords = ['how', 'what', 'why', 'who', 'history', 'fact', 'science', 'define'];

const form = document.getElementById('mind-form');
const input = document.getElementById('mind-input');
const clearBtn = document.getElementById('clear-btn');
const cardNeg = document.getElementById('card-negative');
const cardPos = document.getElementById('card-positive');
const cardInt = document.getElementById('card-intellectual');

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

    // Hide all first
    [cardNeg, cardPos, cardInt].forEach(c => { c.style.opacity = '0'; c.style.transform = 'translateX(-50%) translateY(50px)'; });
    
    setTimeout(() => {
        if (!isInt && score < 0) {
            // Negative Emotion
            starsGroup.visible = true; scrollsGroup.visible = false;
            cardNeg.style.opacity = '1'; cardNeg.style.transform = 'translateX(-50%) translateY(0)';
        } else if (!isInt && score > 0) {
            // Positive Emotion
            starsGroup.visible = true; scrollsGroup.visible = false;
            cardPos.style.opacity = '1'; cardPos.style.transform = 'translateX(-50%) translateY(0)';
        } else {
            // Intellectual
            starsGroup.visible = false; scrollsGroup.visible = true;
            cardInt.style.opacity = '1'; cardInt.style.transform = 'translateX(-50%) translateY(0)';
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
