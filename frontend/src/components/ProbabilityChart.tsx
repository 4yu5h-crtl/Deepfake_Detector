import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

import { FramePrediction } from "@/services/api";

interface ProbabilityChartProps {
  data: FramePrediction[];
}

export function ProbabilityChart({ data }: ProbabilityChartProps) {
  // Map backend FramePrediction to Recharts format
  const chartData = data.map(fp => ({
    frame: fp.id,
    probability: fp.prob
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-4"
    >
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Frame-Wise Probability
      </h3>

      <div className="h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="probabilityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 85%, 55%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(0, 85%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="frame"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
              tickFormatter={(value) => value % 20 === 0 ? `${value}` : ''}
            />
            <YAxis
              domain={[0, 1]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(240, 6%, 10%)',
                border: '1px solid hsl(240, 5%, 20%)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(215, 20%, 55%)' }}
              formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Probability']}
              labelFormatter={(label) => `Frame ${label}`}
            />
            <Area
              type="monotone"
              dataKey="probability"
              stroke="hsl(0, 85%, 55%)"
              strokeWidth={2}
              fill="url(#probabilityGradient)"
              animationDuration={2000}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
