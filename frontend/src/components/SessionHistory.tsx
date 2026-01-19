import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Video, Image, Clock, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface Session {
  id: string;
  name: string;
  type: "video" | "image";
  status: "FAKE" | "REAL";
  timestamp: string;
}

interface SessionHistoryProps {
  sessions?: Session[];
  onSelectSession?: (session: Session) => void;
  onDeleteSession?: (sessionId: string) => void;
  selectedId?: string;
}

export function SessionHistory({ sessions = [], onSelectSession, onDeleteSession, selectedId }: SessionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSessions = sessions.filter(session =>
    session.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Session History
      </h2>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-secondary/50 border-white/10 focus:border-primary/50 focus:ring-primary/20"
        />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2">
        {filteredSessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectSession?.(session)}
            className={`glass-card-hover p-3 cursor-pointer group ${selectedId === session.id ? "border-primary/50 bg-primary/10" : ""
              }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {session.type === "video" ? (
                  <Video className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <Image className="w-4 h-4 text-primary shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {session.name}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{session.timestamp}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={session.status === "FAKE" ? "chip-fake" : "chip-real"}>
                  {session.status}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession?.(session.id);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
