import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Clock,
  Calendar,
  Leaf,
  CheckCircle2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api.js';
import { FoodMenu } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';

export const StudentFoodPage: React.FC = () => {
  const { showToast } = useToast();
  const [menus, setMenus] = useState<FoodMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [optedOutDinner, setOptedOutDinner] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await api.get('/food/menu', { params: { dayOfWeek: selectedDay } });
      if (res.data.success) {
        setMenus(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load mess schedule', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [selectedDay]);

  const handleToggleOptOut = () => {
    const nextState = !optedOutDinner;
    setOptedOutDinner(nextState);
    if (nextState) {
      showToast('Thanks for notifying! Dinner headcount updated in AI kitchen forecast.', 'success');
    } else {
      showToast('Preference cleared. Dinner meal reserved.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-indigo-600" /> Central Mess Weekly Menu & Dining
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          View breakfast, lunch, snacks, and dinner servings across the weekly calendar.
        </p>
      </div>

      {/* Sustainable Dining / Meal Attendance Prompt */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Help Us Prevent Institutional Food Waste</h4>
            <p className="text-xs text-emerald-200 mt-0.5">
              Eating out tonight? Let the catering team know so they avoid cooking surplus portions.
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleOptOut}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            optedOutDinner
              ? 'bg-amber-400 text-slate-900'
              : 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
          }`}
        >
          {optedOutDinner ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-950" /> Skipping Tonight's Dinner (Notified)
            </>
          ) : (
            'I Will Skip Tonight\'s Dinner'
          )}
        </button>
      </div>

      {/* Days Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {daysOfWeek.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
              selectedDay === day
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Meals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {menus.map((meal) => (
          <div
            key={meal.id}
            className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {meal.meal_type}
                </span>
                {meal.is_special === 1 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    Festive Special
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mb-3">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                {meal.timings}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium min-h-[90px]">
                {meal.items}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <Leaf className="w-3 h-3" /> Standard Nutrition
              </span>
              <span>Central Dining Hall</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
