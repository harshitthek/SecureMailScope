"use client";

import { useState, useCallback } from "react";
import { AnalysisResult } from "@/lib/types";
import { uploadPcap, getAnalysis } from "@/lib/api";
import { MOCK_RESULT } from "@/lib/mock-data";

export type AnalysisState = "idle" | "uploading" | "analyzing" | "done" | "error";

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const startAnalysis = useCallback(async (file: File) => {
    setCurrentFile(file);
    setError(null);
    setState("uploading");

    try {
      const analysisId = await uploadPcap(file);
      setState("analyzing");

      await new Promise((resolve) => setTimeout(resolve, 800));

      const data = await getAnalysis(analysisId);
      setResult(data);
      setState("done");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred during PCAP inspection.");
      }
      setState("error");
    }
  }, []);

  const loadDemoData = useCallback(() => {
    setState("analyzing");
    setTimeout(() => {
      setResult(MOCK_RESULT);
      setState("done");
    }, 600);
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setResult(null);
    setError(null);
    setCurrentFile(null);
  }, []);

  return {
    state,
    result,
    error,
    currentFile,
    startAnalysis,
    loadDemoData,
    reset,
  };
}
