// Scene setup (same as before)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById('container').appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting (same as before)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// Ground (same as before)
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3a5f0b,
    side: THREE.DoubleSide
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Tree variables
let currentTree = null;
const barkMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8B4513,
    roughness: 0.9,
    bumpScale: 0.05
});

// Improved leaf materials with texture-like variation
const leafMaterials = [
    new THREE.MeshStandardMaterial({ color: 0x4CAF50, roughness: 0.7 }),
    new THREE.MeshStandardMaterial({ color: 0x5D9E43, roughness: 0.7 }),
    new THREE.MeshStandardMaterial({ color: 0x3E7D3A, roughness: 0.7 })
];

// Improved tree generation with recursive branching
function generateTree(params) {
    if (currentTree) {
        scene.remove(currentTree);
    }

    const treeGroup = new THREE.Group();
    
    // Create trunk with improved geometry
    const trunkHeight = params.height * 0.7;
    const trunkGeometry = new THREE.CylinderGeometry(
        params.trunkRadius * 0.7, 
        params.trunkRadius * 1.2, 
        trunkHeight, 
        params.trunkSegments
    );
    
    // Add some noise to the trunk vertices for more organic look
    const positionAttribute = trunkGeometry.getAttribute('position');
    for (let i = 0; i < positionAttribute.count; i++) {
        const y = positionAttribute.getY(i);
        // More distortion at the bottom
        const distortionFactor = (1 - y / trunkHeight) * 0.1;
        positionAttribute.setX(i, positionAttribute.getX(i) * (1 + Math.random() * distortionFactor));
        positionAttribute.setZ(i, positionAttribute.getZ(i) * (1 + Math.random() * distortionFactor));
    }
    positionAttribute.needsUpdate = true;
    
    const trunk = new THREE.Mesh(trunkGeometry, barkMaterial);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    trunk.position.y = trunkHeight / 2;
    treeGroup.add(trunk);

    // Create root flares
    createRootFlares(treeGroup, params.trunkRadius, trunkHeight, params.trunkSegments);
    
    // Start recursive branching
    const branchStartHeight = trunkHeight * 0.7;
    const startDirection = new THREE.Vector3(0, 1, 0);
    const startPosition = new THREE.Vector3(0, branchStartHeight, 0);
    
    // Create main branches
    const mainBranchCount = 3 + Math.floor(params.branchDensity / 3);
    for (let i = 0; i < mainBranchCount; i++) {
        const angle = (i / mainBranchCount) * Math.PI * 2;
        const branchDirection = new THREE.Vector3(
            Math.sin(angle) * 0.3,
            0.7 + Math.random() * 0.3,
            Math.cos(angle) * 0.3
        ).normalize();
        
        const length = params.height * (0.3 + Math.random() * 0.2);
        const thickness = params.trunkRadius * (0.4 + Math.random() * 0.2);
        
        createBranch(
            treeGroup,
            startPosition,
            branchDirection,
            length,
            thickness,
            0,
            params
        );
    }
    
    // Add leaves based on tree type
    if (params.treeType === 'pine') {
        createPineLeaves(treeGroup, params);
    } else if (params.treeType === 'oak') {
        createOakLeaves(treeGroup, params);
    } else if (params.treeType === 'palm') {
        createPalmLeaves(treeGroup, params);
    } else {
        createCustomLeaves(treeGroup, params);
    }
    
    // Apply wind effect if any
    if (params.windStrength > 0) {
        applyWindEffect(treeGroup, params.windStrength);
    }
    
    scene.add(treeGroup);
    currentTree = treeGroup;
    camera.lookAt(0, params.height / 2, 0);
}

