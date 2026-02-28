import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import ObservationDashboard from './components/dashboard/ObservationDashboard';
import ProcessControl from './components/dashboard/ProcessControl';
import ScalingModel from './components/dashboard/ScalingModel';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('observation');
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      });
      const parts = formatter.formatToParts(now);
      const getPart = (type: string) => parts.find(p => p.type === type)?.value;
      
      const timeString = `${getPart('hour')}:${getPart('minute')}:${getPart('second')} ${getPart('dayPeriod')?.toLowerCase()}`;
      const dateString = `${getPart('day')}/${getPart('month')}/${getPart('year')}`;
      
      setTime(`${timeString} | ${dateString} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Global Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-white shadow-sm">
              <img 
                src="https://api.dicebear.com/7.x/bottts/svg?seed=aimachina&backgroundColor=ffffff" 
                alt="AI Machina Society Logo" 
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-900">Bio operational intelegent</h1>
              <p className="text-xs font-medium text-[#2979FF]">by AI machina society</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
            <div className="hidden text-sm font-medium text-slate-600 md:block font-mono bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
              {time}
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E676] opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[#00E676]"></span>
              </span>
              <span className="text-xs font-semibold text-emerald-700">System working</span>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-white shadow-sm border border-slate-200 p-1 rounded-lg">
            <TabsTrigger 
              active={activeTab === 'observation'} 
              onClick={() => setActiveTab('observation')}
              className="text-sm rounded-md transition-all data-[state=active]:bg-[#2979FF] data-[state=active]:text-white"
            >
              Observation Dashboard
            </TabsTrigger>
            <TabsTrigger 
              active={activeTab === 'process'} 
              onClick={() => setActiveTab('process')}
              className="text-sm rounded-md transition-all data-[state=active]:bg-[#2979FF] data-[state=active]:text-white"
            >
              Process & Control
            </TabsTrigger>
            <TabsTrigger 
              active={activeTab === 'scaling'} 
              onClick={() => setActiveTab('scaling')}
              className="text-sm rounded-md transition-all data-[state=active]:bg-[#2979FF] data-[state=active]:text-white"
            >
              Hostel Scaling Model
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent active={activeTab === 'observation'}>
                <ObservationDashboard />
              </TabsContent>
              
              <TabsContent active={activeTab === 'process'}>
                <ProcessControl />
              </TabsContent>
              
              <TabsContent active={activeTab === 'scaling'}>
                <ScalingModel />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500 font-medium">
            Loyola Hostel Biogas Project - Powered by <span className="text-[#2979FF] font-semibold">AI machina</span>.
          </p>
        </div>
      </footer>
    </div>
  );
}
