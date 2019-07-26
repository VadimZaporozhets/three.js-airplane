(() => {
    const Colors = {
        red: 0xf25346,
        white: 0xd8d0d1,
        brown: 0x59332e,
        pink: 0xF5986E,
        brownDark: 0x23190f,
        blue: 0x68c3c0,
    };

    let scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container;

    const createScene = () => {
        WIDTH = window.innerWidth;
        HEIGHT = window.innerHeight;

        scene = new THREE.Scene();

        scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

        aspectRatio = WIDTH / HEIGHT;
        fieldOfView = 60;
        nearPlane = 1;
        farPlane = 10000;
        camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);

        camera.position.x = 0;
        camera.position.y = 100;
        camera.position.z = 200;

        renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
        renderer.setSize(WIDTH, HEIGHT);
        renderer.shadowMap.enabled = true;

        container = document.getElementById('world');
        container.appendChild(renderer.domElement);

        window.addEventListener('resize', handleWindowResize);
    };

    const handleWindowResize = () => {
        HEIGHT = window.innerHeight;
        WIDTH = window.innerWidth;
        renderer.setSize(WIDTH, HEIGHT);
        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();
    };

    let hemisphereLight, shadowLight, ambientLight;

    const createLights = () => {
        hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9);

        shadowLight = new THREE.DirectionalLight(0xffffff, .9);
        shadowLight.position.set(150, 350, 350);

        shadowLight.castShadow = true;

        shadowLight.shadow.camera.left = -400;
        shadowLight.shadow.camera.right = 400;
        shadowLight.shadow.camera.top = 400;
        shadowLight.shadow.camera.bottom = -400;
        shadowLight.shadow.camera.far = 1;
        shadowLight.shadow.camera.near = 1000;

        shadowLight.shadow.mapSize.width = 2048;
        shadowLight.shadow.mapSize.height = 2048;

        ambientLight = new THREE.AmbientLight(0xdc8874, .5);

        scene.add(ambientLight);
        scene.add(hemisphereLight);
        scene.add(shadowLight);
    };

    class Sea {
        constructor() {
            const geometry = new THREE.CylinderGeometry(600, 600, 800, 40, 10);
            geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

            geometry.mergeVertices();

            const verticesLength = geometry.vertices.length;

            this.waves = [];

            for (let i = 0; i < verticesLength; i++) {
                const vertex = geometry.vertices[i];

                this.waves.push({
                    x: vertex.x,
                    y: vertex.y,
                    z: vertex.z,
                    angle: Math.random() * Math.PI * 2,
                    distance: 5 + Math.random() * 15,
                    speed: .016 + Math.random() * .032
                })
            }

            const material = new THREE.MeshPhongMaterial({
                color: Colors.blue,
                transparent: true,
                opacity: .8,
                flatShading: true
                // shading: THREE.FlatShading
            });

            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.receiveShadow = true;
        }

        moveWaves () {
            const vertices = this.mesh.geometry.vertices;
            const verticesLength = vertices.length;

            for (let i = 0; i < verticesLength; i++) {
                const vertex = vertices[i];
                const vertexProps = this.waves[i];

                vertex.x = vertexProps.x + Math.cos(vertexProps.angle) * vertexProps.distance;
                vertex.y = vertexProps.y + Math.sin(vertexProps.angle) * vertexProps.distance;

                vertexProps.angle += vertexProps.speed;
            }

            this.mesh.geometry.verticesNeedUpdate = true;
            sea.mesh.rotation.z += .005;
        }
    }

    let sea;

    const createSea = () => {
        sea = new Sea();

        sea.mesh.position.y = -600;

        scene.add(sea.mesh);
    };

    class Cloud {
        constructor() {
            this.mesh = new THREE.Object3D();

            const geometry = new THREE.BoxGeometry(20,20,20);
            const material = new THREE.MeshPhongMaterial({
                color: Colors.white
            });

            const nBlocks = 3 + Math.floor(Math.random() * 3);

            for (let i = 0; i < nBlocks; i++) {
                const mesh = new THREE.Mesh(geometry, material);

                mesh.position.x = i * 15;
                mesh.position.y = Math.random() * 10;
                mesh.position.z = Math.random() * 10;
                mesh.rotation.z = Math.random() * Math.PI * 2;
                mesh.rotation.y = Math.random() * Math.PI * 2;

                const size = .1 + Math.random() * .9;
                mesh.scale.set(size, size, size);

                mesh.castShadow = true;
                mesh.receiveShadow = true;

                this.mesh.add(mesh);
            }
        }
    }

    class Sky {
        constructor() {
            this.mesh = new THREE.Object3D();

            this.nClouds = 20;

            const stepAngle = Math.PI * 2 / this.nClouds;

            for (let i = 0; i < this.nClouds; i++ ) {
                const cloud = new Cloud();

                const angle = stepAngle * i;
                const h = 750 + Math.random() * 200;

                cloud.mesh.position.y = Math.sin(angle) * h;
                cloud.mesh.position.x = Math.cos(angle) * h;

                cloud.mesh.rotation.z = angle + Math.PI / 2;

                cloud.mesh.position.z = -400 - Math.random() * 400;

                const scale = 1 + Math.random() * 2;

                cloud.mesh.scale.set(scale, scale, scale);

                this.mesh.add(cloud.mesh);
            }
        }
    }

    let sky;

    const createSky = () => {
        sky = new Sky();
        sky.mesh.position.y = -600;
        scene.add(sky.mesh);
    };

    class Airplane {
        constructor() {
            this.mesh = new THREE.Object3D();

            //Cockpit
            const geomCockpit = new THREE.BoxGeometry(80, 50, 50);
            const materialCockpit = new THREE.MeshPhongMaterial({
                color: Colors.red,
                flatShading: true
            });
            geomCockpit.vertices[4].y-=10;
            geomCockpit.vertices[4].z+=20;
            geomCockpit.vertices[5].y-=10;
            geomCockpit.vertices[5].z-=20;
            geomCockpit.vertices[6].y+=30;
            geomCockpit.vertices[6].z+=20;
            geomCockpit.vertices[7].y+=30;
            geomCockpit.vertices[7].z-=20;
            const cockpit = new THREE.Mesh(geomCockpit, materialCockpit);
            cockpit.castShadow = true;
            cockpit.receiveShadow = true;
            this.mesh.add(cockpit);

            //Engine
            const geomEngine = new THREE.BoxGeometry(20,50,50);
            const matEngine = new THREE.MeshPhongMaterial({color: Colors.white, flatShading: true});
            const engine = new THREE.Mesh(geomEngine, matEngine);
            engine.position.x = 40;
            engine.castShadow = true;
            engine.receiveShadow = true;
            this.mesh.add(engine);

            //Tail
            const geomTail = new THREE.BoxGeometry(15, 20, 5);
            const matTail = new THREE.MeshPhongMaterial({color: Colors.red, flatShading: true});
            const tail = new THREE.Mesh(geomTail, matTail);
            tail.position.set(-35,25,0);
            tail.castShadow = true;
            tail.receiveShadow = true;
            this.mesh.add(tail);

            //Wing
            const geomSideWing = new THREE.BoxGeometry(40,8,150);
            const matSideWing = new THREE.MeshPhongMaterial({color:Colors.red, flatShading: true});
            const sideWing = new THREE.Mesh(geomSideWing, matSideWing);
            sideWing.castShadow = true;
            sideWing.receiveShadow = true;
            this.mesh.add(sideWing);

            //Propeller
            const geomPropeller = new THREE.BoxGeometry(20,10,10);
            const matPropeller = new THREE.MeshPhongMaterial({color:Colors.brown, flatShading: true});
            this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
            this.propeller.castShadow = true;
            this.propeller.receiveShadow = true;

            //Blades
            const geomBlade = new THREE.BoxGeometry(1,100,20);
            const matBlade = new THREE.MeshPhongMaterial({color:Colors.brownDark, flatShading: true});
            const blade = new THREE.Mesh(geomBlade, matBlade);
            blade.position.set(8,0,0);
            blade.castShadow = true;
            blade.receiveShadow = true;
            this.propeller.add(blade);

            this.propeller.position.set(8, 0, 0);
            this.mesh.add(this.propeller);
        }
    }

    let airplane;

    const createPlane = () => {
        airplane = new Airplane();
        airplane.mesh.scale.set(.25, .25, .25);
        airplane.mesh.position.y = 100;
        scene.add(airplane.mesh);
    };

    const mousePos = {x: 0, y: 0};

    const normalize = (v, vmin, vmax, tmin, tmax) => {
        const nv = Math.max(Math.min(v, vmax), vmin);
        const dv = vmax - vmin;
        const pc = (nv - vmin) / dv;
        const dt = tmax - tmin;

        return tmin + (pc * dt);
    };

    const updatePlane = () =>{
        const targetY = normalize(mousePos.y, -.75, .75, 25, 175);

        airplane.mesh.position.y += (targetY - airplane.mesh.position.y) * .1;

        airplane.mesh.rotation.z = (targetY-airplane.mesh.position.y) * .0128;
        airplane.mesh.rotation.x = (airplane.mesh.position.y - targetY) * .0064;

        airplane.propeller.rotation.x += .3;
    };

    const loop = () => {
        sky.mesh.rotation.z += .01;

        sea.moveWaves();
        updatePlane();

        renderer.render(scene, camera);
        requestAnimationFrame(loop);
    };


    const handleMouseMove = (event) => {
        const tx = -1 + (event.clientX / WIDTH) / 2;

        const ty = 1 - (event.clientY / HEIGHT)*2;
        mousePos.x = tx;
        mousePos.y = ty;
    };

    const init = () => {
        createScene();

        createLights();

        createPlane();
        createSea();
        createSky();

        document.addEventListener('mousemove', handleMouseMove, false);

        loop();
    };

    document.addEventListener('DOMContentLoaded', init);
})();
