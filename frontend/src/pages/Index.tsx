import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SessionHistory, Session } from "@/components/SessionHistory";
import { UploadZone } from "@/components/UploadZone";
import { StatusCard } from "@/components/StatusCard";
import { ProbabilityChart } from "@/components/ProbabilityChart";
import { HeatmapPreview } from "@/components/HeatmapPreview";
import { apiService, AnalysisResult } from "@/services/api";
import { toast } from "sonner";

const Index = () => {
  const [selectedSession, setSelectedSession] = useState<string | undefined>(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("analysis_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      toast.info(`Uploading ${file.name}...`);
      const upload = await apiService.uploadFile(file);

      toast.info("Processing frames and running inference...");
      const fileType = file.type.startsWith("video") ? "video" : "image";
      const result = await apiService.runPredict(upload.filename, fileType);

      setAnalysisResult(result);
      toast.success("Analysis complete!");

      // Save to history
      const newSession: Session = {
        id: Date.now().toString(),
        name: file.name,
        type: fileType as "video" | "image",
        status: result.final_prediction,
        timestamp: "Just now",
      };

      const updatedSessions = [newSession, ...sessions];
      setSessions(updatedSessions);
      localStorage.setItem("analysis_history", JSON.stringify(updatedSessions));
      localStorage.setItem(`result_${newSession.id}`, JSON.stringify(result));
      setSelectedSession(newSession.id);

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSession = (session: Session) => {
    setSelectedSession(session.id);
    const savedResult = localStorage.getItem(`result_${session.id}`);
    if (savedResult) {
      setAnalysisResult(JSON.parse(savedResult));
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    localStorage.setItem("analysis_history", JSON.stringify(updatedSessions));
    localStorage.removeItem(`result_${sessionId}`);

    if (selectedSession === sessionId) {
      setSelectedSession(undefined);
      setAnalysisResult(null);
    }
    toast.success("Session deleted");
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background cyber grid effect */}
      <div className="fixed inset-0 cyber-grid opacity-30 pointer-events-none" />

      {/* Ambient glow effects */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-destructive/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col h-screen">
        <DashboardHeader />

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-[350px] border-r border-white/10 p-4 bg-sidebar/50 backdrop-blur-sm"
          >
            <SessionHistory
              sessions={sessions}
              selectedId={selectedSession}
              onSelectSession={handleSelectSession}
              onDeleteSession={handleDeleteSession}
            />
          </motion.aside>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-y-auto scrollbar-thin">
            <div className="max-w-xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <UploadZone
                  onFileUpload={handleFileUpload}
                  isAnalyzing={isAnalyzing}
                />
              </motion.div>
            </div>
          </main>

          {/* Analysis Results Panel */}
          <motion.aside
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-[800px] border-l border-white/10 p-4 bg-card/30 backdrop-blur-sm overflow-y-auto scrollbar-thin"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Real-time Metrics
            </h2>

            <div className="space-y-4">
              {analysisResult ? (
                <>
                  <StatusCard
                    status={analysisResult.final_prediction}
                    confidence={analysisResult.confidence}
                  />
                  <HeatmapPreview
                    heatmaps={analysisResult.heatmaps}
                    type={analysisResult.input_type}
                  />
                  {analysisResult.input_type === 'video' && (
                    <ProbabilityChart data={analysisResult.frame_predictions} />
                  )}
                </>
              ) : (
                <div className="h-40 flex items-center justify-center text-center p-4 glass-card text-muted-foreground text-xs italic">
                  {isAnalyzing ? "Processing..." : "Upload an image or video to begin deepfake analysis."}
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
};

export default Index;
