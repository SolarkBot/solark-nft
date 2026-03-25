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
        position: compact ? new Vector3(0.3, 2.2, 7.7) : new Vector3(-0.05, 2.14, 6.6),
        target: new Vector3(0.05, 0.98, 2.85),
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
        position: compact ? new Vector3(0.95, 2.75, 9.5) : new Vector3(0.9, 2.82, 8.7),
        target: new Vector3(0.1, 1.28, 1.35),
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
