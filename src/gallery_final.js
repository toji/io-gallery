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

// 360 Photo Viewer

import RayInput from '../node_modules/ray-input';
import WebVRPolyfill from '../node_modules/webvr-polyfill';
import * as webvrui from '../node_modules/webvr-ui';

/* global THREE */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "WebVRPolyfill" }] */

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

const thumbDeltaAngle = Math.PI / 10;
const thumbStartAngle = Math.PI * 1.25;
const thumbHeight = -0.5;
const thumbDistance = 1.0;
const thumbRotationSpeed = 0.0025;
const thumbDefaultOpacity = 0.3;
const thumbHoverOpacity = 0.9;

let viewerContainer = document.getElementById('viewer');
let gallery2D = document.getElementById('thumbnail-gallery');

let clock = new THREE.Clock();

let camera;
let scene;
let renderer;
let textureLoader;
let viewer;
let gallery3D;
let enterVR;
let rayInput = null;

let vrDisplay;
let vrEffect;
let vrControls;

/**
 * Adds a texture image to the 2D thumbnail gallery
 * @param {THREE.Texture} texture
 */
function addToGallery2D(texture) {
  let thumbnail = document.createElement('div');
  thumbnail.classList.add('thumbnail');
  thumbnail.appendChild(texture.image);
  thumbnail.addEventListener('click', function() {
    viewer.material.map = texture;
  });
  gallery2D.appendChild(thumbnail);
}

/**
 * Adds a texture image to the 3D thumbnail gallery
 * @param {THREE.Texture} texture
 * @param {THREE.Geometry} geometry Geometry for thumbnail
 * @param {number} i Index of thumnail
 */
function addToGallery3D(texture, geometry, i) {
  let thumbMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: thumbDefaultOpacity,
  });

  let thumbnail = new THREE.Mesh(geometry, thumbMaterial);
  thumbnail.position.x = Math.cos(thumbStartAngle + (thumbDeltaAngle * i)) * thumbDistance;
  thumbnail.position.z = Math.sin(thumbStartAngle + (thumbDeltaAngle * i)) * thumbDistance;

  gallery3D.add(thumbnail);
}

/**
 * Initialize the image viewer
 */
function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
  textureLoader = new THREE.TextureLoader();

  // Main image viewer

  let viewerGeometry = new THREE.SphereGeometry(500, 60, 40);
  viewerGeometry.scale(-1, 1, 1);

  let viewerMaterial = new THREE.MeshBasicMaterial({map: textureLoader.load(galleryImages[0])});

  viewer = new THREE.Mesh(viewerGeometry, viewerMaterial);
  viewer.rotation.y = -Math.PI / 2;
  scene.add(viewer);

  // Thumbnail galleries

  gallery3D = new THREE.Object3D();
  gallery3D.position.y = thumbHeight;
  scene.add(gallery3D);

  let thumbGeometry = new THREE.SphereGeometry(0.15, 60, 40);
  thumbGeometry.scale(-1, 1, 1);

  for (let i = 0; i < galleryImages.length; ++i) {
    let texture = textureLoader.load(galleryImages[i]);
    addToGallery2D(texture);
    addToGallery3D(texture, thumbGeometry, i);
  }

  // Initialize the renderer

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  viewerContainer.appendChild(renderer.domElement);

  // Setup the Three.js WebVR controls and effect

  vrEffect = new THREE.VREffect(renderer);
  vrControls = new THREE.VRControls(camera);

  /**
   * Handler for window resize events
   */
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    if (rayInput) {
      rayInput.setSize(renderer.getSize());
    }
  }
  window.addEventListener('resize', onWindowResize, false);

  // Set up the WebVR UI

  enterVR = new webvrui.EnterVRButton(renderer.domElement, {});
  document.body.appendChild(enterVR.domElement);

  enterVR.getVRDisplay().then((display)=>{
    vrDisplay = display;

    // Initialize RayInput for picking in VR
    rayInput = new RayInput(camera);
    rayInput.setSize(renderer.getSize());
    for (let i = 0; i < gallery3D.children.length; ++i) {
      // Register each selectable thumbnail
      rayInput.add(gallery3D.children[i]);
    }
    scene.add(rayInput.getMesh());

    // Ray Input event handling
    rayInput.on('raydown', (thumbnail) => {
      if (enterVR.isPresenting() && thumbnail) {
        viewer.material.map = thumbnail.material.map;
      }
    });
    rayInput.on('rayover', (thumbnail) => {
      thumbnail.material.opacity = thumbHoverOpacity;
    });
    rayInput.on('rayout', (thumbnail) => {
      thumbnail.material.opacity = thumbDefaultOpacity;
    });
  });

  window.requestAnimationFrame(animate);
}

/**
 * Main render loop
 */
function animate() {
  let delta = clock.getDelta() * 60;

  vrControls.update();

  if (enterVR.isPresenting()) {
    if (rayInput) {
      rayInput.update();
    }
    gallery3D.visible = true;
    for (let i = 0; i < gallery3D.children.length; ++i) {
      let thumbnail = gallery3D.children[i];
      thumbnail.rotation.y += thumbRotationSpeed * delta;
    }
    vrEffect.render(scene, camera);
  } else {
    gallery3D.visible = false;
    renderer.render(scene, camera);
  }

  (vrDisplay ? vrDisplay : window).requestAnimationFrame(animate);
}

init();
