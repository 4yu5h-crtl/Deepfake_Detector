import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, AlertCircle } from "lucide-react";

interface HeatmapPreviewProps {
  heatmaps: string[];
  type: "image" | "video";
}

export function HeatmapPreview({ heatmaps, type }: HeatmapPreviewProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && type === "video" && heatmaps.length > 1) {
      interval = setInterval(() => {
        setCurrentIdx((prev) => (prev + 1) % heatmaps.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, type, heatmaps.length]);

  if (!heatmaps || heatmaps.length === 0) {
    return (
      <div className="glass-card p-4 h-40 flex flex-col items-center justify-center text-muted-foreground">
        <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
        <p className="text-xs">No heatmaps available for this analysis.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card p-4"
    >
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        {type === "video" ? "Temporal Manipulation Heatmap" : "Localization Heatmap"}
      </h3>

      <div className="relative aspect-square rounded-lg overflow-hidden border border-white/5 bg-black/20 max-w-[400px] mx-auto">
        {/* Real heatmap overlay from backend */}
        <img
          src={heatmaps[currentIdx]}
          alt={`Analysis Heatmap ${currentIdx + 1}`}
          className="w-full h-full object-contain"
          key={heatmaps[currentIdx]}
        />

        {/* Animated scan effect (Decorative) */}
        <motion.div
          className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          animate={{ y: [0, 200, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />

        {type === "video" && heatmaps.length > 1 && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors border border-white/10"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white ml-0.5" />
              )}
            </button>

            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/60 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / heatmaps.length) * 100}%` }}
              />
            </div>

            <div className="text-[10px] text-white/70 font-mono bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded border border-white/5">
              {currentIdx + 1}/{heatmaps.length}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
