// 3D Car Viewer using Three.js
class Car3DViewer {
    constructor() {
        this.container = document.getElementById('car-3d-container');
        if (!this.container) return;
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.car = null;
        this.mixer = null;
        this.clock = new THREE.Clock();
        
        this.init();
    }

    init() {
        this.carPaintMaterial = null;
        this.colorMap = {
            '#0066CC': 'Turbo Blue',
            '#1a1a1a': 'Mythos Black',
            '#8B0000': 'Tango Red',
            '#C0C0C0': 'Floret Silver',
            '#FFFFFF': 'Glacier White',
            '#2F4F2F': 'District Green',
            '#4B4B4B': 'Daytona Gray',
            '#000080': 'Navarra Blue'
        };
        
        this.setupScene();
        this.setupLighting();
        this.loadCarModel();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
    }

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        
        // Check theme and set appropriate fog
        const isLightTheme = document.body.getAttribute('data-theme') === 'light';
        this.scene.fog = new THREE.Fog(isLightTheme ? 0xf0f0f0 : 0x000000, 10, 50);
        
        // Camera
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        this.camera.position.set(0, 5, -15);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        // Remove loading indicator and add canvas
        const loadingIndicator = this.container.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        this.container.appendChild(this.renderer.domElement);
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        
        // Main directional light
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(5, 5, 5);
        mainLight.castShadow = true;
        mainLight.shadow.camera.near = 0.1;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -10;
        mainLight.shadow.camera.right = 10;
        mainLight.shadow.camera.top = 10;
        mainLight.shadow.camera.bottom = -10;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        this.scene.add(mainLight);
        
