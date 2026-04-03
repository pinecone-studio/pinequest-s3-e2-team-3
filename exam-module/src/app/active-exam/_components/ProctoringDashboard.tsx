interface ProctorProps {
  videoRef: React.Ref<HTMLVideoElement>;
  isReady: boolean;
  isSpeechDetected: boolean;
}

export const ProctoringDashboard = ({
  videoRef,
  isReady,
  isSpeechDetected,
}: ProctorProps) => {
  return (
    <div className="space-y-6">
      {/* Hidden capture element: stream + face detection need a real video node; students do not see a self-view */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="fixed left-[-9999px] top-0 h-[240px] w-[320px] opacity-0 pointer-events-none"
        aria-hidden
      />

      {/* Speech Detection Indicator */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-800/80 shadow-xl">
        {isReady && (
          <div
            className={`flex items-center gap-2 px-3 py-3 backdrop-blur-md border-b transition-colors duration-300 ${
              isSpeechDetected
                ? "bg-red-900/60 border-red-500/40"
                : "bg-black/40 border-white/10"
            }`}
          >
            <span className="relative flex h-2.5 w-2.5">
              {isSpeechDetected && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
                  isSpeechDetected ? "bg-red-500" : "bg-slate-500"
                }`}
              />
            </span>
            <span
              className={`text-[10px] font-semibold uppercase tracking-widest transition-colors duration-300 ${
                isSpeechDetected ? "text-red-300" : "text-slate-400"
              }`}
            >
              {isSpeechDetected ? "Speech Detected" : "Audio Monitoring"}
            </span>
          </div>
        )}

        {!isReady && (
          <div className="flex items-center justify-center gap-3 px-3 py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="text-xs text-slate-400">Initializing sensors…</span>
          </div>
        )}
      </div>

      {/* Status Card */}
      <div className="p-4 rounded-2xl border border-white/5 text-center">
        <div className="flex opacity-0 items-center justify-center gap-2 mb-2">
          <div
            className={`h-1.5 w-1.5  rounded-full ${isReady ? "bg-green-500 animate-pulse" : "bg-slate-500"}`}
          />
          <span className="text-[10px] opacity: 0 text-slate-400 font-bold uppercase tracking-widest">
            {isReady ? "Encrypted Feed Live" : "Awaiting Sensors"}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 uppercase leading-relaxed">
         
        </p>
      </div>
    </div>
  );
};
