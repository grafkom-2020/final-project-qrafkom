Physijs.scripts.worker = 'js/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

var initScene, initEventHandling, render, createTower, loader,
    renderer, scene, dir_light, am_light, camera, controls,
    table, blocks = [],
    table_material, block_material, intersect_plane,
    selected_block = null,
    mouse_position = new THREE.Vector3,
    block_offset = new THREE.Vector3,
    _i, _v3 = new THREE.Vector3;

initScene = function() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    document.getElementById('viewport').appendChild(renderer.domElement);

    scene = new Physijs.Scene({ fixedTimeStep: 1 / 120 });
    scene.setGravity(new THREE.Vector3(0, -30, 0));
    scene.addEventListener(
        'update',
        function() {
            if (selected_block !== null) {

                _v3.copy(mouse_position).add(block_offset).sub(selected_block.position).multiplyScalar(5);
                _v3.y = 0;
                selected_block.setLinearVelocity(_v3);

                // Reactivate all of the blocks
                _v3.set(0, 0, 0);
                for (_i = 0; _i < blocks.length; _i++) {
                    blocks[_i].applyCentralImpulse(_v3);
                }
            }
            scene.simulate(undefined, 1);
        }
    );

    camera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    camera.position.set(25, 20, 25);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(camera);

    THREEx.WindowResize(renderer, camera);

    controls = new THREE.OrbitControls(camera);
    controls.target = new THREE.Vector3(0, 0, 0);
    controls.maxDistance = 150;

    // ambient light
    am_light = new THREE.AmbientLight(0x444444);
    scene.add(am_light);
    // directional light
    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(20, 25, -5);
    directionalLight.target.position.copy(scene.position);
    directionalLight.castShadow = true;
    directionalLight.shadowMapWidth = directionalLight.shadowMapHeight = 2048;
    directionalLight.shadowDarkness = .7;
    directionalLight.shadowCameraLeft = -25;
    directionalLight.shadowCameraTop = -25;
    directionalLight.shadowCameraRight = 25;
    directionalLight.shadowCameraBottom = 25;
    directionalLight.shadowCameraNear = 20;
    directionalLight.shadowCameraFar = 150;
    directionalLight.shadowBias = -.0001;
    scene.add(directionalLight);
    // Loader
    loader = new THREE.TextureLoader();

    var table_material;
    table_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({
            color: 'white'
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
    table.position.y = (1 / 2) - 8;
    table.receiveShadow = true;
    scene.add(table);

    createTower();

    intersect_plane = new THREE.Mesh(
        new THREE.PlaneGeometry(150, 150),
        new THREE.MeshBasicMaterial({ opacity: 0, transparent: true })
    );
    intersect_plane.rotation.x = Math.PI / -2;
    scene.add(intersect_plane);

    initEventHandling();
    requestAnimationFrame(render);
    scene.simulate();
};

render = function() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
};

createTower = (function() {
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
            block = new Physijs.BoxMesh(
                block_geometry,
                block_material,
                0.01
            );
            block.position.y = (block_height / 2) + block_height * i - 8 + 1;
            if (i % 2 === 0) {
                block.rotation.y = Math.PI / 2.01; // #TODO: There's a bug somewhere when this is to close to 2
                block.position.x = block_offset * j - (block_offset * 3 / 2 - block_offset / 2);
            } else {
                block.position.z = block_offset * j - (block_offset * 3 / 2 - block_offset / 2);
            }
            block.receiveShadow = true;
            block.castShadow = true;
            scene.add(block);
            blocks.push(block);
        }
    }
});

initEventHandling = (function() {
    var _vector = new THREE.Vector3,
        handleMouseDown, handleMouseMove, handleMouseUp, handleMouseWheel;

    handleMouseDown = function(evt) {
        var ray, intersections;

        _vector.set(
            (evt.clientX / window.innerWidth) * 2 - 1, -(evt.clientY / window.innerHeight) * 2 + 1,
            1
        );
        _vector.unproject(camera);

        ray = new THREE.Raycaster(camera.position, _vector.sub(camera.position).normalize());
        intersections = ray.intersectObjects(blocks);
        if (intersections.length > 0) {
            controls.enabled = false;
            selected_block = intersections[0].object;

            _vector.set(0, 0, 0);
            selected_block.setAngularFactor(_vector);
            selected_block.setAngularVelocity(_vector);
            selected_block.setLinearFactor(_vector);
            selected_block.setLinearVelocity(_vector);
            mouse_position.copy(intersections[0].point);
            block_offset.subVectors(selected_block.position, mouse_position);
            // block_offset.copy(intersections[0].point).sub(intersect_plane.position)

            intersect_plane.position.y = mouse_position.y;
        }
    };

    handleMouseMove = function(evt) {


        var ray, intersection,
            i, scalar;

        if (selected_block !== null) {

            _vector.set(
                (evt.clientX / window.innerWidth) * 2 - 1, -(evt.clientY / window.innerHeight) * 2 + 1,
                1
            );
            _vector.unproject(camera);

            ray = new THREE.Raycaster(camera.position, _vector.sub(camera.position).normalize());
            intersection = ray.intersectObject(intersect_plane);
            mouse_position.copy(intersection[0].point);
        }

        // var ray, intersection,
        // 	i, scalar;

        // _vector.set(
        // 	( evt.clientX / window.innerWidth ) * 2 - 1,
        // 	-( evt.clientY / window.innerHeight ) * 2 + 1,
        // 	1
        // );
        // _vector.unproject( camera );

        // ray = new THREE.Raycaster( camera.position, _vector.sub( camera.position ).normalize() );

        // if ( selected_block !== null ) {

        // 	intersection = ray.intersectObject( intersect_plane );
        // 	selected_block.position.copy(intersection[0].point.sub(block_offset));

        // }
        // else{

        // 	intersection = ray.intersectObject(blocks);
        // 	if(intersection.length > 0){
        // 		plane.position.copy(intersection[0].object.position);
        // 		plane.lookAt(camera.position);
        // 	}

        // }

    };

    handleMouseUp = function(evt) {

        if (selected_block !== null) {
            _vector.set(1, 1, 1);
            selected_block.setAngularFactor(_vector);
            selected_block.setLinearFactor(_vector);
            controls.enabled = true;
            selected_block = null;
        }

    };

    handleMouseWheel = function(evt) {
        var fovMAX = 160;
        var fovMIN = 1;
        camera.fov -= event.wheelDeltaY * 0.05;
        camera.fov = Math.max(Math.min(camera.fov, fovMAX), fovMIN);
        camera.projectionMatrix = new THREE.Matrix4().makePerspective(camera.fov, window.innerWidth / window.innerHeight, camera.near, camera.far);

    };

    return function() {
        renderer.domElement.addEventListener('mousedown', handleMouseDown);
        renderer.domElement.addEventListener('mousemove', handleMouseMove);
        renderer.domElement.addEventListener('mouseup', handleMouseUp);
        renderer.domElement.addEventListener('mousewheel', handleMouseWheel);
    };
})();

window.onload = initScene;