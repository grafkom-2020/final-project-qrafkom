Physijs.scripts.worker = 'js/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

var scene, render, renderer, camera,
    table, table_material, intersect_plane,
    blocks = [], block_material, selected_block = null,
    block_offset = new THREE.Vector3, v3 = new THREE.Vector3;

initScene = function () {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    document.getElementById('canvas').appendChild(renderer.domElement);

    scene = new Physijs.Scene({ fixedTimeStep: 1 / 120 });
    scene.setGravity(new THREE.Vector3(0, -10, 0));
    scene.addEventListener(
        'update',
        function () {
            if (selected_block !== null) {

                v3.copy(mouse_position).add(block_offset).sub(selected_block.position).multiplyScalar(5);
                v3.y = 0;
                selected_block.setLinearVelocity(v3);

                // Reactivate all of the blocks
                v3.set(0, 0, 0);
                for (i = 0; i < blocks.length; i++) {
                    blocks[i].applyCentralImpulse(v3);
                }
            }
            scene.simulate();
        }
    );

    camera = new THREE.PerspectiveCamera(35, window.innerWidth/window.innerHeight, 1, 1000);
    camera.position.set( 25, 20, 25 );
	camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
    scene.add(camera);
    
	THREEx.WindowResize(renderer, camera);
	
	var ambientLight = new THREE.AmbientLight( 0x444444 );
	scene.add( ambientLight );

	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
	scene.add( directionalLight );

    // Add table
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

    // Add blocks
    var block_length = 6,
        block_height = 1,
        block_width = 1.5,
        block_offset = 2,
        block_material,
        block_geometry = new THREE.BoxGeometry(block_length, block_height, block_width);
    var i, j, rows = 15, cols = 3;
    var nums = [
                    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 
                    16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 
                    31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45
                ],
        ranNums = [],
        len = nums.length,
        idnums = 0,
        flag = 0;

    // Randomize color indexes
    while (len--) {
        idnums = Math.floor(Math.random() * (len + 1));
        ranNums.push(nums[idnums]);
        nums.splice(idnums, 1);
    }
    
    for (i = 0; i < rows; i++) {
        for (j = 0; j < cols; j++) {
            var a = [];
            a = [' ', 0x3e88c8, 0x3e88c8, 0x3e88c8, 0x3e88c8, 0x3e88c8, 0x3e88c8, 0x3e88c8, 0x3e88c8, 0x3e88c8, 0x3e88c8,
                0xfcd02d, 0xfcd02d, 0xfcd02d, 0xfcd02d, 0xfcd02d, 0xfcd02d, 0xfcd02d, 0xfcd02d, 0xfcd02d, 0xfcd02d,
                0xca4097, 0xca4097, 0xca4097, 0xca4097,
                0x408c57, 0x408c57, 0x408c57, 0x408c57, 0x408c57, 0x408c57, 0x408c57, 0x408c57, 0x408c57, 0x408c57,
                0xe6344e, 0xe6344e, 0xe6344e, 0xe6344e, 0xe6344e, 0xe6344e, 0xe6344e, 0xe6344e, 0xe6344e, 0xe6344e, 0xe6344e, 0xe6344e
			];
			
            block_material = Physijs.createMaterial(
                new THREE.MeshLambertMaterial({ color: a[ranNums[flag]] }),
                .4, // medium friction
                .4 // medium restitution
			);

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
			
			flag++;
        }
    }

    intersect_plane = new THREE.Mesh(
        new THREE.PlaneGeometry(150, 150),
        new THREE.MeshBasicMaterial({ opacity: 0, transparent: true })
	);
	
    intersect_plane.rotation.x = Math.PI / -2;
    scene.add(intersect_plane);

    requestAnimationFrame(render);
    scene.simulate();
};

render = function () {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
};

window.onload = initScene;