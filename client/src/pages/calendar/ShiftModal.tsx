import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { IShift } from "../../interfaces/shift";
import { IClient } from "../../interfaces/client";
import SearchableSelect from "../../components/SearchableSelect";
interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shift: Partial<IShift>) => void;
  initialShift?: IShift;
  date: string;
  time: string;
  clients: IClient[];
  selectedUnitBusiness: string | undefined;
}

const addDurationshift = (time: string) => {
  const [hours, minutes = 0] = time.split(":").map(Number);
  let endTime = hours + 2;
  return `${String(endTime).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
};

const STATUS = [
  { value: "paid", description: "Pagado" },
  { value: "confirmed", description: "Confirmado" },
  { value: "debt", description: "No Pagado" },
  { value: "toConfirm", description: "A Confirmar" },
];

export default function ShiftModal({
  isOpen,
  onClose,
  onSave,
  initialShift,
  date,
  time,
  clients,
  selectedUnitBusiness,
}: ShiftModalProps) {
  const [formData, setFormData] = useState({
    _id: initialShift?._id || "",
    client: initialShift?.client || "",
    timeStart: initialShift?.timeStart || time,
    timeEnd: initialShift?.timeEnd || time,
    status: initialShift?.status || "toConfirm",
    unitBusiness: initialShift?.unitBusiness || selectedUnitBusiness,
    date: initialShift?.date || date,
  });

  useEffect(() => {
    setFormData({
      _id: initialShift?._id || "",
      client: initialShift?.client || "",
      unitBusiness: initialShift?.unitBusiness || selectedUnitBusiness,
      status: initialShift?.status || "toConfirm",
      timeStart: initialShift?.timeStart || time,
      timeEnd: initialShift?.timeEnd || addDurationshift(time),
      date: initialShift?.date || date,
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };
  const clientHandler = (val: string) => {
    setFormData({ ...formData, client: val });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {initialShift ? "Editar Turno" : "Nuevo Turno"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="shiftForm" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="client"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Cliente
            </label>
            <SearchableSelect
              options={clients.map((cli) => ({
                value: cli._id ? cli._id : cli.firstname,
                label: `${cli.firstname} ${cli.lastname}`,
              }))}
              value={
                typeof formData.client === "string"
                  ? formData.client
                  : formData.client._id || ""
              }
              onChange={clientHandler}
              placeholder="Seleccionar a un cliente..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Inicio
              </label>
              <input
                type="time"
                value={formData.timeStart}
                onChange={(e) =>
                  setFormData({ ...formData, timeStart: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de finalización
              </label>
              <input
                type="time"
                value={formData.timeEnd}
                onChange={(e) =>
                  setFormData({ ...formData, timeEnd: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {STATUS.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.description}
                </option>
              ))}
            </select>
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full transition-all ${
                    formData.color === color
                      ? "ring-2 ring-offset-2 ring-blue-500"
                      : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div> */}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
