import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileVideo, FileImage, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadZoneProps {
  onFileUpload?: (file: File) => void;
  isAnalyzing?: boolean;
}

export function UploadZone({ onFileUpload, isAnalyzing }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);

  const handleFile = useCallback((file: File) => {
    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setFileType(file.type.startsWith("video") ? "video" : "image");

    // Pass to parent
    onFileUpload?.(file);
  }, [onFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  // Clean up object URL on unmount or new preview
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const removePreview = () => {
    setPreview(null);
    setFileType(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <motion.div
        className={`upload-zone relative flex flex-col items-center justify-center p-8 min-h-[300px] w-full rounded-xl border-2 border-dashed transition-colors ${isDragging ? "border-primary bg-primary/10" : "border-white/10 hover:border-primary/50"
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.2 }}
      >
        {/* Decorative corner lines */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/50 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/50 rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/50 rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/50 rounded-br-xl" />

        <AnimatePresence mode="wait">
          <motion.div
            key={isDragging ? "dragging" : "idle"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              className={`w-16 h-16 rounded-2xl glass-card flex items-center justify-center mb-4 ${isDragging ? "neon-glow-blue" : ""
                }`}
              animate={isDragging ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
            >
              <Upload className={`w-8 h-8 ${isDragging ? "text-primary" : "text-primary/70"}`} />
            </motion.div>

            <h3 className="text-xl font-semibold mb-2">
              {isAnalyzing ? "Processing Analysis..." : isDragging ? "Release to Upload" : "DRAG & DROP FILES HERE"}
            </h3>
            <p className="text-muted-foreground mb-6">{isAnalyzing ? "Our AI is scanning for manipulations" : "or"}</p>

            {!isAnalyzing && (
              <label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isAnalyzing}
                />
                <Button
                  variant="outline"
                  className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary cursor-pointer px-8"
                  asChild
                >
                  <span>BROWSE FILES</span>
                </Button>
              </label>
            )}

            <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileImage className="w-4 h-4" />
                <span>Image</span>
              </div>
              <span className="text-white/20">/</span>
              <div className="flex items-center gap-2">
                <FileVideo className="w-4 h-4" />
                <span>Video</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Cyber grid background effect */}
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none rounded-xl" />
      </motion.div>

      {/* Media Preview Section */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative w-full rounded-xl overflow-hidden glass-card border border-white/10"
          >
            <div className="absolute top-4 right-4 z-10">
              <Button
                size="icon"
                variant="destructive"
                className="h-8 w-8 rounded-full opacity-80 hover:opacity-100 transition-opacity"
                onClick={removePreview}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-4 flex flex-col items-center bg-black/40">
              <h4 className="text-sm font-medium text-white/70 mb-4 self-start flex items-center gap-2">
                {fileType === 'video' ? <FileVideo className="w-4 h-4" /> : <FileImage className="w-4 h-4" />}
                Selected Media Preview
              </h4>

              {fileType === 'video' ? (
                <video
                  src={preview}
                  controls
                  className="max-h-[500px] w-full object-contain rounded-lg shadow-2xl"
                />
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-[500px] w-full object-contain rounded-lg shadow-2xl"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
