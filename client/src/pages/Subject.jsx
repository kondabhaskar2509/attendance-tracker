import { useEffect } from "react";
import { useContext } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { context } from "./Context";

const Subject = () => {
  const navigate = useNavigate();
  const [currentdate, setCurrentdate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth())
  );
  const year = currentdate.getFullYear();
  const month = currentdate.getMonth();
  const [attendance, setAttendance] = useState([]);
  const { name, id } = useParams();
  const { serverUrl } = useContext(context);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = {
    0: "January",
    1: "February",
    2: "March",
    3: "April",
    4: "May",
    5: "June",
    6: "July",
    7: "August",
    8: "September",
    9: "October",
    10: "November",
    11: "December",
  };
  const [key, setKey] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const presentcount = attendance.filter((a) => a.status === "present").length;
  const absentcount = attendance.filter((a) => a.status === "absent").length;
  const extracount = attendance.filter((a) => a.extra).length;

  const getdates = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const dates = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      dates.push({
        day: prevMonthDays - i,
        current: false,
        key: `p-${prevMonthDays - i}`,
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      dates.push({
        day: i,
        current: true,
        key: `c-${i}`,
      });
    }

    while (dates.length < 42) {
      dates.push({
        day: dates.length - totalDays - firstDay + 1,
        current: false,
        key: `n-${dates.length}`,
      });
    }

    return dates;
  };

  const dates = getdates(year, month);

  const fetchattendance = async () => {
    await fetch(`${serverUrl}/fetchattendance/${id}`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAttendance(data);
      });
  };

  useEffect(() => {
    fetchattendance();
  }, [id]);

  const changeattendance = async (status) => {
    let updated = Array.isArray(attendance) ? [...attendance] : [];
    const index = updated.findIndex(
      (a) => a.year === year && a.month === month && a.key === key
    );

    if (index !== -1) {
      if (status === "delete") {
        updated.splice(index, 1);
      } else if (status === "extra") {
        updated[index].extra = !updated[index].extra;
      } else {
        updated[index].status = status;
      }
    } else if (status !== "delete" && status !== "extra") {
      updated.push({ year, month, key, status, extra: false });
    }

    setAttendance(updated);

    await fetch(`${serverUrl}/changeattendance`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ id, attendance: updated }),
    });

    setKey(null);
  };

  const getColor = (d) => {
    if (!d.current) return "bg-gray-100 text-gray-400";
    const record = attendance?.find(
      (a) => a.year === year && a.month === month && a.key === d.key
    );
    const status = record?.status;
    if (status === "present") return "bg-green-400 text-white";
    if (status === "absent") return "bg-red-400 text-white";
    return "bg-white";
  };

  const deletesubject = async () => {
    await fetch(`${serverUrl}/deletesubject`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ id }),
    });
    navigate("/");
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="text-2xl text-red-600 font-semibold flex justify-center mb-5">
        {name}
      </div>

      <div className="flex justify-between ">
        <button
          onClick={() => {
            setCurrentdate((d) => new Date(d.getFullYear(), d.getMonth() - 1));
          }}
          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
          ←
        </button>

        <div className="text-center text-lg font-semibold mb-4">
          {months[month]} {year}
        </div>

        <button
          onClick={() => {
            setCurrentdate((d) => new Date(d.getFullYear(), d.getMonth() + 1));
          }}
          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
          →
        </button>
      </div>

      <div className="grid grid-cols-7 text-center font-medium mb-2">
        {days.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 ">
        {dates.map((d) => (
          <div
            key={d.key}
            onClick={(e) => d.current && setKey(d.key)}
            className={`
              h-12 flex flex-col items-center justify-center rounded
              border cursor-pointer select-none
              ${getColor(d)}
            `}>
            <span>{d.day}</span>
            {(() => {
              const record = attendance?.find(
                (a) => a.year === year && a.month === month && a.key === d.key
              );
              return record?.extra ? (
                <span className="text-[10px] font-bold">Extra</span>
              ) : null;
            })()}
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between text-sm">
        <div>
          <span className="inline-block w-3 h-3 bg-green-400 mr-2"></span>{" "}
          Present <span>({presentcount})</span>
        </div>
        <div>
          <span className="inline-block w-3 h-3 bg-red-400 mr-2"></span>Absent{" "}
          <span>({absentcount})</span>
        </div>
        <div>
          <span className="inline-block w-3 h-3 bg-yellow-400 mr-2"></span>Extra{" "}
          <span>({extracount})</span>
        </div>
      </div>

      <div className="flex justify-center mt-5">
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center justify-center text-black font-bold bg-red-300 hover:bg-red-400 rounded-md px-6 py-2">
          Delete Subject
        </button>
      </div>

      {key && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setKey(null)}>
          <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
            <div className="w-full max-w-md bg-white rounded-t-2xl p-6 shadow-xl">
              <div className="flex flex-col gap-3">
                {(() => {
                  const record = attendance.find(
                    (a) => a.year === year && a.month === month && a.key === key
                  );
                  if (!record) {
                    return ["present", "absent"].map((s) => (
                      <button
                        key={s}
                        className="w-full py-3 text-lg font-medium capitalize bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                        onClick={() => changeattendance(s)}>
                        {s}
                      </button>
                    ));
                  } else {
                    return (
                      <>
                        <button
                          className={`w-full py-3 text-lg font-medium capitalize rounded-xl transition-colors ${
                            record.extra
                              ? "bg-yellow-200"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                          onClick={() => changeattendance("extra")}>
                          {record.extra ? "Remove Extra" : "Mark as Extra"}
                        </button>
                        <button
                          className="w-full py-3 text-lg font-medium capitalize bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                          onClick={() => changeattendance("delete")}>
                          Delete
                        </button>
                      </>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={() => setShowDeleteModal(false)}>
          <div
            className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6 text-center">Delete Subject?</h3>
            <div className="flex flex-col gap-3">
              <button
                className="w-full py-3 text-lg font-medium bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                onClick={deletesubject}>
                Yes, Delete
              </button>
              <button
                className="w-full py-3 text-lg font-medium bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subject;
