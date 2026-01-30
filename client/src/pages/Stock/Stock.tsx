import { useEffect, useState } from "react";
import { Sidebar } from "../../partials/sidebar";
import Header from "../../partials/headers";
import { IProduct } from "../../interfaces/producto";
import { IStockMovement } from "../../interfaces/stockMovement";
import {
  getStockMovementsPaginated,
  getLowStockProducts,
  registerStockEntry,
  adjustStock,
  getDailySales,
  DailySaleItem,
} from "../../services/stockService";
import { getProducts } from "../../services/productService";
import toast, { Toaster } from "react-hot-toast";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Package,
  Plus,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";

const notify = (msg: string) => toast.success(msg);
const notifyError = (msg: string) => toast.error(msg);

const Stock = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [movements, setMovements] = useState<IStockMovement[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<IProduct[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"movements" | "lowstock" | "dailySales">(
    "movements"
  );
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [entryForm, setEntryForm] = useState({
    productId: "",
    quantity: 0,
    notes: "",
    type: "entry" as "entry" | "adjustment",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMovements, setTotalMovements] = useState(0);
  const pageSize = 15;

  // Daily sales state
  const [dailySalesDate, setDailySalesDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dailySales, setDailySales] = useState<DailySaleItem[]>([]);
  const [loadingDailySales, setLoadingDailySales] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === "movements") {
      fetchMovements();
    }
  }, [currentPage]);

  useEffect(() => {
    if (activeTab === "dailySales") {
      fetchDailySales();
    }
  }, [dailySalesDate, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [movementsResult, lowStockData, productsData] = await Promise.all([
        getStockMovementsPaginated(1, pageSize),
        getLowStockProducts(),
        getProducts(),
      ]);
      setMovements(movementsResult.movements || []);
      setTotalPages(movementsResult.pages);
      setTotalMovements(movementsResult.total);
      setLowStockProducts(lowStockData || []);
      setProducts((productsData as IProduct[]) || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      const result = await getStockMovementsPaginated(currentPage, pageSize);
      setMovements(result.movements || []);
      setTotalPages(result.pages);
      setTotalMovements(result.total);
    } catch (error) {
      console.error("Error fetching movements:", error);
    }
  };

  const fetchDailySales = async () => {
    setLoadingDailySales(true);
    try {
      const result = await getDailySales(dailySalesDate);
      setDailySales(result || []);
    } catch (error) {
      console.error("Error fetching daily sales:", error);
    } finally {
      setLoadingDailySales(false);
    }
  };

  const handleSubmitEntry = async () => {
    try {
      if (!entryForm.productId) {
        notifyError("Selecciona un producto");
        return;
      }
      if (entryForm.quantity === 0) {
        notifyError("La cantidad no puede ser 0");
        return;
      }

      let res;
      if (entryForm.type === "entry") {
        if (entryForm.quantity <= 0) {
          notifyError("La cantidad debe ser mayor a 0");
          return;
        }
        res = await registerStockEntry(
          entryForm.productId,
          entryForm.quantity,
          entryForm.notes
        );
      } else {
        res = await adjustStock(
          entryForm.productId,
          entryForm.quantity,
          entryForm.notes
        );
      }

      if (!res.ack) {
        notify(res.message || "Operación exitosa");
        setShowEntryModal(false);
        setEntryForm({
          productId: "",
          quantity: 0,
          notes: "",
          type: "entry",
        });
        fetchData();
      } else {
        notifyError(res.message || "Error");
      }
    } catch (error) {
      notifyError(error ? error.toString() : "Error");
    }
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case "sale":
        return "Venta";
      case "entry":
        return "Entrada";
      case "adjustment":
        return "Ajuste";
      default:
        return type;
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "sale":
        return <ArrowDownCircle className="h-5 w-5 text-red-500" />;
      case "entry":
        return <ArrowUpCircle className="h-5 w-5 text-green-500" />;
      case "adjustment":
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main>
          <div className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestion de Stock
                </h1>
                <button
                  onClick={() => setShowEntryModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Nueva Entrada
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mb-6 flex-wrap">
                <button
                  onClick={() => {
                    setActiveTab("movements");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeTab === "movements"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Historial de Movimientos
                </button>
                <button
                  onClick={() => setActiveTab("dailySales")}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                    activeTab === "dailySales"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Ventas del Día
                </button>
                <button
                  onClick={() => setActiveTab("lowstock")}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                    activeTab === "lowstock"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Stock Bajo
                  {lowStockProducts.length > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {lowStockProducts.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Content */}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : (
                <>
                  {/* Movements Tab */}
                  {activeTab === "movements" && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fecha
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Producto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tipo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cantidad
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Stock Anterior
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Stock Nuevo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Referencia
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {movements.length === 0 ? (
                            <tr>
                              <td
                                colSpan={7}
                                className="px-6 py-8 text-center text-gray-500"
                              >
                                No hay movimientos de stock registrados
                              </td>
                            </tr>
                          ) : (
                            movements.map((mov) => (
                              <tr key={mov._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(mov.date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {typeof mov.product === "object"
                                      ? mov.product.name
                                      : mov.product}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    {getMovementIcon(mov.type)}
                                    <span className="text-sm text-gray-700">
                                      {getMovementTypeLabel(mov.type)}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`text-sm font-medium ${
                                      mov.quantity >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {mov.quantity >= 0 ? "+" : ""}
                                    {mov.quantity}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {mov.previousStock}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {mov.newStock}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {mov.reference || mov.notes || "-"}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalMovements)} de {totalMovements} movimientos
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <span className="text-sm text-gray-700">
                              Página {currentPage} de {totalPages}
                            </span>
                            <button
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Daily Sales Tab */}
                  {activeTab === "dailySales" && (
                    <div className="space-y-4">
                      {/* Date picker */}
                      <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <label className="text-sm font-medium text-gray-700">
                          Seleccionar fecha:
                        </label>
                        <input
                          type="date"
                          value={dailySalesDate}
                          onChange={(e) => setDailySalesDate(e.target.value)}
                          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                        />
                        <button
                          onClick={() => setDailySalesDate(new Date().toISOString().split("T")[0])}
                          className="px-3 py-2 text-sm text-indigo-600 hover:text-indigo-800"
                        >
                          Hoy
                        </button>
                      </div>

                      {/* Sales table */}
                      <div className="bg-white rounded-lg shadow overflow-hidden">
                        {loadingDailySales ? (
                          <div className="flex justify-center items-center h-64">
                            <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
                          </div>
                        ) : dailySales.length === 0 ? (
                          <div className="p-8 text-center">
                            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">
                              No hay ventas registradas para esta fecha
                            </p>
                          </div>
                        ) : (
                          <>
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Producto
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Código
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cantidad Vendida
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    N° de Ventas
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {dailySales.map((item) => (
                                  <tr key={item.productId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-medium text-gray-900">
                                        {item.productName}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {item.productCode}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="text-sm font-medium text-red-600">
                                        {item.totalQuantity}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {item.movements}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {/* Summary */}
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">
                                  Total productos vendidos:
                                </span>
                                <span className="text-lg font-bold text-gray-900">
                                  {dailySales.reduce((sum, item) => sum + item.totalQuantity, 0)}
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Low Stock Tab */}
                  {activeTab === "lowstock" && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      {lowStockProducts.length === 0 ? (
                        <div className="p-8 text-center">
                          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">
                            No hay productos con stock bajo
                          </p>
                        </div>
                      ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Producto
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Codigo
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock Actual
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock Minimo
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Faltante
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {lowStockProducts.map((product) => (
                              <tr
                                key={product._id}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                                    <span className="text-sm font-medium text-gray-900">
                                      {product.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {product.code}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-medium text-red-600">
                                    {product.stock}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {product.minimumStock}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-medium text-orange-600">
                                    {product.minimumStock - product.stock}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <button
                                    onClick={() => {
                                      setEntryForm({
                                        productId: product._id || "",
                                        quantity:
                                          product.minimumStock - product.stock,
                                        notes: "",
                                        type: "entry",
                                      });
                                      setShowEntryModal(true);
                                    }}
                                    className="text-green-600 hover:text-green-900 font-medium text-sm"
                                  >
                                    Reponer
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Entry Modal */}
          {showEntryModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4">
                  {entryForm.type === "entry"
                    ? "Entrada de Stock"
                    : "Ajuste de Stock"}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Movimiento
                    </label>
                    <select
                      value={entryForm.type}
                      onChange={(e) =>
                        setEntryForm({
                          ...entryForm,
                          type: e.target.value as "entry" | "adjustment",
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    >
                      <option value="entry">Entrada (suma)</option>
                      <option value="adjustment">
                        Ajuste (puede ser positivo o negativo)
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Producto
                    </label>
                    <select
                      value={entryForm.productId}
                      onChange={(e) =>
                        setEntryForm({
                          ...entryForm,
                          productId: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    >
                      <option value="">Seleccionar producto...</option>
                      {products.map((prod) => (
                        <option key={prod._id} value={prod._id}>
                          {prod.name} (Stock actual: {prod.stock})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      value={entryForm.quantity}
                      onChange={(e) =>
                        setEntryForm({
                          ...entryForm,
                          quantity: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    />
                    {entryForm.type === "adjustment" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Usa valores negativos para reducir stock
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas (opcional)
                    </label>
                    <input
                      type="text"
                      value={entryForm.notes}
                      onChange={(e) =>
                        setEntryForm({ ...entryForm, notes: e.target.value })
                      }
                      placeholder="Ej: Compra proveedor X"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEntryModal(false);
                        setEntryForm({
                          productId: "",
                          quantity: 0,
                          notes: "",
                          type: "entry",
                        });
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      onClick={handleSubmitEntry}
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default Stock;
