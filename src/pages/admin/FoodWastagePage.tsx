import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  UtensilsCrossed,
  Calendar,
  CloudSun,
  TrendingDown,
  IndianRupee,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  X,
  ChefHat,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import api from '../../services/api.js';
import { FoodWastageLog } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';

export const FoodWastagePage: React.FC = () => {
  const { showToast } = useToast();
  const [wastageLogs, setWastageLogs] = useState<FoodWastageLog[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Prediction form states
  const [targetDate, setTargetDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [mealType, setMealType] = useState('Dinner');
  const [weather, setWeather] = useState('Normal');
  const [isHoliday, setIsHoliday] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);

  // New Log Modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [logForm, setLogForm] = useState({
    hostelId: 'hostel_01',
    date: new Date().toISOString().slice(0, 10),
    mealType: 'Dinner',
    preparedQuantityKg: '60',
    consumedQuantityKg: '52',
    wastedQuantityKg: '8',
    attendedStudentsCount: '120',
    costPerKg: '4.50',
    notes: ''
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/food/wastage');
      if (res.data.success) {
        setWastageLogs(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load food wastage logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRunPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    setPredicting(true);
    try {
      const res = await api.post('/food/prediction', {
        targetDate,
        mealType,
        weather,
        isHoliday
      });
      if (res.data.success) {
        setPredictionResult(res.data.data);
        showToast('AI Food Wastage Forecast calculated successfully', 'success');
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'AI calculation failed', 'error');
    } finally {
      setPredicting(false);
    }
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/food/wastage', logForm);
      if (res.data.success) {
        showToast('Meal wastage log recorded', 'success');
        setShowLogModal(false);
        fetchLogs();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to save log', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" /> AI Mess Food Wastage & Demand Predictor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Optimize kitchen inventory, reduce daily institutional food waste, and automate meal preparation planning.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" /> Record Today's Meal Wastage
        </button>
      </div>

      {/* AI Prediction Interactive Section */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white shadow-xl relative overflow-hidden border border-indigo-800/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <ChefHat className="w-4 h-4 text-indigo-400" />
            Predictive Catering Intelligence
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-2">
            Forecast Food Quantities & Avoid Over-Cooking
          </h2>
          <p className="text-xs text-indigo-200/90 max-w-2xl leading-relaxed mb-6">
            Our machine learning engine correlates active hostel student residence (factoring students on approved leave), day of the week, meal type, and weather forecast to recommend exact preparation volumes.
          </p>

          <form onSubmit={handleRunPrediction} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-indigo-200 mb-1">Target Forecast Date</label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-indigo-200 mb-1">Meal Service</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Snacks">Snacks</option>
                <option value="Dinner">Dinner</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-indigo-200 mb-1">Weather Condition</label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="Normal">Normal Weather</option>
                <option value="Rainy">Heavy Rain (More stay in)</option>
                <option value="Extreme Heat">Extreme Heat</option>
                <option value="Cold">Cold Weather</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <label className="flex items-center gap-2 text-xs cursor-pointer select-none text-indigo-200 font-medium">
                <input
                  type="checkbox"
                  checked={isHoliday}
                  onChange={(e) => setIsHoliday(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-500 bg-white/10 border-white/30"
                />
                Campus Holiday / Exam
              </label>
            </div>

            <div className="pt-5">
              <button
                type="submit"
                disabled={predicting}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white shadow-lg transition flex items-center justify-center gap-2"
              >
                {predicting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Run AI Prediction
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Prediction Results Banner */}
        {predictionResult && (
          <div className="mt-8 pt-6 border-t border-white/10 relative z-10 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-4">
              <CheckCircle2 className="w-4 h-4" />
              AI Model Forecast Ready for {predictionResult.targetDate} ({predictionResult.mealType})
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-indigo-200 uppercase font-bold block mb-1">Expected Diners</span>
                <div className="text-2xl font-black text-white">{predictionResult.predictedAttendance}</div>
                <span className="text-[10px] text-indigo-300">Students attending</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-indigo-200 uppercase font-bold block mb-1">Recommended Prep</span>
                <div className="text-2xl font-black text-amber-300">{predictionResult.recommendedPrepKg} kg</div>
                <span className="text-[10px] text-amber-200">Optimal volume</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-indigo-200 uppercase font-bold block mb-1">Expected Consumption</span>
                <div className="text-2xl font-black text-emerald-400">{predictionResult.expectedConsumptionKg} kg</div>
                <span className="text-[10px] text-emerald-200">Actual need</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-indigo-200 uppercase font-bold block mb-1">Predicted Wastage</span>
                <div className="text-2xl font-black text-rose-400">{predictionResult.predictedWastageKg} kg</div>
                <span className="text-[10px] text-rose-300">Down from 12 kg baseline</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-indigo-200 uppercase font-bold block mb-1">Projected Savings</span>
                <div className="text-2xl font-black text-emerald-300">₹{predictionResult.estimatedSavingsUsd}</div>
                <span className="text-[10px] text-emerald-200">Per meal saved</span>
              </div>
            </div>

            {/* AI Chef Insight */}
            <div className="mt-4 p-4 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-xs text-indigo-100 flex items-start gap-3">
              <ChefHat className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block mb-0.5">Kitchen Operational Advisory</span>
                <p className="leading-relaxed">{predictionResult.insights}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Historical Wastage Trends Chart */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Historical Food Wastage Tracking</h3>
            <p className="text-[11px] text-slate-400">Daily food prepared (kg) vs food wasted (kg)</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={wastageLogs}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px', background: '#1E293B', color: '#fff', border: 'none' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Area type="monotone" dataKey="prepared_quantity_kg" name="Prepared (kg)" stroke="#6366F1" fill="#6366F1" fillOpacity={0.1} />
              <Area type="monotone" dataKey="wasted_quantity_kg" name="Wasted (kg)" stroke="#F43F5E" fill="#F43F5E" fillOpacity={0.25} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Wastage Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recorded Meal Wastage Log</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">Date & Meal</th>
                <th className="px-6 py-3.5">Prepared (kg)</th>
                <th className="px-6 py-3.5">Consumed (kg)</th>
                <th className="px-6 py-3.5">Wasted (kg)</th>
                <th className="px-6 py-3.5">Diners</th>
                <th className="px-6 py-3.5">Total Waste Cost</th>
                <th className="px-6 py-3.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {wastageLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No logs recorded.
                  </td>
                </tr>
              ) : (
                wastageLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{log.date}</div>
                      <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">{log.meal_type}</div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700 dark:text-slate-300">{log.prepared_quantity_kg} kg</td>
                    <td className="px-6 py-3.5 text-emerald-600 dark:text-emerald-400 font-semibold">{log.consumed_quantity_kg} kg</td>
                    <td className="px-6 py-3.5 text-rose-500 font-bold">{log.wasted_quantity_kg} kg</td>
                    <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400">{log.attended_students_count}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">₹{log.total_cost_wasted}</td>
                    <td className="px-6 py-3.5 text-slate-400 max-w-xs truncate">{log.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Wastage Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Record Meal Wastage Log</h3>
              <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={logForm.date}
                    onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Meal *</label>
                  <select
                    value={logForm.mealType}
                    onChange={(e) => setLogForm({ ...logForm, mealType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Prepared (kg) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={logForm.preparedQuantityKg}
                    onChange={(e) => {
                      const prep = parseFloat(e.target.value) || 0;
                      const cons = parseFloat(logForm.consumedQuantityKg) || 0;
                      setLogForm({
                        ...logForm,
                        preparedQuantityKg: e.target.value,
                        wastedQuantityKg: Math.max(0, prep - cons).toFixed(1)
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Consumed (kg) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={logForm.consumedQuantityKg}
                    onChange={(e) => {
                      const cons = parseFloat(e.target.value) || 0;
                      const prep = parseFloat(logForm.preparedQuantityKg) || 0;
                      setLogForm({
                        ...logForm,
                        consumedQuantityKg: e.target.value,
                        wastedQuantityKg: Math.max(0, prep - cons).toFixed(1)
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Wasted (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={logForm.wastedQuantityKg}
                    readOnly
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Diners Count</label>
                  <input
                    type="number"
                    value={logForm.attendedStudentsCount}
                    onChange={(e) => setLogForm({ ...logForm, attendedStudentsCount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Cost Per Kg (₹)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={logForm.costPerKg}
                    onChange={(e) => setLogForm({ ...logForm, costPerKg: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Observation Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Extra rice left over due to festival night out"
                  value={logForm.notes}
                  onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
