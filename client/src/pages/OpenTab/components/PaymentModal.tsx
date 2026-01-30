import React, { useState } from "react";
import { X, Trash2, CreditCard } from "lucide-react";
import { IOpenTabParticipant } from "../../../interfaces/openTab";
import { IPaymentMethod } from "../../../interfaces/paymentMethod";

interface PaymentModalProps {
  participant: IOpenTabParticipant;
  paymentMethods: IPaymentMethod[];
  onClose: () => void;
  onPay: (
    participantId: string,
    payments: { amount: number; paymentMethod: IPaymentMethod }[]
  ) => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(price);
};

const PaymentModal: React.FC<PaymentModalProps> = ({
  participant,
  paymentMethods,
  onClose,
  onPay,
}) => {
  const [payments, setPayments] = useState<
    { amount: number; paymentMethod: IPaymentMethod }[]
  >([]);

  const addPayment = (method: IPaymentMethod) => {
    // Check if method already exists
    const existing = payments.find(
      (p) => p.paymentMethod._id === method._id
    );
    if (!existing) {
      setPayments([...payments, { amount: 0, paymentMethod: method }]);
    }
  };

  const updateAmount = (index: number, amount: number) => {
    const updated = [...payments];
    updated[index].amount = amount;
    setPayments(updated);
  };

  const removePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = participant.subtotal - totalPaid;
  const canSubmit = totalPaid >= participant.subtotal && payments.length > 0;

  const handleSubmit = () => {
    if (canSubmit) {
      onPay(participant._id!, payments);
    }
  };

  const handlePayFull = (method: IPaymentMethod) => {
    setPayments([{ amount: participant.subtotal, paymentMethod: method }]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-medium text-gray-900">
                Pago de {participant.clientName}
              </h3>
              <p className="text-sm text-gray-500">
                Total a pagar: {formatPrice(participant.subtotal)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          {/* Quick pay buttons */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Pago rápido completo:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.slice(0, 4).map((method) => (
                <button
                  key={method._id}
                  onClick={() => handlePayFull(method)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">{method.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Added payments */}
          {payments.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Medios de pago:
              </p>
              <div className="space-y-3">
                {payments.map((payment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <span className="font-medium">
                        {payment.paymentMethod.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">$</span>
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={payment.amount}
                        onChange={(e) =>
                          updateAmount(index, parseFloat(e.target.value) || 0)
                        }
                        className="w-28 p-2 border border-gray-300 rounded-lg text-right"
                      />
                    </div>
                    <button
                      onClick={() => removePayment(index)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add more payment methods */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Agregar medio de pago:
            </p>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods
                .filter(
                  (m) => !payments.find((p) => p.paymentMethod._id === m._id)
                )
                .map((method) => (
                  <button
                    key={method._id}
                    onClick={() => addPayment(method)}
                    className="p-2 text-sm border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50"
                  >
                    {method.name}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Total a pagar:</span>
            <span className="font-semibold">
              {formatPrice(participant.subtotal)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">Total pagado:</span>
            <span
              className={`font-semibold ${
                totalPaid >= participant.subtotal
                  ? "text-green-600"
                  : "text-orange-600"
              }`}
            >
              {formatPrice(totalPaid)}
            </span>
          </div>
          {remaining > 0 && (
            <p className="text-sm text-orange-600 mb-4">
              Faltan {formatPrice(remaining)}
            </p>
          )}
          {remaining < 0 && (
            <p className="text-sm text-blue-600 mb-4">
              Vuelto: {formatPrice(Math.abs(remaining))}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar Pago
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
