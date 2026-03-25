import { render, screen } from "@testing-library/react";

import { PromptNotebook } from "@/components/experience/PromptNotebook";

describe("PromptNotebook", () => {
  it("disables the submit button for short prompts", () => {
    render(
      <PromptNotebook
        prompt="short"
        negativePrompt=""
        aspectRatio="1:1"
        disabled={false}
        errorMessage={null}
        onPromptChange={() => undefined}
        onNegativePromptChange={() => undefined}
        onAspectRatioChange={() => undefined}
        onClose={() => undefined}
        onSubmit={() => undefined}
      />,
    );

    expect(screen.getByRole("button", { name: /give to artist/i })).toBeDisabled();
  });
});