function createRootFlares(treeGroup, trunkRadius, trunkHeight, segments) {
    const flareCount = 3 + Math.floor(segments / 3);
    for (let i = 0; i < flareCount; i++) {
        const angle = (i / flareCount) * Math.PI * 2;
        const flareSize = trunkRadius * (0.8 + Math.random() * 0.5);
        const flareHeight = trunkHeight * 0.1;
        
        const flareGeometry = new THREE.CylinderGeometry(
            flareSize * 0.2,
            flareSize,
            flareHeight,
            segments
        );
        
        // Rotate flare outward
        const flare = new THREE.Mesh(flareGeometry, barkMaterial);
        flare.rotation.x = Math.PI / 2;
        flare.rotation.z = angle;
        flare.position.set(
            Math.cos(angle) * trunkRadius * 0.7,
            flareHeight / 2,
            Math.sin(angle) * trunkRadius * 0.7
        );
        
        flare.castShadow = true;
        treeGroup.add(flare);
    }
}

function createBranch(parent, startPos, direction, length, thickness, depth, params) {
    // Create branch segment
    const segmentLength = length * (0.3 + Math.random() * 0.2);
    const endThickness = thickness * 0.7;
    
    const segmentGeometry = new THREE.CylinderGeometry(
        endThickness,
        thickness,
        segmentLength,
        Math.max(5, params.trunkSegments - depth * 2)
    );
    
    // Add some noise to the branch
    const positionAttribute = segmentGeometry.getAttribute('position');
    for (let i = 0; i < positionAttribute.count; i++) {
        const distortion = 0.05 * (1 - depth / 5);
        positionAttribute.setX(i, positionAttribute.getX(i) * (1 + (Math.random() - 0.5) * distortion));
        positionAttribute.setZ(i, positionAttribute.getZ(i) * (1 + (Math.random() - 0.5) * distortion));
    }
    positionAttribute.needsUpdate = true;
    
    const segment = new THREE.Mesh(segmentGeometry, barkMaterial);
    segment.castShadow = true;
    
    // Position and orient the segment
    const endPos = startPos.clone().add(direction.clone().multiplyScalar(segmentLength));
    segment.position.copy(startPos.clone().add(endPos).multiplyScalar(0.5));
    
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    segment.quaternion.copy(quaternion);
    
    parent.add(segment);
    
    // Decide whether to continue branching
    const maxDepth = 3 + Math.floor(params.branchDensity / 3);
    if (depth < maxDepth && length > params.height * 0.1) {
        const branchCount = depth < 1 ? 2 : (Math.random() > 0.5 ? 2 : 1);
        
        for (let i = 0; i < branchCount; i++) {
            // Calculate new direction with some variation
            const angleVariation = (Math.PI / 8) * (0.5 + Math.random());
            const newDirection = direction.clone()
                .applyAxisAngle(
                    new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
                    angleVariation
                )
                .normalize();
            
            // New branch should be thinner and shorter
            const newLength = length * (0.5 + Math.random() * 0.3);
            const newThickness = thickness * (0.5 + Math.random() * 0.2);
            
            createBranch(
                parent,
                endPos,
                newDirection,
                newLength,
                newThickness,
                depth + 1,
                params
            );
        }
    }
    
    // Add leaves at the end of branches if this is a leaf-bearing tree
    if (params.treeType !== 'pine' && depth > 1 && (depth === maxDepth || Math.random() > 0.7)) {
        addLeafCluster(parent, endPos, direction, params);
    }
}

function addLeafCluster(parent, position, direction, params) {
    const clusterSize = params.leafSize * (0.5 + Math.random() * 0.5);
    const leafCount = Math.floor(params.leafDensity / 20);
    
    for (let i = 0; i < leafCount; i++) {
        const leafGeometry = new THREE.SphereGeometry(
            clusterSize * (0.3 + Math.random() * 0.2),
            6,
            6
        );
        
        const leaf = new THREE.Mesh(
            leafGeometry,
            leafMaterials[Math.floor(Math.random() * leafMaterials.length)]
        );
        
        // Position leaves in a spherical cluster
        const angle1 = Math.random() * Math.PI * 2;
        const angle2 = Math.random() * Math.PI;
        const distance = clusterSize * (0.3 + Math.random() * 0.7);
        
        leaf.position.copy(position);
        leaf.position.x += Math.sin(angle1) * Math.cos(angle2) * distance;
        leaf.position.y += Math.sin(angle2) * distance;
        leaf.position.z += Math.cos(angle1) * Math.cos(angle2) * distance;
        
        leaf.castShadow = true;
        parent.add(leaf);
    }
}

