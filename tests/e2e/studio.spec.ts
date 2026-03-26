import { expect, test } from "@playwright/test";

const MOCK_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9sWwaP8AAAAASUVORK5CYII=";

test("desktop flow reveals the artwork", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop-only assertion.");
  await page.emulateMedia({ colorScheme: "dark" });
  await page.route("**/api/generate-image", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        artifactId: "c5d9f5a4-5f79-4811-82d8-f5a2f1d2111b",
        imageUrl: MOCK_IMAGE,
        width: 1024,
        height: 1024,
        prompt: "A museum-grade portrait of a brass koi under moonlight",
        aspectRatio: "1:1",
        provider: "nvidia-build",
        model: "stabilityai/stable-diffusion-3-medium",
      }),
    });
  });

  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("[data-orbit-enabled='true']")).toBeVisible();
  await page.getByRole("button", { name: /open notebook/i }).click();
  await expect(page.locator("[data-orbit-enabled='true']")).toBeVisible();
  await expect(page.getByRole("button", { name: /^close notebook$/i }).first()).toBeVisible();
  await page.getByRole("textbox", { name: /prompt/i }).fill(
    "A museum-grade portrait of a brass koi under moonlight",
  );
  await page.getByRole("button", { name: /give to artist/i }).click();
  await expect(page.locator("[data-orbit-enabled='true']")).toBeVisible();

  await expect(
    page.getByRole("heading", { name: /here.?s what i made for you/i }),
  ).toBeVisible({ timeout: 15000 });
  await expect(page.locator("[data-orbit-enabled='false']")).toBeVisible();
  await expect(page.getByRole("button", { name: /download/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /connect phantom/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /back to studio/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /create another/i })).toBeVisible();
  await expect(page.getByText(/studio note/i)).toHaveCount(0);
  await expect(page.getByText(/a museum-grade portrait of a brass koi under moonlight/i)).toHaveCount(
    0,
  );
  await expect(page.getByText(/1:1\s*-\s*1024x1024/i)).toHaveCount(0);
});

test("mint prompts for a wallet when the user is not connected", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop-only assertion.");
  await page.route("**/api/generate-image", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        artifactId: "2fd9f5a4-5f79-4811-82d8-f5a2f1d2000b",
        imageUrl: MOCK_IMAGE,
        width: 1024,
        height: 1024,
        prompt: "A brass ibis beneath a linen sunshade",
        aspectRatio: "1:1",
        provider: "nvidia-build",
        model: "stabilityai/stable-diffusion-3-medium",
      }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: /open notebook/i }).click();
  await page.getByRole("textbox", { name: /prompt/i }).fill(
    "A brass ibis beneath a linen sunshade",
  );
  await page.getByRole("button", { name: /give to artist/i }).click();

  await expect(
    page.getByRole("heading", { name: /here.?s what i made for you/i }),
  ).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: /connect phantom/i }).click();
  await expect(page.getByText(/phantom was not detected/i)).toBeVisible();
});

test("mobile reveal offers the Phantom handoff when no wallet is injected", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Mobile-only assertion.");

  await page.route("**/api/generate-image", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        artifactId: "81d9f5a4-5f79-4811-82d8-f5a2f1d2000b",
        imageUrl: MOCK_IMAGE,
        width: 1024,
        height: 1024,
        prompt: "A brass ibis beneath a linen sunshade",
        aspectRatio: "1:1",
        provider: "nvidia-build",
        model: "stabilityai/stable-diffusion-3-medium",
      }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: /open notebook/i }).click();
  await page.getByRole("textbox", { name: /prompt/i }).fill(
    "A brass ibis beneath a linen sunshade",
  );
  await page.getByRole("button", { name: /give to artist/i }).click();

  await expect(
    page.getByRole("heading", { name: /here.?s what i made for you/i }),
  ).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("button", { name: /open in phantom/i })).toBeVisible();
});

test("mobile layout still exposes the notebook CTA", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile-only assertion.");
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByText(/swipe to look around the studio/i)).toHaveCount(0);
  await expect(page.getByRole("button", { name: /open notebook/i })).toBeVisible();
  await page.getByRole("button", { name: /open notebook/i }).click();
  await expect(page.getByRole("textbox", { name: /prompt/i })).toBeVisible();
});

test("mobile download falls back to the save screen when share is unavailable", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Mobile-only assertion.");

  await page.route("**/api/generate-image", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        artifactId: "51d9f5a4-5f79-4811-82d8-f5a2f1d2000a",
        imageUrl: MOCK_IMAGE,
        width: 1024,
        height: 1024,
        prompt: "A lacquered fox mask on a linen chair",
        aspectRatio: "1:1",
        provider: "nvidia-build",
        model: "stabilityai/stable-diffusion-3-medium",
      }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: /open notebook/i }).click();
  await page.getByRole("textbox", { name: /prompt/i }).fill(
    "A lacquered fox mask on a linen chair",
  );
  await page.getByRole("button", { name: /give to artist/i }).click();

  await expect(
    page.getByRole("heading", { name: /here.?s what i made for you/i }),
  ).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: /download/i }).click();
  await expect(page).toHaveURL(/\/artwork\/save\?image=/);
  await expect(page.getByRole("heading", { name: /save your artwork/i })).toBeVisible();
  await expect(page.getByText(/tap and hold the artwork to save it/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /open image only/i })).toBeVisible();
});

test("notebook toggle and close preserve the draft", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /open notebook/i }).click();
  await page.getByRole("textbox", { name: /prompt/i }).fill(
    "A graphite heron under amber light",
  );

  await page.getByRole("button", { name: /^close notebook$/i }).nth(1).click();
  await expect(page.getByRole("textbox", { name: /prompt/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /open notebook/i })).toBeVisible();

  await page.getByRole("button", { name: /open notebook/i }).click();
  await expect(page.getByRole("textbox", { name: /prompt/i })).toHaveValue(
    "A graphite heron under amber light",
  );
});

test("idle studio shows orbit guidance and no guided room buttons", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop-only assertion.");
  await page.goto("/");

  await expect(page.locator("[data-orbit-enabled='true']")).toBeVisible();
  await expect(page.getByText(/(drag|swipe) to look around the studio/i)).toHaveCount(0);
  await expect(page.getByRole("button", { name: /bed nook|wall studies|window view|return/i })).toHaveCount(0);
});
