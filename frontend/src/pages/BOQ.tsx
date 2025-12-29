import React, { useState } from "react";
import {
  Plus,
  Download,
  Share2,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

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
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [selectedCategory, setSelectedCategory] = useState<"furniture" | "services" | "all">("all");
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editedRoomName, setEditedRoomName] = useState<string>("");
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "living-room",
      name: "Living Room",
      subtotal: 112700,
      items: [
        {
          id: 1,
          name: "L-Shaped Sofa",
          quantity: 1,
          unit: "Nos.",
          rate: 45000,
          amount: 45000,
          category: "furniture",
        },
        {
          id: 2,
          name: "Coffee Table",
          quantity: 1,
          unit: "Nos.",
          rate: 8500,
          amount: 8500,
          category: "furniture",
        },
        {
          id: 3,
          name: "TV Unit",
          quantity: 1,
          unit: "Nos.",
          rate: 25000,
          amount: 25000,
          category: "furniture",
        },
        {
          id: 4,
          name: "Wall Paint",
          quantity: 280,
          unit: "Sq. Ft.",
          rate: 45,
          amount: 12600,
          category: "services",
        },
        {
          id: 5,
          name: "False Ceiling",
          quantity: 180,
          unit: "Sq. Ft.",
          rate: 120,
          amount: 21600,
          category: "services",
        },
      ],
    },
    {
      id: "kitchen",
      name: "Kitchen",
      subtotal: 146350,
      items: [
        {
          id: 7,
          name: "Modular Kitchen",
          quantity: 85,
          unit: "Sq. Ft.",
          rate: 1200,
          amount: 102000,
          category: "furniture",
        },
        {
          id: 8,
          name: "Chimney",
          quantity: 1,
          unit: "Nos.",
          rate: 18000,
          amount: 18000,
          category: "furniture",
        },
        {
          id: 9,
          name: "Wall Tiles",
          quantity: 150,
          unit: "Sq. Ft.",
          rate: 65,
          amount: 9750,
          category: "services",
        },
        {
          id: 10,
          name: "Floor Tiles",
          quantity: 100,
          unit: "Sq. Ft.",
          rate: 85,
          amount: 8500,
          category: "services",
        },
        {
          id: 11,
          name: "Wall Paint",
          quantity: 180,
          unit: "Sq. Ft.",
          rate: 45,
          amount: 8100,
          category: "services",
        },
      ],
    },
    {
      id: "bedroom-1",
      name: "Bedroom 1",
      subtotal: 200000,
      items: [
        {
          id: 12,
          name: "King Size Bed",
          quantity: 1,
          unit: "Nos.",
          rate: 35000,
          amount: 35000,
          category: "furniture",
        },
        {
          id: 13,
          name: "Wardrobe",
          quantity: 120,
          unit: "Sq. Ft.",
          rate: 850,
          amount: 102000,
          category: "furniture",
        },
        {
          id: 14,
          name: "Study Table",
          quantity: 1,
          unit: "Nos.",
          rate: 12000,
          amount: 12000,
          category: "furniture",
        },
        {
          id: 15,
          name: "Wall Paint",
          quantity: 380,
          unit: "Sq. Ft.",
          rate: 45,
          amount: 17100,
          category: "services",
        },
        {
          id: 16,
          name: "False Ceiling",
          quantity: 140,
          unit: "Sq. Ft.",
          rate: 120,
          amount: 16800,
          category: "services",
        },
        {
          id: 17,
          name: "Flooring (Laminate)",
          quantity: 180,
          unit: "Sq. Ft.",
          rate: 95,
          amount: 17100,
          category: "services",
        },
      ],
    },
    {
      id: "bedroom-2",
      name: "Bedroom 2",
      subtotal: 124800,
      items: [
        {
          id: 18,
          name: "Queen Size Bed",
          quantity: 1,
          unit: "Nos.",
          rate: 28000,
          amount: 28000,
          category: "furniture",
        },
        {
          id: 19,
          name: "Wardrobe",
          quantity: 80,
          unit: "Sq. Ft.",
          rate: 850,
          amount: 68000,
          category: "furniture",
        },
        {
          id: 21,
          name: "Wall Paint",
          quantity: 320,
          unit: "Sq. Ft.",
          rate: 45,
          amount: 14400,
          category: "services",
        },
        {
          id: 22,
          name: "False Ceiling",
          quantity: 120,
          unit: "Sq. Ft.",
          rate: 120,
          amount: 14400,
          category: "services",
        },
      ],
    },
    {
      id: "bedroom-3",
      name: "Bedroom 3",
      subtotal: 50600,
      items: [
        {
          id: 24,
          name: "Single Bed",
          quantity: 2,
          unit: "Nos.",
          rate: 15000,
          amount: 30000,
          category: "furniture",
        },
        {
          id: 26,
          name: "Study Desk",
          quantity: 1,
          unit: "Nos.",
          rate: 8000,
          amount: 8000,
          category: "furniture",
        },
        {
          id: 27,
          name: "Wall Paint",
          quantity: 280,
          unit: "Sq. Ft.",
          rate: 45,
          amount: 12600,
          category: "services",
        },
      ],
    },
  ]);

  const handleEditRoomName = (roomId: string, currentName: string) => {
    setEditingRoomId(roomId);
    setEditedRoomName(currentName);
  };

  const handleSaveRoomName = (roomId: string) => {
    setRooms(rooms.map(room => 
      room.id === roomId ? { ...room, name: editedRoomName } : room
    ));
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

      {/* Room Filters */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-slate-100">
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
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedRoom === room.id
                  ? "bg-blue-50 text-blue-600 border-2 border-blue-200"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {room.name}
            </button>
          ))}
        </div>
      </div>

      {/* Room Sections */}
      <div className="space-y-4">
        {filteredRooms.map((room) => {
          const filteredItems = filterItemsByCategory(room.items);
          if (filteredItems.length === 0) return null;

          const roomSubtotal = filteredItems.reduce((sum, item) => sum + item.amount, 0);

          return (
            <div key={room.id} className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100">
              {/* Room Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {editingRoomId === room.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editedRoomName}
                        onChange={(e) => setEditedRoomName(e.target.value)}
                        className="text-xl font-bold text-slate-800 border-2 border-blue-500 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveRoomName(room.id)}
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
                <button className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 hover:bg-blue-600 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

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

      {/* Floating Action Button */}
      <button className="fixed bottom-24 right-6 w-14 h-14 bg-slate-800 text-white rounded-full shadow-lg shadow-slate-300 flex items-center justify-center hover:bg-slate-700 transition-all hover:scale-105 z-40">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default BOQ;
