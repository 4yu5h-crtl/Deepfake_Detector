import { motion } from "framer-motion";
import { AlertTriangle, Shield } from "lucide-react";

interface StatusCardProps {
  status: "FAKE" | "REAL";
  confidence: number;
}

export function StatusCard({ status, confidence }: StatusCardProps) {
  const isFake = status === "FAKE";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-card p-6 text-center relative overflow-hidden ${
        isFake ? "neon-glow-red" : "neon-glow-green"
      }`}
    >
      {/* Animated scan line */}
      <div 
        className={`absolute inset-x-0 h-px animate-scan-line ${
          isFake ? "bg-destructive/50" : "bg-success/50"
        }`}
      />

      <div className="flex items-center justify-center gap-2 mb-2">
        {isFake ? (
          <AlertTriangle className="w-5 h-5 text-destructive" />
        ) : (
          <Shield className="w-5 h-5 text-success" />
        )}
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Analysis Result
        </span>
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`text-5xl font-bold tracking-tight mb-3 animate-pulse-glow ${
          isFake ? "text-destructive" : "text-success"
        }`}
      >
        {status}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-lg text-muted-foreground"
      >
        <span className="font-semibold text-foreground">{confidence.toFixed(1)}%</span>
        {" "}Confidence
      </motion.p>

      {/* Corner accents */}
      <div className={`absolute top-2 left-2 w-4 h-4 border-t border-l ${
        isFake ? "border-destructive/50" : "border-success/50"
      }`} />
      <div className={`absolute top-2 right-2 w-4 h-4 border-t border-r ${
        isFake ? "border-destructive/50" : "border-success/50"
      }`} />
      <div className={`absolute bottom-2 left-2 w-4 h-4 border-b border-l ${
        isFake ? "border-destructive/50" : "border-success/50"
      }`} />
      <div className={`absolute bottom-2 right-2 w-4 h-4 border-b border-r ${
        isFake ? "border-destructive/50" : "border-success/50"
      }`} />
    </motion.div>
  );
}
