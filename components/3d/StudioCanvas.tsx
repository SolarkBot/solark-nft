"use client";

import { Suspense, useEffect, useRef } from "react";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { StudioScene } from "@/components/3d/StudioScene";
import type {
  AspectRatio,
  CreationStage,
  GenerationResult,
  PerformanceTier,
  StudioPhase,
  ThemeMode,
} from "@/types";

function orbitHome(performanceTier: PerformanceTier) {
  if (performanceTier === "low") {
    return {
      position: [1.1, 2.75, 9.7] as const,
      target: [0.2, 1.3, 0.15] as const,
    };
  }

  return {
    position: [1.05, 2.8, 8.9] as const,
    target: [0.2, 1.3, 0.15] as const,
  };
}

function IdleOrbitControls({
  enabled,
  phase,
  performanceTier,
}: {
  enabled: boolean;
  phase: StudioPhase;
  performanceTier: PerformanceTier;
}) {
  const controls = useRef<OrbitControlsImpl>(null);
  const previousPhase = useRef(phase);
  const { camera } = useThree();

  useEffect(() => {
    const home = orbitHome(performanceTier);
    const wasInteractive =
      previousPhase.current === "arrival" ||
      previousPhase.current === "invitation" ||
      previousPhase.current === "prompting" ||
      previousPhase.current === "creating";
    const isInteractive =
      phase === "arrival" ||
      phase === "invitation" ||
      phase === "prompting" ||
      phase === "creating";

    if (enabled && (!wasInteractive || !isInteractive)) {
      camera.position.set(home.position[0], home.position[1], home.position[2]);
      controls.current?.target.set(home.target[0], home.target[1], home.target[2]);
      controls.current?.update();
    }

    previousPhase.current = phase;
  }, [camera, enabled, performanceTier, phase]);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enabled={enabled}
      enablePan={false}
      enableZoom
      enableDamping
      dampingFactor={0.08}
      minDistance={6.8}
      maxDistance={11.5}
      minPolarAngle={0.92}
      maxPolarAngle={1.72}
      target={orbitHome(performanceTier).target}
    />
  );
}

export function StudioCanvas(props: {
  phase: StudioPhase;
  creationStage: CreationStage;
  performanceTier: PerformanceTier;
  themeMode: ThemeMode;
  reducedMotion: boolean;
  generation: GenerationResult | null;
  showPromptInScene: boolean;
  prompt: string;
  negativePrompt: string;
  aspectRatio: AspectRatio;
  notebookActive: boolean;
  hoveredNotebook: boolean;
  onNotebookTrigger: () => void;
  onHoverNotebook: (hovered: boolean) => void;
  onPromptChange: (value: string) => void;
  onNegativePromptChange: (value: string) => void;
  onAspectRatioChange: (value: AspectRatio) => void;
  onClosePrompt: () => void;
  onSubmitPrompt: () => void;
  errorMessage: string | null;
  isGenerating: boolean;
}) {
  const orbitEnabled =
    props.phase === "arrival" ||
    props.phase === "invitation" ||
    props.phase === "prompting" ||
    props.phase === "creating";

  return (
    <div className="absolute inset-0" data-orbit-enabled={orbitEnabled ? "true" : "false"}>
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [1.05, 2.8, 8.9], fov: 36 }}
      >
        <Suspense fallback={null}>
          <IdleOrbitControls
            enabled={orbitEnabled}
            phase={props.phase}
            performanceTier={props.performanceTier}
          />
          <StudioScene {...props} orbitEnabled={orbitEnabled} />
        </Suspense>
      </Canvas>
    </div>
  );
}
