/*
 * Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Step 2: Polyfill and VRControls

// Adds the WebVR polyfill and VRControlls for basic click-and-drag and magic
// window viewing.

// 360 Photo Viewer

import WebVRPolyfill from '../node_modules/webvr-polyfill';

let galleryImages = [
'media/images/image0.jpg',
'media/images/image1.jpg',
'media/images/image2.jpg',
'media/images/image3.jpg',
'media/images/image4.jpg',
'media/images/image5.jpg',
'media/images/image6.jpg',
'media/images/image7.jpg',
];

let viewerContainer = document.getElementById('viewer');

let clock = new THREE.Clock();

let camera;
let scene;
let renderer;
let textureLoader;
let viewer;

let vrControls;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
  textureLoader = new THREE.TextureLoader();

  // Image viewer
  let viewerGeometry = new THREE.SphereGeometry(500, 60, 40);
  viewerGeometry.scale(-1, 1, 1);

  let viewerMaterial = new THREE.MeshBasicMaterial({map: textureLoader.load(galleryImages[0])});

  viewer = new THREE.Mesh(viewerGeometry, viewerMaterial);
  viewer.rotation.y = -Math.PI / 2;
  scene.add(viewer);

  // Initialize the renderer
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  viewerContainer.appendChild(renderer.domElement);

  vrControls = new THREE.VRControls(camera);

  // Handle window resizing
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onWindowResize, false);

  animate();
}

/**
 * Main render loop
 */
function animate() {
  let delta = clock.getDelta() * 60;

  vrControls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(animate);
}

init();
