//-------------------------------------------------
// Title: CMPE360 Project02 - The Museum of Precious Metals & Minerals
// Authors: BATURALP KIZILTAN & KAYRA POLAT
// IDs: 4456996054 & 1000306178
// Section: 1
// Project: 2
//-------------------------------------------------

import * as THREE from './lib/three.js-r147/build/three.module.js';
import { MTLLoader } from './lib/three.js-r147/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from './lib/three.js-r147/examples/jsm/loaders/OBJLoader.js';
import { PointerLockControls } from './lib/three.js-r147/examples/jsm/controls/PointerLockControls.js';
import { RGBELoader } from './lib/three.js-r147/examples/jsm/loaders/RGBELoader.js';

// Set up the camera
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-10, 3, -19);
camera.rotateY(-1 * 5 * (Math.PI / 6));

// Set up the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333);
initializeModels();
initializeLighting();

// Set up the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animationFn);
renderer.shadowMap.type = THREE.BasicShadowMap;
renderer.shadowMap.enabled = true;

// Set up the skybox and wrap the environment map texture
const pmremGenerator = new THREE.PMREMGenerator(renderer);
new RGBELoader().setDataType(THREE.HalfFloatType).load('res/chinese_garden_2k.hdr', texture => {
  var envMap = pmremGenerator.fromEquirectangular(texture).texture;

  scene.background = envMap;
  scene.environment = envMap;

  texture.dispose();
  pmremGenerator.dispose();
});
pmremGenerator.compileEquirectangularShader();

// Set up for camera controls
const controls = new PointerLockControls(camera, renderer.domElement);

// Attach the renderer to DOM
document.body.appendChild(renderer.domElement);

/**
 * Sets up all objects in the scene - both the ones loaded from
 * '.obj' file and the ones builts from scratch. Applies textures,
 * materials and tweaks positions.
 */
function initializeModels() {
  // #1 Surface
  const surface = new THREE.Mesh(
    new THREE.PlaneGeometry(40.0, 40.0),
    new THREE.RawShaderMaterial({
      uniforms: {
        mouse: { value: new THREE.Vector2(0.5, 0.5) },
        resolution: { value: new THREE.Vector2(0.6, 0.5) },
      },
      vertexShader: document.getElementById('vertex-shader').textContent,
      fragmentShader: document.getElementById('fragment-shader').textContent,
      side: THREE.DoubleSide,
    }),
  );
  surface.rotateX(-Math.PI / 2);
  surface.name = 'plane';
  scene.add(surface);

  // #2 Wall
  const wall = new THREE.Mesh(new THREE.BoxGeometry(28, 9, 2), new THREE.MeshNormalMaterial());
  wall.rotateY(Math.PI / 2);
  wall.position.set(-15, 4.51, 0);
  wall.name = 'wall';
  scene.add(wall);

  // #3 Art Table
  const artTable = new THREE.Mesh(new THREE.BoxGeometry(14, 4.5, 0.1), [
    new THREE.MeshBasicMaterial({ color: 0x000000 }),
    new THREE.MeshBasicMaterial({ color: 0x000000 }),
    new THREE.MeshBasicMaterial({ color: 0x000000 }),
    new THREE.MeshBasicMaterial({ color: 0x000000 }),
    new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load('res/pexels-frank-cone-4233216.jpg'),
    }),
    new THREE.MeshBasicMaterial({ color: 0x000000 }),
  ]);
  artTable.rotateY(Math.PI / 2);
  artTable.position.set(-13.94, 4.5, 0);
  scene.add(artTable);

  // #4: Diamond
  let mtlLoader = new MTLLoader();
  mtlLoader.setPath('res/');
  mtlLoader.load('diamond.mtl', mats => {
    mats.preload();
    let objLoader = new OBJLoader();
    objLoader.setMaterials(mats);
    objLoader.load(
      './res/diamond.obj',
      /** @param {Object3D} obj  */
      obj => {
        obj.name = 'diamond';
        obj.position.set(1.5, 1, 1.75);
        scene.add(obj);
        renderer.render(scene, camera);
      },
      _ => {},
      console.error,
    );
  });

  // #5 Display Stands
  const standMat = [
    new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load('res/pexels-henry-&-co-1939485.jpg'),
    }),
    new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load('res/pexels-henry-&-co-1939485.jpg'),
    }),
    new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load('res/pexels-henry-&-co-1939485.jpg'),
    }),
    new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load('res/pexels-henry-&-co-1939485.jpg'),
    }),
    new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load('res/pexels-henry-&-co-1939485.jpg'),
    }),
    new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load('res/pexels-henry-&-co-1939485.jpg'),
    }),
  ];

  const stand1 = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), standMat);
  const stand2 = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), standMat);
  const stand3 = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), standMat);
  stand1.name = 'stand1';
  stand2.name = 'stand2';
  stand3.name = 'stand3';
  stand1.position.set(15, 1, -12);
  stand2.position.set(15, 1, 0);
  stand3.position.set(15, 1, 12);
  scene.add(stand1, stand2, stand3);

  // #6 Palladium Disc
  const palladium = new THREE.Mesh(
    new THREE.RingGeometry(0.3, 1, 7, 9),
    new THREE.MeshPhongMaterial({
      color: 0x78797d,
      specular: 0x736e6e,
      shininess: 20,
      side: THREE.DoubleSide,
    }),
  );
  palladium.name = 'palladium';
  palladium.rotateY(Math.PI / 2);
  palladium.position.set(15, 3, -12);
  scene.add(palladium);

  // #7 Dark Crystal
  mtlLoader.load('crystal.mtl', mats => {
    mats.preload();
    let objLoader = new OBJLoader();
    objLoader.setMaterials(mats);
    objLoader.load(
      './res/crystal.obj',
      /** @param {Object3D} obj  */
      obj => {
        obj.name = 'crystal';
        obj.position.set(15, 3, 0);
        obj.scale.set(0.7, 0.7, 0.7);
        scene.add(obj);
        renderer.render(scene, camera);
      },
      _ => {},
      console.error,
    );
  });

  // #8 Gold Bar
  mtlLoader.load('gold.mtl', mats => {
    mats.preload();
    let objLoader = new OBJLoader();
    objLoader.setMaterials(mats);
    objLoader.load(
      './res/gold.obj',
      /** @param {Object3D} obj  */
      obj => {
        obj.name = 'gold';
        obj.rotateX(Math.PI / 2);
        obj.rotateZ(Math.PI / 2);
        obj.position.set(15, 3, 12);
        scene.add(obj);
        renderer.render(scene, camera);
      },
      _ => {},
      console.error,
    );
  });

  // #9 White Wall
  const whiteWall = new THREE.Mesh(new THREE.BoxGeometry(28, 9, 2), new THREE.MeshBasicMaterial());
  whiteWall.rotateY(Math.PI / 2);
  whiteWall.position.set(17, 3.5, 0);
  whiteWall.name = 'whiteWall';
  scene.add(whiteWall);
}

