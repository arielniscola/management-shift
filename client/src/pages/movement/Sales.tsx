import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Sidebar } from "../../partials/sidebar";
import Header from "../../partials/headers";
import ModalSearch from "../../components/ModalSearch";
import { IMovement } from "../../interfaces/movement";
import LastSales from "./LastSales";
import { IProduct } from "../../interfaces/producto";
import { getProducts } from "../../services/productService";
import { createMovement, updateMovement } from "../../services/movementService";
import moment from "moment";
import toast, { Toaster } from "react-hot-toast";
import { IClient } from "../../interfaces/client";
import { getClients } from "../../services/clientService";
import FormClientModal from "../../components/formClientModal";
import SearchableSelect from "../../components/SearchableSelect";

const notify = (msg: string) => toast.success(msg);
const notifyError = (msg: string) => toast.error(msg);

const Sales = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [research, setResearch] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isEditingIndex, setIsEditingIndex] = useState<number>();
  const [clients, setClients] = useState<IClient[]>([]);
  const [movement, setMovement] = useState<IMovement>({
    date: "",
    details: [],
    totalAmount: 0,
    state: "debit",
    client: "",
  });

  const [products, setProducts] = useState<IProduct[]>([]);
  const [details, setDetails] = useState<IProduct[]>([]);
  const topRef = useRef<HTMLDivElement | null>(null);

  const scrollToTop = () => {
    if (!topRef.current) return;
    topRef.current.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
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
  }, []);

  const addProduct = (prod: IProduct) => {
    prod.units = 1;
    const newArray = [...details];
    newArray.push(prod);
    setDetails(newArray);
    totalCalculate(newArray);
  };

  // Calculo del total de la venta
  const totalCalculate = (arr: IProduct[]) => {
    let total = 0;
    arr.forEach((pro) => {
      total += pro.price * pro.units;
    });
    setMovement({ ...movement, totalAmount: total });
  };

  const handleUnitChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const val = parseInt(e.target.value);
    const updatedDetails = [...details];
    updatedDetails[index].units = val;
    setDetails(updatedDetails);
    totalCalculate(updatedDetails);
  };

  const changeUnitButton = (sum: boolean, index: number) => {
    const val = sum ? 1 : -1;
    const updatedDetails = [...details];
    updatedDetails[index].units += val;
    setDetails(updatedDetails);
    totalCalculate(updatedDetails);
  };
  const deleteHandler = (index: number) => {
    const newArray = details.filter((_det, i) => i !== index);
    setDetails(newArray);
    totalCalculate(newArray);
  };

  const clientHandler = (val: string) => {
    setMovement({ ...movement, client: val });
  };

  const submitHandler = async () => {
    try {
      let res;
      // Agregar los detalles
      movement.details = details;
      if (isEdit) {
        res = await updateMovement(movement);
      } else {
        res = await createMovement(movement);
      }
      if (res.ack) {
        notifyError(res.message ? res.message : "error");
      } else {
        notify(res.message ? res.message : "ok");
      }
    } catch (error) {
      notifyError(error ? error.toString() : "error");
    } finally {
      setResearch(!research);
      cleanForm();
    }
  };
  // Modifica metodo de pago y estado
  const changePaymentMethod = async (mov: IMovement) => {
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
  // Selecciona venta a editar
  const setEditMoc = (mov: IMovement) => {
    setDetails(mov.details);
    if (!mov.client) mov.client = "";
    setMovement(mov);
    setIsEdit(true);
  };

  const cleanForm = () => {
    // Reiniciar form
    setIsEdit(false);
    setDetails([]);
    setMovement({
      date: moment(new Date()).toISOString(),
      details: [],
      totalAmount: 0,
      state: "debit",
      client: "",
    });
  };
  const handlePriceChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const updatedDetails = [...details];
    updatedDetails[index].price = parseFloat(e.target.value);
    setDetails(updatedDetails);
    totalCalculate(updatedDetails);
  };

  const handleBlur = () => {
    setIsEditing(false);
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
          <div
            ref={topRef}
            className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto"
          >
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
              <h6 className="mb-4 text-4xl font-semibold leading-none tracking-tight text-gray-900 md:text-4xl dark:text-white">
                Ventas
              </h6>
              <button
                className={`text-white bg-[#3b5998] hover:bg-[#3b5998]/90 focus:ring-4 focus:outline-none focus:ring-[#3b5998]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#3b5998]/55 me-2 mb-2 ${
                  searchModalOpen && "bg-slate-200"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchModalOpen(true);
                }}
                aria-controls="search-modal"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    className="fill-current text-slate-500 dark:text-slate-400"
                    d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z"
                  />
                  <path
                    className="fill-current text-slate-400 dark:text-slate-500"
                    d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z"
                  />
                </svg>
                Buscar productos
              </button>

              <ModalSearch
                id="search-modal"
                searchId="search"
                modalOpen={searchModalOpen}
                setModalOpen={setSearchModalOpen}
                produts={products}
                addProduct={addProduct}
              />

              {details.length !== 0 && (
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                  <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-[#F1F1F1] dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Producto
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Cantidad
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Precio
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Total
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Accion
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.map((det, index) => (
                        <tr
                          key={index}
                          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                            {det.name}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <button
                                className="inline-flex items-center justify-center p-1 me-3 text-sm font-medium h-6 w-6 text-gray-500 bg-white border border-gray-300 rounded-full focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                                type="button"
                                onClick={() => changeUnitButton(false, index)}
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
                              <div>
                                <input
                                  type="number"
                                  id="units"
                                  className="bg-gray-50 w-14 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                  value={det.units}
                                  onChange={(event) =>
                                    handleUnitChange(event, index)
                                  }
                                  required
                                />
                              </div>
                              <button
                                className="inline-flex items-center justify-center h-6 w-6 p-1 ms-3 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-full focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                                type="button"
                                onClick={() => changeUnitButton(true, index)}
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
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                            {isEditing && isEditingIndex == index ? (
                              <input
                                type="number"
                                value={det.price}
                                onChange={(e) => handlePriceChange(e, index)}
                                onBlur={handleBlur}
                                className="px-2 py-1 border border-gray-300 rounded"
                                autoFocus
                              />
                            ) : (
                              <span
                                onClick={() => {
                                  setIsEditing(true);
                                  setIsEditingIndex(index);
                                }}
                              >
                                {det.price}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                            {det.price * det.units}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-red-red dark:hover:bg-red-700 dark:focus:ring-red-800"
                              onClick={() => deleteHandler(index)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="size-5"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <form className="mt-2">
                <div className="grid gap-6 mb-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="client"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
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
                    <label
                      htmlFor="last_name"
                      className="block mb-2 font-semibold text-gray-900 dark:text-white"
                    >
                      Total:
                    </label>
                    <input
                      type="number"
                      id="total"
                      value={movement.totalAmount}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      disabled
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="text-white bg-[#34A853] hover:bg-green-800  focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                  onClick={submitHandler}
                >
                  Guardar
                </button>
                <button
                  type="button"
                  className="text-white bg-yellow-400 hover:bg-yellow-800 focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800"
                  onClick={cleanForm}
                >
                  Cancelar
                </button>
              </form>
            </div>
            <Toaster position="bottom-right" />
          </div>
          <LastSales
            editMov={changePaymentMethod}
            setMov={setEditMoc}
            research={research}
            scrollToTop={scrollToTop}
          />
          <FormClientModal
            id="form-modal"
            setModalOpen={setFormModalOpen}
            modalOpen={formModalOpen}
          />
        </main>
      </div>
    </div>
  );
};

export default Sales;
