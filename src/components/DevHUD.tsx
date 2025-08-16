"use client";
import { useEffect, useState } from "react";

/**
 * DevHUD (debug version)
 * - Always renders a visible banner at the top so we can confirm it mounted.
 * - Still has the bottom-right toggle button.
 * - After we confirm it shows, we’ll switch back to the subtle version.
 */
export default function DevHUD() {
  const [on, setOn] = useState<boolean>(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("devhud:on") : null;
    if (saved === "1") setOn(true);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.classList.toggle("devhud-on", on);
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("devhud:on", on ? "1" : "0");
    }
  }, [on]);

  return (
    <>
      {/* TEMP: Big banner so we can see the HUD is mounted */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: on ? "rgba(108,99,255,0.95)" : "rgba(0,0,0,0.85)",
          color: "white",
          fontSize: 12,
          padding: "6px 10px",
          textAlign: "center"
        }}
      >
        Dev HUD is {on ? "ON" : "OFF"} — click the button in the bottom-right to toggle
      </div>

      {/* Floating toggle button */}
      <button
        aria-label="Toggle Dev HUD"
        onClick={() => setOn(v => !v)}
        style={{
          position: "fixed",
          zIndex: 9999,
          bottom: 16,
          right: 16,
          borderRadius: 9999,
          padding: "8px 10px",
          background: "rgba(0,0,0,0.85)",
          color: "#fff",
          fontSize: 12,
          border: "none",
          cursor: "pointer"
        }}
      >
        {on ? "👁️ Dev HUD: ON" : "👁️ Dev HUD: OFF"}
      </button>
    </>
  );
}
