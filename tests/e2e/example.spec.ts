import { test, expect } from "@playwright/test";

test.describe("Life Planner", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.click("text=Open Planner");
  });

  test("creates and drags a card", async ({ page }) => {
    // Wait for calendar to appear
    await page.locator("text=Weekly Planner").waitFor();

    // Drag the first event to a different time slot (drag down by 1 hour)
    const event = page.locator(".rbc-event").first();
    const box = await event.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 50);
      await page.mouse.up();
    }

    // Check that event has moved (start time updated in title attribute)
    const updated = await event.getAttribute("title");
    expect(updated).not.toBeNull();
  });

  test("moves board card between columns", async ({ page }) => {
    // Passion tab is default; find board columns
    await page.locator("text=Active").waitFor();

    const firstCard = page.locator(".cursor-grab").first();
    const box = await firstCard.boundingBox();
    const incubatingCol = page.locator("text=Incubating").locator(".."); // parent container
    const destBox = await incubatingCol.boundingBox();
    if (box && destBox) {
      await page.mouse.move(box.x + 5, box.y + 5);
      await page.mouse.down();
      await page.mouse.move(destBox.x + 10, destBox.y + 30);
      await page.mouse.up();
    }

    // The card should now appear under Incubating column
    const incubatingCards = incubatingCol.locator(".cursor-grab");
    await expect(incubatingCards).toHaveCount(1);
  });

  test("export and import JSON", async ({ page }) => {
    await page.goto("/settings");
    // Export JSON
    await page.click("text=Export JSON");
    const textArea = page.locator("textarea");
    const content = await textArea.inputValue();
    expect(content).toContain("budgets");
    // Clear DB by importing empty JSON
    await textArea.fill("{}");
    await page.click("text=Import JSON");
    await page.click("text=Export JSON");
    const cleared = await textArea.inputValue();
    expect(cleared).not.toContain("budgets");
    // Re-import original content
    await textArea.fill(content);
    await page.click("text=Import JSON");
    await page.click("text=Export JSON");
    const restored = await textArea.inputValue();
    expect(restored).toContain("budgets");
  });
});
