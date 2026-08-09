import { expect, test } from "@playwright/test";

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=",
  "base64",
);

test("renders the grid canvas and custom color picker", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Iso Grid Thing/);
  await expect(page.getByRole("heading", { name: /iso grid thing/i })).toBeVisible();

  const canvas = page.locator("#grid-aspect-container svg");
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box?.width).toBeGreaterThan(100);
  expect(box?.height).toBeGreaterThan(100);

  await page.getByRole("button", { name: "Change color for Line Color" }).click();
  await page.getByRole("button", { name: "Set Line Color to #ef4444" }).click();

  await expect(page.getByLabel("Line Color hex value")).toHaveValue("#ef4444");
  await expect(page.getByLabel("Line Color r channel")).toBeVisible();
  await expect(page.getByLabel("Line Color g channel")).toBeVisible();
  await expect(page.getByLabel("Line Color b channel")).toBeVisible();
});

test("exports portable workspace media and PNG, then reports invalid imports inline", async ({
  page,
}) => {
  await page.goto("/");

  await page.locator('input[accept="image/*,video/*"]').setInputFiles({
    name: "fixture.png",
    mimeType: "image/png",
    buffer: tinyPng,
  });
  await expect(page.locator("#assets-group image")).toHaveCount(1);

  const asset = page.locator("#assets-group g[data-id]").first();
  const initialTransform = await asset.getAttribute("transform");
  const assetBox = await asset.boundingBox();
  expect(assetBox).not.toBeNull();
  await page.mouse.move(assetBox!.x + assetBox!.width / 2, assetBox!.y + assetBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    assetBox!.x + assetBox!.width / 2,
    assetBox!.y + assetBox!.height / 2 + 140,
    {
      steps: 5,
    },
  );
  await page.mouse.up();
  await expect.poll(() => asset.getAttribute("transform")).not.toBe(initialTransform);
  expect(await page.evaluate(() => document.body.style.cursor)).toBe("");

  const workspaceDownload = page.waitForEvent("download");
  await page.getByTitle("Export JSON").click();
  const workspace = await workspaceDownload;
  const workspaceStream = await workspace.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of workspaceStream) chunks.push(Buffer.from(chunk));
  const savedWorkspace = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  expect(savedWorkspace.assets[0].src).toMatch(/^data:image\/png;base64,/);
  await expect(page.getByRole("status")).toContainText("Workspace and media saved");

  const pngDownload = page.waitForEvent("download");
  await page.getByTitle("Export PNG").click();
  expect((await pngDownload).suggestedFilename()).toBe("iso-grid-thing.png");

  await page.locator('input[accept=".json"]').setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from("{invalid"),
  });
  await expect(page.getByRole("alert")).toContainText("Error reading or parsing the file");
});

test("keeps the canvas usable on a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.locator("#settings-sidebar")).toBeInViewport();
  await expect(page.getByText("Grid Layout", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Assets", exact: true }).click();
  await expect(page.locator("#assets-sidebar")).toBeInViewport();
  await expect(page.getByText("Asset Properties", { exact: true })).toBeVisible();
});

test("renders the supported 128 by 128 grid without page errors", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/");

  for (const label of ["Width (X)", "Depth (Y)"]) {
    await page.getByLabel(label).evaluate((input: HTMLInputElement) => {
      input.value = "128";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  await expect(page.getByLabel("Width (X)")).toHaveValue("128");
  await expect(page.getByLabel("Depth (Y)")).toHaveValue("128");
  await expect(page.locator("#grid-aspect-container svg")).toBeVisible();
  expect(pageErrors).toEqual([]);
});
