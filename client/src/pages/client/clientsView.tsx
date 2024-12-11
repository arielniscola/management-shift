import { useEffect, useState } from "react";
import { Sidebar } from "../../partials/sidebar";
import Header from "../../partials/headers";
import moment from "moment";
import { IClient } from "../../interfaces/client";
import { getClients, getMovementsClient } from "../../services/clientService";
import { IMovement } from "../../interfaces/movement";
import ModalPaymentMethod from "../../components/PaymentMethodModal";
import FormClientModal from "../../components/formClientModal";
import ModalDetailMovements from "../../components/DetailModalMovements";
import { IPaymentMethod } from "../../interfaces/paymentMethod";
import { updateMovement } from "../../services/movementService";
import toast, { Toaster } from "react-hot-toast";
import SearchableSelect from "../../components/SearchableSelect";

const notify = (msg: string) => toast.success(msg);
const notifyError = (msg: string) => toast.error(msg);

const ClientView = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clients, setClients] = useState<IClient[]>([]);
  const [movements, setMovements] = useState<IMovement[]>();
  const [selectedMov, setSelectedMov] = useState<IMovement>();
  const [selectedClient, setSelectedClient] = useState<IClient>();
  const [methodModalOpen, setMethodModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [doubt, setDoubt] = useState<number>();
  const [research, setResearch] = useState<boolean>(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsData = (await getClients()) as IClient[];
        setClients(clientsData);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, []);
  useEffect(() => {
    const fetchmovs = async () => {
      try {
        const clientsData = (await getMovementsClient(
          selectedClient?._id
        )) as IMovement[];
        totalDoubt(clientsData);
        setMovements(clientsData);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchmovs();
  }, [selectedClient, research]);

  //Manejo selector de cliente
  const handlerSelectClient = (value: string) => {
    const cli = clients?.find((cli) => cli._id === value);
    setSelectedClient(cli);
  };

  //Calculo total deuda
  const totalDoubt = (movs: IMovement[]) => {
    let total = 0;
    for (const mov of movs) {
      if (mov.state == "debit") total += mov.totalAmount;
    }
    setDoubt(total);
  };

  // Selecciona venta a editar
  const setEditMoc = (pm: IPaymentMethod) => {
    if (selectedMov) {
      let mov: IMovement = { ...selectedMov, paymentMethod: pm, state: "paid" };
      submitMovement(mov);
    }
  };

  // Guardar pago
  const submitMovement = async (mov: IMovement) => {
    try {
      const res = await updateMovement(mov);
      if (res.ack) {
        notifyError(res.message ? res.message : "error");
      } else {
        notify(res.message ? res.message : "ok");
      }
      setResearch(!research);
    } catch (error) {
      notifyError(error ? error.toString() : "Error");
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
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
              <h6 className="mb-4 text-4xl font-semibold leading-none tracking-tight text-gray-900 md:text-4xl dark:text-white">
                Clientes
              </h6>
              <div className="grid w-full grid-flow-col gap-4">
                <SearchableSelect
                  options={clients.map((cli) => ({
                    value: cli._id ? cli._id : cli.firstname,
                    label: `${cli.firstname} ${cli.lastname}`,
                  }))}
                  value={selectedClient?._id || ""}
                  onChange={handlerSelectClient}
                  placeholder="Seleccionar a un cliente..."
                />
                <div>
                  <button
                    type="button"
                    className="text-[#34A853] w-12 border border-[#34A853] hover:bg-[#34A853] hover:text-white focus:ring-4 focus:outline-none focus:ring-greeb-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:focus:ring-blue-800 dark:hover:bg-green-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormModalOpen(true);
                    }}
                  >
                    <svg
                      className="w-5 h-5"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 18 18"
                    >
                      {selectedClient ? (
                        // Icono de edición cuando hay un cliente seleccionado
                        <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                      ) : (
                        // Icono de "+" cuando no hay un cliente seleccionado
                        <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {selectedClient && (
                <div>
                  {" "}
                  <div className="grid w-full grid-flow-col gap-4 m-5">
                    <dl className="max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
                      <div className="flex flex-col pb-3">
                        <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                          Nombre
                        </dt>
                        <dd className="text-lg font-semibold">
                          {selectedClient?.firstname}
                        </dd>
                      </div>
                      <div className="flex flex-col py-3">
                        <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                          Apellido
                        </dt>
                        <dd className="text-lg font-semibold">
                          {selectedClient?.lastname}
                        </dd>
                      </div>
                      <div className="flex flex-col pt-3">
                        <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                          Telefono
                        </dt>
                        <dd className="text-lg font-semibold">
                          {selectedClient?.phonenumber}
                        </dd>
                      </div>
                    </dl>
                    <dl className="max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
                      <div className="flex flex-col pb-3">
                        <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                          Direccion
                        </dt>
                        <dd className="text-lg font-semibold">
                          {selectedClient?.address}
                        </dd>
                      </div>
                      <div className="flex flex-col py-3">
                        <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                          DNI
                        </dt>
                        <dd className="text-lg font-semibold">
                          {selectedClient?.identificationNumber}
                        </dd>
                      </div>
                      <div className="flex flex-col py-3">
                        <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                          Correo
                        </dt>
                        <dd className="text-lg font-semibold">
                          {selectedClient?.email}
                        </dd>
                      </div>
                    </dl>
                    <dl className="max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
                      <div className="flex flex-col pt-3">
                        <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                          Deuda Total
                        </dt>
                        {doubt == 0 ? (
                          <dd className="text-lg text-green-600 font-semibold">
                            $ {doubt}
                          </dd>
                        ) : (
                          <dd className="text-lg text-red-600 font-semibold">
                            $ {doubt}
                          </dd>
                        )}
                      </div>
                    </dl>
                  </div>
                  <div className="mt-2 col-span-full xl:col-span-6 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
                    <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                      <h2 className="font-semibold text-slate-800 dark:text-slate-100">
                        Movimientos
                      </h2>
                    </header>

                    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                          <tr>
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
                                <td className="px-6 py-4">
                                  $ {mov.totalAmount}
                                </td>
                                <td className="px-6 py-4 flex items-center">
                                  <button
                                    type="button"
                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedMov(mov);
                                      setDetailModalOpen(true);
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
                                  {mov.state == "debit" && (
                                    <button
                                      type="button"
                                      className="text-white bg-[#34A853] hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center dark:bg-green-green dark:hover:bg-green-700 dark:focus:ring-green-800"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedMov(mov);
                                        setMethodModalOpen(true);
                                      }}
                                    >
                                      Pago
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
        <ModalPaymentMethod
          id="detail-modal"
          setModalOpen={setMethodModalOpen}
          modalOpen={methodModalOpen}
          setMethod={setEditMoc}
        />
        <FormClientModal
          id="form-modal"
          setModalOpen={setFormModalOpen}
          modalOpen={formModalOpen}
          clientUpdate={selectedClient}
        />
        <ModalDetailMovements
          id="method-modal"
          setModalOpen={setDetailModalOpen}
          modalOpen={detailModalOpen}
          movement={selectedMov}
        />
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default ClientView;
