"use client";
import { useEffect, useMemo, useState } from "react";

/**
 * DevHUD (diagnostic version)
 * - Floating button toggles overlay.
 * - Applies 'devhud-on' to BOTH <body> and <html> (documentElement).
 * - Shows counts of [data-component] nodes so we know if labels exist in DOM.
 * - "Force highlight" adds an inline style to the FIRST labeled element so you can see it instantly.
 */
export default function DevHUD() {
  const [on, setOn] = useState<boolean>(false);
  const [labeledCount, setLabeledCount] = useState<number>(0);
  const [hasBodyClass, setHasBodyClass] = useState<boolean>(false);
  const [hasHtmlClass, setHasHtmlClass] = useState<boolean>(false);

  // Load persisted state
  useEffect(() => {
    const saved = localStorage.getItem("devhud:on");
    if (saved === "1") setOn(true);
  }, []);

  // Apply/remove class to BOTH <body> and <html>
  useEffect(() => {
    const toggle = (el: HTMLElement) => el.classList.toggle("devhud-on", on);
    toggle(document.body);
    toggle(document.documentElement);
    localStorage.setItem("devhud:on", on ? "1" : "0");

    setHasBodyClass(document.body.classList.contains("devhud-on"));
    setHasHtmlClass(document.documentElement.classList.contains("devhud-on"));

    // Count labeled elements
    const count = document.querySelectorAll("[data-component]").length;
    setLabeledCount(count);
  }, [on]);

  const forceHighlight = () => {
    const first = document.querySelector("[data-component]") as HTMLElement | null;
    if (first) {
      first.style.outline = "2px dashed #6C63FF";
      first.style.outlineOffset = "4px";
      first.style.position = "relative";
      // Add a quick label if none is visible
      const labelId = "devhud-temp-label";
      if (!first.querySelector(`#${labelId}`)) {
        const chip = document.createElement("div");
        chip.id = labelId;
        chip.textContent = first.getAttribute("data-component") || "component";
        Object.assign(chip.style, {
          position: "absolute",
          top: "-14px",
          left: "0",
          background: "rgba(108,99,255,0.9)",
          color: "white",
          fontSize: "10px",
          padding: "2px 6px",
          borderRadius: "6px",
          pointerEvents: "none",
          zIndex: "1"
        } as CSSStyleDeclaration);
        first.appendChild(chip);
      }
    } else {
      alert("No [data-component] elements found in the DOM.");
    }
  };

  return (
    <>
      <button
        aria-label="Toggle Dev HUD"
        onClick={() => setOn(v => !v)}
        className="fixed z-[9999] bottom-4 right-4 rounded-full px-3 py-2 shadow-lg
                   bg-black/80 text-white text-xs hover:bg-black transition"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {on ? "👁️ Dev HUD: ON" : "👁️ Dev HUD: OFF"}
      </button>

      {on && (
        <div className="fixed bottom-16 right-4 z-[9999] rounded-md bg-black/70 text-white text-xs px-3 py-2 space-y-1">
          <div>Labeled elements: <b>{labeledCount}</b></div>
          <div>&lt;body&gt; has class: <b>{hasBodyClass ? "yes" : "no"}</b></div>
          <div>&lt;html&gt; has class: <b>{hasHtmlClass ? "yes" : "no"}</b></div>
          <button
            onClick={forceHighlight}
            className="mt-1 w-full bg-white/10 hover:bg-white/20 rounded px-2 py-1"
          >
            Force highlight first labeled element
          </button>
        </div>
      )}
    </>
  );
}
