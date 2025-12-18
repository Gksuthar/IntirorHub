import React, { useState } from "react";
import {
  Plus,
  Download,
  Share2,
  Edit2,
  Trash2,
  MessageSquare,
} from "lucide-react";

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
  const [selectedCategory, setSelectedCategory] = useState<"furniture" | "services" | "all">("all");
  const [selectedRoom, setSelectedRoom] = useState<string>("all");

  const rooms: Room[] = [
    {
      id: "living-room",
      name: "Living Room",
      subtotal: 134450,
      items: [
        {
          id: 1,
          name: "L-Shaped Sofa",
          quantity: 1,
          unit: "Nos.",
          rate: 45000,
          amount: 45000,
          category: "furniture",
          comments: 1,
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
          rate: 22000,
          amount: 22000,
          category: "furniture",
        },
        {
          id: 4,
          name: "Wall Paint",
          quantity: 450,
          unit: "Sq. Ft.",
          rate: 35,
          amount: 15750,
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
        {
          id: 6,
          name: "Accent Wall Paneling",
          quantity: 120,
          unit: "Sq. Ft.",
          rate: 180,
          amount: 21600,
          category: "services",
        },
      ],
    },
    {
      id: "kitchen",
      name: "Kitchen",
      subtotal: 144550,
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
          rate: 35,
          amount: 6300,
          category: "services",
        },
      ],
    },
    {
      id: "bedroom-1",
      name: "Bedroom 1",
      subtotal: 196200,
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
          rate: 35,
          amount: 13300,
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
      subtotal: 151350,
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
          quantity: 90,
          unit: "Sq. Ft.",
          rate: 850,
          amount: 76500,
          category: "furniture",
        },
        {
          id: 20,
          name: "Side Table",
          quantity: 2,
          unit: "Nos.",
          rate: 3500,
          amount: 7000,
          category: "furniture",
        },
        {
          id: 21,
          name: "Wall Paint",
          quantity: 320,
          unit: "Sq. Ft.",
          rate: 35,
          amount: 11200,
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
        {
          id: 23,
          name: "Flooring (Laminate)",
          quantity: 150,
          unit: "Sq. Ft.",
          rate: 95,
          amount: 14250,
          category: "services",
        },
      ],
    },
    {
      id: "bedroom-3",
      name: "Bedroom 3",
      subtotal: 146250,
      items: [
        {
          id: 24,
          name: "Single Bed",
          quantity: 2,
          unit: "Nos.",
          rate: 18000,
          amount: 36000,
          category: "furniture",
        },
        {
          id: 25,
          name: "Wardrobe",
          quantity: 75,
          unit: "Sq. Ft.",
          rate: 850,
          amount: 63750,
          category: "furniture",
        },
        {
          id: 26,
          name: "Study Desk",
          quantity: 1,
          unit: "Nos.",
          rate: 9500,
          amount: 9500,
          category: "furniture",
        },
        {
          id: 27,
          name: "Wall Paint",
          quantity: 300,
          unit: "Sq. Ft.",
          rate: 35,
          amount: 10500,
          category: "services",
        },
        {
          id: 28,
          name: "False Ceiling",
          quantity: 110,
          unit: "Sq. Ft.",
          rate: 120,
          amount: 13200,
          category: "services",
        },
        {
          id: 29,
          name: "Flooring (Laminate)",
          quantity: 140,
          unit: "Sq. Ft.",
          rate: 95,
          amount: 13300,
          category: "services",
        },
      ],
    },
  ];

  const totalProjectCost = rooms.reduce((sum, room) => sum + room.subtotal, 0);

  const filteredRooms = selectedRoom === "all" 
    ? rooms 
    : rooms.filter(room => room.id === selectedRoom);

  const filterItemsByCategory = (items: BOQItem[]) => {
    if (selectedCategory === "all") return items;
    return items.filter(item => item.category === selectedCategory);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Bill of Quantities</h1>
          <p className="text-slate-500">Comprehensive cost breakdown and project estimation</p>
        </div>

        {/* Category Filters */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setSelectedCategory("furniture")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === "furniture"
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            Furniture
          </button>
          <button
            onClick={() => setSelectedCategory("services")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === "services"
                ? "bg-orange-500 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            Services
          </button>
        </div>

        {/* Room Tabs */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              onClick={() => setSelectedRoom("all")}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                selectedRoom === "all"
                  ? "bg-indigo-50 text-indigo-600 border-2 border-indigo-200"
                  : "bg-white text-slate-600 border-2 border-slate-200 hover:border-slate-300"
              }`}
            >
              All Rooms
            </button>
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  selectedRoom === room.id
                    ? "bg-indigo-50 text-indigo-600 border-2 border-indigo-200"
                    : "bg-white text-slate-600 border-2 border-slate-200 hover:border-slate-300"
                }`}
              >
                {room.name}
              </button>
            ))}
          </div>
        </div>

        {/* Room Sections */}
        <div className="space-y-6">
          {filteredRooms.map((room) => {
            const filteredItems = filterItemsByCategory(room.items);
            if (filteredItems.length === 0) return null;

            const roomSubtotal = filteredItems.reduce((sum, item) => sum + item.amount, 0);

            return (
              <div key={room.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Room Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                  <h2 className="text-xl font-semibold text-slate-900">{room.name}</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                    <Plus className="h-4 w-4" />
                    Add Item
                  </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Item Name
                        </th>
                        <th className="text-center py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="text-center py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Rate
                        </th>
                        <th className="text-center py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="text-center py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-1 h-10 rounded-full ${
                                  item.category === "furniture" ? "bg-indigo-600" : "bg-orange-500"
                                }`}
                              ></div>
                              <div>
                                <p className="font-medium text-slate-900">{item.name}</p>
                                {item.comments && (
                                  <p className="text-xs text-indigo-600 flex items-center gap-1 mt-1">
                                    <MessageSquare className="h-3 w-3" />
                                    {item.comments} comment
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center text-slate-700">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="py-4 px-6 text-center text-slate-700">
                            ₹{item.rate.toLocaleString("en-IN")}
                          </td>
                          <td className="py-4 px-6 text-center font-semibold text-slate-900">
                            ₹{item.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-2">
                              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <Edit2 className="h-4 w-4 text-slate-600" />
                              </button>
                              <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotal Section */}
                <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-100">
                  <span className="text-sm font-medium text-slate-700">Subtotal</span>
                  <span className="text-2xl font-bold text-slate-900">
                    ₹{roomSubtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="p-4 flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium">
                    <Download className="h-4 w-4" />
                    Export PDF
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium">
                    <Share2 className="h-4 w-4" />
                    Share BOQ
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Project Cost */}
        <div className="mt-8 bg-slate-900 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-slate-300 text-sm uppercase tracking-wider mb-2">
                Total Project Cost
              </p>
              <p className="text-5xl font-bold">₹{totalProjectCost.toLocaleString("en-IN")}</p>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-white text-slate-900 rounded-xl hover:bg-slate-100 transition-colors font-medium">
                Download Complete BOQ
              </button>
              <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium">
                Share Project
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BOQ;