function createCustomLeaves(treeGroup, params) {
    // A mix of different approaches
    const leafCount = Math.floor(params.leafDensity * 1.5);
    const branchCount = Math.floor(params.branchDensity);
    
    // Create branches
    for (let i = 0; i < branchCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const height = Math.random() * params.height * 0.6 + params.height * 0.2;
        const length = 0.3 + Math.random() * params.height * 0.4;
        
        const branchGeometry = new THREE.CylinderGeometry(
            0.03 * params.trunkRadius * 5,
            0.06 * params.trunkRadius * 5,
            length,
            5
        );
        const branch = new THREE.Mesh(
            branchGeometry,
            new THREE.MeshStandardMaterial({ color: 0x8B4513 })
        );
        
        branch.rotation.z = -Math.PI / 6 + Math.random() * Math.PI / 3;
        branch.rotation.y = angle;
        branch.position.y = height;
        branch.position.x = Math.cos(angle) * params.trunkRadius * 1.2;
        branch.position.z = Math.sin(angle) * params.trunkRadius * 1.2;
        
        branch.castShadow = true;
        treeGroup.add(branch);
        
        // Add leaves to branches
        const leavesOnBranch = Math.floor(leafCount / branchCount);
        for (let j = 0; j < leavesOnBranch; j++) {
            const posOnBranch = 0.2 + j / leavesOnBranch * 0.8;
            const leafSize = 0.1 + Math.random() * 0.2 * params.leafSize;
            
            const leafGeometry = new THREE.SphereGeometry(leafSize, 6, 6);
            const leaf = new THREE.Mesh(
                leafGeometry,
                leafMaterials[Math.floor(Math.random() * leafMaterials.length)]
            );
            
            // Position along the branch
            const branchDir = new THREE.Vector3(
                Math.cos(angle) * Math.cos(branch.rotation.z),
                Math.sin(branch.rotation.z),
                Math.sin(angle) * Math.cos(branch.rotation.z)
            );
            branchDir.multiplyScalar(length * posOnBranch);
            
            leaf.position.copy(branch.position).add(branchDir);
            
            // Random offset
            leaf.position.x += (Math.random() - 0.5) * leafSize * 2;
            leaf.position.y += (Math.random() - 0.5) * leafSize * 2;
            leaf.position.z += (Math.random() - 0.5) * leafSize * 2;
            
            leaf.castShadow = true;
            treeGroup.add(leaf);
        }
    }
}

function applyWindEffect(treeGroup, strength) {
    treeGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            // Save original position for wind animation
            if (!child.userData.originalPos) {
                child.userData.originalPos = child.position.clone();
            }
            
            // Add some wind movement
            child.userData.windOffset = Math.random() * Math.PI * 2;
            child.userData.windSpeed = 0.5 + Math.random() * 1.5;
            child.userData.windStrength = strength * (0.5 + Math.random() * 0.5);
        }
    });
}

