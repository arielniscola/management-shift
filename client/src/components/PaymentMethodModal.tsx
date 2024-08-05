import { useRef, useEffect, useState } from "react";
import Transition from "../utils/transitions";
import { IPaymentMethod } from "../interfaces/paymentMethod";
import { getPaymentMethods } from "../services/paymentMethodService";

interface ModalPaymentMethodProps {
  id: string;
  modalOpen: boolean;
  setModalOpen: (modalOpen: boolean) => void;
  setMethod: (method: IPaymentMethod) => void;
}

const ModalPaymentMethod: React.FC<ModalPaymentMethodProps> = ({
  id,
  modalOpen,
  setModalOpen,
  setMethod,
}) => {
  const modalContent = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>();

  // close on click outside
  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      const { target } = event;
      if (!modalOpen || modalContent.current?.contains(target as Node)) return;
      setModalOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      const { keyCode } = event;
      if (!modalOpen || keyCode !== 27) return;
      setModalOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    modalOpen && searchInput.current?.focus();
  }, [modalOpen]);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const paymentMethodsData =
          (await getPaymentMethods()) as IPaymentMethod[];
        setPaymentMethods(paymentMethodsData);
      } catch (error) {
        console.error("Error fetching paymentMethod:", error);
      }
    };
    fetchPaymentMethods();
  }, []);

  return (
    <>
      {/* Modal backdrop */}
      <Transition
        className="fixed inset-0 bg-slate-900 bg-opacity-30 z-50 transition-opacity"
        show={modalOpen}
        enter="transition ease-out duration-200"
        enterStart="opacity-0"
        enterEnd="opacity-100"
        leave="transition ease-out duration-100"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
        aria-hidden="true"
      />
      {/* Modal dialog */}
      <Transition
        id={id}
        className="fixed inset-0 z-50 overflow-hidden flex items-start top-20 mb-4 justify-center px-4 sm:px-6"
        role="dialog"
        aria-modal="true"
        show={modalOpen}
        enter="transition ease-in-out duration-200"
        enterStart="opacity-0 translate-y-4"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-in-out duration-200"
        leaveStart="opacity-100 translate-y-0"
        leaveEnd="opacity-0 translate-y-4"
      >
        <div
          ref={modalContent}
          className="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 overflow-auto max-w-2xl w-full max-h-full rounded shadow-lg"
        >
          <div className="relative p-4 w-full  max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="p-4 md:p-5">
                <ul className="my-4 space-y-3">
                  {paymentMethods &&
                    paymentMethods.map((method) => (
                      <li
                        key={method._id}
                        style={{ borderColor: method.colorBanner }}
                        className="border p-1 rounded-lg"
                      >
                        <button
                          className={`flex w-full items-center p-3 text-base font-bold text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100 group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white`}
                          onClick={() => {
                            setMethod(method);
                            setModalOpen(false);
                          }}
                        >
                          <span className="flex-1 ms-3 whitespace-nowrap">
                            {method.name}
                          </span>
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </>
  );
};

export default ModalPaymentMethod;
