import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Download,
  Share2,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { useSite } from "../context/SiteContext";
import { boqApi } from "../services/api";

interface BOQItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  category: "furniture" | "services";
  comments?: number;
}

interface Room {
  id: string;
  name: string;
  items: BOQItem[];
  subtotal: number;
}

const BOQ: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editedRoomName, setEditedRoomName] = useState<string>("");
  const isAdmin = true; // Set to true or use your own logic for admin check
  const { activeSite } = useSite();
  const [selectedCategory, setSelectedCategory] = useState<"furniture" | "services" | "all">("all");
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  const [boqItems, setBoqItems] = useState<any[]>([]);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [boqForm, setBoqForm] = useState({
    roomName: '',
    itemName: '',
    quantity: '',
    unit: 'Sq.ft',
    rate: '',
    comments: '',
    referenceImage: null as File | null,
  });
  const allRoomNames = useMemo(() => {
    const roomNames = new Set<string>();
    boqItems.forEach((item: any) => {
      roomNames.add(item.roomName);
    });
    return Array.from(roomNames);
  }, [boqItems]);


  const rooms = useMemo(() => {
    const roomMap: { [key: string]: Room } = {};
    
    // First, initialize all rooms from allRoomNames
    allRoomNames.forEach((roomName) => {
      roomMap[roomName] = {
        id: roomName.toLowerCase().replace(/\s+/g, '-'),
        name: roomName,
        items: [],
        subtotal: 0,
      };
    });
    
    // Then add items to the rooms
    boqItems
      .filter((item: any) => item.itemName !== 'Room Added') // Exclude dummy room items
      .forEach((item: any) => {
        const roomName = item.roomName;
        if (roomMap[roomName]) {
          roomMap[roomName].items.push({
            id: item._id,
            name: item.itemName,
            quantity: item.quantity,
            unit: item.unit,
            rate: item.rate,
            amount: item.totalCost,
            category: 'furniture', // TODO: determine from item or add to backend
            comments: item.comments,
          });
          roomMap[roomName].subtotal += item.totalCost;
        }
      });
    
    return Object.values(roomMap);
  }, [boqItems]);



  useEffect(() => {
    if (activeSite) {
      fetchBOQItems();
    }
  }, [activeSite]);

  const fetchBOQItems = async () => {
    const token = localStorage.getItem('authToken');
    if (!token || !activeSite) return;
    try {
      const response = await boqApi.getBOQItemsBySite(activeSite.id, token);
      const { boqItems: items } = response as { boqItems: Record<string, any[]>; stats: any };
    setBoqItems(Object.values(items).flat());
    } catch (error) {
      console.error('Failed to fetch BOQ items', error);
    }
  };

  const handleAddRoom = async () => {
    if (!newRoomName.trim()) return;
    const token = localStorage.getItem('authToken');
    if (!token || !activeSite) return;
    const dummyItem = {
      roomName: newRoomName,
      itemName: 'Room Added',
      quantity: 1,
      unit: 'Nos',
      rate: 0,
      totalCost: 0,
      comments: '',
      siteId: activeSite.id,
    };
    try {
      await boqApi.addBOQItem(dummyItem, token);
      setNewRoomName('');
      setShowAddRoomModal(false);
      fetchBOQItems();
    } catch (error) {
      console.error('Failed to add room', error);
    }
  };

  const handleSubmitBOQItem = async (e: React.FormEvent, keepModalOpen = false) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    if (!token || !activeSite) return;

    const totalCost = parseFloat(boqForm.quantity) * parseFloat(boqForm.rate) || 0;

    const itemData = {
      roomName: boqForm.roomName,
      itemName: boqForm.itemName,
      quantity: parseFloat(boqForm.quantity),
      unit: boqForm.unit,
      rate: parseFloat(boqForm.rate),
      totalCost,
      comments: boqForm.comments,
      siteId: activeSite.id,
    };

    // Handle image upload
    if (boqForm.referenceImage) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const imageData = {
          ...itemData,
          referenceImageBase64: base64,
          referenceImageFilename: boqForm.referenceImage!.name,
        };
        try {
          await boqApi.addBOQItem(imageData, token);
          if (!keepModalOpen) {
            setShowAddModal(false);
          }
          setBoqForm({
            roomName: '',
            itemName: '',
            quantity: '',
            unit: 'Sq.ft',
            rate: '',
            comments: '',
            referenceImage: null,
          });
          fetchBOQItems();
        } catch (error) {
          console.error('Failed to add BOQ item', error);
        }
      };
      reader.readAsDataURL(boqForm.referenceImage);
    } else {
      try {
        await boqApi.addBOQItem(itemData, token);
        if (!keepModalOpen) {
          setShowAddModal(false);
        }
        setBoqForm({
          roomName: '',
          itemName: '',
          quantity: '',
          unit: 'Sq.ft',
          rate: '',
          comments: '',
          referenceImage: null,
        });
        fetchBOQItems();
      } catch (error) {
        console.error('Failed to add BOQ item', error);
      }
    }
  };

  const handleEditRoomName = (roomId: string, currentName: string) => {
    setEditingRoomId(roomId);
    setEditedRoomName(currentName);
  };

  const handleSaveRoomName = () => {
    // TODO: Implement backend update for room name
    setEditingRoomId(null);
    setEditedRoomName("");
  };

  const handleCancelEdit = () => {
    setEditingRoomId(null);
    setEditedRoomName("");
  };

  const handleAddUnit = (roomId: string) => {
    // This will trigger the Add Item functionality
    // For now, we can show an alert or trigger the Add Item button
    console.log("Add unit for room:", roomId);
  };

  const filteredRooms = selectedRoom === "all" 
    ? rooms 
    : rooms.filter(room => room.id === selectedRoom);

  const filterItemsByCategory = (items: BOQItem[]) => {
    if (selectedCategory === "all") return items;
    return items.filter(item => item.category === selectedCategory);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  return (
    <>
    <div className="pb-20">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Bill of Quantities</h2>
        <p className="text-slate-500 text-sm">Comprehensive cost breakdown and project estimation</p>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
            selectedCategory === "all"
              ? "bg-slate-800 text-white shadow-lg"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          All Items
        </button>
        <button
          onClick={() => setSelectedCategory("furniture")}
          className={`px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
            selectedCategory === "furniture"
              ? "bg-slate-800 text-white shadow-lg"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Furniture
        </button>
        <button
          onClick={() => setSelectedCategory("services")}
          className={`px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
            selectedCategory === "services"
              ? "bg-slate-800 text-white shadow-lg"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Services
        </button>
      </div>

      {/* Room Filters + Add Button */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedRoom("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedRoom === "all"
                ? "bg-blue-50 text-blue-600 border-2 border-blue-200"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Rooms
          </button>
          {allRoomNames.map((roomName) => (
            <button
              key={roomName}
              onClick={() => setSelectedRoom(roomName.toLowerCase().replace(/\s+/g, '-'))}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedRoom === roomName.toLowerCase().replace(/\s+/g, '-')
                  ? "bg-blue-50 text-blue-600 border-2 border-blue-200"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {roomName}
            </button>
          ))}
        </div>
        {/* Add Room Button */}
        <button
          className="w-12 h-12 bg-slate-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-700 transition-all flex-shrink-0"
          title="Add Room"
          onClick={() => {
            console.log('Add Room clicked');
            setShowAddRoomModal(true);
          }}
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

 {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 opacity-100" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-xl w-full max-w-md p-4 sm:p-6 shadow-lg
        overflow-auto max-h-[calc(100vh-8rem)]
        transform transition-all duration-300
        scale-100 translate-y-0 opacity-100
        animate-modalIn">
            <div className="flex items-start justify-between mb-3">
              <div className="flex flex-col">
                <h3 className="text-base font-semibold">Add BOQ Item</h3>
                <span className="text-xs text-gray-500">Add a new item to the Bill of Quantities</span>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-md hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmitBOQItem} className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs text-gray-600">Room Name *</label>
                <select 
                  className="w-full mt-1 p-2 border rounded"
                  value={boqForm.roomName}
                  onChange={(e) => setBoqForm({...boqForm, roomName: e.target.value})}
                  required
                >
                  <option value="">Select Room</option>
                  {allRoomNames.map((roomName) => (
                    <option key={roomName} value={roomName}>{roomName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600">Item Name / Scope of Work *</label>
                <input 
                  className="w-full mt-1 p-2 border rounded" 
                  placeholder="Enter item name or scope of work"
                  value={boqForm.itemName}
                  onChange={(e) => setBoqForm({...boqForm, itemName: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Quantity / Size *</label>
                <input 
                  className="w-full mt-1 p-2 border rounded" 
                  placeholder="Enter quantity or size"
                  type="number"
                  value={boqForm.quantity}
                  onChange={(e) => setBoqForm({...boqForm, quantity: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Unit *</label>
                <select 
                  className="w-full mt-1 p-2 border rounded"
                  value={boqForm.unit}
                  onChange={(e) => setBoqForm({...boqForm, unit: e.target.value})}
                >
                  <option>Sq.ft</option>
                  <option>Rft</option>
                  <option>Nos</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600">Rate per Unit (₹) *</label>
                <input 
                  type="number" 
                  className="w-full mt-1 p-2 border rounded" 
                  placeholder="Enter rate per unit"
                  value={boqForm.rate}
                  onChange={(e) => setBoqForm({...boqForm, rate: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Total Cost (₹)</label>
                <input 
                  type="text" 
                  className="w-full mt-1 p-2 border rounded bg-gray-100" 
                  readOnly 
                  value={boqForm.quantity && boqForm.rate ? `₹${(parseFloat(boqForm.quantity) * parseFloat(boqForm.rate)).toLocaleString()}` : "Auto Calculated"} 
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Upload Reference Image</label>
                <input 
                  type="file" 
                  className="w-full mt-1 p-2 border rounded"
                  accept="image/*"
                  onChange={(e) => setBoqForm({...boqForm, referenceImage: e.target.files?.[0] || null})}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Comments / Notes</label>
                <textarea 
                  className="w-full mt-1 p-2 border rounded" 
                  rows={3} 
                  placeholder="Add any additional comments or notes"
                  value={boqForm.comments}
                  onChange={(e) => setBoqForm({...boqForm, comments: e.target.value})}
                />
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="w-full sm:w-auto px-4 py-2 rounded bg-gray-100">Cancel</button>
                <button type="submit" className="w-full sm:w-auto px-4 py-2 rounded bg-indigo-600 text-white">Add BOQ Item</button>
                <button 
                  type="button" 
                  onClick={() => handleSubmitBOQItem({ preventDefault: () => {} } as any, true)}
                  className="w-full sm:w-auto px-4 py-2 rounded bg-white border border-indigo-600 text-indigo-600"
                >
                  Save & Add Another
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 opacity-100" onClick={() => setShowAddRoomModal(false)} />
          <div className="relative bg-white rounded-xl w-full max-w-md p-4 sm:p-6 shadow-lg
        overflow-auto max-h-[calc(100vh-8rem)]
        transform transition-all duration-300
        scale-100 translate-y-0 opacity-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex flex-col">
                <h3 className="text-base font-semibold">Add New Room</h3>
                <span className="text-xs text-gray-500">Add a new room to the Bill of Quantities</span>
              </div>
              <button onClick={() => setShowAddRoomModal(false)} className="p-1 rounded-md hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAddRoom(); }} className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs text-gray-600">Room Name *</label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 border rounded"
                  placeholder="Enter room name (e.g., Bedroom, Kitchen)"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowAddRoomModal(false)} className="w-full sm:w-auto px-4 py-2 rounded bg-gray-100">Cancel</button>
                <button type="submit" className="w-full sm:w-auto px-4 py-2 rounded bg-indigo-600 text-white">Add Room</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Sections */}
      <div className="space-y-4">
        {filteredRooms.map((room) => {
          const filteredItems = filterItemsByCategory(room.items);
          // Show room even if no items

          const roomSubtotal = filteredItems.reduce((sum, item) => sum + item.amount, 0);

          return (
            <div key={room.id} className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100">
              {/* Room Header */}
              <div className="flex items-center justify-between mb-4 ">
                <div className="flex items-center gap-2">
                  {editingRoomId === room.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editedRoomName}
                        onChange={(e) => setEditedRoomName(e.target.value)}
                        className="text-md  text-slate-500 border-1 border-gray-200 rounded-lg px-1 py-1 focus:outline-none focus:ring-2 focus:ring-gray-200 w-3/5"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveRoomName()}
                        className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-slate-800">{room.name}</h3>
                      {isAdmin && (
                        <button
                          onClick={() => handleEditRoomName(room.id, room.name)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit room name"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
                <button 
                  onClick={() => {
                    setBoqForm({...boqForm, roomName: room.name});
                    setShowAddModal(true);
                  }}  
                  className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              {filteredItems.length > 0 ? (
                <>
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-2 mb-3 px-2">
                    <div className="col-span-5 text-[10px] font-semibold tracking-wider text-slate-400">ITEM NAME</div>
                    <div className="col-span-4 text-[10px] font-semibold tracking-wider text-slate-400 text-center">QUANTITY</div>
                    <div className="col-span-3 text-[10px] font-semibold tracking-wider text-slate-400 text-right">RATE</div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3">
                    {filteredItems.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-center py-3 border-b border-slate-50 last:border-0">
                        <div className="col-span-5 flex items-center gap-2">
                          <div className={`w-1 h-10 rounded-full ${
                            item.category === "furniture" ? "bg-blue-500" : "bg-amber-500"
                          }`}></div>
                          <span className="font-semibold text-slate-800">{item.name}</span>
                        </div>
                        <div className="col-span-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="font-semibold text-slate-700">{item.quantity} {item.unit}</span>
                            {isAdmin && (
                              <button
                                onClick={() => handleAddUnit(room.id)}
                                className="p-0.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                title="Add unit"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">Qty</p>
                        </div>
                        <div className="col-span-3 text-right">
                          <span className="font-bold text-slate-800">{formatCurrency(item.rate)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-sm">No items added to this room yet.</p>
                  <p className="text-xs mt-1">Click "Add Item" to get started.</p>
                </div>
              )}

              {/* Subtotal */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="text-2xl font-bold text-slate-800">{formatCurrency(roomSubtotal)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <button className="flex-1 bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-700 transition-all">
                  <Download className="w-5 h-5" />
                  Export PDF
                </button>
                <button className="flex-1 bg-white border-2 border-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                  <Share2 className="w-5 h-5" />
                  Share BOQ
                </button>
              </div>
            </div>
          );
        })}
      </div>

   
      </div>
    </>

  );
};

export default BOQ;