function createPineLeaves(treeGroup, params) {
    // Pine trees have layered conical leaf clusters (needles)
    const levels = 3 + Math.floor(params.branchDensity / 3);
    const leafGeometry = new THREE.ConeGeometry(1, 2, 6);
    
    for (let i = 0; i < levels; i++) {
        const levelHeight = (i / levels) * params.height * 0.6 + params.height * 0.4;
        const radius = (1 - i / levels) * params.height * 0.4 * params.leafSize;
        const height = params.height * 0.25 * params.leafSize;
        
        const leaves = new THREE.Mesh(
            leafGeometry,
            leafMaterials[i % leafMaterials.length]
        );
        leaves.scale.set(radius, height, radius);
        leaves.position.y = levelHeight;
        leaves.castShadow = true;
        
        // Add some randomness to the cone shape
        leaves.geometry.vertices.forEach(v => {
            if (v.y > 0) { // Only affect the top vertices
                v.x += (Math.random() - 0.5) * radius * 0.2;
                v.z += (Math.random() - 0.5) * radius * 0.2;
            }
        });
        leaves.geometry.verticesNeedUpdate = true;
        
        treeGroup.add(leaves);
        
        // Add some bare branches sticking out
        if (i > 0 && Math.random() > 0.7) {
            const branchAngle = Math.random() * Math.PI * 2;
            const branchLength = height * (0.5 + Math.random() * 0.5);
            
            const branchGeometry = new THREE.CylinderGeometry(
                0.03 * params.trunkRadius,
                0.01 * params.trunkRadius,
                branchLength,
                5
            );
            const branch = new THREE.Mesh(branchGeometry, barkMaterial);
            
            branch.rotation.set(
                Math.PI/2 + (Math.random()-0.5)*0.3,
                branchAngle,
                0
            );
            branch.position.set(
                Math.cos(branchAngle) * radius * 0.7,
                levelHeight - height * 0.3,
                Math.sin(branchAngle) * radius * 0.7
            );
            branch.castShadow = true;
            treeGroup.add(branch);
        }
    }
}

function createOakLeaves(treeGroup, params) {
    // Oak trees have a more spherical canopy with clustered leaves
    const canopyRadius = params.height * 0.6;
    const canopyHeightStart = params.height * 0.5;
    const canopyHeightEnd = params.height * 0.9;
    
    // Create main leaf clusters at branch ends
    treeGroup.traverse(child => {
        if (child.geometry instanceof THREE.CylinderGeometry && 
            child.position.y > params.height * 0.4) {
            
            // Only add leaves to smaller branches
            if (child.geometry.parameters.radiusTop < params.trunkRadius * 0.3) {
                const clusterSize = params.leafSize * (0.7 + Math.random() * 0.6);
                const cluster = createLeafCluster(
                    clusterSize,
                    params.leafDensity / 30,
                    child.position
                );
                treeGroup.add(cluster);
            }
        }
    });
    
    // Fill in gaps with additional leaves
    const fillLeaves = Math.floor(params.leafDensity / 4);
    for (let i = 0; i < fillLeaves; i++) {
        const angle = Math.random() * Math.PI * 2;
        const verticalAngle = Math.random() * Math.PI * 0.5;
        const distance = Math.random() * canopyRadius;
        
        const x = Math.sin(angle) * Math.cos(verticalAngle) * distance;
        const y = canopyHeightStart + (Math.sin(verticalAngle) * distance * 0.8);
        const z = Math.cos(angle) * Math.cos(verticalAngle) * distance;
        
        if (y > params.height * 0.4) {
            const leafSize = params.leafSize * (0.3 + Math.random() * 0.4);
            const leafGeometry = new THREE.SphereGeometry(leafSize, 6, 6);
            const leaf = new THREE.Mesh(
                leafGeometry,
                leafMaterials[Math.floor(Math.random() * leafMaterials.length)]
            );
            leaf.position.set(x, y, z);
            leaf.castShadow = true;
            treeGroup.add(leaf);
        }
    }
}

