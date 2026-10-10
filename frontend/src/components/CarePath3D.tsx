// ==============================================================================
// CareSaathi AI - "The Care Path" 3D Ribbon & Pearl Nodes Centerpiece
// Light studio aesthetic: translucent pearlescent glass ribbon looping through space,
// 4 soft pearl nodes (Patient, Hospital, Scheme, Savings), drifting capsules,
// soft studio lighting, contact shadow, pointer parallax, and accessible SVG fallback.
// ==============================================================================

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface CarePath3DProps {
  className?: string;
  style?: React.CSSProperties;
  interactive?: boolean;
  compact?: boolean;
}

const checkWebGLSupport = (): boolean => {
  if (typeof window === 'undefined') return false;
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

export const CarePath3D: React.FC<CarePath3DProps> = ({
  className = '',
  style = {},
  interactive = true,
  compact = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasWebGL] = useState<boolean>(checkWebGLSupport);
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const isVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    if (!hasWebGL) return;

    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 2. Setup Scene, Camera, Renderer
    const width = container.clientWidth || 480;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(compact ? 42 : 38, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 8.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Studio Lighting Rig (Light, Multi-tone Studio)
    const ambientLight = new THREE.AmbientLight(new THREE.Color('#FFFFFF'), 1.8);
    scene.add(ambientLight);

    // Large Key Softbox Light (Cool White / Ice)
    const keyLight = new THREE.DirectionalLight(new THREE.Color('#F0F9FF'), 2.2);
    keyLight.position.set(5, 6, 7);
    scene.add(keyLight);

    // Fill Light (Soft Mint #E7F3EF)
    const fillLight = new THREE.DirectionalLight(new THREE.Color('#E7F3EF'), 1.5);
    fillLight.position.set(-6, -2, 5);
    scene.add(fillLight);

    // Warm Bounce Light (Very subtle warm peach/ivory #FFF7ED)
    const bounceLight = new THREE.PointLight(new THREE.Color('#FFF7ED'), 1.8, 20);
    bounceLight.position.set(0, -4, 3);
    scene.add(bounceLight);

    // 4. Centerpiece Master Group
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // --------------------------------------------------------------------------
    // 5. The Glass Ribbon ("Care Path")
    // Looping through space in a smooth S/figure-eight curve
    // --------------------------------------------------------------------------
    const curvePoints = [
      new THREE.Vector3(-2.8, -1.0, 0.4),
      new THREE.Vector3(-1.8, 1.4, 0.8),
      new THREE.Vector3(-0.4, 1.8, -0.4),
      new THREE.Vector3(1.1, 0.6, -0.8),
      new THREE.Vector3(2.4, -0.9, -0.2),
      new THREE.Vector3(1.6, -1.8, 0.6),
      new THREE.Vector3(-0.2, -1.4, 0.9),
      new THREE.Vector3(-1.8, -0.2, 0.2),
      new THREE.Vector3(-2.8, -1.0, 0.4)
    ];

    const pathCurve = new THREE.CatmullRomCurve3(curvePoints, true, 'catmullrom', 0.5);

    // Ribbon geometry extruded along the curve
    const ribbonGeo = new THREE.TubeGeometry(pathCurve, 120, 0.16, 24, true);

    // Pearlescent Translucent Glass Material
    const ribbonMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#EAF2F8'),
      emissive: new THREE.Color('#E7F3EF'),
      emissiveIntensity: 0.25,
      roughness: 0.1,
      metalness: 0.05,
      transmission: 0.88,
      thickness: 1.2,
      ior: 1.42,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      iridescence: 0.65,
      iridescenceIOR: 1.35,
      transparent: true,
      opacity: 0.92
    });

    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    masterGroup.add(ribbonMesh);

    // --------------------------------------------------------------------------
    // 6. 4 Soft Pearl Nodes along the Care Path
    // Patient (Mint), Hospital (Ice-blue), Scheme (Ivory), Savings (Soft Coral)
    // --------------------------------------------------------------------------
    const nodeConfigs = [
      { name: 'Patient', t: 0.12, color: '#A7F3D0', emissive: '#438F84', label: 'Patient Inquiry' },
      { name: 'Hospital', t: 0.38, color: '#93C5FD', emissive: '#2563EB', label: 'Verified Hospitals (28)' },
      { name: 'Scheme', t: 0.64, color: '#FAFAF7', emissive: '#CBD5E1', label: 'PM-JAY & Aarogyasri' },
      { name: 'Savings', t: 0.88, color: '#FCA5A5', emissive: '#D97962', label: 'Cashless Protection' }
    ];

    const nodeMeshes: THREE.Mesh[] = [];

    nodeConfigs.forEach((cfg) => {
      const pos = pathCurve.getPointAt(cfg.t);
      const pearlGeo = new THREE.SphereGeometry(0.28, 32, 32);
      const pearlMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(cfg.color),
        emissive: new THREE.Color(cfg.emissive),
        emissiveIntensity: 0.35,
        roughness: 0.18,
        metalness: 0.15,
        clearcoat: 0.9,
        clearcoatRoughness: 0.1
      });

      const pearl = new THREE.Mesh(pearlGeo, pearlMat);
      pearl.position.copy(pos);
      masterGroup.add(pearl);
      nodeMeshes.push(pearl);
    });

    // --------------------------------------------------------------------------
    // 7. Drifting Minimal Accents: Capsules, Thin Halo Ring, Minimal Plus
    // --------------------------------------------------------------------------
    // Thin drifting halo ring
    const haloGeo = new THREE.TorusGeometry(3.1, 0.016, 16, 100);
    const haloMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#CBD5E1'),
      roughness: 0.3,
      metalness: 0.6,
      transparent: true,
      opacity: 0.65
    });
    const haloRing = new THREE.Mesh(haloGeo, haloMat);
    haloRing.rotation.x = Math.PI * 0.42;
    haloRing.rotation.y = Math.PI * 0.15;
    masterGroup.add(haloRing);

    // Drifting pastel capsule
    const capTopMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#438F84'),
      roughness: 0.2,
      metalness: 0.1
    });
    const capBottomMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FAFAF7'),
      roughness: 0.2,
      metalness: 0.05
    });
    const capsuleGroup = new THREE.Group();
    const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.22, 16), capTopMat);
    const capSphTop = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), capTopMat);
    capSphTop.position.y = 0.11;
    const capSphBot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), capBottomMat);
    capSphBot.position.y = -0.11;
    capsuleGroup.add(cylinder, capSphTop, capSphBot);
    capsuleGroup.position.set(2.6, 1.4, 0.6);
    capsuleGroup.scale.set(0.75, 0.75, 0.75);
    masterGroup.add(capsuleGroup);

    // Minimal Plus detail (no heart)
    const plusGroup = new THREE.Group();
    const plusMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFFFFF'),
      roughness: 0.2,
      metalness: 0.1
    });
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.05), plusMat);
    const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.05), plusMat);
    plusGroup.add(p1, p2);
    plusGroup.position.set(-2.5, 1.2, -0.4);
    masterGroup.add(plusGroup);

    // --------------------------------------------------------------------------
    // 8. Soft Ground Contact Shadow (Invisible Floor Plane with Radial Falloff)
    // --------------------------------------------------------------------------
    const shadowGeo = new THREE.PlaneGeometry(5.2, 5.2);
    const shadowMat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uColor: { value: new THREE.Color('#102A36') },
        uOpacity: { value: 0.12 }
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
          float alpha = smoothstep(0.5, 0.04, dist) * uOpacity;
          gl_FragColor = vec4(uColor, alpha);
        }
      `
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -2.4;
    scene.add(shadowMesh);

    // --------------------------------------------------------------------------
    // 9. Damped Mouse Parallax Handler
    // --------------------------------------------------------------------------
    const handlePointerMove = (e: PointerEvent | MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      // Damped within 0.12 rad
      mousePos.current.targetX = THREE.MathUtils.clamp(x * 0.18, -0.12, 0.12);
      mousePos.current.targetY = THREE.MathUtils.clamp(y * 0.15, -0.12, 0.12);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // --------------------------------------------------------------------------
    // 10. IntersectionObserver to Pause Render Loop Off-screen
    // --------------------------------------------------------------------------
    const observer = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(container);

    // --------------------------------------------------------------------------
    // 11. Animation Loop
    // --------------------------------------------------------------------------
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisibleRef.current) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      mousePos.current.x = THREE.MathUtils.lerp(mousePos.current.x, mousePos.current.targetX, 0.05);
      mousePos.current.y = THREE.MathUtils.lerp(mousePos.current.y, mousePos.current.targetY, 0.05);

      if (!prefersReducedMotion) {
        // Slow floating ribbon rotation
        masterGroup.rotation.y = elapsedTime * 0.08 + mousePos.current.x;
        masterGroup.rotation.x = Math.sin(elapsedTime * 0.06) * 0.06 - mousePos.current.y;

        // Gentle vertical levitation
        const levitate = Math.sin(elapsedTime * 0.9) * 0.09;
        masterGroup.position.y = levitate;
        shadowMesh.scale.set(1 - levitate * 0.3, 1 - levitate * 0.3, 1);

        // Slow halo ring counter-rotation
        haloRing.rotation.z = -elapsedTime * 0.06;

        // Capsule & plus gentle orbits
        capsuleGroup.rotation.y = elapsedTime * 0.4;
        capsuleGroup.rotation.x = elapsedTime * 0.3;
        plusGroup.rotation.z = -elapsedTime * 0.25;

        // Subtle pearl breathing pulse
        nodeMeshes.forEach((mesh, idx) => {
          const pulse = 1.0 + Math.sin(elapsedTime * 2.2 + idx * 1.5) * 0.04;
          mesh.scale.set(pulse, pulse, pulse);
        });
      } else {
        masterGroup.rotation.y = mousePos.current.x;
        masterGroup.rotation.x = -mousePos.current.y;
      }

      renderer.render(scene, camera);
    };

    animate();

    // --------------------------------------------------------------------------
    // 12. Resize Observer
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
    // 13. Resource Cleanup
    // --------------------------------------------------------------------------
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      observer.disconnect();
      resizeObserver.disconnect();

      ribbonGeo.dispose();
      ribbonMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      nodeMeshes.forEach(m => {
        m.geometry.dispose();
        if (Array.isArray(m.material)) m.material.forEach(mat => mat.dispose());
        else m.material.dispose();
      });

      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive, compact, hasWebGL]);

  return (
    <div
      className={`care-path-3d-wrapper ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: compact ? '340px' : '440px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        ...style
      }}
      onMouseLeave={() => {
        mousePos.current.targetX = 0;
        mousePos.current.targetY = 0;
      }}
    >
      {hasWebGL ? (
        <div
          ref={mountRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0,
            cursor: interactive ? 'grab' : 'default'
          }}
          aria-label="CareSaathi Care Path Interactive 3D Visual"
          role="img"
        />
      ) : (
        /* Accessible Multi-tone SVG Ribbon Fallback */
        <div
          style={{
            width: '280px',
            height: '280px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="CareSaathi Care Path SVG Fallback"
        >
          <svg viewBox="0 0 280 280" width="100%" height="100%">
            <defs>
              <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.85" />
                <stop offset="35%" stopColor="#93C5FD" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#E7F3EF" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#FCA5A5" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <path
              d="M 40 180 C 40 80, 140 60, 140 140 C 140 220, 240 200, 240 100"
              fill="none"
              stroke="url(#ribbonGrad)"
              strokeWidth="20"
              strokeLinecap="round"
            />
            {/* 4 Pearl Nodes */}
            <circle cx="50" cy="160" r="11" fill="#A7F3D0" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx="115" cy="85" r="11" fill="#93C5FD" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx="165" cy="180" r="11" fill="#FAFAF7" stroke="#CBD5E1" strokeWidth="2.5" />
            <circle cx="230" cy="115" r="11" fill="#FCA5A5" stroke="#FFFFFF" strokeWidth="2.5" />
          </svg>
        </div>
      )}

      {/* Desktop-only Static Hairline Leader Line Captions (aria-hidden) */}
      {!compact && (
        <>
          {/* Node 1: Patient (Top-Left) */}
          <div
            className="care-path-leader-label patient"
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '48px',
              left: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              pointerEvents: 'none',
              zIndex: 5
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#326D64', letterSpacing: '0.02em' }}>
              Patient
            </span>
            <div style={{ width: '24px', height: '1px', backgroundColor: 'rgba(67, 143, 132, 0.4)' }} />
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#438F84' }} />
          </div>

          {/* Node 2: Hospital (Top-Right) */}
          <div
            className="care-path-leader-label hospital"
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '64px',
              right: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              pointerEvents: 'none',
              zIndex: 5
            }}
          >
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
            <div style={{ width: '24px', height: '1px', backgroundColor: 'rgba(37, 99, 235, 0.35)' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1E40AF', letterSpacing: '0.02em' }}>
              Hospital (28 Verified)
            </span>
          </div>

          {/* Node 3: Scheme (Bottom-Left) */}
          <div
            className="care-path-leader-label scheme"
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: '56px',
              left: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              pointerEvents: 'none',
              zIndex: 5
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#183247', letterSpacing: '0.02em' }}>
              PM-JAY &amp; Aarogyasri
            </span>
            <div style={{ width: '24px', height: '1px', backgroundColor: 'rgba(24, 50, 71, 0.3)' }} />
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#183247' }} />
          </div>

          {/* Node 4: Savings (Bottom-Right) */}
          <div
            className="care-path-leader-label savings"
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: '42px',
              right: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              pointerEvents: 'none',
              zIndex: 5
            }}
          >
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#D97962' }} />
            <div style={{ width: '24px', height: '1px', backgroundColor: 'rgba(217, 121, 98, 0.4)' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#C05638', letterSpacing: '0.02em' }}>
              Cashless Protection
            </span>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 900px) {
          .care-path-leader-label {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
