import React, { useState, useEffect } from 'react';
import {
  Building,
  BedDouble,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Search,
  User,
  Users,
  X,
  Layers,
  ChevronRight
} from 'lucide-react';
import api from '../../services/api.js';
import { Room, Hostel, Block } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';

export const RoomsPage: React.FC = () => {
  const { showToast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedHostel, setSelectedHostel] = useState<string>('');
  const [selectedBlock, setSelectedBlock] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Modals
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    hostelId: 'hostel_01',
    blockId: 'block_01',
    roomNumber: '',
    floor: '1',
    roomType: 'Double',
    capacity: '2',
    status: 'Available'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hostelsRes, blocksRes, roomsRes] = await Promise.all([
        api.get('/hostels'),
        api.get('/blocks'),
        api.get('/rooms', {
          params: {
            hostelId: selectedHostel || undefined,
            blockId: selectedBlock || undefined,
            status: selectedStatus || undefined,
            search: search || undefined
          }
        })
      ]);

      if (hostelsRes.data.success) setHostels(hostelsRes.data.data);
      if (blocksRes.data.success) setBlocks(blocksRes.data.data);
      if (roomsRes.data.success) setRooms(roomsRes.data.data);
    } catch (err) {
      showToast('Failed to load room infrastructure data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedHostel, selectedBlock, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/rooms', newRoomData);
      if (res.data.success) {
        showToast('Room and beds created successfully', 'success');
        setShowAddRoomModal(false);
        fetchData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to create room', 'error');
    }
  };

  const handleUpdateStatus = async (roomId: string, newStatus: string) => {
    try {
      await api.put(`/rooms/${roomId}`, { status: newStatus });
      showToast('Room status updated', 'success');
      fetchData();
    } catch (err: any) {
      showToast('Failed to update status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-600" /> Visual Room & Bed Inventory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Interactive floor-by-floor visual bed distribution across campus hostel blocks.
          </p>
        </div>

        <button
          onClick={() => setShowAddRoomModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" /> Add New Room
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search room number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedHostel}
            onChange={(e) => {
              setSelectedHostel(e.target.value);
              setSelectedBlock('');
            }}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="">All Hostels</option>
            {hostels.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>

          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="">All Blocks</option>
            {blocks
              .filter((b) => !selectedHostel || b.hostel_id === selectedHostel)
              .map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Partially Occupied">Partially Occupied</option>
            <option value="Full">Full</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Visual Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
          >
            {/* Room Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    Room {room.room_number}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Floor {room.floor}
                  </span>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    room.status === 'Full'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : room.status === 'Available'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : room.status === 'Maintenance'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  }`}
                >
                  {room.status}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 font-medium">
                {room.hostel_name} &bull; {room.block_name} ({room.room_type} Room)
              </div>
            </div>

            {/* Visual Bed Layout Component */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Bed Allocation Matrix ({room.occupied_beds}/{room.capacity} Occupied)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(room.beds || []).map((bed) => (
                  <div
                    key={bed.id}
                    className={`p-3 rounded-2xl border text-xs flex flex-col justify-between transition ${
                      bed.status === 'Occupied'
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/60'
                        : bed.status === 'Maintenance'
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-dashed border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <BedDouble className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        Bed {bed.bed_number}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          bed.status === 'Occupied'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {bed.status}
                      </span>
                    </div>

                    {bed.status === 'Occupied' ? (
                      <div className="mt-1">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {bed.student_name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {bed.student_roll} &bull; {bed.department}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 italic py-1">
                        Ready for allocation
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom quick actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">
                {room.available_beds} beds free
              </span>

              <select
                value={room.status}
                onChange={(e) => handleUpdateStatus(room.id, e.target.value)}
                className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                <option value="Available">Set Available</option>
                <option value="Maintenance">Set Maintenance</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Add Room Modal */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Add New Hostel Room</h3>
              <button onClick={() => setShowAddRoomModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRoom} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Hostel</label>
                <select
                  value={newRoomData.hostelId}
                  onChange={(e) => setNewRoomData({ ...newRoomData, hostelId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {hostels.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Block</label>
                <select
                  value={newRoomData.blockId}
                  onChange={(e) => setNewRoomData({ ...newRoomData, blockId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {blocks.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 105"
                    value={newRoomData.roomNumber}
                    onChange={(e) => setNewRoomData({ ...newRoomData, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Floor</label>
                  <input
                    type="number"
                    min="1"
                    value={newRoomData.floor}
                    onChange={(e) => setNewRoomData({ ...newRoomData, floor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Room Type</label>
                  <select
                    value={newRoomData.roomType}
                    onChange={(e) => setNewRoomData({ ...newRoomData, roomType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Single">Single (1 Bed)</option>
                    <option value="Double">Double (2 Beds)</option>
                    <option value="Triple">Triple (3 Beds)</option>
                    <option value="Suite">Suite (4 Beds)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Capacity (Beds)</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newRoomData.capacity}
                    onChange={(e) => setNewRoomData({ ...newRoomData, capacity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                >
                  Create Room & Beds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