function createPalmLeaves(treeGroup, params) {
    // Palm trees have large, fan-like leaves at the top
    const leafCount = 6 + Math.floor(params.branchDensity / 2);
    const leafLength = params.height * 0.7;
    
    for (let i = 0; i < leafCount; i++) {
        const angle = (i / leafCount) * Math.PI * 2;
        const leafAngle = -Math.PI/4 + Math.random() * Math.PI/6;
        
        // Create curved palm leaf
        const leafSegments = 8;
        const leafWidth = params.leafSize * (0.8 + Math.random() * 0.4);
        
        const leafShape = new THREE.Shape();
        leafShape.moveTo(0, 0);
        leafShape.lineTo(leafWidth * 0.2, 0);
        
        for (let s = 1; s <= leafSegments; s++) {
            const segFrac = s / leafSegments;
            const segWidth = leafWidth * (1 - segFrac * 0.7);
            const segLength = leafLength * segFrac;
            
            // Add some waviness to the leaf edges
            const waveOffset = Math.sin(segFrac * Math.PI * 4) * leafWidth * 0.1;
            
            leafShape.lineTo(
                segWidth + waveOffset,
                segLength
            );
        }
        
        leafShape.lineTo(0, leafLength);
        
        const leafGeometry = new THREE.ExtrudeGeometry(leafShape, {
            steps: 1,
            depth: 0.02 * params.leafSize,
            bevelEnabled: false
        });
        
        // Rotate the geometry so the leaf stands up
        leafGeometry.rotateX(Math.PI/2);
        
        const leaf = new THREE.Mesh(
            leafGeometry,
            leafMaterials[Math.floor(Math.random() * leafMaterials.length)]
        );
        
        // Position and rotate the leaf
        leaf.rotation.y = angle;
        leaf.rotation.z = leafAngle;
        leaf.position.y = params.height * 0.9;
        
        // Add some individual leaflet details
        const leafLines = new THREE.LineSegments(
            new THREE.EdgesGeometry(leafGeometry),
            new THREE.LineBasicMaterial({ color: 0x2d572c })
        );
        leaf.add(leafLines);
        
        leaf.castShadow = true;
        treeGroup.add(leaf);
    }
}

function createCustomLeaves(treeGroup, params) {
    // A more natural distribution that works with the branching system
    const leafClusters = [];
    
    // First pass: identify all branch ends
    treeGroup.traverse(child => {
        if (child.geometry instanceof THREE.CylinderGeometry && 
            child.position.y > params.height * 0.3) {
            
            // Estimate end position of the branch
            const direction = new THREE.Vector3(0, 1, 0)
                .applyQuaternion(child.quaternion);
            const length = child.geometry.parameters.height;
            const endPos = child.position.clone()
                .add(direction.multiplyScalar(length * 0.9));
            
            leafClusters.push({
                position: endPos,
                size: params.leafSize * (0.5 + Math.random() * 0.5),
                density: params.leafDensity / 20
            });
        }
    });
    
    // Create leaf clusters at branch ends
    leafClusters.forEach(cluster => {
        treeGroup.add(createLeafCluster(
            cluster.size,
            cluster.density,
            cluster.position
        ));
    });
    
    // Fill in with some random leaves
    const fillLeaves = Math.floor(params.leafDensity / 10);
    for (let i = 0; i < fillLeaves; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * params.height * 0.5;
        const height = params.height * 0.3 + Math.random() * params.height * 0.6;
        
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        const leafSize = params.leafSize * (0.2 + Math.random() * 0.3);
        const leafGeometry = new THREE.SphereGeometry(leafSize, 6, 6);
        const leaf = new THREE.Mesh(
            leafGeometry,
            leafMaterials[Math.floor(Math.random() * leafMaterials.length)]
        );
        leaf.position.set(x, height, z);
        leaf.castShadow = true;
        treeGroup.add(leaf);
    }
}

function createLeafCluster(size, density, position) {
    const cluster = new THREE.Group();
    cluster.position.copy(position);
    
    const leafCount = Math.max(3, Math.floor(density));
    for (let i = 0; i < leafCount; i++) {
        const leafSize = size * (0.5 + Math.random() * 0.5);
        
        // Create more leaf-like shape (flattened sphere)
        const leafGeometry = new THREE.SphereGeometry(leafSize, 6, 4);
        
        // Flatten the sphere
        const posAttr = leafGeometry.getAttribute('position');
        for (let v = 0; v < posAttr.count; v++) {
            posAttr.setY(v, posAttr.getY(v) * 0.3);
        }
        posAttr.needsUpdate = true;
        
        const leaf = new THREE.Mesh(
            leafGeometry,
            leafMaterials[Math.floor(Math.random() * leafMaterials.length)]
        );
        
        // Position leaves in a spherical cluster
        const angle1 = Math.random() * Math.PI * 2;
        const angle2 = Math.random() * Math.PI;
        const distance = size * (0.3 + Math.random() * 0.7);
        
        leaf.position.set(
            Math.sin(angle1) * Math.cos(angle2) * distance,
            Math.sin(angle2) * distance * 0.5, // More spread horizontally
            Math.cos(angle1) * Math.cos(angle2) * distance
        );
        
        // Random rotation
        leaf.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        leaf.castShadow = true;
        cluster.add(leaf);
    }
    
    return cluster;
}

