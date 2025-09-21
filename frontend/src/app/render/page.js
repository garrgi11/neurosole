'use client';
import { throwForMissingRequestStore } from 'next/dist/server/app-render/work-unit-async-storage.external';
import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

const InsoleRenderer = () => {
  const mountRef = useRef(null);
  const [shoeData, setShoeData] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedHandle, setDraggedHandle] = useState(null);
  const [dragPlane, setDragPlane] = useState(null);
  const [stlFileName, setStlFileName] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    weight: '',
    shoeSize: 'US-5',
    defectType: '',
    age: '',
  });

  // Mouse interaction variables (use useRef to persist across renders)
  const mouseRef = useRef(new THREE.Vector2());
  const raycasterRef = useRef(new THREE.Raycaster());

  const handlesRef = useRef([]);          // all handle meshes
  const selectedHandleRef = useRef(null); // currently clicked handle
  const hoveredHandleRef = useRef(null);  // handle under cursor (for hover highlight)

  const dragPlaneRef = useRef(new THREE.Plane());
  const dragOffsetRef = useRef(new THREE.Vector3());

  const originalHandlePositions = useRef({});
  const shoeDataRef = useRef(null);

  const insoleRef = useRef(null);
  const contourLinesRef = useRef([]);

  const controlsRef = useRef(null);
  const velocityRef = useRef(new THREE.Vector3());
  const directionRef = useRef(new THREE.Vector3());
  const moveRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  const clock = useRef(new THREE.Clock());
  const footMeshRef = useRef(null);
  const sceneRef = useRef(null);

  const [meshParams, setMeshParams] = useState({
    heelThickness: 25,
    toeThickness: 3,
    archHeight: 20,
    showWireframe: false,
    showContours: true,
    color: '#E67E22' // Orange color like Gensole
  });

  useEffect(() => {
  shoeDataRef.current = shoeData;
}, [shoeData]);
useEffect(() => {
  if (!shoeDataRef.current || !insoleRef.current) return;

  // Rebuild geometry
  const newGeom = createInsoleGeometry(shoeDataRef.current);
  insoleRef.current.geometry.dispose();
  insoleRef.current.geometry = newGeom;

  // Update wireframe
  insoleRef.current.material.wireframe = meshParams.showWireframe;

  // Update contour line visibility
  contourLinesRef.current.forEach(line => {
    line.visible = meshParams.showContours;
  });
}, [meshParams]);

const handleFormChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};

const handleFormSubmit = (e) => {
  e.preventDefault();
  console.log('Submitted form data:', formData);
};

const handleStlFile = (event) => {
  const scene = sceneRef.current;
  if (!scene) return;
  const file = event.target.files[0];
  if (!file) return;

  // Convert file to URL for STLLoader
  const url = URL.createObjectURL(file);
  setStlFileName(file.name);

  const stlLoader = new STLLoader();
  stlLoader.load(
    url,
    (geometry) => {
      const material = new THREE.MeshPhongMaterial({
        color: 0x66ccff,
        shininess: 40,
        specular: 0x111111,
      });
      const footMesh = new THREE.Mesh(geometry, material);
      footMesh.castShadow = true;
      footMesh.receiveShadow = true;
      footMesh.rotation.x = -Math.PI / 2;
      footMesh.scale.set(0.01, 0.01, 0.01);

      scene.add(footMesh);
      footMeshRef.current = footMesh;
    },
    undefined,
    (err) => {
      console.error('Error loading STL:', err);
    }
  );
};


  // Create smooth insole surface like Gensole
