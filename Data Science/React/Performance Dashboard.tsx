import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, AlertTriangle } from 'lucide-react';

const normalDistribution = (x, mean, stdDev) => {
  return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
};

const calculatePercentile = (x, mean, stdDev) => {
  const erf = (x) => {
    const t = 1 / (1 + 0.5 * Math.abs(x));
    const tau = t * Math.exp(-x * x - 1.26551223 + 1.00002368 * t + 0.37409196 * t * t + 0.09678418 * t * t * t - 0.18628806 * t * t * t * t + 0.27886807 * t * t * t * t * t - 1.13520398 * t * t * t * t * t * t + 1.48851587 * t * t * t * t * t * t * t - 0.82215223 * t * t * t * t * t * t * t * t + 0.17087277 * t * t * t * t * t * t * t * t * t);
    return x >= 0 ? 1 - tau : tau - 1;
  };
  return 0.5 * (1 + erf((x - mean) / (stdDev * Math.sqrt(2))));
};

const EmployeePerformanceBellCurve = () => {
  const [currentQuarter, setCurrentQuarter] = useState(0);
  const [departmentIndex, setDepartmentIndex] = useState(0);

  const departments = ['Engineering', 'Sales', 'Marketing', 'Customer Support'];
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

  // Simulated data for each department and quarter
  const simulatedData = departments.map(() =>
    quarters.map(() => ({
      mean: Math.random() * 20 + 70,
      stdDev: Math.random() * 5 + 5,
      employees: Array.from({ length: 100 }, () => Math.random() * 40 + 50)
    }))
  );

  const currentData = simulatedData[departmentIndex][currentQuarter];

  const generateBellCurveData = () => {
    const { mean, stdDev } = currentData;
    const xValues = Array.from({ length: 100 }, (_, i) => i + 30);
    return xValues.map(x => ({
      x,
      y: normalDistribution(x, mean, stdDev) * 1000
    }));
  };

  const bellCurveData = generateBellCurveData();

  const calculateKPIs = () => {
    const { mean, stdDev, employees } = currentData;
    const highPerformers = employees.filter(score => score > mean + stdDev).length;
    const lowPerformers = employees.filter(score => score < mean - stdDev).length;
    const averagePerformers = employees.length - highPerformers - lowPerformers;
    return {
      averageScore: mean.toFixed(2),
      variability: stdDev.toFixed(2),
      highPerformersPercentage: ((highPerformers / employees.length) * 100).toFixed(2),
      lowPerformersPercentage: ((lowPerformers / employees.length) * 100).toFixed(2),
      averagePerformersPercentage: ((averagePerformers / employees.length) * 100).toFixed(2)
    };
  };

  const kpis = calculateKPIs();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuarter((prev) => (prev + 1) % 4);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const score = payload[0].payload.x;
      const percentile = calculatePercentile(score, currentData.mean, currentData.stdDev);
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-semibold">Score: {score.toFixed(2)}</p>
          <p className="font-semibold">Percentile: {(percentile * 100).toFixed(2)}%</p>
        </div>
      );
    }
    return null;
  };

  const getKeyInsights = () => {
    const insights = [];
    if (parseFloat(kpis.lowPerformersPercentage) > 30) {
      insights.push({ text: "High number of underperformers", x: currentData.mean - currentData.stdDev, y: 200 });
    }
    if (parseFloat(kpis.highPerformersPercentage) < 10) {
      insights.push({ text: "Few top performers identified", x: currentData.mean + currentData.stdDev, y: 200 });
    }
    if (parseFloat(kpis.variability) > 10) {
      insights.push({ text: "High performance variability", x: currentData.mean, y: 400 });
    }
    return insights;
  };

  const keyInsights = getKeyInsights();

  const getTitle = () => {
    let title = `${departments[departmentIndex]} Department - ${quarters[currentQuarter]} Performance Highlights`;
    if (parseFloat(kpis.lowPerformersPercentage) > 30) {
      title += ": High Underperformance Identified";
    } else if (parseFloat(kpis.highPerformersPercentage) > 30) {
      title += ": Strong Top Performance Noted";
    }
    return title;
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {getTitle()}
      </h2>
      <div className="flex justify-between mb-6">
        <Select value={departmentIndex.toString()} onValueChange={(value) => setDepartmentIndex(Number(value))}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept, index) => (
              <SelectItem key={index} value={index.toString()}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mb-8 relative" style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <AreaChart data={bellCurveData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ff7480" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#84e3c8" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="x" 
              type="number" 
              label={{ value: 'Performance Score', position: 'insideBottom', offset: -10, fill: '#374151', fontWeight: 'bold', fontSize: 14 }} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="y" stroke="url(#colorGradient)" fill="url(#colorGradient)" />
            <ReferenceLine x={currentData.mean - currentData.stdDev} stroke="#ef4444" strokeWidth={2}>
              <Label value="Under" position="insideBottomLeft" fill="#ef4444" fontWeight="bold" />
            </ReferenceLine>
            <ReferenceLine x={currentData.mean} stroke="#eab308" strokeWidth={2}>
              <Label value="Core" position="insideBottom" fill="#eab308" fontWeight="bold" />
            </ReferenceLine>
            <ReferenceLine x={currentData.mean + currentData.stdDev} stroke="#22c55e" strokeWidth={2}>
              <Label value="Top" position="insideBottomRight" fill="#22c55e" fontWeight="bold" />
            </ReferenceLine>
            <ReferenceLine x={parseFloat(kpis.averageScore)} stroke="#3b82f6" strokeWidth={2} strokeDasharray="3 3">
              <Label value={`Avg: ${kpis.averageScore}`} position="top" fill="#3b82f6" fontWeight="bold" fontSize={16} />
            </ReferenceLine>
          </AreaChart>
        </ResponsiveContainer>
        {keyInsights.map((insight, index) => (
          <div key={index} className="absolute bg-white p-1 rounded shadow-md text-xs font-semibold text-red-600 flex items-center" 
               style={{ top: `${insight.y}px`, left: `${(insight.x - 30) / 0.7}%`, transform: 'translateX(-50%)' }}>
            <AlertTriangle className="h-3 w-3 mr-1" />
            {insight.text}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold text-blue-800">Performance Overview</CardTitle>
            <Users className="h-6 w-6 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 mb-2">Avg: {kpis.averageScore}</div>
            <div className="text-sm text-blue-800">Variability: {kpis.variability}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold text-green-800">Top Performers</CardTitle>
            <TrendingUp className="h-6 w-6 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{kpis.highPerformersPercentage}%</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold text-red-800">Underperformers</CardTitle>
            <TrendingDown className="h-6 w-6 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{kpis.lowPerformersPercentage}%</div>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-gray-50 border-gray-200 mb-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-bold text-gray-800">Action Items</CardTitle>
          <AlertTriangle className="h-6 w-6 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-gray-700">
            {parseFloat(kpis.lowPerformersPercentage) > 30 && (
              <li>Implement targeted training programs for underperformers</li>
            )}
            {parseFloat(kpis.highPerformersPercentage) < 10 && (
              <li>Develop strategies to identify and nurture potential top performers</li>
            )}
            {parseFloat(kpis.variability) > 10 && (
              <li>Investigate causes of high performance variability and standardize best practices</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeePerformanceBellCurve;
