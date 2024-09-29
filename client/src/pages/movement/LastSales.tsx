import { FC, useEffect, useState } from "react";
import ModalPaymentMethod from "../../components/PaymentMethodModal";
import { IMovement } from "../../interfaces/movement";
import { getMovements } from "../../services/movementService";

import { IPaymentMethod } from "../../interfaces/paymentMethod";
import moment from "moment";

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
        const date = moment(new Date()).toISOString();
        const movementData = (await getMovements(date)) as IMovement[];
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
          <header className="text-xs uppercase text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700 dark:bg-opacity-50 rounded-sm font-semibold p-2">
            Hoy
          </header>
          <ul className="my-1">
            {/* Item */}
            {movements &&
              movements.map((mov) => (
                <li className="flex px-2" key={mov._id}>
                  {mov.state === "paid" ? (
                    <div className="w-9 h-9 rounded-full shrink-0 bg-emerald-500 my-2 mr-3">
                      <svg
                        className="w-9 h-9 fill-current text-emerald-50"
                        viewBox="0 0 36 36"
                      >
                        <path d="M18.3 11.3l-1.4 1.4 4.3 4.3H11v2h10.2l-4.3 4.3 1.4 1.4L25 18z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full shrink-0 bg-rose-500 my-2 mr-3">
                      <svg
                        className="w-9 h-9 fill-current text-rose-50"
                        viewBox="0 0 36 36"
                      >
                        <path d="M17.7 24.7l1.4-1.4-4.3-4.3H25v-2H14.8l4.3-4.3-1.4-1.4L11 18z" />
                      </svg>
                    </div>
                  )}

                  <div className="grow flex items-center border-b border-slate-100 dark:border-slate-700 text-sm py-2">
                    <div className="grow flex justify-between">
                      <div className="self-center">
                        <span className="font-medium text-slate-800 hover:text-slate-900 dark:text-slate-100 dark:hover:text-white">
                          {mov.client && typeof mov.client == "object"
                            ? `${mov.client.firstname} ${mov.client.lastname}`
                            : "Sin cliente"}
                        </span>
                      </div>
                      <div
                        className={
                          mov.state === "debit"
                            ? "font-bold text-emerald-500 mt-2"
                            : "mr-[123px] font-bold text-emerald-500 mt-2"
                        }
                      >
                        $ {mov.totalAmount}
                      </div>
                      {mov.state === "debit" ? (
                        <div className="shrink-0 self-end ml-2">
                          <button
                            type="button"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            onClick={() => {
                              setSelectedMov(mov);
                              setMov(mov);
                            }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="text-white bg-[#34A853] hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-green-green dark:hover:bg-green-700 dark:focus:ring-green-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMov(mov);
                              setMethodModalOpen(true);
                            }}
                          >
                            Pago
                          </button>
                        </div>
                      ) : (
                        <div className="shrink-0 self-end ml-2">
                          <button
                            type="button"
                            className="hidden text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            onClick={() => {
                              setSelectedMov(mov);
                              setMov(mov);
                            }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="hidden text-white bg-[#34A853] hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-green-green dark:hover:bg-green-700 dark:focus:ring-green-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMethodModalOpen(true);
                            }}
                          >
                            Pago
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
          </ul>
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
