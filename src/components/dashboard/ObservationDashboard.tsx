import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend, AreaChart, Area } from 'recharts';
import { Sparkles, AlertTriangle, Thermometer, Droplets, Zap, Leaf, Flame, Scale, Activity, ArrowUpRight, BellRing, CheckCircle2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';

const data = [
  { day: 'Day 1', input: 30, output: 75, methane: 55, co2: 40 },
  { day: 'Day 5', input: 32, output: 78, methane: 56, co2: 39 },
  { day: 'Day 10', input: 35, output: 80, methane: 58, co2: 38 },
  { day: 'Day 12', input: 38, output: 65, methane: 45, co2: 50, event: 'pH Dip' },
  { day: 'Day 15', input: 25, output: 70, methane: 52, co2: 43 },
  { day: 'Day 20', input: 30, output: 75, methane: 57, co2: 38 },
  { day: 'Day 25', input: 35, output: 82, methane: 60, co2: 36 },
  { day: 'Day 30', input: 38, output: 85, methane: 62, co2: 35 },
  { day: 'Day 35', input: 40, output: 88, methane: 63, co2: 34 },
  { day: 'Day 40', input: 35, output: 84, methane: 61, co2: 36 },
  { day: 'Day 45', input: 38, output: 86, methane: 62, co2: 35 },
  { day: 'Day 50', input: 40, output: 89, methane: 64, co2: 33 },
  { day: 'Day 55', input: 38, output: 87, methane: 63, co2: 34 },
  { day: 'Day 60', input: 40, output: 90, methane: 65, co2: 32 },
];

export default function ObservationDashboard() {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Live Data State
  const [livePH, setLivePH] = useState(7.1);
  const [liveTemp, setLiveTemp] = useState(34.0);
  const [anomaly, setAnomaly] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLivePH(prev => {
        const target = anomaly ? 6.5 : 7.1;
        return prev + (target - prev) * 0.1 + (Math.random() - 0.5) * 0.08;
      });
      setLiveTemp(prev => {
        const target = anomaly ? 39.0 : 34.0;
        return prev + (target - prev) * 0.1 + (Math.random() - 0.5) * 0.4;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [anomaly]);

  // Alarm Logic
  let alarmStatus = 'normal';
  let alarmMessage = 'System operating within optimal parameters.';
  
  if (livePH < 6.8 || livePH > 7.5) {
    alarmStatus = 'critical';
    alarmMessage = `CRITICAL: pH level (${livePH.toFixed(2)}) is outside the optimal range (6.8 - 7.5)!`;
  } else if (livePH < 6.9 || livePH > 7.4) {
    alarmStatus = 'warning';
    alarmMessage = `WARNING: pH level (${livePH.toFixed(2)}) is approaching limits.`;
  }

  if (liveTemp < 30 || liveTemp > 37) {
    alarmStatus = 'critical';
    alarmMessage = `CRITICAL: Temperature (${liveTemp.toFixed(1)}°C) is outside mesophilic range (30-37°C)!`;
  } else if (liveTemp < 31 || liveTemp > 36) {
    alarmStatus = alarmStatus === 'critical' ? 'critical' : 'warning';
    if (alarmStatus === 'warning') alarmMessage = `WARNING: Temperature (${liveTemp.toFixed(1)}°C) is approaching limits.`;
  }

  const generateSummary = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a very short, up-to-date executive summary (max 2-3 sentences or bullet points) for management regarding our anaerobic digestion biogas plant. 
        Current Live Data:
        - Live pH: ${livePH.toFixed(2)}
        - Live Temperature: ${liveTemp.toFixed(1)}°C
        - Processing: 30-40kg Daily Average
        - Gas Production: 82 m³ Daily Output (65% Methane)
        - Current Alarm Status: ${alarmStatus.toUpperCase()}
        
        Focus on the current real-time status, immediate operational health, and overall stability. Keep it extremely concise, professional, and actionable.`,
      });
      setSummary(response.text || 'Failed to generate summary.');
    } catch (error) {
      console.error(error);
      setSummary('Error generating summary. Please check your API key and connection.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  // Visual Positions
  const phPosition = Math.min(Math.max(((livePH - 6.0) / (8.0 - 6.0)) * 100, 0), 100);
  const tempPosition = Math.min(Math.max(((liveTemp - 20) / (50 - 20)) * 100, 0), 100);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-md rounded-lg max-w-[200px]">
          <p className="font-semibold text-slate-900 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
          {dataPoint.event && (
            <div className="mt-2 pt-2 border-t border-slate-100">
              <p className="text-xs font-bold text-red-500 flex items-center gap-1 mb-1">
                <AlertTriangle className="h-3 w-3" /> Event: {dataPoint.event}
              </p>
              {dataPoint.event === 'pH Dip' && (
                <div className="text-[10px] text-slate-600 space-y-1 leading-tight">
                  <p><strong className="text-slate-700">Cause:</strong> Overfeeding or sour food waste.</p>
                  <p><strong className="text-slate-700">Action:</strong> Reduce feed for 24h, add lime buffer.</p>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* ALIT ALARM BANNER */}
      <motion.div 
        layout
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-500 ${
          alarmStatus === 'critical' 
            ? 'bg-red-50 border-red-200 text-red-800 shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
            : alarmStatus === 'warning'
            ? 'bg-amber-50 border-amber-200 text-amber-800 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-full ${alarmStatus === 'critical' ? 'bg-red-100' : alarmStatus === 'warning' ? 'bg-amber-100' : 'bg-emerald-100'}`}>
            {alarmStatus === 'normal' ? (
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            ) : (
              <BellRing className={`h-8 w-8 ${alarmStatus === 'critical' ? 'text-red-600 animate-bounce' : 'text-amber-600 animate-pulse'}`} />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight">
              {alarmStatus === 'critical' ? 'CRITICAL ALARM ACTIVE' : alarmStatus === 'warning' ? 'SYSTEM WARNING' : 'SYSTEM NORMAL'}
            </h3>
            <p className="text-sm font-medium opacity-90">{alarmMessage}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setAnomaly(!anomaly)}
          className={`shrink-0 transition-all ${
            anomaly 
              ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300" 
              : "bg-red-100 hover:bg-red-200 text-red-800 border-red-300"
          }`}
        >
          {anomaly ? "Restore Normal Operations" : "Test Alarm System"}
        </Button>
      </motion.div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Observation Dashboard</h2>
        </div>
        <Button onClick={generateSummary} disabled={loading} className="bg-[#2979FF] hover:bg-[#2979FF]/90 text-white shadow-md transition-all hover:scale-105">
          <Sparkles className="mr-2 h-4 w-4" />
          {loading ? 'Generating Analysis...' : 'Generate Executive Summary'}
        </Button>
      </div>

      <AnimatePresence>
        {summary && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-[#2979FF]/20 bg-gradient-to-br from-[#2979FF]/5 to-transparent shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-[#2979FF] flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {summary}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Current Processing</CardTitle>
              <div className="p-2 bg-slate-100 rounded-full">
                <Scale className="h-4 w-4 text-slate-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">30 - 40kg</div>
              <div className="flex items-center text-xs text-slate-500 mt-1">
                <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                <span className="text-emerald-600 font-medium mr-1">+5%</span> from last week
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow border-emerald-100 bg-emerald-50/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Gas Production</CardTitle>
              <div className="p-2 bg-emerald-100 rounded-full">
                <Zap className="h-4 w-4 text-[#00E676]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">82 m³</div>
              <div className="flex items-center text-xs text-emerald-600 font-medium mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +2.5% Daily Output
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Carbon Offset</CardTitle>
              <div className="p-2 bg-emerald-100 rounded-full">
                <Leaf className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">72 t</div>
              <p className="text-xs text-emerald-600 font-medium mt-1">HIGH • Annual Savings</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">LPG Replaced</CardTitle>
              <div className="p-2 bg-orange-100 rounded-full">
                <Flame className="h-4 w-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">~2 cyl/day</div>
              <p className="text-xs text-slate-500 mt-1">720 kg/year • ₹64,800 saved</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <motion.div variants={itemVariants} className="md:col-span-4 lg:col-span-5 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>2-Month Performance Observation</CardTitle>
              <CardDescription>Daily food waste input vs. biogas output</CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" name="Input (kg)" dataKey="input" stroke="#1A202C" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line yAxisId="right" type="monotone" name="Output (m³)" dataKey="output" stroke="#00E676" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <ReferenceLine yAxisId="right" x="Day 12" stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'pH Dip', fill: '#ef4444', fontSize: 12 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Biogas Composition</CardTitle>
              <CardDescription>Methane (CH4) vs Carbon Dioxide (CO2) ratio over time</CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorMethane" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2979FF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2979FF" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                    <Area type="monotone" dataKey="methane" name="Methane (%)" stroke="#2979FF" fillOpacity={1} fill="url(#colorMethane)" />
                    <Area type="monotone" dataKey="co2" name="CO2 (%)" stroke="#94a3b8" fillOpacity={1} fill="url(#colorCo2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-4 md:col-span-3 lg:col-span-2">
          <motion.div variants={itemVariants}>
            <Card className={`transition-colors duration-300 ${livePH < 6.8 || livePH > 7.5 ? 'border-red-300 bg-red-50/30' : ''}`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    Live pH Level
                  </div>
                  <span className={`flex h-2 w-2 rounded-full animate-pulse ${livePH < 6.8 || livePH > 7.5 ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-end justify-between">
                  <div className={`text-4xl font-bold tracking-tighter transition-colors ${livePH < 6.8 || livePH > 7.5 ? 'text-red-600' : 'text-slate-900'}`}>
                    {livePH.toFixed(2)}
                  </div>
                  <div className="text-sm font-medium text-slate-500">Target: 6.8 - 7.5</div>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                  <div className="h-full bg-red-400 w-[40%]"></div>
                  <div className="h-full bg-[#00E676] w-[35%]"></div>
                  <div className="h-full bg-blue-400 w-[25%]"></div>
                </div>
                <div className="relative w-full h-4 mt-1">
                  <motion.div 
                    animate={{ left: `${phPosition}%` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    className="absolute top-0 w-1.5 h-4 bg-slate-900 rounded-full shadow-sm -ml-[3px]" 
                  />
                </div>
                
                <div className="mt-6 rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <div className="flex gap-2">
                    <Activity className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Real-time sensor data. Values outside 6.8 - 7.5 will trigger the automated buffer injection system.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className={`transition-colors duration-300 ${liveTemp < 30 || liveTemp > 37 ? 'border-red-300 bg-red-50/30' : ''}`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    Live Temperature
                  </div>
                  <span className={`flex h-2 w-2 rounded-full animate-pulse ${liveTemp < 30 || liveTemp > 37 ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-end justify-between">
                  <div className={`text-4xl font-bold tracking-tighter transition-colors ${liveTemp < 30 || liveTemp > 37 ? 'text-red-600' : 'text-slate-900'}`}>
                    {liveTemp.toFixed(1)}°C
                  </div>
                  <div className="text-sm font-medium text-slate-500">Mesophilic: 30–37°C</div>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                  <div className="h-full bg-blue-300 w-[33.3%]"></div>
                  <div className="h-full bg-[#00E676] w-[23.3%]"></div>
                  <div className="h-full bg-red-500 w-[43.3%]"></div>
                </div>
                <div className="relative w-full h-4 mt-1">
                  <motion.div 
                    animate={{ left: `${tempPosition}%` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    className="absolute top-0 w-1.5 h-4 bg-slate-900 rounded-full shadow-sm -ml-[3px]" 
                  />
                </div>
                
                <div className="mt-6 rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Temperature is monitored continuously. External heating activates automatically if temperature drops below 30°C.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-slate-900 text-white border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-slate-100">
                  <Activity className="h-4 w-4 text-[#2979FF]" />
                  Predictive Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Agitator Motor Health</span>
                      <span className="text-emerald-400">92%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[92%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Gas Filter Saturation</span>
                      <span className="text-amber-400">78%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 w-[78%]"></div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Filter replacement recommended in ~14 days.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
