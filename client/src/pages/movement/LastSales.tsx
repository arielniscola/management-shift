import { FC, useEffect, useState } from "react";
import ModalPaymentMethod from "../../components/PaymentMethodModal";
import { IMovement } from "../../interfaces/movement";
import { getLastsMovements } from "../../services/movementService";
import { IPaymentMethod } from "../../interfaces/paymentMethod";

import { CheckCircle, Pencil } from "lucide-react";

interface LastSalesProps {
  editMov: (mov: IMovement) => void;
  setMov: (mov: IMovement) => void;
  research: boolean;
}
const LastSales: FC<LastSalesProps> = ({ editMov, setMov, research }) => {
  const [methodModalOpen, setMethodModalOpen] = useState(false);
  const [movements, setMovements] = useState<IMovement[]>([]);
  const [selectedMov, setSelectedMov] = useState<IMovement>();

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const movementData = (await getLastsMovements()) as IMovement[];
        setMovements(movementData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchMovements();
  }, [research]);

  const setMethod = (method: IPaymentMethod) => {
    if (selectedMov) {
      selectedMov.paymentMethod = method;
      selectedMov.state = "paid";

      editMov(selectedMov);
    }
  };

  return (
    <div className="col-span-full ml-10 mr-10 xl:col-span-6 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
      <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">
          Ultimas ventas
        </h2>
      </header>
      <div className="p-3">
        {/* Card content */}
        {/* "Today" group */}
        <div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productos
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movements &&
                movements.map((mov) => (
                  <tr key={mov._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(mov.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {mov.client && typeof mov.client == "object"
                        ? `${mov.client.firstname} ${mov.client.lastname}`
                        : "Sin cliente"}
                    </td>
                    <td className="px-6 py-4">
                      <ul className="list-disc list-inside">
                        {mov.details.map((item, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            {item.name} x{item.units} (${item.price?.toFixed(2)}
                            )
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                      ${mov.totalAmount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          mov.state === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {mov.state === "debit" ? "Pendiente" : "Pagado"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMov(mov);
                          setMethodModalOpen(true);
                        }}
                        className={`${
                          mov.state === "debit"
                            ? "text-green-600 hover:text-green-800"
                            : "text-yellow-600 hover:text-yellow-800"
                        }`}
                      >
                        {mov.state === "debit" ? (
                          <CheckCircle className="w-5 h-5 inline" />
                        ) : (
                          ""
                        )}
                      </button>
                      {mov.state === "debit" && (
                        <button
                          onClick={() => {
                            setSelectedMov(mov);
                            setMov(mov);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Pencil className="w-5 h-5 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <ModalPaymentMethod
          id="method-modal"
          modalOpen={methodModalOpen}
          setModalOpen={setMethodModalOpen}
          setMethod={setMethod}
        />
      </div>
    </div>
  );
};

export default LastSales;
