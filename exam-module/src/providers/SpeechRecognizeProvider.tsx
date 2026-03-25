import { useEffect } from "react";

// 1. Add the drawing helper
const drawVisualizer = (
  analyser: AnalyserNode,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const draw = () => {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    // Clear canvas
    ctx.fillStyle = "#1a1a1a"; // Dark background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i] / 2;

      // Color specific "speech" frequencies red, others blue
      ctx.fillStyle = i >= 10 && i <= 40 ? "#ff4d4d" : "#4da6ff";
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  };
  draw();
};

// 2. Update the hook to accept canvasRef
export const useAudioProctor = (
  onFlag: (type: string) => void,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) => {
  useEffect(() => {
    let audioContext: AudioContext;
    let analyser: AnalyserNode;
    let stream: MediaStream;
    let interval: NodeJS.Timeout;

    const initAudio = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("stream", stream);

        audioContext = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();
        console.log("audioContext", audioContext);

        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        // 3. Trigger the visualizer
        if (canvasRef.current) {
          drawVisualizer(analyser, canvasRef);
        }

        const data = new Uint8Array(analyser.frequencyBinCount);
        interval = setInterval(() => {
          analyser.getByteFrequencyData(data);
          const speechRange = data.slice(10, 40);
          const averageVolume =
            speechRange.reduce((a, b) => a + b) / speechRange.length;

          if (averageVolume > 60) {
            onFlag("human_speech_detected");
          }
        }, 10);
      } catch (err) {
        console.error("Audio proctoring failed:", err);
      }
    };

    initAudio();

    return () => {
      if (interval) clearInterval(interval);
      if (stream) stream.getTracks().forEach((track) => track.stop());
      if (audioContext) audioContext.close();
    };
  }, [onFlag, canvasRef]); // 4. Add canvasRef to dependencies
};
