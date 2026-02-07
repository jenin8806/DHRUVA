import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Color, DoubleSide, ShaderMaterial } from "three";

interface BeamsProps {
    beamWidth?: number;
    beamNumber?: number;
    lightColor?: string;
    speed?: number;
    noiseIntensity?: number;
    scale?: number;
    rotation?: number;
    className?: string; // Added for styling
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uNoiseIntensity;
  uniform float uBeamWidth;
  uniform float uBeamNumber;
  uniform vec3 uColor;
  uniform float uScale;
  
  varying vec2 vUv;

  // 2D Noise function
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
            -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    
    // Scale UVs for beam effect
    // Multiply x by beamNumber to create vertical strips
    vec2 scaledUv = vec2(uv.x * uBeamNumber, uv.y);
    
    // Animate noise
    float time = uTime * uSpeed;
    
    // Generate noise pattern moving upwards
    float noiseVal = snoise(vec2(scaledUv.x, scaledUv.y * uScale - time));
    
    // Sharpen the noise to create distinct beams
    float beam = smoothstep(0.4, 0.6, noiseVal * uNoiseIntensity + 0.5);
    
    // Add a second layer of noise for detail
    float detail = snoise(vec2(scaledUv.x * 2.0, scaledUv.y * uScale * 2.0 + time * 1.5));
    beam += detail * 0.2;
    
    // Fade edges (vignette effect on y-axis)
    float fade = smoothstep(0.0, 0.4, uv.y) * smoothstep(1.0, 0.6, uv.y);
    
    // Final color mixing
    vec3 finalColor = uColor;
    float alpha = beam * fade * 0.3; // Adjust global opacity
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

const BeamMesh = ({
    beamWidth,
    beamNumber,
    lightColor,
    speed,
    noiseIntensity,
    scale,
    rotation,
}: Required<Omit<BeamsProps, "className">>) => {
    const materialRef = useRef<ShaderMaterial>(null);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uSpeed: { value: speed },
            uNoiseIntensity: { value: noiseIntensity },
            uBeamWidth: { value: beamWidth },
            uBeamNumber: { value: beamNumber },
            uColor: { value: new Color(lightColor) },
            uScale: { value: scale },
        }),
        [speed, noiseIntensity, beamWidth, beamNumber, lightColor, scale]
    );

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    return (
        <mesh rotation={[0, 0, (rotation * Math.PI) / 180]}>
            <planeGeometry args={[100, 100]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                side={DoubleSide}
            />
        </mesh>
    );
};

const Beams = ({
    beamWidth = 3,
    beamNumber = 20,
    lightColor = "#ffffff",
    speed = 2,
    noiseIntensity = 1.75,
    scale = 0.2,
    rotation = 30,
    className = "",
}: BeamsProps) => {
    return (
        <div className={`w-full h-full absolute inset-0 overflow-hidden ${className}`}>
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <BeamMesh
                    beamWidth={beamWidth}
                    beamNumber={beamNumber}
                    lightColor={lightColor}
                    speed={speed}
                    noiseIntensity={noiseIntensity}
                    scale={scale}
                    rotation={rotation}
                />
            </Canvas>
        </div>
    );
};

export default Beams;
