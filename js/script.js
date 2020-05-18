sbVertexShader = [
    "varying vec3 vWorldPosition;",
    "void main() {",
    "  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
    "  vWorldPosition = worldPosition.xyz;",
    "  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}",
].join("\n");

sbFragmentShader = [
    "uniform vec3 topColor;",
    "uniform vec3 bottomColor;",
    "uniform float offset;",
    "uniform float exponent;",
    "varying vec3 vWorldPosition;",
    "void main() {",
    "  float h = normalize( vWorldPosition + offset ).y;",
    "  gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( h, exponent ), 0.0 ) ), 1.0 );",
    "}",
].join("\n");

var objs = {
    scene: null,
    camera: null,
    renderer: null,
    container: null,
    controls: null,
    clock: null,
    plane: null,
    selection: null,
    offset: new THREE.Vector3(),
    objects: [],
    raycaster: new THREE.Raycaster(),
    mouse_position: new THREE.Vector3(),
    v3: new THREE.Vector3(),

    init: function() {

        // Create main scene
        this.scene = new Physijs.Scene({fixedTimeStep:1/120});
        this.scene.setGravity(new THREE.Vector3(0, -30, 0));
        this.scene.addEventListener(
            'update',
            function(){
                if(this.selection !== null){
                    this.v3.copy(this.mouse_position).add(this.offset).sub(this.selection.position).multiplyScalar(5);
                    this.v3.y = 0;
                    this.selection.setLinearVelocity(this.v3);
                    this.v3.set(0, 0, 0);
                    for(var i = 0; i < this.objects.length; i++){
                        this.objects[i].applyCentralImpulse(this.v3);
                    }
                }

                this.scene.simulate(undefined, 1);
            }
        );

        var SCREEN_WIDTH = window.innerWidth,
            SCREEN_HEIGHT = window.innerHeight;

        // Prepare perspective camera
        var VIEW_ANGLE = 45,
            ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
            NEAR = 1,
            FAR = 1000;
        this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        this.scene.add(this.camera);
        this.camera.position.set(100, 0, 0);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        // Prepare webgl renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMapSoft = true;

        // Prepare container
        this.container = document.createElement('div');
        document.body.appendChild(this.container);
        this.container.appendChild(this.renderer.domElement);

        // Events
        THREEx.WindowResize(this.renderer, this.camera);
        document.addEventListener('mousedown', this.onDocumentMouseDown, false);
        document.addEventListener('mousemove', this.onDocumentMouseMove, false);
        document.addEventListener('mouseup', this.onDocumentMouseUp, false);
        document.addEventListener('mousewheel', this.onDocumentMouseWheel, false);

        // Prepare Orbit controls
        this.controls = new THREE.OrbitControls(this.camera);
        this.controls.target = new THREE.Vector3(0, 0, 0);
        this.controls.maxDistance = 150;

        this.clock = new THREE.Clock();

        // Add lights
        this.scene.add(new THREE.AmbientLight(0x444444));

        var dirLight = new THREE.DirectionalLight(0xffffff);
        dirLight.position.set(200, 200, 1000).normalize();
        this.camera.add(dirLight);
        this.camera.add(dirLight.target);

        // Display skybox
        this.addSkybox();

        // Plane, that helps to determinate an intersection position
        this.plane = new THREE.Mesh(
            new THREE.PlaneGeometry(150, 150),
            new THREE.MeshBasicMaterial({ opacity: 0, transparent: true }));
        this.plane.rotation.x = Math.PI / -2;
        // this.plane.visible = false;
        this.scene.add(this.plane);

        // Add table
        var loader;
        loader = new THREE.TextureLoader();

        var table_material;
        table_material = Physijs.createMaterial(
            new THREE.MeshLambertMaterial({
                color: 'black'
            }),
            .9, // high friction
            .2 // low restitution
        );
        
        var table;
        table = new Physijs.BoxMesh(
            new THREE.BoxGeometry(50, 1, 50),
            table_material,
            0, // mass
            { restitution: .2, friction: .8 }
        );
        table.position.y = (1 / 2) - 8 - 1;
        table.receiveShadow = true;
        this.scene.add(table);

        // Add blocks
        var block_length = 6,
            block_height = 1,
            block_width = 1.5,
            block_offset = 2,
            block_geometry = new THREE.BoxGeometry(block_length, block_height, block_width);
        var i, j, rows = 15,
            block;

        var nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
            ranNums = [],
            k = nums.length,
            l = 0;

        while (k--) {
            l = Math.floor(Math.random() * (k + 1));
            ranNums.push(nums[l]);
            nums.splice(l, 1);
        }

        var m;
        m = 0;
        for (i = 0; i < rows; i++) {
            for (j = 0; j < 3; j++) {
                var block_material;
                var a = [];
                a = [' ', 0x3e88c8, 0x3e88c8, 0x3e88c8, 0x3e88c8, 0x3e88c8, 0x3e88c8, 0x3e88c8, 0x3e88c8, 0x3e88c8, 0x3e88c8,
                    0xfcd02d, 0xfcd02d, 0xfcd02d, 0xfcd02d, 0xfcd02d, 0xfcd02d, 0xfcd02d, 0xfcd02d, 0xfcd02d, 0xfcd02d,
                    0xca4097, 0xca4097, 0xca4097, 0xca4097,
                    0x408c57, 0x408c57, 0x408c57, 0x408c57, 0x408c57, 0x408c57, 0x408c57, 0x408c57, 0x408c57, 0x408c57,
                    0xe6344e, 0xe6344e, 0xe6344e, 0xe6344e, 0xe6344e, 0xe6344e, 0xe6344e, 0xe6344e, 0xe6344e, 0xe6344e, 0xe6344e, 0xe6344e
                ];
                block_material = Physijs.createMaterial(
                    new THREE.MeshLambertMaterial({ color: a[ranNums[m]] }),
                    .4, // medium friction
                    .4 // medium restitution
                );
                m++;
                block = new Physijs.BoxMesh(block_geometry, block_material);
                block.position.y = (block_height / 2) + block_height * i - 8;
                if (i % 2 === 0) {
                    block.rotation.y = Math.PI / 2.01; // #TODO: There's a bug somewhere when this is to close to 2
                    block.position.x = block_offset * j - (block_offset * 3 / 2 - block_offset / 2);
                } else {
                    block.position.z = block_offset * j - (block_offset * 3 / 2 - block_offset / 2);
                }
                block.receiveShadow = true;
                block.castShadow = true;
                this.scene.add(block);
                this.objects.push(block);
            }
        }
    },
    addSkybox: function() {
        var iSBrsize = 500;
        var uniforms = {
            topColor: { type: "c", value: new THREE.Color(0x0077ff) },
            bottomColor: { type: "c", value: new THREE.Color(0xffffff) },
            offset: { type: "f", value: iSBrsize },
            exponent: { type: "f", value: 1.5 }
        }

        var skyGeo = new THREE.SphereGeometry(iSBrsize, 32, 32);
        skyMat = new THREE.ShaderMaterial({ vertexShader: sbVertexShader, fragmentShader: sbFragmentShader, uniforms: uniforms, side: THREE.DoubleSide, fog: false });
        skyMesh = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(skyMesh);
    },
    onDocumentMouseDown: function(event) {
        // Get mouse position
        var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

        // Get 3D vector from 3D mouse position using 'unproject' function
        var vector = new THREE.Vector3(mouseX, mouseY, 1);
        vector.unproject(objs.camera);

        // Set the raycaster position
        objs.raycaster.set(objs.camera.position, vector.sub(objs.camera.position).normalize());

        // Find all intersected objects
        var intersects = objs.raycaster.intersectObjects(objs.objects);

        if (intersects.length > 0) {
            // Disable the controls
            objs.controls.enabled = false;

            // Set the selection - first intersected object
            objs.selection = intersects[0].object;
            vector.set(0, 0, 0);
            objs.selection.setAngularFactor(vector);
            objs.selection.setAngularVelocity(vector);
            objs.selection.setLinearFactor(vector);
            objs.selection.setLinearVelocity(vector);

            objs.mouse_position.copy(intersects[0].point);
            objs.offset.subVectors(objs.selection.position, objs.mouse_position);
            objs.plane.position.y = objs.mouse_position.y;
        }
    },
    onDocumentMouseMove: function(event) {
        event.preventDefault();

        // Get mouse position
        var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

        // Get 3D vector from 3D mouse position using 'unproject' function
        var vector = new THREE.Vector3(mouseX, mouseY, 1);
        vector.unproject(objs.camera);

        // Set the raycaster position
        objs.raycaster.set(objs.camera.position, vector.sub(objs.camera.position).normalize());

        if (objs.selection) {
            // Check the position where the plane is intersected
            var intersects = objs.raycaster.intersectObject(objs.plane);
            // Reposition the object based on the intersection point with the plane
            objs.selection.position.copy(intersects[0].point.sub(objs.offset));
        } else {
            // Update position of the plane if need
            var intersects = objs.raycaster.intersectObjects(objs.objects);
            if (intersects.length > 0) {
                objs.plane.position.copy(intersects[0].object.position);
                objs.plane.lookAt(objs.camera.position);
            }
        }
    },
    onDocumentMouseUp: function(event) {
        // Enable the controls
        var vector = new THREE.Vector3();
        
        if(objs.selection !== null){
            vector.set(1, 1, 1);
            objs.selection.setAngularFactor(vector);
            objs.selection.setLinearFactor(vector);
            objs.controls.enabled = true;
            objs.selection = null;
        }
        
    },
    onDocumentMouseWheel: function(event) {
        var fovMAX = 160;
        var fovMIN = 1;

        objs.camera.fov -= event.wheelDeltaY * 0.05;
        objs.camera.fov = Math.max( Math.min( camera.fov, fovMAX ), fovMIN );
        objs.camera.projectionMatrix = new THREE.Matrix4().makePerspective(camera.fov, window.innerWidth / window.innerHeight, camera.near, camera.far);
    },
};

// Animate the scene
function animate() {
    requestAnimationFrame(animate);
    render();
    update();
}

function update() {
    var delta = objs.clock.getDelta();

    objs.controls.update(delta);
}

// Render the scene
function render() {
    if (objs.renderer) {
        objs.renderer.render(objs.scene, objs.camera);
    }
}

// Initialize lesson on page load
function initializeLesson() {
    objs.init();
    animate();
}

if (window.addEventListener)
    window.addEventListener('load', initializeLesson, false);
else if (window.attachEvent)
    window.attachEvent('onload', initializeLesson);
else window.onload = initializeLesson;
