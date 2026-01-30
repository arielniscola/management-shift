import React, { useState } from "react";
import { Plus, CreditCard, CheckCircle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { IOpenTabParticipant, IOpenTabProduct } from "../../../interfaces/openTab";

interface ParticipantCardProps {
  participant: IOpenTabParticipant;
  divisionType?: "equal" | "byProduct";
  sharedProducts?: IOpenTabProduct[];  // Para mostrar en división equitativa
  totalParticipants?: number;          // Para calcular proporción en división equitativa
  onAddProduct: () => void;
  onPay: () => void;
  onRemoveProduct?: (productIndex: number) => void;  // Para eliminar productos propios
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(price);
};

const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  divisionType,
  sharedProducts = [],
  totalParticipants = 1,
  onAddProduct,
  onPay,
  onRemoveProduct,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Productos propios del participante (agregados post-división)
  const participantProducts = participant.products || [];

  // En división equitativa, mostrar productos compartidos + propios
  // En división por productos, solo mostrar los propios
  const hasSharedProducts = divisionType === "equal" && sharedProducts.length > 0;
  const hasParticipantProducts = participantProducts.length > 0;
  const hasProducts = hasSharedProducts || hasParticipantProducts;

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border p-4 ${
        participant.isPaid ? "border-green-300 bg-green-50" : "border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
              participant.isPaid ? "bg-green-500" : "bg-indigo-500"
            }`}
          >
            {participant.clientName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {participant.clientName}
            </h3>
            {participant.isPaid && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="w-3 h-3" />
                Pagado
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">
            {formatPrice(participant.subtotal)}
          </p>
          {divisionType === "equal" && (
            <p className="text-xs text-gray-500">
              1/{totalParticipants} del total
            </p>
          )}
        </div>
      </div>

      {/* Toggle para ver productos */}
      {hasProducts && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <span>
            {divisionType === "byProduct"
              ? `${participantProducts.length} producto(s)`
              : hasParticipantProducts
                ? `${sharedProducts.length} compartido(s) + ${participantProducts.length} propio(s)`
                : `${sharedProducts.length} producto(s) compartido(s)`
            }
          </span>
          {showDetails ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Products list */}
      {showDetails && hasProducts && (
        <div className="mb-3 space-y-1 py-2 border-t border-gray-100">
          {/* Productos compartidos (solo en división equitativa) */}
          {hasSharedProducts && (
            <>
              <p className="text-xs text-gray-500 font-medium mb-1">Productos compartidos:</p>
              {sharedProducts.map((product, index) => (
                <div
                  key={`shared-${index}`}
                  className="flex justify-between text-sm text-gray-600"
                >
                  <span>
                    {product.units}x {product.name}
                  </span>
                  <span>
                    {formatPrice((product.price * product.units) / totalParticipants)}
                  </span>
                </div>
              ))}
              <p className="text-xs text-gray-400 italic">
                * Dividido entre {totalParticipants}
              </p>
            </>
          )}

          {/* Productos propios del participante (agregados post-división) */}
          {hasParticipantProducts && (
            <>
              {hasSharedProducts && <div className="my-2 border-t border-gray-100"></div>}
              <p className="text-xs text-gray-500 font-medium mb-1">
                {divisionType === "equal" ? "Productos adicionales:" : "Productos asignados:"}
              </p>
              {participantProducts.map((product, index) => (
                <div
                  key={`own-${index}`}
                  className="flex justify-between items-center text-sm text-gray-600"
                >
                  <span>
                    {product.units}x {product.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{formatPrice(product.price * product.units)}</span>
                    {!participant.isPaid && onRemoveProduct && (
                      <button
                        onClick={() => onRemoveProduct(index)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Payment details if paid */}
      {participant.isPaid && participant.payments.length > 0 && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <p className="text-xs text-green-700 mb-1">Pagos realizados:</p>
          {participant.payments.map((payment, index) => (
            <div
              key={index}
              className="flex justify-between text-xs text-green-600"
            >
              <span>{payment.paymentMethod.name}</span>
              <span>{formatPrice(payment.amount)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {!participant.isPaid && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={onAddProduct}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
          <button
            onClick={onPay}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <CreditCard className="w-4 h-4" />
            Pagar
          </button>
        </div>
      )}
    </div>
  );
};

export default ParticipantCard;
