import { describe, it, expect } from "vitest";
import { useStore } from "../src/state/useStore";

describe("store", () => {
  it("updates budget and clamps between 0..100", () => {
    const s = useStore.getState();
    s.updateBudget(0, 120);
    expect(useStore.getState().budgets[0].daily[0]).toBe(100);
    s.updateBudget(0, -10);
    expect(useStore.getState().budgets[0].daily[0]).toBe(0);
  });

  it("moves board cards between columns", () => {
    const s = useStore.getState();
    const id = s.boards[0].id;
    s.moveBoardCard(id, "dormant");
    expect(useStore.getState().boards.find(b=>b.id===id)?.status).toBe("dormant");
  });
});
