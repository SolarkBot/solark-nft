"use client";

import { ContactShadows, Float, Html, Sparkles } from "@react-three/drei";
import { useMemo } from "react";

import { BackSide } from "three";

import { Artist } from "@/components/3d/Artist";
import { CameraRig } from "@/components/3d/CameraRig";
import { CanvasEasel } from "@/components/3d/CanvasEasel";
import { PromptNotebook } from "@/components/experience/PromptNotebook";
import type {
  AspectRatio,
  CreationStage,
  GenerationResult,
  PerformanceTier,
  StudioPhase,
  ThemeMode,
} from "@/types";

const WINDOW_STARS = [
  [-0.42, 0.36, 0.04],
  [0.32, 0.28, 0.05],
  [0.18, -0.12, 0.03],
  [-0.26, -0.24, 0.02],
  [0.02, 0.08, 0.025],
] as const;

const WINDOW_CLOUDS = [
  [-0.34, 0.2, 0.9],
  [0.2, 0.02, 0.78],
  [0.4, -0.24, 0.64],
] as const;

const WALL_FRAMES = [
  { position: [-5.9, 2.15, -3.25] as const, rotation: [0, 0.72, 0] as const, accent: "#c27859" },
  { position: [5.8, 2.45, -2.2] as const, rotation: [0, -0.8, 0] as const, accent: "#6e88a5" },
  { position: [6.2, 1.8, 2.1] as const, rotation: [0, -1.25, 0] as const, accent: "#9b7d48" },
  { position: [-6.3, 1.75, 1.45] as const, rotation: [0, 1.18, 0] as const, accent: "#7d5f9c" },
] as const;

