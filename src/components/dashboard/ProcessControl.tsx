import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle2, AlertTriangle, Settings2, Power, Send, Mic, Sparkles, Loader2, StopCircle, CalendarClock, Plus, Trash2, Circle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { motion } from 'motion/react';

export default function ProcessControl() {
  const [holidayMode, setHolidayMode] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Hello! I am your AI Maintenance Assistant. Ask me troubleshooting questions (e.g., "Why is gas production low?") and get engineering advice.' }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Maintenance Reminders State
  const [reminders, setReminders] = useState([
    { id: 1, task: 'Check VFA/Alkalinity levels', date: '2026-03-01', completed: false },
    { id: 2, task: 'Inspect mechanical shredder blades', date: '2026-03-05', completed: false }
  ]);
  const [newTask, setNewTask] = useState('');
  const [newDate, setNewDate] = useState('');

  const addReminder = () => {
    if (newTask.trim() && newDate) {
      setReminders([...reminders, { id: Date.now(), task: newTask, date: newDate, completed: false }]);
      setNewTask('');
      setNewDate('');
    }
  };

  const toggleReminder = (id: number) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const deleteReminder = (id: number) => {
    setReminders(reminders.filter(r => r.id !== id));
  };
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const newMessages = [...messages, { role: 'user' as const, text }];
    setMessages(newMessages);
    setChatInput('');
    setIsProcessing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are an expert AI Maintenance Assistant for an anaerobic digestion biogas plant. 
        Current system status:
        - Mechanical Shredding: OK
        - Constant Daily Feeding: OK
        - Inoculum (Cow Dung): OK
        - VFA / Alkalinity < 0.3: OK
        - Holiday Mode: ${holidayMode ? 'ON' : 'OFF'}
        
        User asks: ${text}`,
      });
      
      setMessages([...newMessages, { role: 'ai', text: response.text || 'I could not generate a response.' }]);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: 'ai', text: 'Sorry, I encountered an error processing your request.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      mediaRecorder.current = recorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              { inlineData: { mimeType: 'audio/webm', data: base64Audio } },
              { text: 'Transcribe this audio exactly as spoken.' }
            ]
          }
        });
        
        const transcription = response.text || '';
        if (transcription) {
          handleSendMessage(transcription);
        } else {
          setMessages(prev => [...prev, { role: 'ai', text: 'Could not transcribe the audio.' }]);
          setIsProcessing(false);
        }
      };
    } catch (error) {
      console.error('Transcription error:', error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Error during transcription.' }]);
      setIsProcessing(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Process & Control</h2>
        <p className="text-slate-500">System stability and operational parameters</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-slate-500" />
                Stability Checklist
              </CardTitle>
              <CardDescription>Critical Process Parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Mechanical Shredding', status: 'OK', icon: CheckCircle2, color: 'text-[#00E676]' },
                { label: 'Constant Daily Feeding', status: 'OK', icon: CheckCircle2, color: 'text-[#00E676]' },
                { label: 'Inoculum: Cow Dung', status: 'OK', icon: CheckCircle2, color: 'text-[#00E676]' },
                { label: 'VFA / Alkalinity < 0.3', status: 'OK', icon: CheckCircle2, color: 'text-[#00E676]' },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ x: 4, backgroundColor: 'rgba(241, 245, 249, 0.5)' }}
                  className="flex items-center justify-between p-2 -mx-2 rounded-md transition-colors cursor-default"
                >
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  <div className={`flex items-center gap-2 ${item.color}`}>
                    <span className="text-xs font-bold">{item.status}</span>
                    <item.icon className="h-5 w-5" />
                  </div>
                </motion.div>
              ))}
              <motion.div 
                whileHover={{ x: 4, backgroundColor: 'rgba(254, 243, 199, 0.3)' }}
                className="flex items-center justify-between p-2 -mx-2 rounded-md transition-colors cursor-default border-t border-slate-100 mt-2 pt-4"
              >
                <span className="text-sm font-medium text-slate-700">Avoid Shock Loading</span>
                <div className="flex items-center gap-2 text-amber-500">
                  <span className="text-xs font-bold">Monitor</span>
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Power className="h-5 w-5 text-slate-500" />
                Operational Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-white shadow-sm"
              >
                <div>
                  <h4 className="font-medium text-slate-900">Holiday Mode</h4>
                  <p className="text-xs text-slate-500 mt-1">Reduces expected input parameters</p>
                </div>
                <button 
                  onClick={() => setHolidayMode(!holidayMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF] focus-visible:ring-offset-2 ${holidayMode ? 'bg-[#2979FF]' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${holidayMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </motion.div>
              
              <div className="mt-6">
                <h4 className="font-medium text-slate-900 mb-2">AI Diagnosis</h4>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="rounded-lg bg-emerald-50 p-4 border border-emerald-100 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-emerald-800 leading-relaxed">
                      System health prediction: <span className="font-bold">Stable</span>. Current sensor data indicates optimal methanogenesis. No immediate maintenance required.
                    </p>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="h-full hover:shadow-md transition-shadow flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-slate-500" />
                Maintenance Reminders
              </CardTitle>
              <CardDescription>Schedule critical system checks</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[200px] mb-4 pr-2">
                {reminders.map(reminder => (
                  <motion.div 
                    key={reminder.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start justify-between p-3 rounded-md border transition-colors ${reminder.completed ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200 shadow-sm'}`}
                  >
                    <div className="flex items-start gap-3">
                      <button onClick={() => toggleReminder(reminder.id)} className="mt-0.5 shrink-0 text-slate-400 hover:text-[#2979FF] transition-colors focus:outline-none">
                        {reminder.completed ? <CheckCircle2 className="h-5 w-5 text-[#00E676]" /> : <Circle className="h-5 w-5" />}
                      </button>
                      <div>
                        <p className={`text-sm font-medium ${reminder.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{reminder.task}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{reminder.date}</p>
                      </div>
                    </div>
                    <button onClick={() => deleteReminder(reminder.id)} className="text-slate-400 hover:text-red-500 transition-colors focus:outline-none p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
                {reminders.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No pending reminders.</p>
                )}
              </div>
              <div className="pt-3 border-t border-slate-100 mt-auto space-y-2">
                <input 
                  type="text" 
                  placeholder="New task (e.g., Inspect shredder)" 
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                />
                <div className="flex gap-2">
                  <input 
                    type="date" 
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="flex-1 text-sm px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2979FF] text-slate-600"
                  />
                  <Button onClick={addReminder} disabled={!newTask.trim() || !newDate} className="bg-[#2979FF] hover:bg-[#2979FF]/90 px-3">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card className="border-[#2979FF]/20 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-[#2979FF]">
              <Sparkles className="h-5 w-5" />
              AI Maintenance Assistant
            </CardTitle>
            <CardDescription>Ask troubleshooting questions and get engineering advice</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col h-[400px]">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-[#2979FF] text-white rounded-tr-sm' 
                        : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {isProcessing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm flex items-center gap-2 shadow-sm">
                      <Loader2 className="h-4 w-4 animate-spin text-[#2979FF]" />
                      Processing...
                    </div>
                  </motion.div>
                )}
              </div>
              <div className="p-4 border-t border-slate-100 bg-white">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(chatInput)}
                    placeholder="Ask troubleshooting questions..."
                    className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2979FF] focus:border-transparent transition-all"
                    disabled={isProcessing}
                  />
                  <Button 
                    size="icon" 
                    variant={isRecording ? "default" : "outline"}
                    className={isRecording ? "bg-red-500 hover:bg-red-600 border-red-500 text-white rounded-full animate-pulse" : "rounded-full transition-all hover:bg-slate-100"}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing}
                    title={isRecording ? "Stop recording" : "Transcribe audio"}
                  >
                    {isRecording ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button 
                    size="icon" 
                    className="rounded-full bg-[#2979FF] hover:bg-[#2979FF]/90 transition-all hover:scale-105"
                    onClick={() => handleSendMessage(chatInput)}
                    disabled={!chatInput.trim() || isProcessing}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
