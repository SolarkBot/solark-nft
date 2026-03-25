"use client";

import { useMemo } from "react";

import { useTexture } from "@react-three/drei";

import type { CreationStage, GenerationResult, StudioPhase } from "@/types";

function stageStrength(stage: CreationStage) {
  switch (stage) {
    case "thinking":
      return 0.12;
    case "sketching":
      return 0.52;
    case "adding-color":
      return 0.82;
    case "finalizing":
      return 1;
    default:
      return 0;
  }
}

export function CanvasEasel({
  phase,
  stage,
  generation,
}: {
  phase: StudioPhase;
  stage: CreationStage;
  generation: GenerationResult | null;
}) {
  const strength = stageStrength(stage);
  const texture = useTexture(generation?.imageUrl || "/next.svg");
  const sketchStrokes = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        x: -0.8 + (index % 6) * 0.32,
        y: 0.88 - Math.floor(index / 6) * 0.58,
        rotation: ((index * 17) % 40) * (Math.PI / 180),
        color: index % 2 === 0 ? "#f2ecdd" : "#d8c6a3",
      })),
    [],
  );

  return (
    <group position={[3.4, 0.1, -2.1]} rotation={[0, -0.38, 0]}>
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[0.09, 2.6, 0.09]} />
        <meshStandardMaterial color="#4b3527" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[-0.82, 0.32, 0]}>
        <boxGeometry args={[0.09, 2.2, 0.09]} />
        <meshStandardMaterial color="#4b3527" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0.82, 0.32, 0]}>
        <boxGeometry args={[0.09, 2.2, 0.09]} />
        <meshStandardMaterial color="#4b3527" roughness={0.9} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.55, 0.02]}>
        <boxGeometry args={[2.1, 1.55, 0.12]} />
        <meshStandardMaterial color="#f5f1e6" roughness={0.76} />
      </mesh>
      <mesh position={[0, 1.55, 0.1]}>
        <planeGeometry args={[1.88, 1.3]} />
        <meshStandardMaterial
          color={phase === "creating" ? "#f7f3eb" : "#ece4d6"}
          roughness={0.9}
          metalness={0}
        />
      </mesh>
      {generation && (phase === "creating" || phase === "reveal") ? (
        <mesh position={[0, 1.55, 0.11]}>
          <planeGeometry args={[1.88, 1.3]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={phase === "creating" ? 0.18 + strength * 0.22 : 0.6}
          />
        </mesh>
      ) : null}
      {sketchStrokes.map((stroke, index) => (
        <mesh
          key={`${stroke.x}-${stroke.y}`}
          position={[stroke.x, stroke.y + 1.55, 0.115]}
          rotation={[0, 0, stroke.rotation]}
          visible={phase === "creating"}
        >
          <planeGeometry args={[0.42 + (index % 3) * 0.18, 0.028 + (index % 2) * 0.01]} />
          <meshBasicMaterial
            color={stroke.color}
            transparent
            opacity={
              stage === "sketching" ? 0.22 + strength * 0.45 : stage === "adding-color" ? 0.4 : 0.5
            }
          />
        </mesh>
      ))}
      {[0, 1, 2, 3].map((column) => (
        <mesh
          key={`wash-${column}`}
          position={[-0.72 + column * 0.48, 1.45 - (column % 2) * 0.28, 0.12]}
          visible={phase === "creating" && (stage === "adding-color" || stage === "finalizing")}
        >
          <planeGeometry args={[0.42, 0.62]} />
          <meshBasicMaterial
            color={["#ca9e63", "#6f8ba5", "#b75f49", "#687b4c"][column]}
            transparent
            opacity={stage === "adding-color" ? 0.1 + strength * 0.22 : 0.22}
          />
        </mesh>
      ))}
    </group>
  );
}
