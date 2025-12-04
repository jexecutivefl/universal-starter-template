"use client";

import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);

export default function App() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>EHR Platform</h1>
      <p>Backend connected successfully.</p>
    </main>
  );
}
