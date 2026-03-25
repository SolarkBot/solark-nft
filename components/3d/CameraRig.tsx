"use client";

import { useRef } from "react";

import { MathUtils, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";

import type { PerformanceTier, StudioPhase } from "@/types";

function cameraForPhase(phase: StudioPhase, performanceTier: PerformanceTier) {
  const compact = performanceTier === "low";

  switch (phase) {
    case "prompting":
      return {
        position: compact ? new Vector3(-0.55, 2.25, 7.5) : new Vector3(-1.15, 2.18, 6.45),
        target: new Vector3(-2.55, 0.98, 2.4),
      };
    case "creating":
      return {
        position: compact ? new Vector3(4.9, 2.9, 8.8) : new Vector3(5.35, 3, 7.3),
        target: new Vector3(3.25, 1.7, -2.15),
      };
    case "reveal":
      return {
        position: compact ? new Vector3(0.1, 2.35, 7.8) : new Vector3(0, 2.3, 6.8),
        target: new Vector3(0, 1.58, -1.35),
      };
    case "invitation":
    case "arrival":
    default:
      return {
        position: compact ? new Vector3(1.1, 2.75, 9.7) : new Vector3(1.05, 2.8, 8.9),
        target: new Vector3(0.2, 1.3, 0.15),
      };
  }
}

export function CameraRig({
  phase,
  performanceTier,
  reducedMotion,
  orbitEnabled,
}: {
  phase: StudioPhase;
  performanceTier: PerformanceTier;
  reducedMotion: boolean;
  orbitEnabled: boolean;
}) {
  const lookAt = useRef(new Vector3());

  useFrame((state, delta) => {
    if (orbitEnabled) {
      return;
    }

    const target = cameraForPhase(phase, performanceTier);
    const damping = reducedMotion ? 7.5 : 4.5;
    const camera = state.camera;
    const lookAtVector = lookAt.current;

    camera.position.x = MathUtils.damp(camera.position.x, target.position.x, damping, delta);
    camera.position.y = MathUtils.damp(camera.position.y, target.position.y, damping, delta);
    camera.position.z = MathUtils.damp(camera.position.z, target.position.z, damping, delta);

    lookAtVector.x = MathUtils.damp(lookAtVector.x, target.target.x, damping, delta);
    lookAtVector.y = MathUtils.damp(lookAtVector.y, target.target.y, damping, delta);
    lookAtVector.z = MathUtils.damp(lookAtVector.z, target.target.z, damping, delta);

    camera.lookAt(lookAtVector);
  });

  return null;
}
