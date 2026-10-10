// ==============================================================================
// CareSaathi AI - Premium 3D Healthcare Animation Centerpiece
// Features: Translucent Glass Medical Orb, Pulsing Heartbeat Nucleus,
// Orbiting Glowing Rings, Floating 3D Medical Cross & Capsule,
// Mouse Parallax, Entrance Easing & Graceful WebGL Fallback.
// ==============================================================================

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Healthcare3DOrbProps {
  className?: string;
  style?: React.CSSProperties;
  interactive?: boolean;
}

export const Healthcare3DOrb: React.FC<Healthcare3DOrbProps> = ({
  className = '',
  style = {},
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    // 1. Detect WebGL support
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        );
      } catch {
        return false;
      }
    };

    if (!checkWebGL()) {
      setHasWebGL(false);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    // Check for user reduced motion preference
    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 2. Initialize Three.js Scene, Camera, and Renderer
    const width = container.clientWidth || 520;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Main Center Group (for floating and parallax)
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // 4. Lighting Setup (Navy, Teal, Cyan, Mint)
    const ambientLight = new THREE.AmbientLight(new THREE.Color('#183247'), 1.8);
    scene.add(ambientLight);

    // Key Light: Luminous Teal
    const keyLight = new THREE.PointLight(new THREE.Color('#5EEAD4'), 4.2, 25);
    keyLight.position.set(4, 4.5, 4.5);
    scene.add(keyLight);

    // Rim Light: Vivid Electric Cyan
    const rimLight = new THREE.PointLight(new THREE.Color('#38BDF8'), 3.6, 20);
    rimLight.position.set(-4.5, -2, -3.5);
    scene.add(rimLight);

    // Fill Light: Soft Mint-White
    const fillLight = new THREE.PointLight(new THREE.Color('#E7F3EF'), 2.2, 18);
    fillLight.position.set(0, -4, 4);
    scene.add(fillLight);

    // Subtle Front Directional Light for crisp highlights
    const dirLight = new THREE.DirectionalLight(new THREE.Color('#FFFFFF'), 1.1);
    dirLight.position.set(2, 5, 6);
    scene.add(dirLight);

    // --------------------------------------------------------------------------
    // 5. Layer 1: Outer Translucent Glass Healthcare Sphere
    // --------------------------------------------------------------------------
    const sphereGeo = new THREE.SphereGeometry(1.68, 64, 64);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#438F84'),
      emissive: new THREE.Color('#144d45'),
      emissiveIntensity: 0.35,
      roughness: 0.12,
      metalness: 0.08,
      transmission: 0.82,
      thickness: 1.2,
      ior: 1.45,
      transparent: true,
      opacity: 0.88,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const outerSphere = new THREE.Mesh(sphereGeo, sphereMat);
    masterGroup.add(outerSphere);

    // --------------------------------------------------------------------------
    // 6. Layer 2: Inner Pulsing Heartbeat Nucleus (AI Core)
    // --------------------------------------------------------------------------
    const coreGroup = new THREE.Group();
    masterGroup.add(coreGroup);

    // Inner Glowing Polyhedron
    const nucleusGeo = new THREE.IcosahedronGeometry(0.82, 3);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#5EEAD4'),
      emissive: new THREE.Color('#2C8C83'),
      emissiveIntensity: 0.85,
      roughness: 0.25,
      metalness: 0.35,
    });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    coreGroup.add(nucleus);

    // Inner Geodesic Wireframe Lattice (Clinical Telemetry Matrix)
    const latticeGeo = new THREE.IcosahedronGeometry(1.22, 1);
    const latticeMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#A7F3D0'),
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    });
    const innerLattice = new THREE.Mesh(latticeGeo, latticeMat);
    coreGroup.add(innerLattice);

    // --------------------------------------------------------------------------
    // 7. Layer 3: Orbiting Glowing Rings
    // --------------------------------------------------------------------------
    // Ring 1: Primary Teal Orbital Ring
    const ring1Geo = new THREE.TorusGeometry(2.36, 0.026, 16, 120);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#5EEAD4'),
      emissive: new THREE.Color('#438F84'),
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.8,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI * 0.38;
    ring1.rotation.y = Math.PI * 0.12;
    masterGroup.add(ring1);

    // Ring 2: Secondary Pale Blue Slanted Ring
    const ring2Geo = new THREE.TorusGeometry(2.62, 0.02, 16, 120);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#93C5FD'),
      emissive: new THREE.Color('#2563EB'),
      emissiveIntensity: 0.75,
      roughness: 0.3,
      metalness: 0.7,
      transparent: true,
      opacity: 0.9,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI * 0.32;
    ring2.rotation.z = Math.PI * 0.25;
    masterGroup.add(ring2);

    // Ring 3: Delicate Equatorial Tracker Ring
    const ring3Geo = new THREE.TorusGeometry(2.92, 0.012, 16, 100);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#A7F3D0'),
      transparent: true,
      opacity: 0.45,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.x = Math.PI * 0.55;
    masterGroup.add(ring3);

    // Orbiting Satellite Beacon on Ring 1
    const satelliteGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const satelliteMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFFFFF'),
      emissive: new THREE.Color('#5EEAD4'),
      emissiveIntensity: 1.6,
      roughness: 0.1,
    });
    const satellite1 = new THREE.Mesh(satelliteGeo, satelliteMat);
    masterGroup.add(satellite1);

    // Orbiting Satellite Beacon on Ring 2
    const satellite2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 16, 16),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#93C5FD'),
        emissive: new THREE.Color('#38BDF8'),
        emissiveIntensity: 1.4,
      })
    );
    masterGroup.add(satellite2);

    // --------------------------------------------------------------------------
    // 8. Layer 4: Floating Medical Geometric Elements
    // --------------------------------------------------------------------------
    // A. 3D Medical Cross (Floating Symbol of Healing & Care)
    const crossGroup = new THREE.Group();
    const crossMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFFFFF'),
      emissive: new THREE.Color('#A7F3D0'),
      emissiveIntensity: 0.45,
      roughness: 0.18,
      metalness: 0.15,
    });
    const barH = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.18, 0.16), crossMat);
    const barV = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.56, 0.16), crossMat);
    crossGroup.add(barH);
    crossGroup.add(barV);
    crossGroup.position.set(2.4, 1.3, 0.8);
    crossGroup.scale.set(0.72, 0.72, 0.72);
    masterGroup.add(crossGroup);

    // B. 3D Medical Capsule (Sleek Two-Tone Capsule)
    const capsuleGroup = new THREE.Group();
    const capTopMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#438F84'),
      emissive: new THREE.Color('#1F5B53'),
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.1,
    });
    const capBottomMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FAFAF7'),
      roughness: 0.2,
      metalness: 0.05,
    });

    const cylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.32, 20),
      capTopMat
    );
    const sphereTop = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2),
      capTopMat
    );
    sphereTop.position.y = 0.16;

    const sphereBottom = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 20, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      capBottomMat
    );
    sphereBottom.position.y = -0.16;

    capsuleGroup.add(cylinder);
    capsuleGroup.add(sphereTop);
    capsuleGroup.add(sphereBottom);
    capsuleGroup.position.set(-2.5, -1.2, 0.9);
    capsuleGroup.scale.set(0.85, 0.85, 0.85);
    capsuleGroup.rotation.z = Math.PI * 0.25;
    masterGroup.add(capsuleGroup);

    // C. Floating Telemetry Particles (50 ambient soft nodes)
    const particleCount = 48;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const tealColor = new THREE.Color('#5EEAD4');
    const blueColor = new THREE.Color('#93C5FD');
    const mintColor = new THREE.Color('#A7F3D0');

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.4 + Math.random() * 1.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const chosenColor = i % 3 === 0 ? tealColor : i % 3 === 1 ? blueColor : mintColor;
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    masterGroup.add(particles);

    // --------------------------------------------------------------------------
    // 9. Layer 5: Contact Ground Shadow Mesh (Natural Depth)
    // --------------------------------------------------------------------------
    const shadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
    const shadowMat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uColor: { value: new THREE.Color('#183247') },
        uOpacity: { value: 0.28 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform vec3 uColor;
        uniform float uOpacity;
        void main() {
          float dist = distance(vUv, vec2(0.5));
          float alpha = smoothstep(0.5, 0.05, dist) * uOpacity;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -2.7;
    scene.add(shadowMesh);

    // Initial scale for smooth entrance
    masterGroup.scale.set(0.1, 0.1, 0.1);
    let entranceProgress = 0;

    // --------------------------------------------------------------------------
    // 10. Mouse Interaction / Parallax Handler
    // --------------------------------------------------------------------------
    const handlePointerMove = (e: MouseEvent | PointerEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mousePos.current.targetX = x * 0.45;
      mousePos.current.targetY = y * 0.35;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // --------------------------------------------------------------------------
    // 11. Animation Loop with Natural Physics and Floating Dynamics
    // --------------------------------------------------------------------------
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const delta = clock.getDelta();

      // Entrance interpolation
      if (entranceProgress < 1) {
        entranceProgress += delta * 1.8;
        const eased = Math.min(1, 1 - Math.pow(1 - entranceProgress, 3));
        masterGroup.scale.set(eased, eased, eased);
        if (entranceProgress >= 0.99 && !isLoaded) {
          setIsLoaded(true);
        }
      }

      // Smooth mouse lerp for natural parallax
      mousePos.current.x = THREE.MathUtils.lerp(
        mousePos.current.x,
        mousePos.current.targetX,
        0.05
      );
      mousePos.current.y = THREE.MathUtils.lerp(
        mousePos.current.y,
        mousePos.current.targetY,
        0.05
      );

      if (!prefersReducedMotion) {
        // Continuous 3D Rotation
        outerSphere.rotation.y = elapsedTime * 0.12;
        outerSphere.rotation.x = Math.sin(elapsedTime * 0.08) * 0.1;

        // Counter-rotation of inner core for layered depth
        coreGroup.rotation.y = -elapsedTime * 0.18;
        innerLattice.rotation.x = elapsedTime * 0.15;
        innerLattice.rotation.z = elapsedTime * 0.09;

        // Rhythmic Pulse (resting clinical heartbeat: ~72 BPM)
        const pulse = 1.0 + Math.sin(elapsedTime * 3.8) * 0.065;
        coreGroup.scale.set(pulse, pulse, pulse);

        // Orbital Rings Rotation
        ring1.rotation.z = elapsedTime * 0.22;
        ring2.rotation.y = -elapsedTime * 0.18;
        ring3.rotation.z = elapsedTime * 0.12;

        // Satellite movement along their orbits
        const sat1Angle = elapsedTime * 0.85;
        satellite1.position.set(
          Math.cos(sat1Angle) * 2.36,
          Math.sin(sat1Angle) * 2.36 * Math.sin(ring1.rotation.x),
          Math.sin(sat1Angle) * 2.36 * Math.cos(ring1.rotation.x)
        );

        const sat2Angle = -elapsedTime * 0.65;
        satellite2.position.set(
          Math.cos(sat2Angle) * 2.62 * Math.cos(ring2.rotation.z),
          Math.sin(sat2Angle) * 2.62,
          Math.cos(sat2Angle) * 2.62 * Math.sin(ring2.rotation.z)
        );

        // Floating Medical Cross Orbit & Spin
        const crossOrbitAngle = elapsedTime * 0.42;
        crossGroup.position.x = Math.cos(crossOrbitAngle) * 2.5;
        crossGroup.position.z = Math.sin(crossOrbitAngle) * 1.8;
        crossGroup.position.y = 1.1 + Math.sin(elapsedTime * 1.4) * 0.25;
        crossGroup.rotation.x = elapsedTime * 0.6;
        crossGroup.rotation.y = elapsedTime * 0.5;

        // Floating Capsule Orbit & Tumbling
        const capOrbitAngle = elapsedTime * 0.35 + Math.PI;
        capsuleGroup.position.x = Math.cos(capOrbitAngle) * 2.4;
        capsuleGroup.position.z = Math.sin(capOrbitAngle) * 1.9;
        capsuleGroup.position.y = -1.2 + Math.cos(elapsedTime * 1.2) * 0.22;
        capsuleGroup.rotation.x = elapsedTime * 0.7;
        capsuleGroup.rotation.z = elapsedTime * 0.4;

        // Ambient particles slow rotation
        particles.rotation.y = elapsedTime * 0.04;

        // Floating vertical oscillation of entire centerpiece
        const floatY = Math.sin(elapsedTime * 1.2) * 0.16;
        masterGroup.position.y = floatY;

        // Responsive shadow scaling based on floating height
        shadowMesh.scale.set(1 - floatY * 0.45, 1 - floatY * 0.45, 1);
        (shadowMat.uniforms.uOpacity as any).value = 0.28 - floatY * 0.08;
      }

      // Apply parallax tilting to master group
      masterGroup.rotation.y = mousePos.current.x * 0.6;
      masterGroup.rotation.x = -mousePos.current.y * 0.6;

      renderer.render(scene, camera);
    };

    animate();

    // --------------------------------------------------------------------------
    // 12. Resize Observer for fluid responsiveness
    // --------------------------------------------------------------------------
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth > 0 && newHeight > 0) {
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      }
    });
    resizeObserver.observe(container);

    // --------------------------------------------------------------------------
    // 13. Resource Cleanup on Unmount
    // --------------------------------------------------------------------------
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      resizeObserver.disconnect();

      // Dispose Geometries and Materials
      sphereGeo.dispose();
      sphereMat.dispose();
      nucleusGeo.dispose();
      nucleusMat.dispose();
      latticeGeo.dispose();
      latticeMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      satelliteGeo.dispose();
      satelliteMat.dispose();
      crossMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();

      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  return (
    <div
      className={`healthcare-3d-orb-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '440px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        ...style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        mousePos.current.targetX = 0;
        mousePos.current.targetY = 0;
      }}
    >
      {/* 3D WebGL Canvas Mount */}
      {hasWebGL ? (
        <div
          ref={mountRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0,
            cursor: interactive ? 'grab' : 'default',
          }}
          aria-label="CareSaathi AI Interactive 3D Healthcare Orb"
          role="img"
        />
      ) : (
        /* Graceful Accessible Fallback when WebGL is unavailable */
        <div
          style={{
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 35% 35%, #5EEAD4 0%, #438F84 45%, #183247 100%)',
            boxShadow:
              '0 0 60px rgba(67, 143, 132, 0.45), inset 0 0 30px rgba(255, 255, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: 'rgba(231, 243, 239, 0.25)',
              border: '2px solid #5EEAD4',
              backdropFilter: 'blur(8px)',
            }}
          />
        </div>
      )}

      {/* Floating Clinical Telemetry Glass Pill - Top Right */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '18px',
          zIndex: 5,
          backgroundColor: 'rgba(24, 50, 71, 0.88)',
          border: '1px solid rgba(67, 143, 132, 0.65)',
          borderRadius: '30px',
          padding: '6px 14px',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#E7F3EF',
          fontSize: '0.78rem',
          fontWeight: 700,
          boxShadow: '0 8px 24px rgba(24, 50, 71, 0.25)',
          pointerEvents: 'none',
          transition: 'transform 0.2s ease',
          transform: isHovered ? 'scale(1.03)' : 'scale(1)',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#5EEAD4',
            boxShadow: '0 0 10px #5EEAD4',
            display: 'inline-block',
          }}
        />
        <span>AI Telemetry Active • 72 BPM</span>
      </div>

      {/* Floating Feature Glass Pill - Bottom Left */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '18px',
          zIndex: 5,
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          border: '1px solid rgba(67, 143, 132, 0.35)',
          borderRadius: '24px',
          padding: '8px 16px',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#183247',
          fontSize: '0.82rem',
          fontWeight: 700,
          boxShadow: '0 10px 30px rgba(24, 50, 71, 0.12)',
          pointerEvents: 'none',
          maxWidth: '280px',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: '#E7F3EF',
            color: '#438F84',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.9rem',
            flexShrink: 0,
          }}
        >
          ✓
        </div>
        <div>
          <div style={{ lineHeight: 1.2 }}>PM-JAY & State Aligned</div>
          <div style={{ fontSize: '0.72rem', color: '#64717D', fontWeight: 500, marginTop: '2px' }}>
            Govt vs Pvt Tariff Engine
          </div>
        </div>
      </div>
    </div>
  );
};
