"use client";
import { useState } from "react";
import { useStore } from "@/state/useStore";

/**
 * Settings page for exporting and importing JSON data.
 */
export default function SettingsPage() {
  const { exportJSON, importJSON } = useStore();
  const [json, setJson] = useState("");

  const handleExport = () => {
    const data = exportJSON();
    setJson(JSON.stringify(data, null, 2));
  };

  const handleImport = async () => {
    try {
      const data = JSON.parse(json);
      await importJSON(data);
      alert("Data imported successfully");
    } catch (err) {
      alert("Invalid JSON");
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <button onClick={handleExport} className="px-4 py-2 bg-accent text-white rounded-md">
        Export JSON
      </button>
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        className="w-full h-60 border rounded-md p-2"
        placeholder="Paste JSON here"
      />
      <button onClick={handleImport} className="px-4 py-2 bg-accent text-white rounded-md">
        Import JSON
      </button>
    </div>
  );
}
