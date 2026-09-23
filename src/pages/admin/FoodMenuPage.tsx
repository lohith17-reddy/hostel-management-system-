import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Clock,
  Edit2,
  Plus,
  CheckCircle2,
  Leaf,
  X
} from 'lucide-react';
import api from '../../services/api.js';
import { FoodMenu } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';

export const FoodMenuPage: React.FC = () => {
  const { showToast } = useToast();
  const [menus, setMenus] = useState<FoodMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('Monday');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<FoodMenu | null>(null);
  const [menuForm, setMenuForm] = useState({
    items: '',
    timings: '',
    isSpecial: false
  });

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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeal) return;
    try {
      const res = await api.put(`/food/menu/${selectedMeal.id}`, menuForm);
      if (res.data.success) {
        showToast('Mess menu updated', 'success');
        setEditModalOpen(false);
        fetchMenu();
      }
    } catch (err: any) {
      showToast('Failed to update menu item', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-indigo-600" /> Campus Mess Weekly Menu
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organize nutrition, dietary offerings, serving slots, and special festive meals.
          </p>
        </div>
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

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium min-h-[90px]">
                {meal.items}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <Leaf className="w-3 h-3" /> Balanced Nutrition
              </span>
              <button
                onClick={() => {
                  setSelectedMeal(meal);
                  setMenuForm({
                    items: meal.items,
                    timings: meal.timings || '',
                    isSpecial: meal.is_special === 1
                  });
                  setEditModalOpen(true);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Edit {selectedDay} {selectedMeal?.meal_type}
              </h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Serving Hours</label>
                <input
                  type="text"
                  required
                  value={menuForm.timings}
                  onChange={(e) => setMenuForm({ ...menuForm, timings: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Menu Items & Dishes</label>
                <textarea
                  rows={3}
                  required
                  value={menuForm.items}
                  onChange={(e) => setMenuForm({ ...menuForm, items: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={menuForm.isSpecial}
                    onChange={(e) => setMenuForm({ ...menuForm, isSpecial: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  Mark as Festive / Weekend Special
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                >
                  Save Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
