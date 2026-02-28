import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Sparkles, Users, Scale, Database, Flame, Zap, AlertTriangle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export default function ScalingModel() {
  const [students, setStudents] = useState(1000);
  const [riskAssessment, setRiskAssessment] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Calculations based on the prompt
  const foodWastePerStudent = 0.25; // kg
  const totalFoodWaste = students * foodWastePerStudent;
  const digesterVolume = (totalFoodWaste / 250) * 20; // 20m3 for 250kg
  const totalEnergyDemand = (students / 1000) * 150; // 150m3 for 1000 students
  const projectedBiogasSupply = (totalFoodWaste / 250) * 25; // 25m3 for 250kg
  const lpgOffset = (projectedBiogasSupply / 25) * 10.75; // 10.75kg for 25m3
  const energyIndependence = (projectedBiogasSupply / totalEnergyDemand) * 100;

  const analyzeRisks = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze feasibility and risks for scaling an anaerobic digestion biogas plant to ${students} students.
        Current parameters:
        - Total Food Waste/Day: ${totalFoodWaste} kg
        - Required Digester Volume: ${digesterVolume.toFixed(1)} m³
        - Projected Biogas Supply: ${projectedBiogasSupply.toFixed(1)} m³/day
        - Energy Independence: ${energyIndependence.toFixed(1)}%
        
        Provide a concise, professional risk assessment advising on scaling. Include specific risk alerts (e.g., manual feeding viability, equipment needs, space requirements).`,
      });
      setRiskAssessment(response.text || 'Failed to generate risk assessment.');
    } catch (error) {
      console.error(error);
      setRiskAssessment('Error generating assessment. Please check your API key and connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Hostel Scaling Model</h2>
          <p className="text-slate-500">Energy Balance Estimation Panel</p>
        </div>
        <Button onClick={analyzeRisks} disabled={loading} className="bg-[#2979FF] hover:bg-[#2979FF]/90 text-white shadow-md">
          <Sparkles className="mr-2 h-4 w-4" />
          {loading ? 'Analyzing...' : 'Analyze Feasibility & Risks'}
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#2979FF]" />
              Total Hostel Students
            </div>
            <span className="text-2xl font-bold text-[#2979FF]">{students.toLocaleString()}</span>
          </CardTitle>
          <CardDescription>Adjust the slider to see scaling projections</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <input
            type="range"
            min="100"
            max="5000"
            step="100"
            value={students}
            onChange={(e) => setStudents(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2979FF]"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>100</span>
            <span>2,500</span>
            <span>5,000</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Average Food Waste/Day</CardTitle>
            <Scale className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalFoodWaste.toLocaleString()} kg</div>
            <p className="text-xs text-slate-500 mt-1">Estimated at 0.25 kg/student</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Required Digester Volume</CardTitle>
            <Database className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{digesterVolume.toFixed(1)} m³</div>
            <p className="text-xs text-slate-500 mt-1">30-day HRT + gas headspace</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Energy Demand</CardTitle>
            <Flame className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalEnergyDemand.toFixed(1)} m³</div>
            <p className="text-xs text-slate-500 mt-1">Biogas/day for full cooking & heating</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Projected Biogas Supply</CardTitle>
            <Zap className="h-4 w-4 text-[#00E676]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{projectedBiogasSupply.toFixed(1)} m³</div>
            <p className="text-xs text-[#00E676] font-medium mt-1">Offsets ~{lpgOffset.toFixed(2)} kg of LPG daily</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-2 lg:col-span-2 bg-slate-900 text-white border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Energy Independence Rating</CardTitle>
            <Zap className="h-4 w-4 text-[#00E676]" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div className="text-4xl font-bold text-white">{energyIndependence.toFixed(1)}%</div>
              <div className="flex-1 pb-1">
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-[#00E676] transition-all duration-500" 
                    style={{ width: `${Math.min(energyIndependence, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              System will heavily supplement, but not completely replace commercial LPG
            </p>
          </CardContent>
        </Card>
      </div>

      {riskAssessment && (
        <Card className="border-amber-200 bg-amber-50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-amber-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Custom Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-amber-900 whitespace-pre-wrap">
              {riskAssessment}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
