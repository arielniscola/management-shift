import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, Clock, XCircle, ShoppingCart } from "lucide-react";
import { IOpenTab } from "../../interfaces/openTab";
import { getOpenTabs, createOpenTab, cancelOpenTab } from "../../services/openTabService";
import toast, { Toaster } from "react-hot-toast";
import { Sidebar } from "../../partials/sidebar";
import Header from "../../partials/headers";

const notify = (msg: string) => toast.success(msg);
const notifyError = (msg: string) => toast.error(msg);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(price);
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStateColor = (state: IOpenTab["state"]) => {
  switch (state) {
    case "open":
      return "bg-blue-100 text-blue-800";
    case "dividing":
      return "bg-yellow-100 text-yellow-800";
    case "paying":
      return "bg-orange-100 text-orange-800";
    case "closed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStateLabel = (state: IOpenTab["state"]) => {
  switch (state) {
    case "open":
      return "Abierta";
    case "dividing":
      return "Dividiendo";
    case "paying":
      return "Pagando";
    case "closed":
      return "Cerrada";
    default:
      return state;
  }
};

const OpenTab: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tabs, setTabs] = useState<IOpenTab[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchTabs = async () => {
    try {
      setLoading(true);
      const data = await getOpenTabs(false);
      setTabs(data);
    } catch (error) {
      notifyError("Error al cargar las cuentas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTabs();
  }, []);

  const handleCreateTab = async () => {
    if (!newTabName.trim()) {
      notifyError("Ingresa un nombre para la cuenta");
      return;
    }

    try {
      setCreating(true);
      const created = await createOpenTab(newTabName.trim());
      notify("Cuenta creada");
      setShowCreateModal(false);
      setNewTabName("");
      navigate(`/open-tab/${created._id}`);
    } catch (error: any) {
      notifyError(error.message || "Error al crear cuenta");
    } finally {
      setCreating(false);
    }
  };

  const handleCancelTab = async (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (!confirm("¿Estás seguro de cancelar esta cuenta?")) return;

    try {
      await cancelOpenTab(tabId);
      notify("Cuenta cancelada");
      fetchTabs();
    } catch (error: any) {
      notifyError(error.message || "Error al cancelar cuenta");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-light text-gray-900">Cuentas Abiertas</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/sales")}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Ir a Ventas
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nueva Cuenta
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Cargando...</p>
          </div>
        ) : tabs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Users className="w-16 h-16 text-gray-300 mx-auto" />
            <h2 className="mt-4 text-xl text-gray-600">No hay cuentas abiertas</h2>
            <p className="mt-2 text-gray-400">
              Crea una nueva cuenta para comenzar
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors mx-auto"
            >
              <Plus className="w-5 h-5" />
              Nueva Cuenta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tabs.map((tab) => (
              <div
                key={tab._id}
                onClick={() => navigate(`/open-tab/${tab._id}`)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-medium text-gray-900">{tab.name}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(
                      tab.state
                    )}`}
                  >
                    {getStateLabel(tab.state)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Clock className="w-4 h-4" />
                  {formatDate(tab.createdAt)}
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500">
                      {tab.sharedProducts.length} producto(s)
                    </p>
                    {tab.participants.length > 0 && (
                      <p className="text-sm text-gray-500">
                        {tab.participants.filter((p) => p.isPaid).length}/
                        {tab.participants.length} pagados
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatPrice(tab.totalAmount)}
                    </p>
                  </div>
                </div>

                {tab.state !== "closed" && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={(e) => handleCancelTab(e, tab._id!)}
                      className="flex-1 flex items-center justify-center gap-1 text-sm text-red-600 hover:text-red-700 py-1"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
            </div>

            <Toaster position="bottom-right" />
          </div>
        </main>
      </div>

      {/* Modal crear cuenta */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-medium text-gray-900 mb-4">
              Nueva Cuenta Abierta
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la cuenta
              </label>
              <input
                type="text"
                value={newTabName}
                onChange={(e) => setNewTabName(e.target.value)}
                placeholder="Ej: Cancha 1, Mesa 5, Grupo Ana..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                autoFocus
                onKeyPress={(e) => e.key === "Enter" && handleCreateTab()}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTabName("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateTab}
                disabled={creating}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {creating ? "Creando..." : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenTab;
