import React, { useState } from "react";
import { X, Users, Package, Plus, Trash2, User, UserCheck } from "lucide-react";
import { IOpenTab } from "../../../interfaces/openTab";
import { IClient } from "../../../interfaces/client";

interface DivisionModalProps {
  tab: IOpenTab;
  clients: IClient[];
  onClose: () => void;
  onDivide: (
    type: "equal" | "byProduct",
    participants: { clientId?: string; clientName: string }[],
    assignments?: { clientId?: string; clientName: string; productIndices: number[] }[]
  ) => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(price);
};

const DivisionModal: React.FC<DivisionModalProps> = ({
  tab,
  clients,
  onClose,
  onDivide,
}) => {
  const [divisionType, setDivisionType] = useState<"equal" | "byProduct" | null>(null);
  const [participants, setParticipants] = useState<
    { clientId?: string; clientName: string }[]
  >([{ clientName: "" }]);
  const [assignments, setAssignments] = useState<
    { clientId?: string; clientName: string; productIndices: number[] }[]
  >([]);

  const addParticipant = () => {
    if (divisionType === "equal") {
      setParticipants([...participants, { clientName: "" }]);
    } else {
      setAssignments([...assignments, { clientName: "", productIndices: [] }]);
    }
  };

  const removeParticipant = (index: number) => {
    if (divisionType === "equal") {
      setParticipants(participants.filter((_, i) => i !== index));
    } else {
      setAssignments(assignments.filter((_, i) => i !== index));
    }
  };

  const updateParticipantName = (index: number, name: string) => {
    if (divisionType === "equal") {
      const updated = [...participants];
      updated[index].clientName = name;
      // Check if it matches a client
      const client = clients.find(
        (c) => `${c.firstname} ${c.lastname}`.toLowerCase() === name.toLowerCase()
      );
      if (client) {
        updated[index].clientId = client._id;
      } else {
        delete updated[index].clientId;
      }
      setParticipants(updated);
    } else {
      const updated = [...assignments];
      updated[index].clientName = name;
      const client = clients.find(
        (c) => `${c.firstname} ${c.lastname}`.toLowerCase() === name.toLowerCase()
      );
      if (client) {
        updated[index].clientId = client._id;
      } else {
        delete updated[index].clientId;
      }
      setAssignments(updated);
    }
  };

  const selectClient = (index: number, clientId: string) => {
    const client = clients.find((c) => c._id === clientId);
    if (divisionType === "equal") {
      const updated = [...participants];
      if (client) {
        updated[index].clientId = client._id;
        updated[index].clientName = `${client.firstname} ${client.lastname}`;
      } else {
        delete updated[index].clientId;
        updated[index].clientName = "";
      }
      setParticipants(updated);
    } else {
      const updated = [...assignments];
      if (client) {
        updated[index].clientId = client._id;
        updated[index].clientName = `${client.firstname} ${client.lastname}`;
      } else {
        delete updated[index].clientId;
        updated[index].clientName = "";
      }
      setAssignments(updated);
    }
  };

  const toggleProductAssignment = (participantIndex: number, productIndex: number) => {
    const updated = [...assignments];
    const current = updated[participantIndex].productIndices;
    if (current.includes(productIndex)) {
      updated[participantIndex].productIndices = current.filter(
        (i) => i !== productIndex
      );
    } else {
      // Remove from other participants first
      updated.forEach((a, i) => {
        if (i !== participantIndex) {
          a.productIndices = a.productIndices.filter((pi) => pi !== productIndex);
        }
      });
      updated[participantIndex].productIndices = [...current, productIndex];
    }
    setAssignments(updated);
  };

  const getAssignedParticipant = (productIndex: number): number | null => {
    for (let i = 0; i < assignments.length; i++) {
      if (assignments[i].productIndices.includes(productIndex)) {
        return i;
      }
    }
    return null;
  };

  const canSubmit = () => {
    if (divisionType === "equal") {
      return participants.length > 0 && participants.every((p) => p.clientName.trim());
    } else if (divisionType === "byProduct") {
      const allAssigned = tab.sharedProducts.every(
        (_, i) => getAssignedParticipant(i) !== null
      );
      const allNamed = assignments.every((a) => a.clientName.trim());
      return assignments.length > 0 && allAssigned && allNamed;
    }
    return false;
  };

  const handleSubmit = () => {
    if (divisionType === "equal") {
      onDivide("equal", participants);
    } else if (divisionType === "byProduct") {
      onDivide("byProduct", [], assignments);
    }
  };

  const subtotalPerParticipant =
    divisionType === "equal" && participants.length > 0
      ? Math.round(tab.totalAmount / participants.length)
      : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-medium text-gray-900">Dividir Cuenta</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          {/* Step 1: Select division type */}
          {!divisionType && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                ¿Cómo deseas dividir la cuenta de {formatPrice(tab.totalAmount)}?
              </p>
              <button
                onClick={() => setDivisionType("equal")}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      División Equitativa
                    </h4>
                    <p className="text-sm text-gray-500">
                      Dividir el total entre N participantes por igual
                    </p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => {
                  setDivisionType("byProduct");
                  setAssignments([{ clientName: "", productIndices: [] }]);
                }}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      División por Productos
                    </h4>
                    <p className="text-sm text-gray-500">
                      Asignar productos específicos a cada participante
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Step 2: Equal division - add participants */}
          {divisionType === "equal" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-900">Participantes</h4>
                <button
                  onClick={() => setDivisionType(null)}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Cambiar tipo
                </button>
              </div>

              <div className="bg-indigo-50 p-3 rounded-lg">
                <p className="text-sm text-indigo-800">
                  Cada participante pagará aproximadamente{" "}
                  <span className="font-bold">
                    {formatPrice(subtotalPerParticipant)}
                  </span>
                </p>
              </div>

              <div className="space-y-3">
                {participants.map((participant, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">
                          Seleccionar cliente existente
                        </label>
                        <select
                          value={participant.clientId || ""}
                          onChange={(e) => selectClient(index, e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        >
                          <option value="">-- Sin cliente / Nuevo --</option>
                          {clients.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.firstname} {c.lastname}
                            </option>
                          ))}
                        </select>
                      </div>
                      {participants.length > 1 && (
                        <button
                          onClick={() => removeParticipant(index)}
                          className="p-2 text-gray-400 hover:text-red-600 mt-4"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        {participant.clientId ? "Nombre (autocompletado)" : "Nombre del participante"}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={participant.clientName}
                          onChange={(e) => updateParticipantName(index, e.target.value)}
                          placeholder="Ej: Juan, Mesa 1, etc."
                          className={`flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm ${
                            participant.clientId
                              ? "border-green-300 bg-green-50"
                              : "border-gray-300"
                          }`}
                          readOnly={!!participant.clientId}
                        />
                        {participant.clientId ? (
                          <UserCheck className="w-5 h-5 text-green-600" />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      {!participant.clientId && participant.clientName && (
                        <p className="text-xs text-gray-400 mt-1">
                          Se creará la venta sin cliente asociado
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addParticipant}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
              >
                <Plus className="w-4 h-4" />
                Agregar participante
              </button>
            </div>
          )}

          {/* Step 2: By products division */}
          {divisionType === "byProduct" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-900">
                  Asignar productos a participantes
                </h4>
                <button
                  onClick={() => setDivisionType(null)}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Cambiar tipo
                </button>
              </div>

              {/* Participants */}
              <div className="space-y-4">
                {assignments.map((assignment, pIndex) => {
                  const participantTotal = assignment.productIndices.reduce(
                    (sum, pi) => {
                      const product = tab.sharedProducts[pi];
                      return sum + product.price * product.units;
                    },
                    0
                  );

                  return (
                    <div
                      key={pIndex}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <select
                              value={assignment.clientId || ""}
                              onChange={(e) => selectClient(pIndex, e.target.value)}
                              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                            >
                              <option value="">-- Sin cliente / Nuevo --</option>
                              {clients.map((c) => (
                                <option key={c._id} value={c._id}>
                                  {c.firstname} {c.lastname}
                                </option>
                              ))}
                            </select>
                            {assignments.length > 1 && (
                              <button
                                onClick={() => removeParticipant(pIndex)}
                                className="p-1 text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={assignment.clientName}
                              onChange={(e) =>
                                updateParticipantName(pIndex, e.target.value)
                              }
                              placeholder="Nombre del participante"
                              className={`flex-1 p-2 border rounded-lg text-sm ${
                                assignment.clientId
                                  ? "border-green-300 bg-green-50"
                                  : "border-gray-300"
                              }`}
                              readOnly={!!assignment.clientId}
                            />
                            {assignment.clientId ? (
                              <UserCheck className="w-4 h-4 text-green-600" />
                            ) : (
                              <User className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="font-medium text-gray-900 whitespace-nowrap">
                              {formatPrice(participantTotal)}
                            </span>
                          </div>
                          {!assignment.clientId && assignment.clientName && (
                            <p className="text-xs text-gray-400">
                              Se creará la venta sin cliente asociado
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {tab.sharedProducts.map((product, productIndex) => {
                          const assignedTo = getAssignedParticipant(productIndex);
                          const isAssignedHere = assignedTo === pIndex;
                          const isAssignedElsewhere =
                            assignedTo !== null && assignedTo !== pIndex;

                          return (
                            <button
                              key={productIndex}
                              onClick={() =>
                                toggleProductAssignment(pIndex, productIndex)
                              }
                              disabled={isAssignedElsewhere}
                              className={`p-2 text-left text-sm rounded-lg border transition-colors ${
                                isAssignedHere
                                  ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                                  : isAssignedElsewhere
                                  ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                              }`}
                            >
                              <div className="font-medium truncate">
                                {product.name}
                              </div>
                              <div className="text-xs">
                                {product.units}x {formatPrice(product.price)}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={addParticipant}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
              >
                <Plus className="w-4 h-4" />
                Agregar participante
              </button>

              {/* Unassigned warning */}
              {tab.sharedProducts.some(
                (_, i) => getAssignedParticipant(i) === null
              ) && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Hay productos sin asignar. Asigna todos los productos antes
                    de continuar.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {divisionType && (
          <div className="border-t border-gray-200 p-6">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Dividir Cuenta
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DivisionModal;
