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

// Step 4: WebVR UI

// The WebVR UI button and VREffect for simple VR presentation mode

// 360 Photo Viewer

import WebVRPolyfill from '../node_modules/webvr-polyfill';
import * as webvrui from '../node_modules/webvr-ui';

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
let gallery2D = document.getElementById('thumbnail-gallery');

let clock = new THREE.Clock();

let camera;
let scene;
let renderer;
let textureLoader;
let viewer;
let enterVR;

let vrControls;
let vrEffect;
let vrDisplay;

function addToGallery2D(texture) {
  let thumbnail = document.createElement('div');
  thumbnail.classList.add('thumbnail');
  thumbnail.appendChild(texture.image);
  thumbnail.addEventListener('click', function() {
    viewer.material.map = texture;
  });
  gallery2D.appendChild(thumbnail);
}

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

  // Thumbnail Gallery
  for (let i = 0; i < galleryImages.length; ++i) {
    let texture = textureLoader.load(galleryImages[i]);
    addToGallery2D(texture);
  }

  // Initialize the renderer
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  viewerContainer.appendChild(renderer.domElement);

  vrControls = new THREE.VRControls(camera);
  vrEffect = new THREE.VREffect(renderer);

  // WebVR Button
  enterVR = new webvrui.EnterVRButton(renderer.domElement, {});
  document.body.appendChild(enterVR.domElement);

  enterVR.getVRDisplay().then((display)=>{
    vrDisplay = display;
  });

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

  if (enterVR.isPresenting()) {
    vrEffect.render(scene, camera);
  } else {
    renderer.render(scene, camera);
  }

  (vrDisplay ? vrDisplay : window).requestAnimationFrame(animate);
}

init();
