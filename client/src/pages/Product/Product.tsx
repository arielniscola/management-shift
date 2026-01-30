import { ChangeEvent, useEffect, useState } from "react";
import { Sidebar } from "../../partials/sidebar";
import Header from "../../partials/headers";
import { IProduct } from "../../interfaces/producto";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../../services/productService";
import { registerStockEntry } from "../../services/stockService";
import ModalDelete from "../../components/DeleteModal";
import toast, { Toaster } from "react-hot-toast";
import { AlertTriangle, PackageSearch, Pencil, Plus, Search, Trash2 } from "lucide-react";

const notify = (msg: string) => toast.success(msg);
const notifyError = (msg: string) => toast.error(msg);

const Product = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string>("");
  const [products, setProducts] = useState<IProduct[]>([]);
  const [filter, setFilter] = useState("");
  const [filterData, setFilterData] = useState<IProduct[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [research, setResearch] = useState<boolean>(true);
  const [formData, setFormData] = useState<IProduct>({
    _id: "",
    name: "",
    price: 0,
    code: "",
    stock: 0,
    description: "",
    units: 0,
    minimumStock: 0,
  });
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockEntry, setStockEntry] = useState({
    productId: "",
    productName: "",
    quantity: 0,
    notes: "",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = (await getProducts()) as IProduct[];
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [research]);

  useEffect(() => {
    if (showModal === false) {
      setFormData({
        _id: "",
        name: "",
        price: 0,
        code: "",
        stock: 0,
        description: "",
        units: 0,
        minimumStock: 0,
      });
    }
  }, [showModal]);

  const handleStockEntry = (product: IProduct) => {
    setStockEntry({
      productId: product._id || "",
      productName: product.name,
      quantity: 0,
      notes: "",
    });
    setShowStockModal(true);
  };

  const submitStockEntry = async () => {
    try {
      if (stockEntry.quantity <= 0) {
        notifyError("La cantidad debe ser mayor a 0");
        return;
      }
      const res = await registerStockEntry(
        stockEntry.productId,
        stockEntry.quantity,
        stockEntry.notes
      );
      if (!res.ack) {
        notify(res.message || "Entrada registrada");
        setShowStockModal(false);
        setResearch(!research);
      } else {
        notifyError(res.message || "Error");
      }
    } catch (error) {
      notifyError(error ? error.toString() : "Error");
    }
  };

  const isLowStock = (product: IProduct) => {
    return product.minimumStock > 0 && product.stock < product.minimumStock;
  };

  const handleUpdate = (id?: string) => {
    const unit = products.find((u) => u._id === id);
    if (unit) {
      setFormData(unit);
      setShowModal(true);
    }
  };
  const filterHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilter(value);
    const newProdArray = products.filter(
      (prod) =>
        prod.name?.toLocaleLowerCase().includes(value) ||
        prod.code?.toLocaleLowerCase().includes(value)
    );
    setFilterData(newProdArray);
  };

  const deleteHandler = async () => {
    try {
      const res = await deleteProduct(deleteId);
      if (res.ack) {
        notifyError(res.message ? res.message : "error");
      } else {
        notify(res.message ? res.message : "ok");
      }
      setDeleteModalOpen(false);
      setResearch(!research);
    } catch (error) {
      notifyError(error ? error.toString() : "error");
    }
  };
  const handleAddProduct = async () => {
    try {
      let res;
      if (!formData._id) {
        res = await createProduct(formData);
      } else {
        res = await updateProduct(formData);
      }
      if (!res.ack) {
        notify(res.message ? res.message : "ok");
      } else {
        notifyError(res.message ? res.message : "Error");
      }
    } catch (error) {
      notifyError(error ? error.toString() : "Error");
    } finally {
      setResearch(!research);
      setShowModal(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                >
                  <PackageSearch className="h-5 w-5" />
                  Nuevo
                </button>
              </div>

              <div className="mb-4 flex gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Filtrar productos..."
                    value={filter}
                    onChange={(e) => filterHandler(e)}
                    className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Codigo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filter.length === 0
                      ? products.map((prod) => (
                          <tr key={prod._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-500">
                                {prod.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {prod.code}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-500">
                                $ {prod.price}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm font-medium ${
                                    isLowStock(prod)
                                      ? "text-red-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {prod.stock}
                                </span>
                                {isLowStock(prod) && (
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => handleStockEntry(prod)}
                                  className="text-green-600 hover:text-green-900 transition-colors"
                                  title="Agregar stock"
                                >
                                  <Plus className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleUpdate(prod._id)}
                                  className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                >
                                  <Pencil className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteId(prod._id ? prod._id : "");
                                    setDeleteModalOpen(true);
                                  }}
                                  className="text-red-600 hover:text-red-900 transition-colors"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      : filterData.map((prod) => (
                          <tr key={prod._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-500">
                                {prod.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {prod.code}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-500">
                                $ {prod.price}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm font-medium ${
                                    isLowStock(prod)
                                      ? "text-red-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {prod.stock}
                                </span>
                                {isLowStock(prod) && (
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => handleStockEntry(prod)}
                                  className="text-green-600 hover:text-green-900 transition-colors"
                                  title="Agregar stock"
                                >
                                  <Plus className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleUpdate(prod._id)}
                                  className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                >
                                  <Pencil className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteId(prod._id ? prod._id : "");
                                    setDeleteModalOpen(true);
                                  }}
                                  className="text-red-600 hover:text-red-900 transition-colors"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>

              {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-8 max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-4">
                      Agregar Producto
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Nombre
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2 border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Codigo
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.code}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              code: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2 border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Price
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              price: parseFloat(e.target.value),
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2 border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Descripcion
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2 border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Stock
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.stock}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              stock: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2 border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Stock Minimo
                        </label>
                        <input
                          type="number"
                          value={formData.minimumStock}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              minimumStock: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2 border"
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          onClick={handleAddProduct}
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <ModalDelete
            id="delete-modal"
            modalOpen={deleteModalOpen}
            setModalOpen={setDeleteModalOpen}
            deleteFn={deleteHandler}
          />

          {showStockModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4">
                  Entrada de Stock - {stockEntry.productName}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={stockEntry.quantity}
                      onChange={(e) =>
                        setStockEntry({
                          ...stockEntry,
                          quantity: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2 border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Notas (opcional)
                    </label>
                    <input
                      type="text"
                      value={stockEntry.notes}
                      onChange={(e) =>
                        setStockEntry({
                          ...stockEntry,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Ej: Compra proveedor X"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2 border"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowStockModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      onClick={submitStockEntry}
                    >
                      Registrar Entrada
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

export default Product;
