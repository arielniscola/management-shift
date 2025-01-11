import { Calendar as CalendarIcon } from "lucide-react";
import Calendar from "./Calendar";
import ShiftModal from "./ShiftModal";
import type { IShift } from "../../interfaces/shift";
import { useEffect, useState } from "react";
import Header from "../../partials/headers";
import { Sidebar } from "../../partials/sidebar";
import { getClients } from "../../services/clientService";
import { IClient } from "../../interfaces/client";
import {
  createShift,
  getShifts,
  updateShift,
} from "../../services/shiftService";
import toast, { Toaster } from "react-hot-toast";
import moment from "moment";
import UpdateModalConfirm from "../../components/updateModalConfirm";
import { IUnitBusiness } from "../../interfaces/unitBusiness";
import { getUnitBusiness } from "../../services/unitBusinessService";
const notify = (msg: string) => toast.success(msg);
const notifyError = (msg: string) => toast.error(msg);

function CalendarMenu() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shifts, setShifts] = useState<IShift[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedShift, setSelectedShift] = useState<IShift | undefined>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [clients, setClients] = useState<IClient[]>([]);
  const [researchShifts, setResearchShifts] = useState<boolean>(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectDragShift, setSelectDragShift] = useState<IShift>();
  const [unitBusiness, setUnitBusiness] = useState<IUnitBusiness[]>([]);
  const [selectedUnitBusiness, setSelectedUnitBusiness] =
    useState<IUnitBusiness>();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsData = (await getClients()) as IClient[];
        setClients(clientsData);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    const fetchUnitBusiness = async () => {
      try {
        const unitBusinessData = (await getUnitBusiness(
          true
        )) as IUnitBusiness[];
        setUnitBusiness(unitBusinessData);
        setSelectedUnitBusiness(unitBusinessData[0]);
      } catch (error) {
        console.error("Error fetching unit business:", error);
      }
    };
    fetchClients();
    fetchUnitBusiness();
  }, []);
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const clientsData = (await getShifts(
          selectedDate
            ? selectedDate
            : moment(currentDate).format("YYYY-MM-DD"),
          selectedUnitBusiness?.code
        )) as IShift[];
        setShifts(clientsData);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchShifts();
  }, [researchShifts, selectedUnitBusiness]);

  const handleAddShift = (date: string, time: string) => {
    setSelectedStartTime(time);
    setSelectedDate(date);
    setSelectedShift(undefined);
    setIsModalOpen(true);
  };

  const handleEditShift = (shift: IShift) => {
    setSelectedShift(shift);
    setIsModalOpen(true);
  };

  const handleUpdateShift = (
    shiftId: string,
    date: string,
    startTime: string,
    endTime: string
  ) => {
    //buscar turno a modificar
    const shiftFound = shifts.find((shift) => shift._id === shiftId);
    //Modificar turno
    if (shiftFound)
      setSelectDragShift({
        ...shiftFound,
        date,
        timeStart: startTime,
        timeEnd: endTime,
      });
    setUpdateModalOpen(true);
  };

  const handleSaveShift = async (shiftData?: Partial<IShift>) => {
    try {
      let res;
      if (selectDragShift) {
        res = await updateShift(selectDragShift);
      } else if (selectedShift) {
        // Editar turno existente
        if (shiftData) res = await updateShift(shiftData);
      } else if (shiftData) {
        // Agregar nuevo turno
        res = await createShift(shiftData);
      }
      if (res?.ack) {
        notifyError(res.message ? res.message : "error");
      } else {
        notify(res?.message ? res.message : "ok");
        setResearchShifts(!researchShifts);
      }
    } catch (error) {
      notifyError(error ? error.toString() : "Error");
    } finally {
      setUpdateModalOpen(false);
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
          <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Gestion Turnos
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Gestione sus turnos por canchas
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-lg font-medium text-gray-900">
                    {currentDate.toLocaleDateString("es-ES", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <Calendar
                shifts={shifts}
                onAddShift={handleAddShift}
                onEditShift={handleEditShift}
                selectedDate={currentDate}
                onDateChange={setCurrentDate}
                onUpdateShift={handleUpdateShift}
                selectedUN={selectedUnitBusiness}
                setSelectedUN={setSelectedUnitBusiness}
                unitBusiness={unitBusiness}
              />

              <ShiftModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveShift}
                initialShift={selectedShift}
                date={selectedDate}
                time={selectedStartTime}
                clients={clients}
                selectedUnitBusiness={selectedUnitBusiness?.code}
              />

              <UpdateModalConfirm
                id="update-modal"
                modalOpen={updateModalOpen}
                setModalOpen={setUpdateModalOpen}
                updateFn={handleSaveShift}
              />
            </div>
          </div>
          <Toaster position="bottom-right" />
        </main>
      </div>
    </div>
  );
}

export default CalendarMenu;