const createInsoleGeometry = (data) => {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const indices = [];
  
  // Combine both inner and outer contours to form a single, closed shape
  const combinedPoints = data.outPoints.concat(data.inPoints.slice().reverse());
  const scale = 0.01;
  
  if (combinedPoints.length === 0) return geometry;
  
  // Create the insole surface by extruding the contour upward with varying thickness
  const contourVertices = [];
  
  // Add contour points as base
  combinedPoints.forEach((point, i) => {
    contourVertices.push(point.x * scale, point.y * scale, 0);
  });
  
  // Find bounds for thickness calculation
  const yValues = combinedPoints.map(p => p.y);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const length = maxY - minY;
  
  // Create top surface with variable thickness
  combinedPoints.forEach((point, i) => {
    // Calculate relative position (0 = heel, 1 = toe)
    const relativeY = (point.y - minY) / length;
    
    // Base thickness varies from heel to toe
    let thickness = meshParams.heelThickness + (meshParams.toeThickness - meshParams.heelThickness) * relativeY;
    
    // Add arch support in middle region
    const archRegion = relativeY > 0.3 && relativeY < 0.7;
    if (archRegion) {
      const archProgress = (relativeY - 0.3) / 0.4; // 0 to 1 in arch region
      const archCurve = Math.sin(archProgress * Math.PI); // Bell curve
      const centerDistance = Math.abs(point.x) / 100; // Distance from center line
      const archWidth = Math.max(0, 1 - centerDistance * 2); // Arch width falloff
      
      thickness += meshParams.archHeight * archCurve * archWidth;
    }
    
    contourVertices.push(point.x * scale, point.y * scale, thickness * scale);
  });
  
  const pointCount = combinedPoints.length;
  
  // Create triangulated surface using earcut-like approach
  // Bottom face (triangulate from center)
  const centerBottom = [0, (minY + maxY) * 0.5 * scale, 0];
  vertices.push(...centerBottom);
  
  for (let i = 0; i < pointCount; i++) {
    const current = i;
    const next = (i + 1) % pointCount;
    
    vertices.push(...contourVertices.slice(current * 3, current * 3 + 3));
    
    // Bottom face triangle
    indices.push(0, current + 1, next + 1);
  }
  
  // Top face (triangulate from center)
  const centerTop = [0, (minY + maxY) * 0.5 * scale, meshParams.heelThickness * 0.5 * scale];
  vertices.push(...centerTop);
  const centerTopIndex = pointCount + 1;
  
  for (let i = 0; i < pointCount; i++) {
    const current = i;
    const next = (i + 1) % pointCount;
    
    vertices.push(...contourVertices.slice((current + pointCount) * 3, (current + pointCount) * 3 + 3));
    
    // Top face triangle (reverse winding)
    indices.push(centerTopIndex, centerTopIndex + next + 1, centerTopIndex + current + 1);
  }
  
  // Side faces
  for (let i = 0; i < pointCount; i++) {
    const next = (i + 1) % pointCount;
    const bottomCurrent = i + 1;
    const bottomNext = next + 1;
    const topCurrent = centerTopIndex + i + 1;
    const topNext = centerTopIndex + next + 1;
    
    // Two triangles per side face
    indices.push(bottomCurrent, topCurrent, bottomNext);
    indices.push(bottomNext, topCurrent, topNext);
  }
  
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  
  return geometry;
};
  
  // Check if point is inside shoe contour using ray casting
  const isPointInsideShoe = (x, y, contourPoints) => {
    let inside = false;
    for (let i = 0, j = contourPoints.length - 1; i < contourPoints.length; j = i++) {
      if (((contourPoints[i].y > y) !== (contourPoints[j].y > y)) &&
          (x < (contourPoints[j].x - contourPoints[i].x) * (y - contourPoints[i].y) / (contourPoints[j].y - contourPoints[i].y) + contourPoints[i].x)) {
        inside = !inside;
      }
    }
    return inside;
  };
  
  // Interpolate thickness from heel to toe
  const interpolateThickness = (v, heelThickness, toeThickness) => {
    // v goes from 0 (heel) to 1 (toe)
    return heelThickness * (1 - v) + toeThickness * v;
  };
  
  // Calculate arch support factor
  const getArchFactor = (x, y, data) => {
    // Arch is typically in the middle section of the foot
    const archStart = data.l * 0.3;
    const archEnd = data.l * 0.7;
    const archWidth = data.w * 0.6;
    
    if (y >= archStart && y <= archEnd && Math.abs(x) <= archWidth / 2) {
      // Gaussian-like curve for arch support
      const lengthFactor = Math.sin((y - archStart) / (archEnd - archStart) * Math.PI);
      const widthFactor = Math.exp(-Math.pow(x / (archWidth / 4), 2));
      return lengthFactor * widthFactor * 0.8;
    }
    return 0;
  };

  // Create contour lines
  const createContourLines = (data) => {
    const lines = [];
    const scale = 0.01;
    
    if (data.inPoints) {
      const innerGeometry = new THREE.BufferGeometry();
      const innerVertices = [];
      data.inPoints.forEach(point => {
        innerVertices.push(point.x * scale, point.y * scale, 0.02);
      });
      innerGeometry.setAttribute('position', new THREE.Float32BufferAttribute(innerVertices, 3));
      const innerMaterial = new THREE.LineBasicMaterial({ color: 0xff4444, linewidth: 2 });
      lines.push(new THREE.Line(innerGeometry, innerMaterial));
    }
    
    if (data.outPoints) {
      const outerGeometry = new THREE.BufferGeometry();
      const outerVertices = [];
      data.outPoints.forEach(point => {
        outerVertices.push(point.x * scale, point.y * scale, 0.02);
      });
      outerGeometry.setAttribute('position', new THREE.Float32BufferAttribute(outerVertices, 3));
      const outerMaterial = new THREE.LineBasicMaterial({ color: 0x4444ff, linewidth: 2 });
      lines.push(new THREE.Line(outerGeometry, outerMaterial));
    }
    
    return lines;
  };

  const createSphereMeshes = (data) => {
    const sphereMeshes = [];
    const scale = 0.01;
    const handleGeometry = new THREE.SphereGeometry(0.03, 16, 16);
    // const handleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    
    const outPoints = data.outPoints || [];
    const inPoints = data.inPoints || [];
    if (outPoints.length === 0) return sphereMeshes;

    // Use the SAME combined points as your insole geometry
    const combinedPoints = outPoints.concat(inPoints.slice().reverse());
    const xValues = combinedPoints.map(p => p.x);
    const yValues = combinedPoints.map(p => p.y);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);

    // Position spheres at the raw coordinate edges (no centering)
    const positions = [
        { x: 0, y: maxY, z: 0.15, name: 'toe' },
        { x: 0, y: minY, z: 0.15, name: 'heel' },
        { x: minX, y: (minY + maxY) / 2, z: 0.15, name: 'left' },
        { x: maxX, y: (minY + maxY) / 2, z: 0.15, name: 'right' },
    ];
    
    positions.forEach(pos => {
        const handle = new THREE.Mesh(handleGeometry, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        handle.rotation.x = -Math.PI / 2;
        handle.position.set(pos.x * scale, 0.15, -pos.y * scale);
        handle.userData = { name: pos.name };
        sphereMeshes.push(handle);
    });

    return sphereMeshes;
};

  useEffect(() => {
    if (!mountRef.current) return;

    const AXES_RENDER_ORDER = 999;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf0f0f0);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;

    // pointer listeners
    renderer.domElement.style.touchAction = 'none';
    const getMouseNDC = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    const onKeyDown = (e) => {
      switch (e.code) {
        case 'ArrowUp':
          moveRef.current.forward = true;
          break;
        case 'ArrowDown':
          moveRef.current.backward = true;
          break;
        case 'ArrowLeft':
          moveRef.current.left = true;
          break;
        case 'ArrowRight':
          moveRef.current.right = true;
          break;
      }
    };

    const onKeyUp = (e) => {
      switch (e.code) {
        case 'ArrowUp':
          moveRef.current.forward = false;
          break;
        case 'ArrowDown':
          moveRef.current.backward = false;
          break;
        case 'ArrowLeft':
          moveRef.current.left = false;
          break;
        case 'ArrowRight':
          moveRef.current.right = false;
          break;
      }
    };

    // Hover highlight (turn handle yellow when hovered)
  const onPointerMove = (event) => {
    getMouseNDC(event);
    raycasterRef.current.setFromCamera(mouseRef.current, camera);
    const intersects = raycasterRef.current.intersectObjects(handlesRef.current, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (hoveredHandleRef.current !== hit) {
        // reset previous hover color
        if (hoveredHandleRef.current) {
          hoveredHandleRef.current.material.color.setHex(0xff0000);
        }
        hoveredHandleRef.current = hit;
        hit.material.color.setHex(0xffff00); // yellow on hover
        renderer.domElement.style.cursor = 'pointer';
      }
    } 
    else {
      if (hoveredHandleRef.current) {
        hoveredHandleRef.current.material.color.setHex(0xff0000);
      }
      hoveredHandleRef.current = null;
      renderer.domElement.style.cursor = '';
    }
    if (selectedHandleRef.current) {
      const intersection = new THREE.Vector3();
      if (
        raycasterRef.current.ray.intersectPlane(
          dragPlaneRef.current,
          intersection
        )
      ) 
        {
          selectedHandleRef.current.position.copy(
            intersection.sub(dragOffsetRef.current)
          );
        }
      }
    };
    // Click select (log which handle you clicked)
    const onPointerDown = (event) => {
      getMouseNDC(event);
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(handlesRef.current, false);

      if (intersects.length > 0) {
        selectedHandleRef.current = intersects[0].object;
        // brief visual feedback
        selectedHandleRef.current.material.color.setHex(0xffaa00); // orange
        // Set drag plane parallel to camera view at clicked point
        dragPlaneRef.current.setFromNormalAndCoplanarPoint(
          camera.getWorldDirection(new THREE.Vector3()).clone().negate(),
          intersects[0].point
        );
        // Calculate offset so handle doesn't jump
        dragOffsetRef.current.copy(intersects[0].point).sub(selectedHandleRef.current.position);
        console.log('Selected handle:', selectedHandleRef.current.userData.name);
      }
    };
    const onPointerUp = () => {
        if (selectedHandleRef.current) {
          const currentData = shoeDataRef.current;
          if (!currentData || !currentData.outPoints || !currentData.inPoints) {
            console.warn('Shoe data not ready yet.');
            selectedHandleRef.current.material.color.setHex(0xff0000);
            selectedHandleRef.current = null;
            return;
          }

        const name = selectedHandleRef.current.userData.name;
        const original = originalHandlePositions.current[name];
        const current = selectedHandleRef.current.position;
        const delta = current.clone().sub(original);

        // Find the bounds of the original data for directional expansion
        const allPoints = [...currentData.outPoints, ...currentData.inPoints];
        const minX = Math.min(...allPoints.map(p => p.x));
        const maxX = Math.max(...allPoints.map(p => p.x));
        const minY = Math.min(...allPoints.map(p => p.y));
        const maxY = Math.max(...allPoints.map(p => p.y));
        const centerX = (minX + maxX) * 0.5;
        const centerY = (minY + maxY) * 0.5;

        // Clone the data
        const newData = JSON.parse(JSON.stringify(currentData));

        // Apply directional expansion based on handle type
        if (name === 'toe') {
          // Only expand points that are in the front half (above center)
          const expansion = -delta.z / 0.01; // Convert back to original scale
          newData.outPoints = newData.outPoints.map(p => ({
            x: p.x,
            y: p.y >= centerY ? p.y + (expansion * (p.y - centerY) / (maxY - centerY)) : p.y
          }));
          newData.inPoints = newData.inPoints.map(p => ({
            x: p.x,
            y: p.y >= centerY ? p.y + (expansion * (p.y - centerY) / (maxY - centerY)) : p.y
          }));
        }
        else if (name === 'heel') {
          // Only expand points that are in the back half (below center)
          const expansion = -delta.z / 0.01; // Negative because heel drags backwards
          newData.outPoints = newData.outPoints.map(p => ({
            x: p.x,
            y: p.y <= centerY ? p.y + (expansion * (centerY - p.y) / (centerY - minY)) : p.y
          }));
          newData.inPoints = newData.inPoints.map(p => ({
            x: p.x,
            y: p.y <= centerY ? p.y + (expansion * (centerY - p.y) / (centerY - minY)) : p.y
          }));
        }
        else if (name === 'left') {
          // Only expand points that are on the left side (negative X)
          const expansion = delta.x / 0.01;
          newData.outPoints = newData.outPoints.map(p => ({
            x: p.x <= centerX ? p.x + (expansion * (centerX - p.x) / (centerX - minX)) : p.x,
            y: p.y
          }));
          newData.inPoints = newData.inPoints.map(p => ({
            x: p.x <= centerX ? p.x + (expansion * (centerX - p.x) / (centerX - minX)) : p.x,
            y: p.y
          }));
        }
        else if (name === 'right') {
          // Only expand points that are on the right side (positive X)
          const expansion = delta.x / 0.01;
          newData.outPoints = newData.outPoints.map(p => ({
            x: p.x >= centerX ? p.x + (expansion * (p.x - centerX) / (maxX - centerX)) : p.x,
            y: p.y
          }));
          newData.inPoints = newData.inPoints.map(p => ({
            x: p.x >= centerX ? p.x + (expansion * (p.x - centerX) / (maxX - centerX)) : p.x,
            y: p.y
          }));
        }

        // Rebuild geometry
        const newGeom = createInsoleGeometry(newData);
        insole.geometry.dispose();
        insole.geometry = newGeom;

        // Update the sphere positions to match the new geometry
        const newHandles = createSphereMeshes(newData);
        handlesRef.current.forEach((handle, index) => {
          if (newHandles[index]) {
            handle.position.copy(newHandles[index].position);
            originalHandlePositions.current[handle.userData.name] = handle.position.clone();
          }
        });

        setShoeData(newData);

        selectedHandleRef.current.material.color.setHex(0xff0000);
        selectedHandleRef.current = null;
      }
    };


    // attach listeners
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('pointerup', onPointerUp);

    // Axes Helper
    const axesHelper = new THREE.AxesHelper(2); // length = 2 units
    scene.add(axesHelper);
    axesHelper.renderOrder = AXES_RENDER_ORDER;
    axesHelper.children.forEach(child => {
      child.material.depthTest = false;
    });

    // Lighting (similar to Gensole)
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Additional lights for better visualization
    const fillLight = new THREE.DirectionalLight(0x9999ff, 0.3);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0xe0e0e0 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0xccccc, 0xcccccc);
    gridHelper.position.y = -0.49;
    scene.add(gridHelper);

    let insole, contourLines = [];

    // Load and render shoe data
    const loader = new THREE.FileLoader();
    loader.load('/shoe.json', (data) => {
      try {
        const parsedData = JSON.parse(data);
        console.log("loaded shoe data", parsedData);
        setShoeData(parsedData);
  
        const insoleGeometry = createInsoleGeometry(parsedData);
        // insoleGeometry.computeBoundingBox();

        // const center = new THREE.Vector3();
        // insoleGeometry.boundingBox.getCenter(center);
        
        // Apply same translation to geometry
        // insoleGeometry.translate(-center.x, -center.y, -center.z);
        // console.log()
        // Create small spheres for the dragging
        const handles = createSphereMeshes(parsedData); 
        handles.forEach(handle => {
          scene.add(handle);
        });
        handlesRef.current = handles;

        handles.forEach(h => {
          originalHandlePositions.current[h.userData.name] = h.position.clone();
        });

        // const translationVector = new THREE.Vector3(-center.x, -center.y, -center.z);/

        // shift so geometry is centered at origin
        const insoleMaterial = new THREE.MeshPhongMaterial({
          color: new THREE.Color(meshParams.color),
          shininess: 60,
          specular: 0x111111,
          transparent: false,
          wireframe: meshParams.showWireframe,
          side: THREE.DoubleSide
        });
        
        insole = new THREE.Mesh(insoleGeometry, insoleMaterial);
        insole.castShadow = true;
        insole.receiveShadow = true;
        insole.rotation.x = -Math.PI/2; // Flip to match Gensole orientation
        scene.add(insole);
        insoleRef.current = insole;
        
        // Add contour lines
        contourLines = createContourLines(parsedData);
        contourLines.forEach(line => {
          // line.geometry.translate(-center.x, -center.y, -center.z);
          line.rotation.x = -Math.PI/2;
          line.visible = meshParams.showContours;
          scene.add(line);
        });
        contourLinesRef.current = contourLines;
        // Position camera
        camera.position.set(0, 2, 5); // 3,2,3
        camera.lookAt(0, 0, 0);
        controls.update();
        
      } catch (error) {
        console.error('Error loading shoe data:', error);
      }
    });

    // STL FOOT LOADER
    // const stlLoader = new STLLoader();
    // stlLoader.load(
    //   '/LeftFoot1.stl', 
    //   (geometry) => {
    //     const material = new THREE.MeshPhongMaterial({
    //       color: 0x66ccff, // light blue foot
    //       shininess: 40,
    //       specular: 0x111111,
    //     });
    //     const footMesh = new THREE.Mesh(geometry, material);
    //     footMesh.castShadow = true;
    //     footMesh.receiveShadow = true;

    //     // Rotate to match your scene orientation (STLs are often Z-up)
    //     footMesh.rotation.x = -Math.PI / 2;

    //     // ✅ Scale down (adjust the factor until the size matches your insole)
    //     footMesh.scale.set(0.01, 0.01, 0.01);

    //     // Position it somewhere visible
    //     footMesh.position.set(0, 0, 0);

    //     scene.add(footMesh);

    //     // Store reference if needed later for dragging
    //     footMeshRef.current = footMesh;
    //   },
    //   undefined,
    //   (error) => {
    //     console.error('Error loading STL:', error);
    //   }
    // );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      const delta = clock.current.getDelta();
      const velocity = velocityRef.current;
      const direction = directionRef.current;

      // Dampen velocity
      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;

      // Determine movement direction
      direction.z = Number(moveRef.current.forward) - Number(moveRef.current.backward);
      direction.x = Number(moveRef.current.right) - Number(moveRef.current.left);
      direction.normalize();

      const speed = 30.0; // adjust to taste
      if (moveRef.current.forward || moveRef.current.backward)
        velocity.z -= direction.z * speed * delta;
      if (moveRef.current.left || moveRef.current.right)
        velocity.x -= direction.x * speed * delta;

      // Move the camera in its local space
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0; // keep movement horizontal
      forward.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(camera.up, forward).normalize();

      camera.position.addScaledVector(forward, -velocity.z * delta);
      camera.position.addScaledVector(right, -velocity.x * delta);

      controls.update();
      renderer.render(scene, camera);
    };

    animate();
    return () => {
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      controls.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // if (!shoeData) {
  //   console.log(shoeData);
  //   return <div>Loading insole...</div>;
  // }

  return (
  <div className="relative w-screen h-screen bg-gradient-to-br from-slate-800 to-slate-900">
    <div ref={mountRef} className="w-full h-full" />

    {/* ===== TOP BAR ===== */}
    <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-4">
      {/* --- Insole Parameters (moved to top-left) --- */}
      <div className="bg-white text-white p-6 rounded-xl backdrop-blur-lg border border-white/20 max-w-sm">
        <h4 className="text-lg font-bold text-green-400 mb-4">Insole Parameters</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Heel Thickness: <span className="text-green-400">{meshParams.heelThickness}mm</span>
            </label>
            <input
              type="range"
              min="15"
              max="40"
              value={meshParams.heelThickness}
              onChange={(e) => setMeshParams({ ...meshParams, heelThickness: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Toe Thickness: <span className="text-green-400">{meshParams.toeThickness}mm</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={meshParams.toeThickness}
              onChange={(e) => setMeshParams({ ...meshParams, toeThickness: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Arch Height: <span className="text-green-400">{meshParams.archHeight}mm</span>
            </label>
            <input
              type="range"
              min="0"
              max="80"
              value={meshParams.archHeight}
              onChange={(e) => setMeshParams({ ...meshParams, archHeight: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg cursor-pointer"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setMeshParams({ ...meshParams, showWireframe: !meshParams.showWireframe })}
              className={`px-4 py-2 text-xs rounded-lg ${meshParams.showWireframe ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              Wireframe
            </button>
            <button
              onClick={() => setMeshParams({ ...meshParams, showContours: !meshParams.showContours })}
              className={`px-4 py-2 text-xs rounded-lg ${meshParams.showContours ? 'bg-green-500' : 'bg-gray-700'}`}
            >
              Contours
            </button>
          </div>
        </div>
      </div>

      {/* --- Patient Information (still top-right) --- */}
      <div className="bg-white text-white p-6 rounded-xl backdrop-blur-lg border border-white/20 max-w-sm">
        <h4 className="text-lg font-bold text-green-400 mb-4">📝 Patient Information</h4>
        <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-gray-400 mb-1">Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              className="w-full px-3 py-2 rounded-lg bg-white border border-black text-black focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleFormChange}
              className="w-full px-3 py-2 rounded-lg bg-white border border-black text-white focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Shoe Size</label>
            <select
              name="shoeSize"
              value={formData.shoeSize}
              onChange={handleFormChange}
              className="w-full px-3 py-2 rounded-lg bg-white border border-black text-black focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {['US-5','US-6','US-7','US-8','US-9','US-10','US-11'].map((size) => (
                <option key={size}>{size}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Defect Type</label>
            <input
              name="defectType"
              value={formData.defectType}
              onChange={handleFormChange}
              className="w-full px-3 py-2 rounded-lg bg-white border border-black text-black focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleFormChange}
              className="w-full px-3 py-2 rounded-lg bg-white text-black border border-black focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 py-2 rounded-lg font-semibold"
          >
            Generate Insole
          </button>
        </form>
      </div>
    </div>

    {/* ===== BOTTOM CENTER ===== */}
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-white p-6 rounded-xl backdrop-blur-lg border border-white/20 max-w-sm">
      <h4 className="text-lg font-bold text-green-400 mb-4">Load Foot STL</h4>
      <input
        type="file"
        accept=".stl"
        onChange={handleStlFile}
        className="block w-full text-sm text-gray-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700
                  cursor-pointer"
      />
      {stlFileName && (
        <p className="mt-3 text-xs text-gray-400">
          Loaded: <span className="text-blue-300">{stlFileName}</span>
        </p>
      )}
    </div>
  </div>
)};




export default InsoleRenderer;