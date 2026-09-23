import React from 'react';
import {
  FileBarChart,
  Download,
  Users,
  Building,
  CalendarCheck,
  MessageSquareWarning,
  UtensilsCrossed,
  Receipt,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api.js';
import { useToast } from '../../contexts/ToastContext.js';

export const ReportsPage: React.FC = () => {
  const { showToast } = useToast();

  const handleExport = async (endpoint: string, filename: string) => {
    try {
      showToast(`Generating ${filename}...`, 'info');
      const res = await api.get(endpoint);
      const data = res.data.data;
      if (!data || !Array.isArray(data) || data.length === 0) {
        showToast('No records available for export', 'error');
        return;
      }

      // Convert json array to CSV string
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map((row) =>
          headers
            .map((field) => {
              const val = row[field] === null || row[field] === undefined ? '' : String(row[field]);
              return `"${val.replace(/"/g, '""')}"`;
            })
            .join(',')
        )
      ];

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(`${filename} exported successfully`, 'success');
    } catch (err) {
      showToast('Export failed', 'error');
    }
  };

  const reports = [
    {
      title: 'Student Residents Census Report',
      description: 'Comprehensive roster of all registered residents, departmental enrollment, allocated rooms, and emergency contacts.',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/60',
      endpoint: '/admin/students',
      filename: 'Students_Roster'
    },
    {
      title: 'Room & Bed Allocations Master Log',
      description: 'Full inventory of assigned rooms, occupied vs available bed matrices, allocation check-ins, and transfer history.',
      icon: Building,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/60',
      endpoint: '/allocations',
      filename: 'Room_Allocations'
    },
    {
      title: 'Night Curfew & Attendance Audit',
      description: 'Daily biometric roll call records, absence frequency logs, and verified student outpass permissions.',
      icon: CalendarCheck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
      endpoint: '/attendance',
      filename: 'Attendance_Register'
    },
    {
      title: 'Maintenance Grievance & SLA Resolution',
      description: 'Complete log of plumbing, electrical, WiFi, and carpentry issues with repair technician timestamps.',
      icon: MessageSquareWarning,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50 dark:bg-rose-950/60',
      endpoint: '/complaints',
      filename: 'Complaints_SLA'
    },
    {
      title: 'Mess Catering & Food Wastage Ledger',
      description: 'Historical cooking volume versus plate waste log, average cost per kg lost, and AI forecast compliance.',
      icon: UtensilsCrossed,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/60',
      endpoint: '/food/wastage',
      filename: 'Food_Wastage_Audit'
    },
    {
      title: 'Operational Expenditure Ledger',
      description: 'Utility bills, campus contractor vendor payments, maintenance hardware costs, and monthly ledger summary.',
      icon: Receipt,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/60',
      endpoint: '/expenses',
      filename: 'Hostel_Expenses_Ledger'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <FileBarChart className="w-5 h-5 text-indigo-600" /> Executive Data & Export Hub
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Download real-time comma-separated (CSV) audit spreadsheets formatted for institutional compliance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reports.map((report, idx) => {
          const Icon = report.icon;
          return (
            <div
              key={idx}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
            >
              <div>
                <div className={`w-10 h-10 rounded-2xl ${report.bgColor} ${report.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">{report.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {report.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleExport(report.endpoint, report.filename)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-800 dark:text-slate-200 transition flex items-center justify-center gap-2 group shadow-xs"
                >
                  <Download className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
                  <span>Export Spreadsheet (.CSV)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
