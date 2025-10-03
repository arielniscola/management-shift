import { useEffect, useState } from "react";
import { Sidebar } from "../../partials/sidebar";
import Header from "../../partials/headers";
import DatepickerWithIcon from "../../components/Datepicker";
import { IMovement } from "../../interfaces/movement";
import DailyMovementsCard from "../../components/salesChart";
import { getDailyBalance } from "../../services/dailyBalanceService";
import {
  DailyBalanceResponse,
  IDailyBalance,
} from "../../interfaces/dailyBalance";
import moment from "moment";
import CashClousureView from "./CashClousure";

const DailyMovements = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [movements, setMovements] = useState<IMovement[]>([]);
  const [dailyBalance, setDailyBalance] = useState<IDailyBalance>();
  const [date, setDate] = useState<string>(moment(new Date()).toISOString());
  const [reload, setReload] = useState<boolean>(false);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const data = (await getDailyBalance(date)) as DailyBalanceResponse;
        setMovements(data.movements);
        setDailyBalance(data.dailyBalance);
      } catch (error) {
        console.error("Error fetching daily balance:", error);
      }
    };
    fetchMovements();
  }, [date, reload]);

  const setDateHandler = (e: string[]) => {
    setDate(moment(e[0]).toISOString());
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
          <CashClousureView />
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
              <h2 className="mb-4 text-4xl font-semibold leading-none tracking-tight text-gray-900 md:text-4xl dark:text-white">
                Ventas/Cierres
                {dailyBalance && dailyBalance.state == "closed" ? (
                  <span className="bg-indigo-100 text-indigo-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300">
                    Cerrado
                  </span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300 m-2">
                    Pendiente
                  </span>
                )}
              </h2>
              <div className="grid gap-6 mb-4 md:grid-cols-2">
                <div>
                  <DatepickerWithIcon
                    setDate={setDateHandler}
                    defaultValue={date}
                  />
                </div>
                <div></div>
              </div>
              <DailyMovementsCard
                movements={movements}
                balance={dailyBalance}
                setReload={setReload}
                reload={reload}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DailyMovements;
