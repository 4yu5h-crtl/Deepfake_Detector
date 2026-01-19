import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Activity, WifiOff } from "lucide-react";
import { apiService } from "@/services/api";

export function DashboardHeader() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      const online = await apiService.checkHealth();
      setIsOnline(online);
    };

    // Initial check
    checkStatus();

    // Poll every 2 seconds
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-6 py-4 border-b border-white/10"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center neon-glow-blue">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">Deepfake Detector</h1>
          <p className="text-xs text-muted-foreground">Multi-Modal Detection System</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <motion.div
          animate={{
            backgroundColor: isOnline ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
            borderColor: isOnline ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"
          }}
          className={`flex items-center gap-2 mr-4 px-3 py-1.5 rounded-full border transition-colors`}
        >
          {isOnline ? (
            <Activity className="w-3 h-3 text-success" />
          ) : (
            <WifiOff className="w-3 h-3 text-destructive" />
          )}
          <span className={`text-[10px] uppercase tracking-wider font-bold ${isOnline ? 'text-success' : 'text-destructive'}`}>
            System {isOnline ? 'Online' : 'Offline'}
          </span>
        </motion.div>
      </div>
    </motion.header>
  );
}
