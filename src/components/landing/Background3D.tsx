import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function NeuralOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    []
  );

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta * 0.15;
      materialRef.current.uniforms.uMouse.value.lerp(
        new THREE.Vector2(mouseRef.current.x, mouseRef.current.y),
        0.03
      );
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.03;
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        mouseRef.current.y * 0.1,
        0.02
      );
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    uniform float uTime;
    uniform vec2 uMouse;
    
    void main() {
      vUv = uv;
      vNormal = normal;
      vec3 pos = position;
      float displacement = sin(pos.x * 3.0 + uTime * 0.8) * 0.05 
                         + sin(pos.y * 4.0 + uTime * 1.1) * 0.04
                         + sin(pos.z * 2.5 + uTime * 0.6) * 0.04;
      float mouseInfluence = (uMouse.x * pos.x + uMouse.y * pos.y) * 0.02;
      pos += normal * (displacement + mouseInfluence);
      vPosition = pos;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    uniform float uTime;
    
    void main() {
      // Very dark purple base colors
      vec3 darkPurple1 = vec3(0.08, 0.02, 0.18);
      vec3 darkPurple2 = vec3(0.12, 0.04, 0.25);
      vec3 deepViolet = vec3(0.15, 0.03, 0.3);
      
      float noise = sin(vPosition.x * 4.0 + uTime * 0.7) * 0.5 + 0.5;
      float noise2 = cos(vPosition.y * 3.5 + uTime * 0.9) * 0.5 + 0.5;
      
      vec3 color = mix(darkPurple1, darkPurple2, noise);
      color = mix(color, deepViolet, noise2 * 0.3);
      
      // Subtle purple fresnel edge
      vec3 viewDir = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 4.0);
      color += vec3(0.25, 0.1, 0.5) * fresnel * 0.3;
      
      float dist = length(vUv - 0.5);
      float alpha = smoothstep(0.5, 0.05, dist) * 0.18;
      alpha += fresnel * 0.08;
      
      gl_FragColor = vec4(color, alpha);
    }
  `;

  return (
    <mesh ref={meshRef} position={[0, 0.3, 0]} scale={2.8}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function FloatingParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, sizes } = useMemo(() => {
    const count = 120;
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      sz[i] = Math.random() * 1.2 + 0.2;
    }
    return { positions: pos, sizes: sz };
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.008;
      pointsRef.current.rotation.x += delta * 0.004;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        color={0x4a2080}
        size={0.015}
        transparent
        opacity={0.2}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function GlowRing() {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.x += delta * 0.05;
      ringRef.current.rotation.z += delta * 0.02;
    }
  });

  return (
    <mesh ref={ringRef} position={[0, 0.3, 0]} scale={3.4}>
      <torusGeometry args={[1, 0.003, 16, 100]} />
      <meshBasicMaterial color={0x3a1a6e} transparent opacity={0.08} />
    </mesh>
  );
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 55 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
      >
        {/* No ambient or point lights — shader handles all color */}
        <NeuralOrb />
        <GlowRing />
        <FloatingParticles />
      </Canvas>
    </div>
  );
}
