import { FormEvent, useEffect, useState } from "react";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Check,
  AlertCircle,
  Monitor,
  ChevronDown,
  X,
  DollarSign,
  Minus,
  ArchiveRestore,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  closeBalance,
  createWithdrawal,
  getClosedBalance,
  getClosedBalances,
} from "../../services/dailyBalanceService";
import {
  ICloseDailyBalanceResponse,
  IDailyBalance,
  IDailyBalanceIds,
} from "../../interfaces/dailyBalance";
import { IPayment } from "../../interfaces/payment";
import { IWithdrawal } from "../../interfaces/withdrawal";

const notify = (msg: string) => toast.success(msg);
const notifyError = (msg: string) => toast.error(msg);

const CashClousureView = () => {
  const [closedBalances, setClosedBalances] = useState<IDailyBalanceIds[]>([]);
  const [showCerrarCajaPopup, setShowCerrarCajaPopup] = useState(false);
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [withdrawals, setWithdrawals] = useState<IWithdrawal[]>([]);
  const [showRetiroPopup, setShowRetiroPopup] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<IDailyBalance>({
    companyCode: "",
    date: new Date(),
    closedTime: new Date(),
    finalAmountCash: 0,
    finalAmountTranfer: 0,
    initialAmountTranfer: 0,
    initialAmountCash: 0,
    totalWithdrawalCash: 0,
    totalWithdrawalTranfer: 0,
    identificationNumber: 0,
    state: "pending",
    realAmountCash: 0,
    realAmountTranfer: 0,
  });
  const [realAmountCash, setRealAmountCash] = useState(0);
  const [realAmountTransfer, setRealAmountTransfer] = useState(0);
  const [selectedBalanceId, setSelectedBalanceId] = useState<IDailyBalanceIds>({
    date: "",
    identificationNumber: 0,
    state: "pending",
  });
  const [totalMethod, setTotalMethod] = useState<
    { method: string; total: number }[]
  >([]);
  const [totalMethodWithdrawal, setTotalMethodWithdrawal] = useState<
    { method: string; total: number }[]
  >([]);
  const [showCajaSelector, setShowCajaSelector] = useState(false);
  const [withdrawal, setWithdrawal] = useState<IWithdrawal>({
    amount: 0,
    observations: "",
    withdrawnBy: "",
    companyCode: "",
    date: new Date(),
    processed: false,
    type: "efectivo",
    reason: "",
  });
  const [partialTotalAmount, setPartialTotalAmount] = useState(0);
  const [partialWithdrawalAmount, setPartialWithdrawalAmount] = useState(0);
  const [partialPaymentAmount, setPartialPaymentAmount] = useState(0);

  useEffect(() => {
    const fetchBalancesCloses = async () => {
      try {
        const balancesData = (await getClosedBalances()) as IDailyBalanceIds[];
        setClosedBalances(balancesData);
      } catch (error) {
        notifyError("Error al cargar los balances cerrados");
      }
    };
    fetchBalancesCloses();
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balanceData = (await getClosedBalance(
          selectedBalanceId.identificationNumber
        )) as ICloseDailyBalanceResponse;
        setSelectedBalance(balanceData.balance);
        setPayments(balanceData.payments);
        setWithdrawals(balanceData.withdrawals);
      } catch (error) {
        notifyError("Error al cargar el balance seleccionado");
      }
    };
    fetchBalance();
  }, [selectedBalanceId]);

  useEffect(() => {
    if (payments.length || withdrawals.length) {
      calculateTotalsPaymentMethod();
    }
  }, [payments, withdrawals]);

  const calculateTotalsPaymentMethod = () => {
    let totalCash = 0;
    let totalTransfer = 0;
    let totalWithdrawals = 0;
    let totalWithdrawalCash = 0;
    let totalWithdrawalTransfer = 0;
    withdrawals.forEach((withdrawal) => {
      if (withdrawal.type?.toLocaleLowerCase() === "efectivo") {
        totalWithdrawalCash += withdrawal.amount;
      } else {
        totalWithdrawalTransfer += withdrawal.amount;
      }
    });
    payments.forEach((payment) => {
      if (payment.paymentMenthod.name?.toLocaleLowerCase() === "efectivo") {
        totalCash += payment.amount;
      } else {
        totalTransfer += payment.amount;
      }
    });
    setTotalMethodWithdrawal([
      { method: "Efectivo", total: totalWithdrawalCash },
      { method: "Transferencia", total: totalWithdrawalTransfer },
    ]);
    totalWithdrawals = totalWithdrawalCash + totalWithdrawalTransfer;
    setTotalMethod([
      { method: "Efectivo", total: totalCash },
      { method: "Transferencia", total: totalTransfer },
    ]);
    if (selectedBalance.state === "pending") {
      setPartialPaymentAmount(totalCash + totalTransfer);
      setPartialWithdrawalAmount(totalWithdrawals);
      setPartialTotalAmount(totalCash + totalTransfer - totalWithdrawals);
    }
  };
  const handleRetiroSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await createWithdrawal(withdrawal);
      if (res.ack) {
        notifyError(res.message ? res.message : "error");
      } else {
        notify(res.message ? res.message : "ok");
      }
    } catch (error) {
      notifyError("Error al procesar el retiro");
    } finally {
      setShowRetiroPopup(false);
      setWithdrawal({
        amount: 0,
        observations: "",
        withdrawnBy: "",
        date: new Date(),
        companyCode: "",
        type: "",
        reason: "",
      });
    }
  };

  const handleRetiroChange = (field: string, value: string) => {
    setWithdrawal((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const closeBalanceHandle = async () => {
    try {
      const res = await closeBalance(realAmountCash, realAmountTransfer);
      if (res.ack) {
        notifyError(res.message ? res.message : "error");
      } else {
        notify(res.message ? res.message : "ok");
      }
    } catch (error) {
      notifyError("Error al cerrar el balance");
    } finally {
      setShowCerrarCajaPopup(false);
    }
  };
  const getEstadoBadge = (estado: string) => {
    const badges = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: AlertCircle,
        text: "Pendiente",
      },
      closed: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: Check,
        text: "Cerrado",
      },
    };

    const badge = badges[estado as keyof typeof badges];
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${badge.color}`}
      >
        <Icon className="w-4 h-4 mr-1" />
        {badge.text}
      </span>
    );
  };

  const getTipoMovimientoColor = (tipo: string) => {
    const colors = {
      venta: "text-green-600",
      gasto: "text-red-600",
      retiro: "text-orange-600",
      deposito: "text-blue-600",
    };
    return colors[tipo as keyof typeof colors] || "text-gray-600";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalPartialAmount = (type: string) => {
    let subtotals =
      (totalMethod.find((t) => t.method.toLocaleLowerCase() == type)?.total ||
        0) -
      (totalMethodWithdrawal.find((t) => t.method.toLocaleLowerCase() == type)
        ?.total || 0);

    if (type === "efectivo") {
      subtotals += selectedBalance.initialAmountCash;
    } else {
      subtotals += selectedBalance.initialAmountTranfer;
    }
    return subtotals;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  Cierre de Caja
                </h1>
                <div className="relative">
                  <button
                    onClick={() => setShowCajaSelector(!showCajaSelector)}
                    className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    Caja {selectedBalanceId.identificationNumber}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </button>

                  {showCajaSelector && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-lg shadow-lg z-10">
                      {Object.entries(closedBalances).map(([id, caja]) => (
                        <button
                          key={id}
                          onClick={() => {
                            setSelectedBalanceId(caja);
                            setShowCajaSelector(false);
                          }}
                          className={`w-full text-left p-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg border-b last:border-b-0 ${
                            selectedBalanceId._id === id
                              ? "bg-blue-50 border-blue-200"
                              : ""
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">
                                Caja - {caja.identificationNumber}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(caja.date).toLocaleString("es-AR", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                            {getEstadoBadge(caja.state)}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mt-1">
                Gestión y control de movimientos diarios
              </p>
            </div>
            {selectedBalance.state === "pending" && (
              <div className="flex items-center space-x-3">
                <button
                  className="flex items-center px-4 py-2 text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                  onClick={() => setShowCerrarCajaPopup(true)}
                >
                  <ArchiveRestore className="w-4 h-4 mr-2" />
                  Cerrar Caja
                </button>

                <button
                  onClick={() => setShowRetiroPopup(true)}
                  className="flex items-center px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Realizar Retiro
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-2 gap-6">
          {/* Información General */}

          {/* Detalles del Cierre */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información del Cierre
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Estado:</span>
                {getEstadoBadge(selectedBalance?.state)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Fecha:</span>
                <div className="flex items-center text-gray-900">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(selectedBalance.date).toLocaleDateString("es-AR")}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Fecha Inicio:</span>
                <span className="text-gray-900 font-medium">
                  {new Date(selectedBalance.date).toLocaleString("es-AR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Fecha Cierre:</span>
                <span className="text-gray-900 font-medium">
                  {selectedBalance.state === "pending"
                    ? "---"
                    : new Date(selectedBalance.closedTime).toLocaleString(
                        "es-AR",
                        {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        }
                      )}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    Monto Inicial (Efectivo):
                  </span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(selectedBalance.initialAmountCash)}
                  </span>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    Monto Inicial (Transferencia):
                  </span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(selectedBalance.initialAmountTranfer)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen de Totales */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen de Totales
            </h2>
            <div className="space-y-4">
              {/* Ventas */}
              <div className="border-b pb-4">
                <h3 className="font-medium text-gray-700 mb-3">
                  Ventas por Método
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Efectivo:</span>
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(
                        totalMethod.find((t) => t.method === "Efectivo")
                          ?.total || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Transferencia:
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(
                        totalMethod.find((t) => t.method === "Transferencia")
                          ?.total || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium text-gray-700">
                      Total Ventas:
                    </span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(
                        selectedBalance.state === "closed"
                          ? selectedBalance.finalAmountCash +
                              selectedBalance.finalAmountTranfer
                          : partialPaymentAmount
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pb-2">
                <h3 className="font-medium text-gray-700 mb-1">
                  Retiros por Método
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Efectivo:</span>
                    <span className="text-sm font-medium text-orange-600">
                      {formatCurrency(
                        totalMethodWithdrawal.find(
                          (t) => t.method === "Efectivo"
                        )?.total || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Transferencia:
                    </span>
                    <span className="text-sm font-medium text-orange-600">
                      {formatCurrency(
                        totalMethodWithdrawal.find(
                          (t) => t.method === "Transferencia"
                        )?.total || 0
                      )}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Retiros:</span>
                      <span className="text-orange-600 font-medium">
                        -
                        {formatCurrency(
                          selectedBalance.state === "closed"
                            ? selectedBalance.totalWithdrawalCash +
                                selectedBalance.totalWithdrawalTranfer
                            : partialWithdrawalAmount
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resultado Final */}
              <div className="border-t pt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Monto Final Esperado (Efectivo):
                  </span>
                  <span className="font-medium">
                    {formatCurrency(
                      selectedBalance.state == "pending"
                        ? totalPartialAmount("efectivo")
                        : selectedBalance.finalAmountCash
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Monto Final Caja (Efectivo):
                  </span>
                  <span className="font-medium">
                    {formatCurrency(selectedBalance.realAmountCash)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold text-gray-700">
                    Diferencia:
                  </span>
                  <span
                    className={`font-bold ${
                      selectedBalance.finalAmountCash -
                        selectedBalance.realAmountCash <
                      0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {formatCurrency(
                      selectedBalance.finalAmountCash -
                        selectedBalance.realAmountCash
                    )}
                  </span>
                </div>
              </div>
              <div className="border-t pt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Monto Final Esperado (Transferencia):
                  </span>
                  <span className="font-medium">
                    {formatCurrency(
                      selectedBalance.state === "pending"
                        ? totalPartialAmount("transferencia")
                        : selectedBalance.finalAmountTranfer
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Monto Final (Transferencia):
                  </span>
                  <span className="font-medium">
                    {formatCurrency(selectedBalance.realAmountTranfer)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold text-gray-700">
                    Diferencia:
                  </span>
                  <span
                    className={`font-bold ${
                      selectedBalance.finalAmountTranfer -
                        selectedBalance.realAmountTranfer <
                      0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {formatCurrency(
                      selectedBalance.finalAmountTranfer -
                        selectedBalance.realAmountTranfer
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Lista de Movimientos */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Movimientos del Día
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {payments.length + withdrawals.length} movimientos registrados
                </p>
              </div>

              <div className="overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  {payments.map((movimiento) => {
                    return (
                      <div
                        key={movimiento._id}
                        className="border-b last:border-b-0 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-3">
                            <div
                              className={`p-2 rounded-full ${
                                movimiento.amount > 0
                                  ? "bg-green-100"
                                  : "bg-red-100"
                              }`}
                            >
                              <TrendingUp
                                className={`w-4 h-4 ${getTipoMovimientoColor(
                                  "Venta"
                                )}`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium text-gray-900 truncate">
                                  {movimiento.movementsNumber[0]}
                                </h3>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {"venta".toUpperCase()}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                <span>
                                  {new Date(movimiento.date).toLocaleString(
                                    "es-AR",
                                    {
                                      year: "numeric",
                                      month: "2-digit",
                                      day: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                      timeZone:
                                        "America/Argentina/Buenos_Aires",
                                    }
                                  )}
                                </span>
                                <span>{movimiento.paymentMenthod.name}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-lg font-semibold ${
                                movimiento.amount > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {movimiento.amount > 0 ? "+" : ""}
                              {formatCurrency(Math.abs(movimiento.amount))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {withdrawals.map((movimiento) => {
                    return (
                      <div
                        key={movimiento._id}
                        className="border-b last:border-b-0 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full bg-red-100`}>
                              <TrendingDown
                                className={`w-4 h-4 ${getTipoMovimientoColor(
                                  "retiro"
                                )}`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium text-gray-900 truncate">
                                  {movimiento.reason}
                                </h3>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {"retiro".toUpperCase()}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                <span>
                                  {new Date(movimiento.date).toLocaleString(
                                    "es-AR",
                                    {
                                      year: "numeric",
                                      month: "2-digit",
                                      day: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                      timeZone:
                                        "America/Argentina/Buenos_Aires",
                                    }
                                  )}
                                </span>
                                <span>{movimiento.type}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-lg font-semibold text-red-600`}
                            >
                              {movimiento.amount > 0 ? "-" : ""}
                              {formatCurrency(Math.abs(movimiento.amount))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resumen en el footer */}
              <div className="bg-gray-50 p-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Total de movimientos: {payments.length + withdrawals.length}
                  </span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Ingresos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-gray-600">Egresos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Popup de Retiro */}
      {showRetiroPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Realizar Retiro
              </h3>
              <button
                onClick={() => setShowRetiroPopup(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Información de Caja Seleccionada */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">
                  Caja Seleccionada
                </span>
                {getEstadoBadge(selectedBalance.state)}
              </div>
              <div className="text-lg font-semibold text-blue-900">
                CAJA - ({selectedBalance.identificationNumber})
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  Monto disponible (Efectivo):
                </span>
                <span className="font-semibold text-blue-900">
                  {formatCurrency(selectedBalance.finalAmountCash)}
                </span>
              </div>
            </div>

            <form onSubmit={(e) => handleRetiroSubmit(e)} className="space-y-4">
              {/* Tipo de Retiro */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Retiro
                </label>
                <select
                  value={withdrawal.type}
                  defaultValue="efectivo"
                  onChange={(e) => handleRetiroChange("type", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>

              {/* Monto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto a Retirar *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={withdrawal.amount}
                    onChange={(e) =>
                      handleRetiroChange("amount", e.target.value)
                    }
                    placeholder="0.00"
                    min="1"
                    max={
                      selectedBalance.state === "pending"
                        ? partialTotalAmount + selectedBalance.initialAmountCash
                        : selectedBalance.finalAmountCash
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Máximo:{" "}
                  {formatCurrency(
                    withdrawal.type === "efectivo"
                      ? totalPartialAmount("efectivo")
                      : totalPartialAmount("transferencia")
                  )}
                </p>
              </div>

              {/* Concepto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Concepto *
                </label>
                <select
                  value={withdrawal.reason}
                  onChange={(e) => handleRetiroChange("reason", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                >
                  <option value="">Seleccionar concepto...</option>
                  <option value="deposito_banco">Depósito en Banco</option>
                  <option value="caja_fuerte">Traslado a Caja Fuerte</option>
                  <option value="pago_proveedores">Pago a Proveedores</option>
                  <option value="gastos_operativos">Gastos Operativos</option>
                  <option value="cambio_turno">Cambio de Turno</option>
                  <option value="otros">Otros</option>
                </select>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={withdrawal.observations}
                  onChange={(e) =>
                    handleRetiroChange("observations", e.target.value)
                  }
                  rows={3}
                  placeholder="Detalles adicionales del retiro..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                />
              </div>

              {/* Resumen */}
              {withdrawal.amount && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Resumen del Retiro
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monto actual:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          selectedBalance.state === "pending"
                            ? partialTotalAmount +
                                selectedBalance.initialAmountCash
                            : selectedBalance.finalAmountCash
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monto a retirar:</span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(Number(withdrawal.amount))}
                      </span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-medium text-gray-900">
                        Monto restante:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(
                          partialTotalAmount +
                            selectedBalance.initialAmountCash -
                            withdrawal.amount
                        )}
                      </span>
                      <span>
                        {partialTotalAmount +
                          selectedBalance.initialAmountCash -
                          withdrawal.amount}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRetiroPopup(false)}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!withdrawal.amount}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Confirmar Retiro
                </button>
              </div>
            </form>
            {/* Popup de Cerrar Caja */}
          </div>
        </div>
      )}
      {showCerrarCajaPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Cerrar Caja
              </h3>
              <button
                onClick={() => setShowCerrarCajaPopup(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Información de Caja */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-900">
                  Caja a Cerrar
                </span>
                {getEstadoBadge(selectedBalance.state)}
              </div>
              <div className="text-lg font-semibold text-orange-900">
                {selectedBalance.identificationNumber}
              </div>
              <div className="text-xs text-orange-600">
                ⚠️ Una vez cerrada la caja, no podrás realizar más operaciones
                en ella.
              </div>
            </div>

            {/* Resumen de Totales Previo al Cierre */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-4">
                Resumen del Día
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto inicial (total):</span>
                  <span className="font-medium">
                    {formatCurrency(
                      selectedBalance.initialAmountCash +
                        selectedBalance.initialAmountTranfer
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total ventas:</span>
                  <span className="font-medium text-green-600">
                    +{formatCurrency(partialPaymentAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total retiros:</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(partialWithdrawalAmount)}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-medium text-gray-900">
                    Monto esperado:
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(
                      partialTotalAmount +
                        selectedBalance.initialAmountCash +
                        selectedBalance.initialAmountTranfer
                    )}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={closeBalanceHandle} className="space-y-4">
              {/* Monto Final Contado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Final Contado *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={realAmountCash}
                    onChange={(e) => {
                      setRealAmountCash(parseFloat(e.target.value));
                    }}
                    placeholder="Ingrese el monto contado físicamente"
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Monto esperado:{" "}
                  {formatCurrency(totalPartialAmount("efectivo"))}
                </p>
              </div>

              {/* Mostrar diferencia si hay monto ingresado */}
              {realAmountCash != 0 && (
                <div
                  className={`p-3 rounded-lg border ${
                    Math.abs(
                      Number(realAmountCash) - totalPartialAmount("efectivo")
                    ) > 0
                      ? "bg-red-50 border-red-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Diferencia:</span>
                    <span
                      className={`font-bold ${
                        Number(realAmountCash) -
                          totalPartialAmount("efectivo") >=
                        0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(
                        Number(realAmountCash) - totalPartialAmount("efectivo")
                      )}
                      <div className="space-y-3"></div>{" "}
                    </span>
                  </div>
                </div>
              )}

              {/* Monto Final Transferencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Final Transferencias *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={realAmountTransfer}
                    onChange={(e) => {
                      setRealAmountTransfer(parseFloat(e.target.value));
                    }}
                    placeholder="Ingrese el monto en transferencias"
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Monto esperado:{" "}
                  {formatCurrency(
                    totalPartialAmount("transferencia") +
                      selectedBalance.initialAmountTranfer
                  )}
                </p>
              </div>

              {/* Mostrar diferencia si hay monto ingresado */}
              {realAmountTransfer != 0 && (
                <div
                  className={`p-3 rounded-lg border ${
                    Math.abs(
                      Number(realAmountTransfer) -
                        totalPartialAmount("transferencia")
                    ) > 0
                      ? "bg-red-50 border-red-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Diferencia:</span>
                    <span
                      className={`font-bold ${
                        Number(realAmountTransfer) -
                          totalPartialAmount("transferencia") >=
                        0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(
                        Number(realAmountTransfer) -
                          totalPartialAmount("transferencia")
                      )}
                      <div className="space-y-3"></div>{" "}
                    </span>
                  </div>
                </div>
              )}
              {/* Advertencia Final */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 mb-1">
                      Importante:
                    </p>
                    <p className="text-yellow-700">
                      Al cerrar la caja no podrás realizar más ventas ni
                      movimientos sobre la caja Actual. Asegúrate de haber
                      completado todas las operaciones del día.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCerrarCajaPopup(false)}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={realAmountCash === 0}
                  className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  onClick={() => closeBalanceHandle()}
                >
                  Cerrar Caja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Toaster position="bottom-right" />
    </div>
  );
};

export default CashClousureView;
