"use client";

import { useRef } from "react";

import { Group, MathUtils } from "three";
import { useFrame } from "@react-three/fiber";

import type { CreationStage, StudioPhase } from "@/types";

function targetPosition(phase: StudioPhase) {
  if (phase === "creating" || phase === "reveal") {
    return [3.7, -0.2, -1.4] as const;
  }

  return [0.25, -0.18, 0.25] as const;
}

export function Artist({
  phase,
  stage,
  reducedMotion,
}: {
  phase: StudioPhase;
  stage: CreationStage;
  reducedMotion: boolean;
}) {
  const group = useRef<Group>(null);
  const leftUpperArm = useRef<Group>(null);
  const rightUpperArm = useRef<Group>(null);
  const leftThigh = useRef<Group>(null);
  const rightThigh = useRef<Group>(null);
  const leftCalf = useRef<Group>(null);
  const rightCalf = useRef<Group>(null);
  const body = targetPosition(phase);
  const standing = phase === "creating" || phase === "reveal";

  useFrame((state, delta) => {
    if (!group.current) {
      return;
    }

    group.current.position.x = MathUtils.damp(group.current.position.x, body[0], 4, delta);
    group.current.position.y = MathUtils.damp(group.current.position.y, body[1], 4, delta);
    group.current.position.z = MathUtils.damp(group.current.position.z, body[2], 4, delta);
    group.current.rotation.y = MathUtils.damp(
      group.current.rotation.y,
      standing ? -0.55 : 0.25,
      4.5,
      delta,
    );
    group.current.rotation.x = MathUtils.damp(group.current.rotation.x, standing ? 0 : 0.04, 5, delta);
    group.current.rotation.z = MathUtils.damp(group.current.rotation.z, 0, 5, delta);

    if (!reducedMotion) {
      group.current.position.y += Math.sin(state.clock.elapsedTime * (standing ? 1.3 : 0.8)) *
        (standing ? 0.0016 : 0.0011);
    }

    const drawingEnergy =
      phase === "creating"
        ? stage === "sketching"
          ? 0.82
          : stage === "adding-color"
            ? 1.08
            : stage === "finalizing"
              ? 0.6
              : 0.24
        : 0.08;

    if (leftUpperArm.current && rightUpperArm.current) {
      leftUpperArm.current.rotation.z = MathUtils.damp(
        leftUpperArm.current.rotation.z,
        standing ? -0.55 - drawingEnergy * 0.35 : -0.16,
        6,
        delta,
      );
      leftUpperArm.current.rotation.x = MathUtils.damp(
        leftUpperArm.current.rotation.x,
        standing ? 0 : 0.28,
        6,
        delta,
      );
      rightUpperArm.current.rotation.z = MathUtils.damp(
        rightUpperArm.current.rotation.z,
        standing ? 0.72 + Math.sin(state.clock.elapsedTime * 5.2) * 0.12 * drawingEnergy : 0.18,
        8,
        delta,
      );
      rightUpperArm.current.rotation.x = MathUtils.damp(
        rightUpperArm.current.rotation.x,
        standing ? -0.34 + Math.cos(state.clock.elapsedTime * 4.1) * 0.12 * drawingEnergy : 0.24,
        8,
        delta,
      );
    }

    if (leftThigh.current && rightThigh.current && leftCalf.current && rightCalf.current) {
      leftThigh.current.rotation.x = MathUtils.damp(
        leftThigh.current.rotation.x,
        standing ? 0.05 : -1.24,
        6,
        delta,
      );
      rightThigh.current.rotation.x = MathUtils.damp(
        rightThigh.current.rotation.x,
        standing ? -0.05 : -1.24,
        6,
        delta,
      );
      leftCalf.current.rotation.x = MathUtils.damp(
        leftCalf.current.rotation.x,
        standing ? 0.02 : 1.18,
        6,
        delta,
      );
      rightCalf.current.rotation.x = MathUtils.damp(
        rightCalf.current.rotation.x,
        standing ? -0.02 : 1.12,
        6,
        delta,
      );
    }
  });

  return (
    <group ref={group} position={[0.25, -0.18, 0.25]}>
      <mesh castShadow position={[0, standing ? 1.98 : 1.72, 0]}>
        <sphereGeometry args={[0.33, 32, 32]} />
        <meshStandardMaterial color="#d5b089" roughness={0.55} />
      </mesh>
      <mesh castShadow position={[0, standing ? 1.08 : 1.05, standing ? 0 : -0.04]}>
        <capsuleGeometry args={[0.42, standing ? 1.15 : 0.88, 10, 18]} />
        <meshStandardMaterial color="#15181d" metalness={0.15} roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0, standing ? 1.02 : 0.82, 0.12]}>
        <capsuleGeometry args={[0.28, standing ? 0.95 : 0.58, 8, 16]} />
        <meshStandardMaterial color="#6d5640" roughness={0.92} />
      </mesh>
      <group ref={leftUpperArm} position={[-0.48, standing ? 1.33 : 1.22, 0]}>
        <mesh castShadow rotation={[0, 0, -0.52]}>
          <capsuleGeometry args={[0.11, 0.78, 8, 12]} />
          <meshStandardMaterial color="#d5b089" roughness={0.68} />
        </mesh>
      </group>
      <group ref={rightUpperArm} position={[0.48, standing ? 1.28 : 1.2, 0.08]}>
        <mesh castShadow rotation={[0, 0, 0.52]}>
          <capsuleGeometry args={[0.11, 0.82, 8, 12]} />
          <meshStandardMaterial color="#d5b089" roughness={0.68} />
        </mesh>
      </group>
      <group ref={leftThigh} position={[-0.2, standing ? 0.42 : 0.7, 0.08]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.12, 0.62, 8, 12]} />
          <meshStandardMaterial color="#171a1f" roughness={0.9} />
        </mesh>
      </group>
      <group ref={rightThigh} position={[0.2, standing ? 0.42 : 0.7, 0.08]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.12, 0.62, 8, 12]} />
          <meshStandardMaterial color="#171a1f" roughness={0.9} />
        </mesh>
      </group>
      <group ref={leftCalf} position={[-0.22, standing ? -0.12 : 0.28, standing ? 0.02 : 0.52]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.11, 0.58, 8, 12]} />
          <meshStandardMaterial color="#171a1f" roughness={0.9} />
        </mesh>
      </group>
      <group ref={rightCalf} position={[0.22, standing ? -0.12 : 0.28, standing ? 0.02 : 0.48]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.11, 0.58, 8, 12]} />
          <meshStandardMaterial color="#171a1f" roughness={0.9} />
        </mesh>
      </group>
      <mesh castShadow position={[-0.22, standing ? -0.58 : -0.06, standing ? 0 : 0.86]} rotation={[0.22, 0, 0]}>
        <boxGeometry args={[0.28, 0.08, 0.48]} />
        <meshStandardMaterial color="#201a17" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0.22, standing ? -0.58 : -0.06, standing ? 0 : 0.82]} rotation={[0.18, 0, 0]}>
        <boxGeometry args={[0.28, 0.08, 0.48]} />
        <meshStandardMaterial color="#201a17" roughness={0.9} />
      </mesh>
      <mesh position={[0, standing ? 2.3 : 2.05, 0.12]}>
        <torusGeometry args={[0.18, 0.025, 12, 24, Math.PI]} />
        <meshStandardMaterial color="#6d5640" roughness={0.52} metalness={0.3} />
      </mesh>
    </group>
  );
}
