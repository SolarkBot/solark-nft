import { useStudioStore } from "@/store/studio-store";

const DEFAULT_STATE = {
  phase: "arrival" as const,
  creationStage: "idle" as const,
  themeMode: "dark" as const,
  prompt: "",
  negativePrompt: "",
  generation: null,
  errorMessage: null,
  hoveredNotebook: false,
  isGenerating: false,
  lastPrompt: "",
  aspectRatio: "1:1" as const,
  selectedExample: "A lunar koi painted in brass ink",
  performanceTier: "balanced" as const,
  reducedMotion: false,
  isMobileLayout: false,
};

describe("studio store", () => {
  afterEach(() => {
    useStudioStore.setState(DEFAULT_STATE);
  });

  it("toggles from invitation to prompting", () => {
    useStudioStore.setState({ ...DEFAULT_STATE, phase: "invitation" });

    useStudioStore.getState().togglePrompt();

    expect(useStudioStore.getState().phase).toBe("prompting");
  });

  it("toggles from prompting back to invitation", () => {
    useStudioStore.setState({ ...DEFAULT_STATE, phase: "prompting" });

    useStudioStore.getState().togglePrompt();

    expect(useStudioStore.getState().phase).toBe("invitation");
  });

  it("closes the notebook without clearing the draft", () => {
    useStudioStore.setState({
      ...DEFAULT_STATE,
      phase: "prompting",
      prompt: "A lacquered fox under stage light",
      negativePrompt: "text, watermark",
    });

    useStudioStore.getState().closePrompt();

    const state = useStudioStore.getState();
    expect(state.phase).toBe("invitation");
    expect(state.prompt).toBe("A lacquered fox under stage light");
    expect(state.negativePrompt).toBe("text, watermark");
  });

  it("ignores notebook toggle while creating", () => {
    useStudioStore.setState({ ...DEFAULT_STATE, phase: "creating" });

    useStudioStore.getState().togglePrompt();

    expect(useStudioStore.getState().phase).toBe("creating");
  });

  it("ignores notebook toggle while revealing", () => {
    useStudioStore.setState({ ...DEFAULT_STATE, phase: "reveal" });

    useStudioStore.getState().togglePrompt();

    expect(useStudioStore.getState().phase).toBe("reveal");
  });

  it("moves into creation state", () => {
    useStudioStore.setState({ ...DEFAULT_STATE, prompt: "A brass bird in moonlight" });
    useStudioStore.getState().beginCreation();

    const state = useStudioStore.getState();
    expect(state.phase).toBe("creating");
    expect(state.creationStage).toBe("thinking");
    expect(state.lastPrompt).toBe("A brass bird in moonlight");
  });
});