/**
 * Sets up lights for the whole map, including the sky light and
 * lights for objects.
 */
function initializeLighting() {
  //
  // -- Sky Lighting --
  scene.add(new THREE.HemisphereLight(0xffffcc, 0x19bbdc, 1));

  //
  // -- Lighting for Gold Bar --
  // Directional light
  const gb_DL = new THREE.DirectionalLight(0xffff00, 0.15);
  gb_DL.position.set(0, 3, 25);
  gb_DL.target.position.set(15, 3, 12);
  gb_DL.castShadow = true;
  scene.add(gb_DL, new THREE.DirectionalLightHelper(gb_DL, 1));

  // -- Lighting for Dark Crystal --
  // Point light #1
  const dc_PL1 = new THREE.PointLight(0xff0000, 1.0, 5);
  dc_PL1.castShadow = true;
  dc_PL1.position.set(15, 3, 2);
  scene.add(dc_PL1 /*, new THREE.PointLightHelper(dc_PL1)*/);

  // Point light #2
  const dc_PL2 = new THREE.PointLight(0x0000ff, 1.0, 5);
  dc_PL2.castShadow = true;
  dc_PL2.position.set(15, 3, -2);
  scene.add(dc_PL2 /*, new THREE.PointLightHelper(dc_PL2)*/);

  // -- Lighting for Palladium Disc --
  // Point light
  const pd_PL = new THREE.PointLight(0xffff00, 1.0, 5);
  pd_PL.castShadow = true;
  pd_PL.position.set(13, 3, -9);
  scene.add(pd_PL /*, new THREE.PointLightHelper(pd_PL)*/);
}

let ActiveCameraActions = {
  Ascending: false,
  Descending: false,
  HeadingRight: false,
  HeadingLeft: false,
  WalkForward: false,
  WalkBackward: false,
};

let DiamondIsAscending = true;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let prevTime = performance.now();

/**
 * This is the animation loop function. Called for each
 * animation frame. Enables animations for certain objects and
 * updates camera control properties for moving around the map.
 */