// (Rest of the code - pineLeaves, oakLeaves, palmLeaves, customLeaves, 
// applyWindEffect, animate, and UI controls remain similar to previous version)

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update wind effect if any
    if (currentTree && currentTree.children.length > 0) {
        const time = Date.now() * 0.001;
        
        currentTree.traverse((child) => {
            if (child instanceof THREE.Mesh && child.userData.originalPos) {
                const windFactor = Math.sin(time * child.userData.windSpeed + child.userData.windOffset) * 
                                 child.userData.windStrength * 0.1;
                child.position.x = child.userData.originalPos.x + windFactor;
                child.position.z = child.userData.originalPos.z + windFactor * 0.5;
                
                // Slight rotation for leaves
                if (child.geometry instanceof THREE.SphereGeometry || 
                    child.geometry instanceof THREE.ConeGeometry) {
                    child.rotation.z = windFactor * 0.5;
                }
            }
        });
    }
    
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// UI Controls
document.getElementById('generateBtn').addEventListener('click', () => {
    const params = {
        treeType: document.getElementById('treeType').value,
        height: parseFloat(document.getElementById('height').value),
        trunkRadius: parseFloat(document.getElementById('trunkRadius').value),
        trunkSegments: parseInt(document.getElementById('trunkSegments').value),
        branchDensity: parseInt(document.getElementById('branchDensity').value),
        leafDensity: parseInt(document.getElementById('leafDensity').value),
        leafSize: parseFloat(document.getElementById('leafSize').value),
        windStrength: parseFloat(document.getElementById('windStrength').value)
    };
    generateTree(params);
});

document.getElementById('randomBtn').addEventListener('click', () => {
    // Set random values for all sliders
    document.getElementById('treeType').value = ['pine', 'oak', 'palm', 'custom'][Math.floor(Math.random() * 4)];
    document.getElementById('height').value = 3 + Math.random() * 12;
    document.getElementById('trunkRadius').value = 0.1 + Math.random() * 1.5;
    document.getElementById('trunkSegments').value = 3 + Math.floor(Math.random() * 15);
    document.getElementById('branchDensity').value = Math.floor(Math.random() * 10);
    document.getElementById('leafDensity').value = Math.floor(Math.random() * 100);
    document.getElementById('leafSize').value = 0.1 + Math.random() * 1.5;
    document.getElementById('windStrength').value = Math.floor(Math.random() * 10);
    
    // Update displayed values
    updateSliderValues();
    
    // Generate tree
    document.getElementById('generateBtn').click();
});

// Update displayed values when sliders change
function updateSliderValues() {
    document.getElementById('heightValue').textContent = document.getElementById('height').value;
    document.getElementById('trunkRadiusValue').textContent = document.getElementById('trunkRadius').value;
    document.getElementById('trunkSegmentsValue').textContent = document.getElementById('trunkSegments').value;
    document.getElementById('branchDensityValue').textContent = document.getElementById('branchDensity').value;
    document.getElementById('leafDensityValue').textContent = document.getElementById('leafDensity').value;
    document.getElementById('leafSizeValue').textContent = document.getElementById('leafSize').value;
    document.getElementById('windStrengthValue').textContent = document.getElementById('windStrength').value;
}

// Add event listeners to all sliders
document.querySelectorAll('input[type="range"]').forEach(slider => {
    slider.addEventListener('input', updateSliderValues);
});

// Generate initial tree
document.getElementById('generateBtn').click();