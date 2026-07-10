"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useStudio } from "../studio-context";
import { DEFAULT_PRODUCT, type StudioProduct } from "@/lib/easyvariants/config";

type WizardValue = {
  /** Current screen index (0..4). */
  step: number;
  /** Furthest screen the user has unlocked — gates stepper navigation. */
  maxReached: number;
  /** Selected / uploaded product image (may be null for gradient-only samples). */
  source: string | null;
  /** Display name of the chosen image — also the "has selection" signal. */
  sourceName: string | null;
  /** The catalog product driving the 3D model + try-on (defaults to red shirt). */
  product: StudioProduct;
  setSource: (url: string | null, name?: string | null) => void;
  /** Pick a catalog product — sets the source image + the 3D/try-on asset. */
  selectProduct: (product: StudioProduct) => void;
  goTo: (n: number) => void;
  next: () => void;
  back: () => void;
  restart: () => void;
};

const WizardContext = createContext<WizardValue | null>(null);

/**
 * Drives the linear studio flow. Sits inside StudioProvider so it can kick off
 * the (mock) reconstruction and react to its status for auto-advancing.
 */
export function WizardProvider({ children }: { children: ReactNode }) {
  const { status, reset } = useStudio();
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [source, setSourceState] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState<string | null>(null);
  const [product, setProduct] = useState<StudioProduct>(DEFAULT_PRODUCT);

  const goTo = useCallback((n: number) => {
    setStep(n);
    setMaxReached((m) => Math.max(m, n));
  }, []);

  const setSource = useCallback(
    (url: string | null, name: string | null = null) => {
      setSourceState(url);
      setSourceName(name);
      // An uploaded image has no reconstructed asset — fall back to the default
      // product's GLB / try-on shot so the rest of the flow still demos.
      setProduct(DEFAULT_PRODUCT);
    },
    [],
  );

  const selectProduct = useCallback((p: StudioProduct) => {
    setProduct(p);
    setSourceState(p.image);
    setSourceName(p.name);
  }, []);

  const next = useCallback(() => {
    if (step === 0) goTo(1);
    else if (step === 2) goTo(3);
    else if (step === 3) goTo(4);
  }, [step, goTo]);

  const back = useCallback(() => {
    // From the model view we jump straight back to the gallery (skipping the
    // transient reconstruction screen) and clear the generation state.
    if (step === 1 || step === 2) {
      reset();
      goTo(0);
    } else if (step === 3) {
      goTo(2);
    } else if (step === 4) {
      goTo(3);
    }
  }, [step, goTo, reset]);

  const restart = useCallback(() => {
    reset();
    setSourceState(null);
    setSourceName(null);
    setProduct(DEFAULT_PRODUCT);
    setStep(0);
    setMaxReached(0);
  }, [reset]);

  // When the reconstruction finishes on the processing screen, reveal the model.
  useEffect(() => {
    if (step === 1 && status === "ready") {
      const t = window.setTimeout(() => goTo(2), 800);
      return () => window.clearTimeout(t);
    }
  }, [step, status, goTo]);

  const value = useMemo<WizardValue>(
    () => ({
      step,
      maxReached,
      source,
      sourceName,
      product,
      setSource,
      selectProduct,
      goTo,
      next,
      back,
      restart,
    }),
    [
      step,
      maxReached,
      source,
      sourceName,
      product,
      setSource,
      selectProduct,
      goTo,
      next,
      back,
      restart,
    ],
  );

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within WizardProvider");
  return ctx;
}