function animationFn(time) {
  // -- Animate certain objects --
  const crystal = scene.getObjectByName('crystal');
  if (crystal) {
    crystal.rotation.y = time / 400;
  }

  const diamond = scene.getObjectByName('diamond');
  if (diamond) {
    diamond.rotation.y = time / 800;

    if (diamond.position.y >= 7) {
      DiamondIsAscending = false;
    }
    if (diamond.position.y <= 1) {
      DiamondIsAscending = true;
    }
    if (DiamondIsAscending) {
      diamond.position.y += 0.05;
    } else {
      diamond.position.y -= 0.05;
    }
  }

  const palladium = scene.getObjectByName('palladium');
  if (palladium) {
    palladium.rotation.z = time / 700;
  }

  // -- Update camera controls --
  if (controls.isLocked === true) {
    const delta = (time - prevTime) / 1000;

    // Apply friction force
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    // Determine the directions and normalize
    direction.z =
      Number(ActiveCameraActions.WalkForward) - Number(ActiveCameraActions.WalkBackward);
    direction.x =
      Number(ActiveCameraActions.HeadingRight) - Number(ActiveCameraActions.HeadingLeft);
    direction.normalize();

    // Accelarate the camera according to keys and the directions
    if (ActiveCameraActions.WalkForward || ActiveCameraActions.WalkBackward) {
      velocity.z -= direction.z * 100.0 * delta;
    }
    if (ActiveCameraActions.HeadingLeft || ActiveCameraActions.HeadingRight) {
      velocity.x -= direction.x * 100.0 * delta;
    }

    // Apply velocity vectors to the camera
    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    // Change the camera height
    if (ActiveCameraActions.Ascending) {
      camera.position.y += Math.PI * 0.05;
    }
    if (ActiveCameraActions.Descending) {
      camera.position.y -= Math.PI * 0.05;
    }

    // Check the map boundaries for each direction: x, z, y
    if (controls.getObject().position.x >= 20) {
      velocity.x = 0;
      controls.getObject().position.x = 20;
    }
    if (controls.getObject().position.x <= -20) {
      velocity.x = 0;
      controls.getObject().position.x = -20;
    }

    if (controls.getObject().position.z >= 20) {
      velocity.z = 0;
      controls.getObject().position.z = 20;
    }
    if (controls.getObject().position.z <= -20) {
      velocity.z = 0;
      controls.getObject().position.z = -20;
    }

    if (controls.getObject().position.y >= 10) {
      velocity.y = 0;
      controls.getObject().position.y = 10;
    }
    if (controls.getObject().position.y <= 1) {
      velocity.y = 0;
      controls.getObject().position.y = 1;
    }
  }

  prevTime = time;
  renderer.render(scene, camera);
}

// Lock for the camera controller
window.addEventListener('click', _ => {
  controls.lock();
});

// Turn on/off intro panel
const intro = document.getElementById('intro-panel');
controls.addEventListener('lock', function () {
  intro.style.display = 'none';
});
controls.addEventListener('unlock', function () {
  intro.style.display = 'block';
});

// When a key is pressed, activate the proper action
window.addEventListener('keydown', e => {
  switch (e.code) {
    case 'ShiftRight':
    case 'ShiftLeft': {
      ActiveCameraActions.Ascending = true;
      break;
    }
    case 'Space': {
      ActiveCameraActions.Descending = true;
      break;
    }
    case 'KeyD': {
      ActiveCameraActions.HeadingRight = true;
      break;
    }
    case 'KeyA': {
      ActiveCameraActions.HeadingLeft = true;
      break;
    }
    case 'KeyW': {
      ActiveCameraActions.WalkForward = true;
      break;
    }
    case 'KeyS': {
      ActiveCameraActions.WalkBackward = true;
      break;
    }
  }
});

// When a key is released, disable the proper action
window.addEventListener('keyup', e => {
  switch (e.code) {
    case 'ShiftRight':
    case 'ShiftLeft': {
      ActiveCameraActions.Ascending = false;
      break;
    }
    case 'Space': {
      ActiveCameraActions.Descending = false;
      break;
    }
    case 'KeyD': {
      ActiveCameraActions.HeadingRight = false;
      break;
    }
    case 'KeyA': {
      ActiveCameraActions.HeadingLeft = false;
      break;
    }
    case 'KeyW': {
      ActiveCameraActions.WalkForward = false;
      break;
    }
    case 'KeyS': {
      ActiveCameraActions.WalkBackward = false;
      break;
    }
  }
});
