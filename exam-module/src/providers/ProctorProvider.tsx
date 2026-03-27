"use client";

import { useEffect, useRef } from "react";
import * as faceDetection from "@tensorflow-models/face-detection";
import * as tf from "@tensorflow/tfjs-core";
// IMPORTANT: We do not import the backend at the top level
// to avoid SSR (Server Side Rendering) conflicts.

export const useProctor = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  onFlag: (type: string) => void,
  enabled: boolean,
) => {
  const detectorRef = useRef<faceDetection.FaceDetector | null>(null);
  const onFlagRef = useRef(onFlag);
  onFlagRef.current = onFlag;

  useEffect(() => {
    if (!enabled) return;

    let interval: NodeJS.Timeout;
    let isMounted = true;

    const setupDetector = async () => {
      try {
        // 1. Ensure TensorFlow is initialized only on the Client
        if (typeof window !== "undefined") {
          // Dynamically import the backend so the server never touches it
          await import("@tensorflow/tfjs-backend-webgl");

          if (tf.getBackend() !== "webgl") {
            await tf.setBackend("webgl");
            await tf.ready();
          }
        }

        // 2. Initialize the Detector
        const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
        const detectorConfig: faceDetection.MediaPipeFaceDetectorTfjsModelConfig =
          {
            runtime: "tfjs",
          };

        const detector = await faceDetection.createDetector(
          model,
          detectorConfig,
        );

        if (!isMounted) return;
        detectorRef.current = detector;
        console.log("✅ Proctoring AI initialized and monitoring...");

        // 3. Monitoring Loop
        interval = setInterval(async () => {
          if (
            videoRef.current &&
            videoRef.current.readyState === 4 &&
            detectorRef.current &&
            isMounted
          ) {
            const faces = await detectorRef.current.estimateFaces(
              videoRef.current,
              { flipHorizontal: false },
            );

            // Logic for detecting violations
            if (faces.length > 1) {
              onFlagRef.current("multiple_faces");
            } else if (faces.length === 0) {
              onFlagRef.current("no_face_detected");
            }
          }
        }, 3000); // 2 second check interval
      } catch (error) {
        console.error("Proctoring AI Init Error:", error);
      }
    };

    // 4. Tab Change Detection
    const handleVisibilityChange = () => {
      if (document.hidden) onFlagRef.current("tab_change");
    };

    setupDetector();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 5. Cleanup
    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (detectorRef.current) {
        detectorRef.current.dispose();
      }
    };
  }, [enabled, videoRef]);
};
