// src/components/Admin/ManajemenUser/PengajuanReviewer.jsx
import React, { useState, useEffect } from "react";
import { ReviewerServices } from "../../../services/Shared/ReviewerServices";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  CircleCheck,
  Delete,
  Save,
  BookCheck,
  Search
} from "lucide-react";
import Pagination from "../../Shared/Pagination";

const PengajuanReviewer = () => {
  const [pengajuan, setPengajuan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPengajuan, setSelectedPengajuan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formData, setFormData] = useState({
    status: "",
    catatan: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadPengajuan();
  }, []);

  useEffect(() => {
      setCurrentPage(1);
    }, [searchTerm, statusFilter]);

  const loadPengajuan = async () => {
    try {
      setLoading(true);
      const data = await ReviewerServices.getAllPengajuan();
      setPengajuan(data);
    } catch (error) {
      setError(error.response?.data?.message || "Tidak terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifikasi = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await ReviewerServices.verifikasiPengajuan(
        selectedPengajuan.user_id,
        {
          status: formData.status,
          catatan: formData.catatan,
        }
      );
      setSuccess(response.message);
      await loadPengajuan();
      handleCloseModal();
    } catch (error) {
      setError(
        error.response?.data?.message || "Gagal memverifikasi pengajuan"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (data) => {
    setSelectedPengajuan(data);
    setFormData({
      status: "",
      catatan: "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPengajuan(null);
    setFormData({
      status: "",
      catatan: "",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Terdaftar":
        return "text-green-600 bg-green-100";
      case "Menunggu Persetujuan":
        return "text-yellow-600 bg-yellow-100";
      case "Revisi Pengajuan":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Terdaftar":
        return <CheckCircle2 size={20} className="text-green-600" />;
      case "Menunggu Persetujuan":
        return <Clock size={20} className="text-yellow-600" />;
      case "Revisi Pengajuan":
        return <AlertCircle size={20} className="text-red-600" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredPengajuan = pengajuan.filter((item) => {
    const matchSearch =
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      statusFilter === "" || item.status_reviewer === statusFilter;
    return matchSearch && matchStatus;
  });

  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredPengajuan.slice(indexOfFirstItem, indexOfLastItem);
  };
  
  const totalPages = Math.ceil(filteredPengajuan.length / itemsPerPage);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Timer untuk auto-hide pesan setelah 3 detik
        useEffect(() => {
          if (success || error) {
            const timer = setTimeout(() => {
              setSuccess("");
              setError("");
            }, 3000);
            return () => clearTimeout(timer);
          }
        }, [success, error]);

  return (
    <div className="bg-white rounded-xl p-2 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 h-14 w-14 rounded-full flex items-center justify-center shadow-md">
          <BookCheck className="text-white" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Reviewer
          </h2>
          <p className="text-gray-600 mt-1">
            Kelola dan verifikasi pengajuan pendaftaran reviewer
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-red-50 border-l-4 border-red-500 rounded-lg shadow-sm flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-500 mt-0.5" />
          <div className="text-red-800 font-medium">{error}</div>
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-green-50 border-l-4 border-green-500 rounded-lg shadow-sm flex items-start gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-500 mt-0.5" />
          <div className="text-green-800 font-medium">{success}</div>
        </div>
      )}

      {/* Search, Filter, and Data Count Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari Reviewer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg text-gray-700 w-full sm:w-54 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Semua Status</option>
            <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
            <option value="Revisi Pengajuan">Revisi Pengajuan</option>
            <option value="Terdaftar">Terdaftar</option>
          </select>
        </div>

        {/* Data Count */}
        {!loading && (
          <div className="text-sm text-gray-600">
            Total Pengajuan:{" "}
            <span className="font-medium text-green-600">{filteredPengajuan.length}</span>
            {(searchTerm || statusFilter !== "") && (
              <span>
                {" "}
                dari <span className="font-medium text-green-600">{pengajuan.length}</span>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
       <table className="min-w-full divide-y divide-gray-200">
         <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal Pengajuan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal Disetujui
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  Memuat data...
                </td>
              </tr>
            ) : filteredPengajuan.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  {searchTerm || statusFilter
                    ? "Tidak ada hasil pencarian"
                    : "Tidak ada data pengajuan"}
                </td>
              </tr>
            ) : (
              getCurrentItems().map((item, index) => (
                <tr key={item.id}className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {item.nama}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status_reviewer)}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          item.status_reviewer
                        )}`}
                      >
                        {item.status_reviewer}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(item.tanggal_pengajuan)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(item.tanggal_disetujui)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {item.status_reviewer === "Menunggu Persetujuan" && (
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md flex items-center gap-2 transition-colors"
                      >
                        <CircleCheck className="w-5 h-5" />
                        Verifikasi
                      </button>
                    )}
                    {item.status_reviewer === "Revisi Pengajuan" && (
                      <div className="text-sm">
                        -
                      </div>
                    )}
                    {item.status_reviewer === "Terdaftar" && (
                      <div className="text-sm">
                        -
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredPengajuan.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Modal Verifikasi */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Verifikasi Pengajuan Reviewer
                  </Dialog.Title>

                  {/* User Info */}
                  <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                    <div className="text-sm">
                      <p>
                        <span className="font-medium">Nama:</span>{" "}
                        {selectedPengajuan?.nama}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {selectedPengajuan?.email}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleVerifikasi} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Status Verifikasi
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      >
                        <option value="">Pilih Status</option>
                        <option value="Disetujui">Disetujui</option>
                        <option value="Revisi">Revisi</option>
                      </select>
                    </div>

                    {formData.status === "Revisi" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Catatan Revisi
                        </label>
                        <textarea
                          value={formData.catatan}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              catatan: e.target.value,
                            })
                          }
                          rows="3"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-3 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md flex items-center gap-2 transition-colors"
                      >
                        <Delete className="w-5 h-5" />
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className={`px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md
                          hover:bg-green-700 focus:outline-none focus-visible:ring-2 
                          focus-visible:ring-green-500 focus-visible:ring-offset-2
                          flex items-center gap-2 transition-colors
                          ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <Save className="w-5 h-5" />
                        {loading ? "Memproses..." : "Simpan"}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default PengajuanReviewer;
