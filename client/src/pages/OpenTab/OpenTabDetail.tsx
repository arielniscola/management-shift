import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  X,
  Users,
  CheckCircle,
  ArrowRightLeft,
} from "lucide-react";
import { Sidebar } from "../../partials/sidebar";
import Header from "../../partials/headers";
import { IOpenTab, IOpenTabProduct, IOpenTabParticipant } from "../../interfaces/openTab";
import { IProduct } from "../../interfaces/producto";
import { IPaymentMethod } from "../../interfaces/paymentMethod";
import { IClient } from "../../interfaces/client";
import {
  getOpenTab,
  addProductToTab,
  removeProductFromTab,
  updateProductUnits,
  divideTabEqual,
  divideTabByProducts,
  addProductToParticipant,
  removeProductFromParticipant,
  transferProduct,
  registerParticipantPayment,
  closeOpenTab,
  cancelOpenTab,
} from "../../services/openTabService";
import { getProducts } from "../../services/productService";
import { getPaymentMethods } from "../../services/paymentMethodService";
import { getClients } from "../../services/clientService";
import toast, { Toaster } from "react-hot-toast";
import DivisionModal from "./components/DivisionModal";
import ParticipantCard from "./components/ParticipantCard";
import TransferModal from "./components/TransferModal";
import PaymentModal from "./components/PaymentModal";

const notify = (msg: string) => toast.success(msg);
const notifyError = (msg: string) => toast.error(msg);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(price);
};

const OpenTabDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<IOpenTab | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([]);
  const [clients, setClients] = useState<IClient[]>([]);

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDivisionModal, setShowDivisionModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // For adding product to participant
  const [selectedParticipant, setSelectedParticipant] = useState<IOpenTabParticipant | null>(null);
  const [showParticipantProductModal, setShowParticipantProductModal] = useState(false);

  // For payment
  const [payingParticipant, setPayingParticipant] = useState<IOpenTabParticipant | null>(null);

  const fetchTab = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getOpenTab(id);
      setTab(data);
    } catch (error: any) {
      notifyError(error.message || "Error al cargar la cuenta");
      navigate("/open-tab");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTab();
    // Fetch products, payment methods, and clients
    getProducts().then((data) => setProducts(data as IProduct[]));
    getPaymentMethods().then((data) => setPaymentMethods(data as IPaymentMethod[]));
    getClients().then((data) => setClients(data as IClient[]));
  }, [id]);

  const handleAddProduct = async (product: IProduct) => {
    if (!id || !tab) return;
    try {
      const openTabProduct: IOpenTabProduct = {
        productId: product._id,  // ID real para control de stock
        code: product.code,
        name: product.name,
        price: product.price,
        units: 1,
      };

      // If we're adding to a participant
      if (selectedParticipant) {
        const updated = await addProductToParticipant(
          id,
          selectedParticipant._id!,
          openTabProduct
        );
        setTab(updated);
        setShowParticipantProductModal(false);
        setSelectedParticipant(null);
      } else {
        const updated = await addProductToTab(id, openTabProduct);
        setTab(updated);
        setShowProductModal(false);
      }
      setSearchTerm("");
    } catch (error: any) {
      notifyError(error.message || "Error al agregar producto");
    }
  };

  const handleRemoveProduct = async (index: number) => {
    if (!id) return;
    try {
      const updated = await removeProductFromTab(id, index);
      setTab(updated);
    } catch (error: any) {
      notifyError(error.message || "Error al eliminar producto");
    }
  };

  const handleRemoveParticipantProduct = async (participantId: string, productIndex: number) => {
    if (!id) return;
    try {
      const updated = await removeProductFromParticipant(id, participantId, productIndex);
      setTab(updated);
      notify("Producto eliminado");
    } catch (error: any) {
      notifyError(error.message || "Error al eliminar producto");
    }
  };

  const handleUpdateUnits = async (index: number, units: number) => {
    if (!id) return;
    try {
      const updated = await updateProductUnits(id, index, units);
      setTab(updated);
    } catch (error: any) {
      notifyError(error.message || "Error al actualizar cantidad");
    }
  };

  const handleDivide = async (
    type: "equal" | "byProduct",
    participants: { clientId?: string; clientName: string }[],
    assignments?: { clientId?: string; clientName: string; productIndices: number[] }[]
  ) => {
    if (!id) return;
    try {
      let updated: IOpenTab;
      if (type === "equal") {
        updated = await divideTabEqual(id, participants);
      } else {
        updated = await divideTabByProducts(id, assignments!);
      }
      setTab(updated);
      setShowDivisionModal(false);
      notify("Cuenta dividida correctamente");
    } catch (error: any) {
      notifyError(error.message || "Error al dividir cuenta");
    }
  };

  const handleTransfer = async (
    fromId: string,
    toId: string,
    productIndex: number,
    units: number
  ) => {
    if (!id) return;
    try {
      const updated = await transferProduct(id, fromId, toId, productIndex, units);
      setTab(updated);
      setShowTransferModal(false);
      notify("Producto transferido");
    } catch (error: any) {
      notifyError(error.message || "Error al transferir producto");
    }
  };

  const handlePayment = async (
    participantId: string,
    payments: { amount: number; paymentMethod: IPaymentMethod }[]
  ) => {
    if (!id) return;
    try {
      const updated = await registerParticipantPayment(id, participantId, payments);
      setTab(updated);
      setShowPaymentModal(false);
      setPayingParticipant(null);
      notify("Pago registrado");
    } catch (error: any) {
      notifyError(error.message || "Error al registrar pago");
    }
  };

  const handleCloseTab = async () => {
    if (!id || !tab) return;
    const unpaid = tab.participants.filter((p) => !p.isPaid).length;
    if (unpaid > 0) {
      notifyError(`Faltan ${unpaid} participante(s) por pagar`);
      return;
    }

    if (!confirm("¿Cerrar la cuenta y generar las ventas?")) return;

    try {
      await closeOpenTab(id);
      notify("Cuenta cerrada correctamente");
      navigate("/open-tab");
    } catch (error: any) {
      notifyError(error.message || "Error al cerrar cuenta");
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    if (!confirm("¿Cancelar esta cuenta? Se perderán todos los datos.")) return;

    try {
      await cancelOpenTab(id);
      notify("Cuenta cancelada");
      navigate("/open-tab");
    } catch (error: any) {
      notifyError(error.message || "Error al cancelar cuenta");
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paidCount = tab?.participants.filter((p) => p.isPaid).length || 0;
  const totalParticipants = tab?.participants.length || 0;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          {loading ? (
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : !tab ? (
            <div className="flex items-center justify-center min-h-screen">
              <p className="text-gray-500">Cuenta no encontrada</p>
            </div>
          ) : (
            <div className="min-h-screen bg-gray-50 p-8">
              <div className="max-w-6xl mx-auto">
                {/* Page Header */}
                <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/open-tab")}
            className="p-2 hover:bg-gray-200 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">{tab.name}</h1>
            <p className="text-sm text-gray-500">
              Estado:{" "}
              <span className="font-medium">
                {tab.state === "open"
                  ? "Abierta"
                  : tab.state === "paying"
                  ? "Pagando"
                  : tab.state === "dividing"
                  ? "Dividiendo"
                  : "Cerrada"}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(tab.totalAmount)}
            </p>
          </div>
        </div>

        {/* Estado: Open - Carrito compartido */}
        {tab.state === "open" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Carrito Compartido
              </h2>
              <button
                onClick={() => setShowProductModal(true)}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
              >
                <Plus className="w-5 h-5" />
                Agregar Producto
              </button>
            </div>

            {tab.sharedProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No hay productos en la cuenta</p>
                <button
                  onClick={() => setShowProductModal(true)}
                  className="mt-4 text-indigo-600 hover:text-indigo-700"
                >
                  Agregar el primer producto
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {tab.sharedProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">
                        {formatPrice(product.price)} c/u
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateUnits(index, product.units - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">
                        {product.units}
                      </span>
                      <button
                        onClick={() => handleUpdateUnits(index, product.units + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <p className="w-24 text-right font-medium text-gray-900">
                      {formatPrice(product.price * product.units)}
                    </p>
                    <button
                      onClick={() => handleRemoveProduct(index)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {tab.sharedProducts.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium text-gray-700">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(tab.totalAmount)}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    Cancelar Cuenta
                  </button>
                  <button
                    onClick={() => setShowDivisionModal(true)}
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                  >
                    <Users className="w-5 h-5" />
                    Dividir Cuenta
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estado: Paying - Participantes */}
        {tab.state === "paying" && (
          <div className="space-y-4">
            {/* Progress */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">
                    {paidCount} de {totalParticipants} pagados
                  </span>
                </div>
                <div className="flex gap-2">
                  {tab.divisionType === "byProduct" && (
                    <button
                      onClick={() => setShowTransferModal(true)}
                      className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      Transferir producto
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      totalParticipants > 0
                        ? (paidCount / totalParticipants) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Participants */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tab.participants.map((participant) => (
                <ParticipantCard
                  key={participant._id}
                  participant={participant}
                  divisionType={tab.divisionType}
                  sharedProducts={tab.sharedProducts}
                  totalParticipants={tab.participants.length}
                  onAddProduct={() => {
                    setSelectedParticipant(participant);
                    setShowParticipantProductModal(true);
                  }}
                  onPay={() => {
                    setPayingParticipant(participant);
                    setShowPaymentModal(true);
                  }}
                  onRemoveProduct={(productIndex) => {
                    handleRemoveParticipantProduct(participant._id!, productIndex);
                  }}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancel}
                disabled={paidCount > 0}
                className="flex-1 px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar Cuenta
              </button>
              <button
                onClick={handleCloseTab}
                disabled={paidCount !== totalParticipants}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Cerrar Cuenta
              </button>
            </div>
          </div>
        )}

        {/* Estado: Closed */}
        {tab.state === "closed" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            <h2 className="mt-4 text-xl font-medium text-gray-900">
              Cuenta Cerrada
            </h2>
            <p className="mt-2 text-gray-500">
              Se generaron {tab.generatedMovements.length} venta(s)
            </p>
            <button
              onClick={() => navigate("/open-tab")}
              className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Volver a Cuentas
            </button>
          </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal selección productos (para carrito compartido) */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium text-gray-900">
                  Seleccionar producto
                </h3>
                <button
                  onClick={() => {
                    setShowProductModal(false);
                    setSearchTerm("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
            </div>
            <div className="overflow-y-auto p-6">
              <div className="space-y-2">
                {filteredProducts.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => handleAddProduct(product)}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {product.description}
                        </p>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              {filteredProducts.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No se encontraron productos
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal selección productos (para participante) */}
      {showParticipantProductModal && selectedParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium text-gray-900">
                  Agregar a {selectedParticipant.clientName}
                </h3>
                <button
                  onClick={() => {
                    setShowParticipantProductModal(false);
                    setSelectedParticipant(null);
                    setSearchTerm("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
            </div>
            <div className="overflow-y-auto p-6">
              <div className="space-y-2">
                {filteredProducts.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => handleAddProduct(product)}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {product.description}
                        </p>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              {filteredProducts.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No se encontraron productos
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Division Modal */}
      {showDivisionModal && tab && (
        <DivisionModal
          tab={tab}
          clients={clients}
          onClose={() => setShowDivisionModal(false)}
          onDivide={handleDivide}
        />
      )}

      {/* Transfer Modal */}
      {showTransferModal && tab && (
        <TransferModal
          participants={tab.participants}
          onClose={() => setShowTransferModal(false)}
          onTransfer={handleTransfer}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && payingParticipant && (
        <PaymentModal
          participant={payingParticipant}
          paymentMethods={paymentMethods}
          onClose={() => {
            setShowPaymentModal(false);
            setPayingParticipant(null);
          }}
          onPay={handlePayment}
        />
      )}

      <Toaster position="bottom-right" />
    </div>
  );
};

export default OpenTabDetail;
