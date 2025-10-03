import { useEffect, useState } from "react";
import { getShifts } from "../../../services/shiftService";
import moment from "moment";
import { IShift } from "../../../interfaces/shift";
import { getUnitBusiness } from "../../../services/unitBusinessService";
import { IUnitBusiness } from "../../../interfaces/unitBusiness";
import { getClients } from "../../../services/clientService";
import { IClient } from "../../../interfaces/client";

const getColorStatus = (status: string) => {
  switch (status) {
    case "paid":
      return "#10B981	";
    case "confirmed":
      return "#3B82F6	";
    case "debt":
      return "#EF4444";
    case "cancelled":
      return "#EF4444";
    default:
      return "#FBBF24	";
  }
};
const getStatusText = (status: string) => {
  switch (status) {
    case "available":
      return "Disponible";
    case "scheduled":
      return "Reservado";
    case "completed":
      return "Completado";
    case "cancelled":
      return "Cancelado";
    default:
      return status;
  }
};

export const ListView = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const timeSlots = Array.from({ length: 13 }, (_, i) => `${i + 11}:00`);
  const [shifts, setShifts] = useState<IShift[]>([]);
  const [unitBusiness, setUnitBusiness] = useState<IUnitBusiness[]>([]);
  const [clients, setClients] = useState<IClient[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<
    IShift | undefined
  >();
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsData = (await getClients()) as IClient[];
        setClients(clientsData);
        console.log(clients);
        console.log(selectedAppointment);
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
      } catch (error) {
        console.error("Error fetching unit business:", error);
      }
    };
    fetchUnitBusiness();
    fetchClients();
  }, []);
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const clientsData = (await getShifts(
          selectedDate
            ? selectedDate
            : moment(selectedDate).format("YYYY-MM-DD")
        )) as IShift[];
        setShifts(clientsData);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchShifts();
  }, [selectedDate]);

  const getAppointmentByTimeAndCourt = (
    timeStart: string,
    courtId: string = ""
  ) => {
    return shifts.find(
      (app) =>
        app.timeStart === timeStart &&
        app.date === selectedDate &&
        app.unitBusiness === courtId
    );
  };
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="overflow-x-auto">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Fecha:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horario
                </th>
                {unitBusiness.map((court) => (
                  <th
                    key={court._id}
                    className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {court.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeSlots.map((time) => (
                <tr key={time}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {time}
                  </td>
                  {unitBusiness.map((court) => {
                    const appointment = getAppointmentByTimeAndCourt(
                      time,
                      court._id
                    );
                    return (
                      <td
                        key={`${time}-${court._id}`}
                        className="px-6 py-4 whitespace-nowrap"
                      >
                        {appointment ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${getColorStatus(
                                  appointment.status
                                )}`}
                              >
                                {getStatusText(appointment.status)}
                              </span>
                              {appointment.client && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {typeof appointment.client === "string"
                                    ? appointment.client
                                    : appointment.client.firstname}
                                </p>
                              )}
                            </div>
                            {appointment.status === "scheduled" && (
                              <button
                                onClick={() =>
                                  setSelectedAppointment(appointment)
                                }
                                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                              >
                                Modificar
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => console.log("Reservar")}
                            className="text-green-600 hover:text-green-900 text-sm font-medium"
                          >
                            Reservar
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
