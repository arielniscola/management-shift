import React, { useEffect, useState } from "react";
import { X, Plus, Trash2, Search, AlertTriangle } from "lucide-react";
import SearchableSelect from "../components/SearchableSelect";
import { IClient } from "../interfaces/client";
import { IMovement } from "../interfaces/movement";
import { getProducts } from "../services/productService";
import { IProduct } from "../interfaces/producto";
import { getClients } from "../services/clientService";
import { getPaymentMethods } from "../services/paymentMethodService";
import { IPaymentMethod } from "../interfaces/paymentMethod";
import { IPayment } from "../interfaces/payment";
import toast, { Toaster } from "react-hot-toast";
import { createMovement, updateMovement } from "../services/movementService";
import { StockValidationWarning } from "../interfaces/stockMovement";

const notify = (msg: string) => toast.success(msg);
const notifyError = (msg: string) => toast.error(msg);

interface PaymentModalProps {
  movementEdit?: IMovement;
  isEdit?: boolean;
  setResearch: React.Dispatch<React.SetStateAction<boolean>>;
  research?: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  movementEdit,
  setResearch,
}) => {
  const [clients, setClients] = useState<IClient[]>([]);
  const [movement, setMovement] = useState<IMovement>({
    date: "",
    details: [],
    totalAmount: 0,
    state: "debit",
    client: "",
    amountPaid: 0,
  });

  const [paymentMethodOptions, setPaymentMethodOptions] = useState<
    IPaymentMethod[]
  >([]);

  const [cart, setCart] = useState<IProduct[]>([]);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<IPayment[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [stockWarnings, setStockWarnings] = useState<StockValidationWarning[]>([]);
  const [showStockWarningModal, setShowStockWarningModal] = useState(false);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const paymentMethodsData =
          (await getPaymentMethods()) as IPaymentMethod[];
        setPaymentMethodOptions(paymentMethodsData);
      } catch (error) {
        console.error("Error fetching paymentMethod:", error);
      }
    };
    const fetchProducts = async () => {
      try {
        const productsData = (await getProducts()) as IProduct[];
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    const fetchClients = async () => {
      try {
        const clientsData = (await getClients()) as IClient[];
        setClients(clientsData);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchProducts();
    fetchClients();
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    if (movementEdit) {
      if (!movementEdit.client) movementEdit.client = "";
      setCart(movementEdit.details);
      setMovement(movementEdit);
      setIsEdit(true);
    }
  }, [movementEdit]);

  const addToCart = (product: IProduct) => {
    const existingItem = cart.find((item) => item._id === product._id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.code === product.code ? { ...item, units: item.units + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, units: 1, price: product.price }]);
    }
    setShowProductModal(false);
    setSearchTerm("");
  };

  const updateQuantity = (productCode: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productCode);
      return;
    }
    setCart(
      cart.map((item) =>
        item.code === productCode ? { ...item, quantity } : item
      )
    );
  };

  const updatePrice = (productCode: String, price: number) => {
    setCart(
      cart.map((item) =>
        item.code === productCode ? { ...item, price: price } : item
      )
    );
  };

  const removeFromCart = (productCode: String) => {
    setCart(cart.filter((item) => item.code !== productCode));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.units, 0);
  };

  const getTotalPayments = () => {
    return paymentMethods.reduce((sum, pm) => sum + pm.amount, 0);
  };

  const addPaymentMethod = (option: IPaymentMethod) => {
    const newPayment: IPayment = {
      date: new Date(),
      paymentMenthod: option,
      client: (movement.client as string) || "",
      movementsNumber: [movement.identifacationNumber || ""],
      amount: 0,
    };
    setPaymentMethods([...paymentMethods, newPayment]);
  };

  const updatePaymentAmount = (id: string, amount: number) => {
    setPaymentMethods(
      paymentMethods.map((pm) =>
        pm.paymentMenthod._id === id ? { ...pm, amount } : pm
      )
    );
  };

  const removePaymentMethod = (id: string) => {
    setPaymentMethods(
      paymentMethods.filter((pm) => pm.paymentMenthod._id !== id)
    );
  };

  const changeUnitButton = (sum: boolean, id: string) => {
    const val = sum ? 1 : -1;
    const updatedDetails = [...cart];
    const index = cart.findIndex((item) => item._id === id);
    updatedDetails[index].units += val;
    if (updatedDetails[index].units < 1) return;
    setCart(updatedDetails);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const cleanForm = () => {
    // Reiniciar form
    setIsEdit(false);
    setCart([]);
    setPaymentMethods([]);
    setIsPaid(false);
    setStockWarnings([]);
    setMovement({
      date: "",
      details: [],
      totalAmount: 0,
      state: "debit",
      client: "",
      amountPaid: 0,
    });
  };

  // Verificar stock de los items en el carrito
  const checkStockWarnings = (): StockValidationWarning[] => {
    const warnings: StockValidationWarning[] = [];
    for (const item of cart) {
      const product = products.find((p) => p._id === item._id);
      if (product) {
        const available = product.stock || 0;
        const requested = item.units || 1;
        if (requested > available) {
          warnings.push({
            productId: item._id || "",
            productName: item.name,
            requested,
            available,
            hasWarning: true,
          });
        }
      }
    }
    return warnings;
  };

  // Obtener stock disponible de un producto
  const getProductStock = (productId: string): number => {
    const product = products.find((p) => p._id === productId);
    return product?.stock || 0;
  };

  // Verificar si un item en el carrito excede el stock
  const hasStockWarning = (item: IProduct): boolean => {
    const available = getProductStock(item._id || "");
    return item.units > available;
  };

  const handleFinalizeSale = async (skipWarnings: boolean = false) => {
    if (cart.length === 0) {
      alert("El carrito está vacío");
      return;
    }
    if (isPaid && paymentMethods.length === 0) {
      alert("Agrega al menos un medio de pago");
      return;
    }

    // Verificar stock si no estamos editando y no se saltaron las advertencias
    if (!isEdit && !skipWarnings) {
      const warnings = checkStockWarnings();
      if (warnings.length > 0) {
        setStockWarnings(warnings);
        setShowStockWarningModal(true);
        return;
      }
    }

    try {
      let res;
      // Agregar los detalles y total
      movement.details = cart;
      movement.totalAmount = getTotal();
      if (isPaid) movement.state = "paid";
      if (isEdit) {
        res = await updateMovement(movement, paymentMethods);
      } else {
        res = await createMovement(movement, paymentMethods);
      }
      if (res.ack) {
        notifyError(res.message ? res.message : "error");
      } else {
        notify(res.message ? res.message : "ok");
        setResearch((prev) => !prev);
        cleanForm();
      }
    } catch (error) {
      notifyError(error ? error.toString() : "error");
    }
  };

  const handleConfirmWithWarnings = () => {
    setShowStockWarningModal(false);
    handleFinalizeSale(true);
  };
  const clientHandler = (val: string) => {
    setMovement({ ...movement, client: val });
  };

  return (
    <div className="max-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-light text-gray-900 mb-8">Ventas</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          {/* Cliente y Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente
              </label>
              <SearchableSelect
                options={clients.map((cli) => ({
                  value: cli._id ? cli._id : cli.firstname,
                  label: `${cli.firstname} ${cli.lastname}`,
                }))}
                value={
                  typeof movement.client === "string"
                    ? movement.client
                    : movement.client._id || ""
                }
                onChange={clientHandler}
                placeholder="Seleccionar a un cliente..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de pago
              </label>
              <label className="flex items-center gap-2 p-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPaid}
                  onChange={(e) => {
                    setIsPaid(e.target.checked);
                    if (!e.target.checked) {
                      setPaymentMethods([]);
                    }
                  }}
                  className="w-4 h-4 text-gray-900 rounded focus:ring-gray-400"
                />
                <span className="text-sm text-gray-700">
                  {isPaid ? "Pagada" : "Pendiente de pago"}
                </span>
              </label>
              {isPaid && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="mt-2 text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  {paymentMethods.length === 0
                    ? "Agregar medios de pago"
                    : `${paymentMethods.length} medio(s) de pago`}
                </button>
              )}
            </div>
          </div>

          {/* Botón agregar producto */}
          <button
            onClick={() => setShowProductModal(true)}
            className="w-full p-3 border-2 border-dashed border-indigo-600 rounded-lg text-indigo-900 hover:border-indigo-300 hover:text-indigo-900 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Agregar producto
          </button>

          {/* Lista de productos en el carrito */}
          {cart.length > 0 && (
            <div className="mt-6 space-y-3">
              {cart.map((item) => (
                <div
                  key={item._id}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    hasStockWarning(item)
                      ? "bg-orange-50 border border-orange-200"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        Stock: {getProductStock(item._id || "")}
                      </span>
                      {hasStockWarning(item) && (
                        <span className="flex items-center gap-1 text-xs text-orange-600">
                          <AlertTriangle className="h-3 w-3" />
                          Stock insuficiente
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Cant.</span>
                      <div>
                        <button
                          className="inline-flex items-center justify-center p-1 me-3 text-sm font-medium h-6 w-6 text-gray-500 bg-white border border-gray-300 rounded-full focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                          type="button"
                          onClick={() =>
                            changeUnitButton(false, item._id || "")
                          }
                        >
                          <svg
                            className="w-3 h-3"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 18 2"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M1 1h16"
                            />
                          </svg>
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.units}
                          onChange={(e) =>
                            updateQuantity(item.code, Number(e.target.value))
                          }
                          className="w-16 p-1 border border-gray-300 rounded text-center text-sm"
                        />
                        <button
                          className="inline-flex items-center justify-center h-6 w-6 p-1 ms-3 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-full focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                          type="button"
                          onClick={() => changeUnitButton(true, item._id || "")}
                        >
                          <svg
                            className="w-3 h-3"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 18 18"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 1v16M1 9h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">$</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={item.price}
                        onChange={(e) =>
                          updatePrice(item.code, Number(e.target.value))
                        }
                        className="w-28 p-1 border border-gray-300 rounded text-sm"
                      />
                    </div>

                    <div className="w-32 text-right font-medium text-gray-900">
                      {formatPrice(item.price * item.units)}
                    </div>

                    <button
                      onClick={() => removeFromCart(item.code)}
                      className="text-gray-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total y finalizar */}
          {cart.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-gray-700">Total</span>
                <span className="text-2xl font-semibold text-gray-900">
                  {formatPrice(getTotal())}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={cleanForm}
                  className="flex-1 bg-white border border-red-300 text-red-600 py-3 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Cancelar venta
                </button>
                <button
                  onClick={() => handleFinalizeSale()}
                  className="flex-1 w-full bg-[#34A853] text-white py-3 rounded-lg hhover:bg-green-800  transition-colors"
                >
                  Finalizar venta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de selección de productos */}
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-y-auto p-6">
              <div className="space-y-2">
                {filteredProducts.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => addToCart(product)}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {product.description}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            product.stock > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          Stock: {product.stock || 0}
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
      {/* Modal de medios de pago */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-medium text-gray-900">
                  Medios de pago
                </h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-6 flex-1">
              {/* Medios de pago agregados */}
              {paymentMethods.length > 0 && (
                <div className="space-y-3 mb-6">
                  {paymentMethods.map((pm) => (
                    <div
                      key={pm.paymentMenthod._id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">
                          {pm.paymentMenthod.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">$</span>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={pm.amount}
                          onChange={(e) =>
                            updatePaymentAmount(
                              pm.paymentMenthod._id || "",
                              Number(e.target.value)
                            )
                          }
                          placeholder="Monto"
                          className="w-32 p-2 border border-gray-300 rounded text-sm"
                        />
                      </div>

                      <button
                        onClick={() =>
                          removePaymentMethod(pm.paymentMenthod._id || "")
                        }
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Selector de nuevos medios de pago */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Agregar medio de pago
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {paymentMethodOptions.map((option) => (
                    <button
                      key={option._id}
                      onClick={() => addPaymentMethod(option)}
                      className="p-3 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Resumen */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  Total de la venta:
                </span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(getTotal())}
                </span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">Total pagado:</span>
                <span
                  className={`font-semibold ${
                    getTotalPayments() === getTotal()
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  {formatPrice(getTotalPayments())}
                </span>
              </div>
              {getTotalPayments() !== getTotal() && (
                <p className="text-xs text-orange-600 mb-4">
                  {getTotalPayments() < getTotal()
                    ? `Faltan ${formatPrice(getTotal() - getTotalPayments())}`
                    : `Sobran ${formatPrice(getTotalPayments() - getTotal())}`}
                </p>
              )}
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de advertencia de stock */}
      {showStockWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Advertencia de Stock
              </h3>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Los siguientes productos tienen stock insuficiente:
            </p>

            <div className="space-y-2 mb-6">
              {stockWarnings.map((warning) => (
                <div
                  key={warning.productId}
                  className="flex justify-between items-center p-3 bg-orange-50 rounded-lg"
                >
                  <span className="font-medium text-gray-900">
                    {warning.productName}
                  </span>
                  <span className="text-sm text-orange-700">
                    Solicitado: {warning.requested} / Disponible:{" "}
                    {warning.available}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowStockWarningModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmWithWarnings}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Continuar de todos modos
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="bottom-right" />
    </div>
  );
};

export default PaymentModal;
