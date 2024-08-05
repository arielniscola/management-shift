import { FC, useEffect, useState } from "react";
import BarChart from "../charts/barChar";
import { IMovement } from "../interfaces/movement";
import { IDailyBalance } from "../interfaces/dailyBalance";
import ModalPaymentMethod from "./DetailModalMovements";
import moment from "moment";

interface IDataSet {
  label: string;
  data: number[];
  backgroundColor: string;
  hoverBackgroundColor: string;
  barPercentage: number;
  categoryPercentage: number;
}

interface DailyMovementsProps {
  movements: IMovement[];
  balance?: IDailyBalance;
}
const DailyMovementsCard: FC<DailyMovementsProps> = ({
  movements,
  balance,
}) => {
  const [selectedMov, setSelectedMov] = useState<IMovement>();
  const [methodModalOpen, setMethodModalOpen] = useState(false);
  const [chartData, setChartData] = useState<{
    datasets: IDataSet[];
    labels: string[];
  }>({ datasets: [], labels: ["Reasons"] });
  const [totalAmountMov, setTotalAmountMov] = useState<number>(0);

  useEffect(() => {
    let dataSets: IDataSet[] = [];
    let totalAmount = 0;
    let methods: { method: string; amount: number; bgColor: string }[] = [];

    for (const mov of movements) {
      totalAmount += mov.totalAmount;

      if (methods.some((met) => met.method === mov.paymentMethod?.name)) {
        const index = methods.findIndex(
          (met) => met.method === mov.paymentMethod?.name
        );
        methods[index].amount += mov.totalAmount;
      } else {
        if (methods.some((met) => met.method === "Impagos")) {
          const index = methods.findIndex((met) => met.method === "Impagos");
          methods[index].amount += mov.totalAmount;
        } else {
          methods.push({
            method: mov.paymentMethod?.name
              ? mov.paymentMethod.name
              : "Impagos",
            amount: mov.totalAmount,
            bgColor: mov.paymentMethod?.colorBanner
              ? mov.paymentMethod.colorBanner
              : "#312e81",
          });
        }
      }
    }
    for (const met of methods) {
      let data: IDataSet = {
        label: met.method,
        data: [met.amount],
        backgroundColor: met.bgColor,
        hoverBackgroundColor: "#312e81",
        barPercentage: 1,
        categoryPercentage: 1,
      };
      dataSets.push(data);
    }
    setChartData({ datasets: dataSets, labels: ["Reasons"] });
    setTotalAmountMov(totalAmount);
  }, [movements]);

  return (
    <div>
      <div className="col-span-full xl:col-span-6 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
        <div className="px-5 py-3">
          <div className="flex items-start">
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mr-2">
              {balance
                ? `Total Ventas: $ ${balance.finalBalance} `
                : `Total Ventas: $ ${totalAmountMov}`}
            </div>
          </div>
        </div>
        {/* Chart built with Chart.js 3 */}
        <div className="grow">
          {/* Change the height attribute to adjust the chart height */}
          <BarChart data={chartData} width={595} height={48} />
        </div>
      </div>
      <div className="mt-2 col-span-full xl:col-span-6 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
        <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">
            Ventas
          </h2>
        </header>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-3">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3">
                  Monto Total
                </th>
                <th scope="col" className="px-6 py-3">
                  Detalle
                </th>
              </tr>
            </thead>
            <tbody>
              {movements &&
                movements.map((mov) => (
                  <tr
                    key={mov._id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {mov.client ? mov.client : "Sin Cliente"}
                    </th>
                    <td className="px-6 py-4">
                      {moment(mov.date).format("DD-MM-YYYY")}
                    </td>
                    <td className="px-6 py-4">
                      {mov.state === "debit" ? (
                        <span className="bg-red-100 text-red-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
                          No pagado
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                          Pagado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">$ {mov.totalAmount}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMov(mov);
                          setMethodModalOpen(true);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="size-5"
                        >
                          <path d="M6 4.75A.75.75 0 0 1 6.75 4h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 4.75ZM6 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 10Zm0 5.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75ZM1.99 4.75a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1v-.01ZM1.99 15.25a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1v-.01ZM1.99 10a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1V10Z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <ModalPaymentMethod
            id="method-modal"
            setModalOpen={setMethodModalOpen}
            modalOpen={methodModalOpen}
            movement={selectedMov}
          />
        </div>
      </div>
    </div>
  );
};

export default DailyMovementsCard;
