import { useEffect, useState, useCallback } from "react";
import { LogIn, LogOut, Download, Search } from "lucide-react";
import toast from "react-hot-toast";
import { attendanceService } from "../services";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import TableSkeleton from "../components/TableSkeleton";
import { formatDate, formatTime, getWorkingHoursDisplay, getDayTypeDisplay, downloadBlob } from "../utils/helpers";

const Attendance = () => {
  const { isAdmin } = useAuth();
  const [todayRecord, setTodayRecord] = useState(null);
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      if (isAdmin) {
        const { data } = await attendanceService.getAll({ page, limit: 10, search, date: filterDate });
        setRecords(data.data.records);
        setPagination(data.data.pagination);
      } else {
        const [todayRes, myRes] = await Promise.all([
          attendanceService.getToday(),
          attendanceService.getMy({ page, limit: 10 }),
        ]);
        setTodayRecord(todayRes.data.data);
        setRecords(myRes.data.data.records);
        setPagination(myRes.data.data.pagination);
      }
    } catch {
      toast.error("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, search, filterDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await attendanceService.checkIn();
      toast.success("Checked in successfully!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Check-in failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await attendanceService.checkOut();
      toast.success("Checked out successfully!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Check-out failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await attendanceService.export({ date: filterDate });
      downloadBlob(res.data, "attendance.csv");
      toast.success("Attendance exported");
    } catch {
      toast.error("Export failed");
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Attendance"
        subtitle={isAdmin ? "View and manage all attendance records" : "Mark your attendance and view history"}
        action={isAdmin && <button onClick={handleExport} className="btn-secondary inline-flex items-center gap-2"><Download className="w-4 h-4" /> Export CSV</button>}
      />

      {!isAdmin && (
        <div className="card p-6 mb-6">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Today's Attendance</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              {todayRecord?.checkIn ? (
                <div className="space-y-1">
                  <p className="text-sm text-slate-600">Check In: <span className="font-medium">{formatTime(todayRecord.checkIn)}</span></p>
                  {todayRecord.checkOut && <p className="text-sm text-slate-600">Check Out: <span className="font-medium">{formatTime(todayRecord.checkOut)}</span></p>}
                  <p className="text-sm text-slate-600">Working Hours: <span className="font-medium">{getWorkingHoursDisplay(todayRecord)}</span></p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">You haven't checked in today</p>
              )}
            </div>
            <div className="flex gap-3">
              {!todayRecord?.checkIn && (
                <button onClick={handleCheckIn} disabled={actionLoading} className="btn-primary inline-flex items-center gap-2">
                  <LogIn className="w-4 h-4" /> Check In
                </button>
              )}
              {todayRecord?.checkIn && !todayRecord?.checkOut && (
                <button onClick={handleCheckOut} disabled={actionLoading} className="btn-primary inline-flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Check Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="card mb-6 p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="pl-10" placeholder="Search by employee..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="sm:w-48" />
        </div>
      )}

      <div className="card">
        {loading ? <TableSkeleton /> : records.length === 0 ? (
          <EmptyState title="No attendance records" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead><tr>
                {isAdmin && <th>Employee</th>}
                <th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Day Type</th><th>Status</th>
              </tr></thead>
              <tbody>
                {records.map((r) => {
                  const dayType = getDayTypeDisplay(r);
                  const emp = r.employeeId;
                  return (
                    <tr key={r._id}>
                      {isAdmin && <td>{emp ? `${emp.firstName} ${emp.lastName}` : "—"}</td>}
                      <td>{formatDate(r.date)}</td>
                      <td>{formatTime(r.checkIn)}</td>
                      <td>{formatTime(r.checkOut)}</td>
                      <td>{getWorkingHoursDisplay(r)}</td>
                      <td>{dayType.label !== "—" && <span className={`badge ${dayType.className}`}>{dayType.label}</span>}</td>
                      <td><span className={`badge ${r.status === "PRESENT" ? "badge-success" : "badge-danger"}`}>{r.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={fetchData} />
      </div>
    </div>
  );
};

export default Attendance;
