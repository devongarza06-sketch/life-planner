"use client";
import { useEffect, useRef } from "react";

export default function useRafUpdate(cb: () => void) {
  const raf = useRef<number | null>(null);
  const schedule = () => {
    if (raf.current != null) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      raf.current = null;
      cb();
    });
  };
  useEffect(() => () => {
    if (raf.current != null) cancelAnimationFrame(raf.current);
  }, []);
  return schedule;
}
