import { useRef, useState } from "react";
import { Sidebar } from "../../partials/sidebar";
import Header from "../../partials/headers";
import { IMovement } from "../../interfaces/movement";
import LastSales from "./LastSales";

import { updateMovement } from "../../services/movementService";
import toast, { Toaster } from "react-hot-toast";

import FormClientModal from "../../components/formClientModal";
import PaymentModal from "../../components/PaymentsModal";

const notify = (msg: string) => toast.success(msg);
const notifyError = (msg: string) => toast.error(msg);

const Sales = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [research, setResearch] = useState<boolean>(false);
  const [movement, setMovement] = useState<IMovement>();

  const topRef = useRef<HTMLDivElement | null>(null);

  const scrollToTop = () => {
    if (!topRef.current) return;
    topRef.current.scrollIntoView({ behavior: "smooth" });
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
    } catch (error) {
      notifyError(error ? error.toString() : "Error");
    } finally {
      setResearch((prev) => !prev);
    }
  };
  // Selecciona venta a editar
  const setEditMoc = (mov: IMovement) => {
    setMovement(mov);
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
            <PaymentModal
              setResearch={setResearch}
              movementEdit={movement}
              research={research}
            />
            <Toaster position="bottom-right" />
          </div>
          <LastSales
            editMov={changePaymentMethod}
            setMov={setEditMoc}
            research={research}
            setResearch={setResearch}
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
