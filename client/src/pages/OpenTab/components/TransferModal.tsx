import React, { useState } from "react";
import { X, ArrowRight } from "lucide-react";
import { IOpenTabParticipant } from "../../../interfaces/openTab";

interface TransferModalProps {
  participants: IOpenTabParticipant[];
  onClose: () => void;
  onTransfer: (
    fromId: string,
    toId: string,
    productIndex: number,
    units: number
  ) => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(price);
};

const TransferModal: React.FC<TransferModalProps> = ({
  participants,
  onClose,
  onTransfer,
}) => {
  const [fromParticipant, setFromParticipant] = useState<string>("");
  const [toParticipant, setToParticipant] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [units, setUnits] = useState<number>(1);

  const fromPart = participants.find((p) => p._id === fromParticipant);
  const availableProducts = fromPart?.products || [];

  const canTransfer =
    fromParticipant &&
    toParticipant &&
    fromParticipant !== toParticipant &&
    selectedProduct !== null &&
    units > 0;

  const handleSubmit = () => {
    if (canTransfer && selectedProduct !== null) {
      onTransfer(fromParticipant, toParticipant, selectedProduct, units);
    }
  };

  const maxUnits =
    selectedProduct !== null && fromPart
      ? fromPart.products[selectedProduct]?.units || 1
      : 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-gray-900">
            Transferir Producto
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desde
            </label>
            <select
              value={fromParticipant}
              onChange={(e) => {
                setFromParticipant(e.target.value);
                setSelectedProduct(null);
                setUnits(1);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Seleccionar participante</option>
              {participants
                .filter((p) => !p.isPaid && p.products.length > 0)
                .map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.clientName} ({p.products.length} productos)
                  </option>
                ))}
            </select>
          </div>

          {/* Product selection */}
          {fromParticipant && availableProducts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Producto
              </label>
              <div className="space-y-2">
                {availableProducts.map((product, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedProduct(index);
                      setUnits(1);
                    }}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      selectedProduct === index
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-gray-500">
                        {product.units} unidad(es)
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatPrice(product.price)} c/u
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Units */}
          {selectedProduct !== null && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad a transferir
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUnits(Math.max(1, units - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={maxUnits}
                  value={units}
                  onChange={(e) =>
                    setUnits(
                      Math.min(maxUnits, Math.max(1, parseInt(e.target.value) || 1))
                    )
                  }
                  className="w-20 p-2 text-center border border-gray-300 rounded-lg"
                />
                <button
                  onClick={() => setUnits(Math.min(maxUnits, units + 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  +
                </button>
                <span className="text-sm text-gray-500">de {maxUnits}</span>
              </div>
            </div>
          )}

          {/* To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hacia
            </label>
            <select
              value={toParticipant}
              onChange={(e) => setToParticipant(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Seleccionar participante</option>
              {participants
                .filter((p) => !p.isPaid && p._id !== fromParticipant)
                .map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.clientName}
                  </option>
                ))}
            </select>
          </div>

          {/* Preview */}
          {canTransfer && fromPart && selectedProduct !== null && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="font-medium">{fromPart.clientName}</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <span className="font-medium">
                  {participants.find((p) => p._id === toParticipant)?.clientName}
                </span>
              </div>
              <p className="text-center text-gray-600 mt-1">
                {units}x {fromPart.products[selectedProduct].name}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canTransfer}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Transferir
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;
