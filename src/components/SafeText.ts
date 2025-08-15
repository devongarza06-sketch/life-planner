// tiny helper to avoid JSX parsing issues with '>' characters (some bundlers get picky)
export function safeText(s: string) {
  return (s || "").replace(/>/g, "≥");
}