        // Fill light
        const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3);
        fillLight.position.set(-5, 3, -5);
        this.scene.add(fillLight);
        
        // Rim light
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
        rimLight.position.set(0, 5, -5);
        this.scene.add(rimLight);
        
        // Ground
        const isLightTheme = document.body.getAttribute('data-theme') === 'light';
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: isLightTheme ? 0xe0e0e0 : 0x0a0a0a,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    loadCarModel() {
        const loader = new THREE.GLTFLoader();
        
        loader.load(
            'assets/models/2020_audi_s5.glb',
            (gltf) => {
                this.car = gltf.scene;
                
                // Scale and position the model
                this.car.scale.set(0.7, 0.7, 0.7);
                this.car.position.set(0, 0, 0);
                
                // Enable shadows for all meshes and find car paint material
                this.car.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        
                        // Log material names to debug
                        if (child.material && child.material.name) {
                            console.log('Material name:', child.material.name);
                        }
                        
                        // Enhance materials
                        if (child.material) {
                            child.material.envMapIntensity = 0.5;
                            
                            // Check for glass materials
                            if (child.material.name && child.material.name.toLowerCase().includes('glass')) {
                                child.material.transparent = true;
                                child.material.opacity = 0.3;
                            }
                            
                            // Find the main car body paint material - check for common body material names
                            if (child.material.name && 
                                (child.material.name.toLowerCase().includes('paint') || 
                                 child.material.name.toLowerCase().includes('body') ||
                                 child.material.name.toLowerCase().includes('car') ||
                                 child.material.name.toLowerCase().includes('exterior') ||
                                 child.material.name.toLowerCase().includes('main'))) {
                                this.carPaintMaterial = child.material;
                            }
                            
                            // If no specific paint material found, check if it's the largest mesh (likely the body)
                            if (!this.carPaintMaterial && child.material.color && child.geometry) {
                                const boundingBox = new THREE.Box3().setFromObject(child);
                                const size = new THREE.Vector3();
                                boundingBox.getSize(size);
                                const volume = size.x * size.y * size.z;
                                
                                // Store the largest colored mesh as likely body
                                if (!this.largestMesh || volume > this.largestVolume) {
                                    this.largestMesh = child;
                                    this.largestVolume = volume;
                                    this.carPaintMaterial = child.material;
                                }
                            }
                        }
                    }
                });
                
                this.scene.add(this.car);
                
                // Center camera on the car
                const box = new THREE.Box3().setFromObject(this.car);
                const center = box.getCenter(new THREE.Vector3());
                this.controls.target.copy(center);
                this.controls.update();
                
                // Hide loading indicator
                const loadingIndicator = this.container.querySelector('.loading-indicator');
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
            },
            (xhr) => {
                // Update loading progress
                const percentComplete = (xhr.loaded / xhr.total) * 100;
                const loadingText = this.container.querySelector('.loading-indicator p');
                if (loadingText) {
                    loadingText.textContent = `Loading 3D Model... ${Math.round(percentComplete)}%`;
                }
            },
            (error) => {
                console.error('Error loading model:', error);
                // Fall back to placeholder
                this.createPlaceholderCar();
                
                // Hide loading indicator
                const loadingIndicator = this.container.querySelector('.loading-indicator');
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
            }
        );
    }

    createPlaceholderCar() {
        const carGroup = new THREE.Group();
        
        // Car body
        const bodyGeometry = new THREE.BoxGeometry(4, 1, 2);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a,
            metalness: 0.8,
            roughness: 0.2
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        body.castShadow = true;
        carGroup.add(body);
        
        // Car roof
        const roofGeometry = new THREE.BoxGeometry(2, 0.6, 1.8);
        const roofMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x0a0a0a,
            metalness: 0.5,
            roughness: 0.3
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(0, 1.3, 0);
        roof.castShadow = true;
        carGroup.add(roof);
        
        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
        const wheelMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x0a0a0a,
            metalness: 0.2,
            roughness: 0.7
        });
        
        const wheelPositions = [
            [-1.5, 0.3, 0.8],
            [-1.5, 0.3, -0.8],
            [1.5, 0.3, 0.8],
            [1.5, 0.3, -0.8]
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.set(...pos);
            wheel.rotation.z = Math.PI / 2;
            wheel.castShadow = true;
            carGroup.add(wheel);
        });
        
        // Windows
        const windowMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x111111,
            metalness: 0.9,
            roughness: 0.1,
            opacity: 0.8,
            transparent: true
        });
        
        const frontWindowGeometry = new THREE.PlaneGeometry(1.8, 0.5);
        const frontWindow = new THREE.Mesh(frontWindowGeometry, windowMaterial);
        frontWindow.position.set(0.99, 1.3, 0);
        frontWindow.rotation.y = Math.PI / 2;
        carGroup.add(frontWindow);
        
        const rearWindowGeometry = new THREE.PlaneGeometry(1.8, 0.5);
        const rearWindow = new THREE.Mesh(rearWindowGeometry, windowMaterial);
        rearWindow.position.set(-0.99, 1.3, 0);
        rearWindow.rotation.y = -Math.PI / 2;
        carGroup.add(rearWindow);
        
        this.car = carGroup;
        this.scene.add(this.car);
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 8;
        this.controls.maxDistance = 25;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.target.set(0, 0.5, 0);
        this.controls.update();
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // View buttons
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.changeView(e.target.dataset.view));
        });
        
        // Color buttons
        const colorButtons = document.querySelectorAll('.color-btn');
        colorButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                this.changeCarColor(color);
                
                // Update active state
                colorButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
        
        // Set first color as active
        if (colorButtons.length > 0) {
            colorButtons[0].classList.add('active');
        }
        
        // Hide controls hint after first interaction
        this.controls.addEventListener('start', () => {
            const hint = this.container.querySelector('.controls-hint');
            if (hint) hint.style.opacity = '0';
        });
        
        // Listen for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    this.updateTheme();
                }
            });
        });
        observer.observe(document.body, { attributes: true });
    }
    
    updateTheme() {
        const isLightTheme = document.body.getAttribute('data-theme') === 'light';
        
        // Update fog
        this.scene.fog.color.setHex(isLightTheme ? 0xf0f0f0 : 0x000000);
        
        // Update ground
        const ground = this.scene.children.find(child => 
            child.geometry && child.geometry.type === 'PlaneGeometry'
        );
        if (ground) {
            ground.material.color.setHex(isLightTheme ? 0xe0e0e0 : 0x0a0a0a);
        }
    }

    changeView(view) {
        // For side view, toggle between left and right
        if (view === 'side') {
            // Track which side we're on
            if (!this.currentSide) this.currentSide = 'right';
            this.currentSide = this.currentSide === 'right' ? 'left' : 'right';
            view = this.currentSide + 'Side';
        }
        
        const positions = {
            front: { x: 0, y: 5, z: -15 },
            rightSide: { x: 15, y: 5, z: 0 },
            leftSide: { x: -15, y: 5, z: 0 },
            rear: { x: 0, y: 5, z: 15 }
        };
        
        const pos = positions[view];
        if (pos) {
            // Animate camera position
            const startPos = this.camera.position.clone();
            const targetPos = new THREE.Vector3(pos.x, pos.y, pos.z);
            
            const duration = 1000;
            const startTime = Date.now();
            
            const animateCamera = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = this.easeInOutCubic(progress);
                
                this.camera.position.lerpVectors(startPos, targetPos, eased);
                this.camera.lookAt(0, 0.5, 0);
                
                if (progress < 1) {
                    requestAnimationFrame(animateCamera);
                }
            };
            
            animateCamera();
        }
        
        // Update active button
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === (view === 'leftSide' || view === 'rightSide' ? 'side' : view)) {
                btn.classList.add('active');
            }
        });
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    changeCarColor(colorHex) {
        // Try multiple approaches to change car color
        let colorChanged = false;
        
        if (this.carPaintMaterial) {
            // Convert hex to Three.js color
            this.carPaintMaterial.color.set(colorHex);
            colorChanged = true;
        }
        
        // Also try to change all materials that look like body panels
        this.car.traverse((child) => {
            if (child.isMesh && child.material && child.material.color) {
                // Skip materials that shouldn't be colored
                if (child.material.name && 
                    (child.material.name.toLowerCase().includes('glass') ||
                     child.material.name.toLowerCase().includes('chrome') ||
                     child.material.name.toLowerCase().includes('metal') ||
                     child.material.name.toLowerCase().includes('tire') ||
                     child.material.name.toLowerCase().includes('wheel') ||
                     child.material.name.toLowerCase().includes('interior') ||
                     child.material.name.toLowerCase().includes('black'))) {
                    return;
                }
                
                // If material looks like it could be car body, change it
                if (!child.material.transparent && 
                    (!child.material.name || 
                     child.material.name === '' || 
                     child.material.name.toLowerCase().includes('body') ||
                     child.material.name.toLowerCase().includes('paint') ||
                     child.material.name.toLowerCase().includes('exterior'))) {
                    child.material.color.set(colorHex);
                    colorChanged = true;
                }
            }
        });
        
        // Update color name in UI
        const colorName = this.colorMap[colorHex] || 'Custom';
        const colorText = document.getElementById('car-color-name');
        if (colorText) {
            colorText.textContent = `${colorName} • 3.0L V6 Turbo • 349 HP`;
        }
        
        if (!colorChanged) {
            console.log('Warning: Could not find car body material to change color');
        }
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        if (this.mixer) {
            this.mixer.update(delta);
        }
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('car-3d-container')) {
        new Car3DViewer();
    }
});