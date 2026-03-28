import { useStudioStore } from "@/store/studio-store";

const DEFAULT_STATE = {
  phase: "arrival" as const,
  creationStage: "idle" as const,
  themeMode: "dark" as const,
  creationMode: null,
  isChoicePopupOpen: false,
  isUploadPanelOpen: false,
  prompt: "",
  negativePrompt: "",
  generation: null,
  uploadedArtworkDraft: null,
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

  it("opens the creation chooser from invitation", () => {
    useStudioStore.setState({ ...DEFAULT_STATE, phase: "invitation" });

    useStudioStore.getState().openCreationChoice();

    const state = useStudioStore.getState();
    expect(state.isChoicePopupOpen).toBe(true);
    expect(state.phase).toBe("invitation");
  });

  it("switches into upload mode", () => {
    useStudioStore.setState({ ...DEFAULT_STATE, phase: "invitation", isChoicePopupOpen: true });

    useStudioStore.getState().chooseUploadMode();

    const state = useStudioStore.getState();
    expect(state.creationMode).toBe("uploaded");
    expect(state.isChoicePopupOpen).toBe(false);
    expect(state.isUploadPanelOpen).toBe(true);
  });

  it("startAnother clears the revealed artwork and opens a fresh prompt flow", () => {
    useStudioStore.setState({
      ...DEFAULT_STATE,
      phase: "reveal",
      generation: {
        artifactId: "art-1",
        sourceType: "generated",
        imageUrl: "data:image/png;base64,abc",
        width: 1024,
        height: 1024,
        prompt: "A graphite heron",
        aspectRatio: "1:1",
        provider: "nvidia-build",
        model: "stabilityai/stable-diffusion-3-medium",
      },
      prompt: "Old prompt",
      negativePrompt: "text",
      isGenerating: true,
    });

    useStudioStore.getState().startAnother();

    const state = useStudioStore.getState();
    expect(state.phase).toBe("prompting");
    expect(state.generation).toBeNull();
    expect(state.prompt).toBe("");
    expect(state.negativePrompt).toBe("");
    expect(state.isGenerating).toBe(false);
  });

  it("resetToStudio clears the revealed artwork without reopening the old reveal", () => {
    useStudioStore.setState({
      ...DEFAULT_STATE,
      phase: "reveal",
      generation: {
        artifactId: "art-2",
        sourceType: "generated",
        imageUrl: "data:image/png;base64,def",
        width: 1024,
        height: 1024,
        prompt: "A brass ibis",
        aspectRatio: "1:1",
        provider: "nvidia-build",
        model: "stabilityai/stable-diffusion-3-medium",
      },
      prompt: "Current draft",
      lastPrompt: "Remembered draft",
      isGenerating: true,
    });

    useStudioStore.getState().resetToStudio();

    const state = useStudioStore.getState();
    expect(state.phase).toBe("invitation");
    expect(state.generation).toBeNull();
    expect(state.prompt).toBe("Remembered draft");
    expect(state.isGenerating).toBe(false);
  });

  it("startUploadAnother reopens the upload panel with a clean draft", () => {
    useStudioStore.setState({
      ...DEFAULT_STATE,
      phase: "reveal",
      creationMode: "uploaded",
      generation: {
        artifactId: "art-3",
        sourceType: "uploaded",
        imageUrl: "data:image/png;base64,ghi",
        width: 1000,
        height: 1000,
        aspectRatio: "1:1",
        fileName: "piece.png",
      },
      uploadedArtworkDraft: {
        artifactId: "draft-3",
        sourceType: "uploaded",
        imageUrl: "data:image/png;base64,jkl",
        width: 800,
        height: 800,
        aspectRatio: "1:1",
        fileName: "draft.png",
      },
    });

    useStudioStore.getState().startUploadAnother();

    const state = useStudioStore.getState();
    expect(state.phase).toBe("invitation");
    expect(state.creationMode).toBe("uploaded");
    expect(state.isUploadPanelOpen).toBe(true);
    expect(state.uploadedArtworkDraft).toBeNull();
    expect(state.generation).toBeNull();
  });
});
