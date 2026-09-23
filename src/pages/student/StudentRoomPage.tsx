import React, { useState, useEffect } from 'react';
import {
  BedDouble,
  Building,
  Users,
  Wifi,
  Shield,
  Coffee,
  Sparkles,
  Phone,
  Mail,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api.js';

export const StudentRoomPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const res = await api.get('/student/room');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load room details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, []);

  const student = data?.student;
  const room = data?.room;
  const roommates = data?.roommates || [];

  if (!room) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <BedDouble className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800 dark:text-white">No Room Assigned Yet</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Your hostel room allocation is currently being processed by the administration office. Please consult your warden.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <BedDouble className="w-5 h-5 text-indigo-600" /> My Room & Accommodation Details
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          View assigned room features, allocated bed space, and current resident roommates.
        </p>
      </div>

      {/* Main Room Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider block mb-1">
              {room.hostel_name} &bull; {room.block_name}
            </span>
            <h2 className="text-3xl font-black tracking-tight">Room {room.room_number}</h2>
            <p className="text-xs text-indigo-200 mt-1">
              Floor {room.floor} &bull; {room.room_type} Room &bull; Capacity: {room.capacity} Beds
            </p>
          </div>

          <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 text-center">
            <span className="text-[10px] text-indigo-200 uppercase font-bold block mb-0.5">Your Assigned Bed</span>
            <div className="text-2xl font-black text-amber-300">Slot #{student?.bed_number}</div>
          </div>
        </div>

        {/* Room Amenities */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-200">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span>High-Speed Campus WiFi</span>
          </div>
          <div className="flex items-center gap-2 text-indigo-200">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Study Table & Lamp</span>
          </div>
          <div className="flex items-center gap-2 text-indigo-200">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>Biometric Keycard Lock</span>
          </div>
          <div className="flex items-center gap-2 text-indigo-200">
            <Coffee className="w-4 h-4 text-purple-400" />
            <span>Hot Water 24/7</span>
          </div>
        </div>
      </div>

      {/* Roommates Roster */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-indigo-600" /> Current Room Occupants
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roommates.map((rm: any) => {
            const isMe = rm.id === student.id;
            return (
              <div
                key={rm.id}
                className={`p-4 rounded-2xl border transition flex items-center gap-4 ${
                  isMe
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/60'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60'
                }`}
              >
                <img
                  src={rm.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rm.full_name}`}
                  alt=""
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/20 shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {rm.full_name}
                    </span>
                    {isMe && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                        You
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 block">
                    Bed Slot #{rm.bed_number}
                  </span>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-x-3">
                    <span>{rm.department}</span>
                    <span>{rm.phone}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
