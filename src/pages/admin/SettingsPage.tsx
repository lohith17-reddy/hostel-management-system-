import React, { useState } from 'react';
import {
  Settings,
  Building,
  Clock,
  Shield,
  Bell,
  Save,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext.js';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();

  const [settings, setSettings] = useState({
    hostelName: 'Olympus Heights Residential Campus',
    curfewTime: '21:30',
    visitorCutoffTime: '19:00',
    lateFeePenaltyPercentage: '5',
    maxLeaveDaysPerMonth: '6',
    autoApproveLeaves: false,
    emailAlertsOnUrgentComplaint: true,
    aiFoodWastageThresholdKg: '15'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Hostel operational settings saved successfully', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" /> System & Hostel Configurations
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Define institutional curfew hours, leave quotas, fee billing parameters, and AI alert thresholds.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 text-xs">
        {/* Campus Rules */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-600" /> Institution & Residence Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Campus Name</label>
              <input
                type="text"
                value={settings.hostelName}
                onChange={(e) => setSettings({ ...settings, hostelName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Night Curfew Roll-Call Time</label>
              <input
                type="time"
                value={settings.curfewTime}
                onChange={(e) => setSettings({ ...settings, curfewTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Visitor Gate Cut-Off Time</label>
              <input
                type="time"
                value={settings.visitorCutoffTime}
                onChange={(e) => setSettings({ ...settings, visitorCutoffTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Max Leave Days / Month</label>
              <input
                type="number"
                value={settings.maxLeaveDaysPerMonth}
                onChange={(e) => setSettings({ ...settings, maxLeaveDaysPerMonth: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* AI & Automation */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" /> Automated Triggers & AI Alerts
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.emailAlertsOnUrgentComplaint}
                onChange={(e) => setSettings({ ...settings, emailAlertsOnUrgentComplaint: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Notify Maintenance Supervisor via Email instantly when an Urgent Grievance ticket is filed
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.autoApproveLeaves}
                onChange={(e) => setSettings({ ...settings, autoApproveLeaves: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Auto-approve single day weekend outpasses if attendance exceeds 95%
              </span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl font-semibold bg-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Configurations
        </button>
      </form>
    </div>
  );
};