export function StudioScene({
  phase,
  creationStage,
  performanceTier,
  themeMode,
  reducedMotion,
  orbitEnabled,
  generation,
  showPromptInScene,
  prompt,
  negativePrompt,
  aspectRatio,
  hoveredNotebook,
  onTogglePrompt,
  onHoverNotebook,
  onPromptChange,
  onNegativePromptChange,
  onAspectRatioChange,
  onClosePrompt,
  onSubmitPrompt,
  errorMessage,
  isGenerating,
}: {
  phase: StudioPhase;
  creationStage: CreationStage;
  performanceTier: PerformanceTier;
  themeMode: ThemeMode;
  reducedMotion: boolean;
  orbitEnabled: boolean;
  generation: GenerationResult | null;
  showPromptInScene: boolean;
  prompt: string;
  negativePrompt: string;
  aspectRatio: AspectRatio;
  hoveredNotebook: boolean;
  onTogglePrompt: () => void;
  onHoverNotebook: (hovered: boolean) => void;
  onPromptChange: (value: string) => void;
  onNegativePromptChange: (value: string) => void;
  onAspectRatioChange: (value: AspectRatio) => void;
  onClosePrompt: () => void;
  onSubmitPrompt: () => void;
  errorMessage: string | null;
  isGenerating: boolean;
}) {
  const books = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => ({
        position: [-4.95 + index * 0.34, 1.33 + (index % 2) * 0.05, -2.95 + (index % 3) * 0.12] as const,
        color: ["#695345", "#7d6349", "#83684c"][index % 3],
      })),
    [],
  );

  const palette = useMemo(
    () =>
      themeMode === "dark"
        ? {
            background: "#0a0d12",
            fog: "#0a0d12",
            ambient: "#7f8ca0",
            ambientIntensity: 0.52,
            mainLight: "#f2d0a2",
            fillLight: "#6188b1",
            floor: "#12171f",
            roomShell: "#141b24",
            trim: "#2a3545",
            glow: "#d49a52",
            rug: "#2b2220",
            wood: "#4b3527",
            stool: "#5e4737",
            table: "#3e2e24",
            notebook: "#cfbf9e",
            notebookHot: "#f4ead5",
            notebookGlow: "#6e5330",
            windowSky: "#102035",
            windowGlow: "#f0e7c0",
            cloud: "#7d8da7",
            frameMatte: "#efe7d7",
            sparkle: "#d5b073",
            leaf: "#586e56",
            ceramic: "#d8cec1",
          }
        : {
            background: "#e9ddcb",
            fog: "#e9ddcb",
            ambient: "#f5ebd8",
            ambientIntensity: 0.84,
            mainLight: "#f5d7ad",
            fillLight: "#91aeca",
            floor: "#c5b39d",
            roomShell: "#f0e6d6",
            trim: "#d8c6ad",
            glow: "#d6b173",
            rug: "#c6a886",
            wood: "#7a5a40",
            stool: "#8e6b50",
            table: "#8a684d",
            notebook: "#d8c7a7",
            notebookHot: "#fff2d8",
            notebookGlow: "#a07233",
            windowSky: "#d9efff",
            windowGlow: "#ffd36b",
            cloud: "#ffffff",
            frameMatte: "#f7efe5",
            sparkle: "#b88d53",
            leaf: "#6f8861",
            ceramic: "#f5efe7",
          },
    [themeMode],
  );

  return (
    <>
      <color attach="background" args={[palette.background]} />
      <fog attach="fog" args={[palette.fog, 11, 23]} />
      <ambientLight intensity={palette.ambientIntensity} color={palette.ambient} />
      <spotLight
        position={[-2.2, 8.4, 4.2]}
        angle={0.38}
        penumbra={0.82}
        intensity={themeMode === "dark" ? 72 : 66}
        color={palette.mainLight}
        castShadow
      />
      <spotLight
        position={[5.6, 7.2, -0.5]}
        angle={0.34}
        penumbra={0.9}
        intensity={phase === "creating" ? 58 : themeMode === "dark" ? 26 : 34}
        color={themeMode === "dark" ? "#f4e9cb" : "#f9ebcb"}
      />
      <pointLight position={[-5.8, 3.7, -3.2]} intensity={themeMode === "dark" ? 11 : 8} color={palette.fillLight} />
      <pointLight position={[0, 3.8, -6.1]} intensity={themeMode === "dark" ? 8 : 10} color={themeMode === "dark" ? "#e0ca8b" : "#fff0c6"} />

      <CameraRig
        phase={phase}
        performanceTier={performanceTier}
        reducedMotion={reducedMotion}
        orbitEnabled={orbitEnabled}
      />

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
        <circleGeometry args={[8.8, 64]} />
        <meshStandardMaterial color={palette.floor} roughness={0.96} metalness={0.05} />
      </mesh>
      <mesh position={[0, 2.25, 0]}>
        <cylinderGeometry args={[8.9, 8.9, 5.8, 64, 1, true]} />
        <meshStandardMaterial color={palette.roomShell} roughness={0.95} metalness={0.04} side={BackSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 2.36, 0]}>
        <ringGeometry args={[7.45, 8.4, 64]} />
        <meshStandardMaterial color={palette.trim} roughness={0.88} metalness={0.08} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <ringGeometry args={[7.5, 8.5, 64]} />
        <meshStandardMaterial color={palette.trim} roughness={0.92} />
      </mesh>

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0.25, -0.52, 0.25]}>
        <circleGeometry args={[2.35, 48]} />
        <meshStandardMaterial color={palette.rug} roughness={0.94} />
      </mesh>

      <group position={[0.25, -0.08, 0.25]}>
        <mesh castShadow receiveShadow position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.62, 0.74, 0.18, 28]} />
          <meshStandardMaterial color={palette.stool} roughness={0.78} />
        </mesh>
        <mesh castShadow position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.13, 0.15, 0.48, 18]} />
          <meshStandardMaterial color={palette.stool} roughness={0.78} />
        </mesh>
        <mesh castShadow position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.38, 0.44, 0.12, 20]} />
          <meshStandardMaterial color={palette.stool} roughness={0.78} />
        </mesh>
        <mesh castShadow position={[0, 1.02, -0.42]}>
          <boxGeometry args={[0.8, 1.05, 0.12]} />
          <meshStandardMaterial color={palette.stool} roughness={0.78} />
        </mesh>
        <mesh castShadow position={[-0.38, 0.62, -0.18]}>
          <boxGeometry args={[0.1, 0.68, 0.1]} />
          <meshStandardMaterial color={palette.stool} roughness={0.78} />
        </mesh>
        <mesh castShadow position={[0.38, 0.62, -0.18]}>
          <boxGeometry args={[0.1, 0.68, 0.1]} />
          <meshStandardMaterial color={palette.stool} roughness={0.78} />
        </mesh>
      </group>

      <group position={[0.1, -0.1, 2.9]}>
        <mesh castShadow receiveShadow position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.98, 1.22, 0.9, 36]} />
          <meshStandardMaterial color={palette.table} roughness={0.95} metalness={0.1} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.94, 0]}>
          <boxGeometry args={[2.35, 0.14, 1.4]} />
          <meshStandardMaterial color="#b38d63" roughness={0.55} metalness={0.2} />
        </mesh>
        <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.08}>
          <group
            position={[0, 1.03, 0.14]}
            onPointerEnter={() => onHoverNotebook(true)}
            onPointerLeave={() => onHoverNotebook(false)}
            onClick={onTogglePrompt}
          >
            <mesh castShadow rotation={[-0.12, 0.06, 0.08]}>
              <boxGeometry args={[1.3, 0.08, 0.96]} />
              <meshStandardMaterial
                color={hoveredNotebook || phase === "prompting" ? palette.notebookHot : palette.notebook}
                emissive={hoveredNotebook || phase === "prompting" ? palette.notebookGlow : "#000000"}
                emissiveIntensity={hoveredNotebook || phase === "prompting" ? 0.28 : 0}
                roughness={0.6}
              />
            </mesh>
            <mesh position={[0.58, 0.05, 0.2]} rotation={[-0.6, 0.18, -0.15]}>
              <cylinderGeometry args={[0.035, 0.035, 1.2, 18]} />
              <meshStandardMaterial color="#ceb28a" metalness={0.5} roughness={0.3} />
            </mesh>
          </group>
        </Float>
        {showPromptInScene ? (
          <Html transform distanceFactor={1.4} position={[0.18, 1.72, 0.72]} occlude>
            <PromptNotebook
              prompt={prompt}
              negativePrompt={negativePrompt}
              aspectRatio={aspectRatio}
              disabled={isGenerating}
              errorMessage={errorMessage}
              onPromptChange={onPromptChange}
              onNegativePromptChange={onNegativePromptChange}
              onAspectRatioChange={onAspectRatioChange}
              onClose={onClosePrompt}
              onSubmit={onSubmitPrompt}
            />
          </Html>
        ) : null}
      </group>

      <group position={[0, 2.45, -8.2]}>
        <mesh castShadow position={[0, 0, 0]}>
          <boxGeometry args={[2.2, 1.8, 0.12]} />
          <meshStandardMaterial color={palette.wood} roughness={0.74} />
        </mesh>
        <mesh position={[0, 0, 0.08]}>
          <planeGeometry args={[1.82, 1.42]} />
          <meshBasicMaterial color={palette.windowSky} />
        </mesh>
        {themeMode === "dark" ? (
          <>
            <mesh position={[0.28, 0.25, 0.1]}>
              <sphereGeometry args={[0.18, 18, 18]} />
              <meshBasicMaterial color={palette.windowGlow} />
            </mesh>
            {WINDOW_STARS.map((star, index) => (
              <mesh key={`star-${index}`} position={[star[0], star[1], 0.1]}>
                <sphereGeometry args={[star[2], 10, 10]} />
                <meshBasicMaterial color="#f8f4df" />
              </mesh>
            ))}
          </>
        ) : (
          <>
            <mesh position={[0.28, 0.24, 0.1]}>
              <sphereGeometry args={[0.24, 24, 24]} />
              <meshBasicMaterial color={palette.windowGlow} />
            </mesh>
            {WINDOW_CLOUDS.map((cloud, index) => (
              <group key={`cloud-${index}`} position={[cloud[0], cloud[1], 0.1]}>
                <mesh position={[0, 0, 0]}>
                  <sphereGeometry args={[0.14 * cloud[2], 18, 18]} />
                  <meshBasicMaterial color={palette.cloud} />
                </mesh>
                <mesh position={[0.16, 0.05, 0]}>
                  <sphereGeometry args={[0.18 * cloud[2], 18, 18]} />
                  <meshBasicMaterial color={palette.cloud} />
                </mesh>
                <mesh position={[-0.14, -0.02, 0]}>
                  <sphereGeometry args={[0.12 * cloud[2], 18, 18]} />
                  <meshBasicMaterial color={palette.cloud} />
                </mesh>
              </group>
            ))}
          </>
        )}
      </group>

      <group position={[-5.15, 0.15, -3.05]} rotation={[0, 0.45, 0]}>
        <mesh castShadow receiveShadow position={[0, 1.1, 0]}>
          <boxGeometry args={[1.8, 0.1, 0.38]} />
          <meshStandardMaterial color={palette.wood} roughness={0.84} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.45, 0]}>
          <boxGeometry args={[2.1, 0.18, 0.48]} />
          <meshStandardMaterial color={palette.wood} roughness={0.84} />
        </mesh>
        <mesh castShadow position={[-0.82, 0.72, 0]}>
          <boxGeometry args={[0.14, 1.4, 0.42]} />
          <meshStandardMaterial color={palette.wood} roughness={0.84} />
        </mesh>
        <mesh castShadow position={[0.82, 0.72, 0]}>
          <boxGeometry args={[0.14, 1.4, 0.42]} />
          <meshStandardMaterial color={palette.wood} roughness={0.84} />
        </mesh>
        {books.map((book) => (
          <mesh key={book.position.join(",")} position={book.position} rotation={[0, 0.18, 0]}>
            <boxGeometry args={[0.22, 0.4, 0.28]} />
            <meshStandardMaterial color={book.color} roughness={0.85} />
          </mesh>
        ))}
      </group>

      <group position={[5.35, -0.12, 3.45]} rotation={[0, -0.7, 0]}>
        <mesh castShadow receiveShadow position={[0, 0.58, 0]}>
          <cylinderGeometry args={[0.22, 0.32, 1.16, 18]} />
          <meshStandardMaterial color="#8c7d68" roughness={0.95} />
        </mesh>
        <mesh position={[0, 1.28, 0]}>
          <sphereGeometry args={[0.52, 24, 24]} />
          <meshStandardMaterial color={palette.leaf} roughness={0.95} />
        </mesh>
        <mesh position={[-0.16, 1.54, 0.1]}>
          <sphereGeometry args={[0.32, 20, 20]} />
          <meshStandardMaterial color={palette.leaf} roughness={0.95} />
        </mesh>
      </group>

      <group position={[6.1, -0.08, -3.3]} rotation={[0, -1.05, 0]}>
        <mesh castShadow receiveShadow position={[0, 0.55, 0]}>
          <boxGeometry args={[1.7, 1.1, 0.78]} />
          <meshStandardMaterial color={palette.wood} roughness={0.82} />
        </mesh>
        <mesh position={[0.45, 1.12, 0.02]}>
          <cylinderGeometry args={[0.1, 0.12, 0.32, 18]} />
          <meshStandardMaterial color={palette.ceramic} roughness={0.92} />
        </mesh>
        <mesh position={[-0.22, 1.16, -0.08]}>
          <cylinderGeometry args={[0.08, 0.08, 0.24, 18]} />
          <meshStandardMaterial color="#a06e55" roughness={0.8} />
        </mesh>
      </group>

      {WALL_FRAMES.map((frame, index) => (
        <group key={`frame-${index}`} position={frame.position} rotation={frame.rotation}>
          <mesh castShadow>
            <boxGeometry args={[1.1, 0.9, 0.08]} />
            <meshStandardMaterial color={palette.wood} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <planeGeometry args={[0.88, 0.68]} />
            <meshBasicMaterial color={palette.frameMatte} />
          </mesh>
          <mesh position={[0, 0.08, 0.055]}>
            <planeGeometry args={[0.58, 0.1]} />
            <meshBasicMaterial color={frame.accent} />
          </mesh>
          <mesh position={[-0.12, -0.08, 0.055]} rotation={[0, 0, -0.45]}>
            <planeGeometry args={[0.26, 0.03]} />
            <meshBasicMaterial color={themeMode === "dark" ? "#3a4b61" : "#425b76"} />
          </mesh>
          <mesh position={[0.14, -0.15, 0.055]} rotation={[0, 0, 0.38]}>
            <planeGeometry args={[0.18, 0.03]} />
            <meshBasicMaterial color={themeMode === "dark" ? "#9c6f54" : "#7c5537"} />
          </mesh>
        </group>
      ))}

      <Artist phase={phase} stage={creationStage} reducedMotion={reducedMotion} />
      <CanvasEasel phase={phase} stage={creationStage} generation={generation} />

      <Sparkles
        count={performanceTier === "low" ? 12 : themeMode === "dark" ? 28 : 14}
        scale={[12, 5.8, 12]}
        position={[0, 2.35, 0]}
        speed={0.16}
        size={themeMode === "dark" ? 2 : 1.3}
        color={palette.sparkle}
      />

      <ContactShadows
        position={[0, -0.54, 0]}
        opacity={themeMode === "dark" ? 0.42 : 0.28}
        width={15}
        height={15}
        blur={2.8}
      />
    </>
  );
}
