// src/components/Admin/Klaster/TahunAnggaran.jsx
import React, { useState, useEffect } from "react";
import { TahunAnggaranServices } from "../../../services/Admin/TahunAnggaranServices";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  CirclePlus,
  Edit,
  Trash2,
  Delete,
  Save,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar
} from "lucide-react";

const TahunAnggaran = () => {
  const [tahunAnggaran, setTahunAnggaran] = useState([]);
  const [activeTahunAnggaran, setActiveTahunAnggaran] = useState(null);
  const [loadingActive, setLoadingActive] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    tahun_anggaran: "",
    total_anggaran: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    deskripsi: "",
  });

  useEffect(() => {
    loadTahunAnggaran();
    loadActiveTahunAnggaran();
  }, []);

  const loadTahunAnggaran = async () => {
    try {
      setLoading(true);
      const data = await TahunAnggaranServices.getAllTahunAnggaran();
      setTahunAnggaran(data);
    } catch (error) {
      setError(error.response?.data?.message || "Tidak terhubung ke server");
    } finally {
      setLoading(false);
    }
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

  const loadActiveTahunAnggaran = async () => {
    try {
      setLoadingActive(true);
      const data = await TahunAnggaranServices.getActiveTahunAnggaran();
      setActiveTahunAnggaran(data);
    } catch (error) {
      // Tidak perlu error handling karena bisa saja memang tidak ada tahun aktif
      setActiveTahunAnggaran(null);
    } finally {
      setLoadingActive(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const cleanData = {
        ...formData,
        total_anggaran: parseCurrency(formData.total_anggaran),
      };

      if (editingId) {
        const response = await TahunAnggaranServices.updateTahunAnggaran(editingId, cleanData);
        setSuccess(response.message);
      } else {
        const response = await TahunAnggaranServices.createTahunAnggaran(cleanData);
        setSuccess(response.message);
      }

      await loadTahunAnggaran();
      await loadActiveTahunAnggaran();
      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus tahun anggaran ini?")) {
      try {
        const response = await TahunAnggaranServices.deleteTahunAnggaran(id);
        setSuccess(response.message);
        await loadTahunAnggaran();
        await loadActiveTahunAnggaran();
      } catch (error) {
        setError(error.response?.data?.message || "Gagal menghapus tahun anggaran");
      }
    }
  };

  const handleEdit = (data) => {
    setEditingId(data.id);
    setFormData({
      tahun_anggaran: data.tahun_anggaran.toString(),
      total_anggaran: formatCurrency(data.total_anggaran),
      tanggal_mulai: formatDateForInput(data.tanggal_mulai),
      tanggal_selesai: formatDateForInput(data.tanggal_selesai),
      deskripsi: data.deskripsi || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingId(null);
      setFormData({
        tahun_anggaran: "",
        total_anggaran: "",
        tanggal_mulai: "",
        tanggal_selesai: "",
        deskripsi: "",
      });
    }, 300);
  };

  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("id-ID").format(value);
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    // Convert database date to YYYY-MM-DD format for input
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const parseCurrency = (currencyString) => {
    if (!currencyString) return 0;
    // Remove all non-numeric characters except dots and convert to number
    // Since Indonesian format uses dots as thousand separator, we need to handle it properly
    const cleanedString = currencyString.replace(/\./g, '').replace(/,/g, '');
    return parseFloat(cleanedString) || 0;
  };

  const handleCurrencyChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData(prev => ({
      ...prev,
      total_anggaran: formatCurrency(value)
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Aktif':
        return (
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-green-600" />
            <span className="px-2 py-1 rounded-full text-xs font-semibold text-green-600 bg-green-100">
              {status}
            </span>
          </div>
        );
      case 'Selesai':
        return (
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-gray-600" />
            <span className="px-2 py-1 rounded-full text-xs font-semibold text-gray-600 bg-gray-100">
              {status}
            </span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-green-600" />
            <span className="px-2 py-1 rounded-full text-xs font-semibold text-green-600 bg-green-50">
              {status}
            </span>
          </div>
        );
    }
  };

  const formatPeriode = (tanggalMulai, tanggalSelesai) => {
    const formatDate = (date) => {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    };
    return `${formatDate(tanggalMulai)} - ${formatDate(tanggalSelesai)}`;
  };

  return (
    <div className="bg-white rounded-xl p-2 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 h-14 w-14 rounded-full flex items-center justify-center shadow-md">
          <Calendar className="text-white" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Tahun Anggaran
          </h2>
          <p className="text-gray-600 mt-1">
            Kelola Tahun Anggaran
          </p>
        </div>
      </div>

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

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-sm text-gray-600">Tahun Anggaran Aktif:</span>
          {loadingActive ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500"></div>
              <span className="text-sm text-gray-500">Memuat...</span>
            </div>
          ) : activeTahunAnggaran ? (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1 w-fit">
              <CheckCircle2 className="w-4 h-4" />
              {activeTahunAnggaran.tahun_anggaran}
            </span>
          ) : (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium flex items-center gap-1 w-fit">
              <AlertCircle className="w-4 h-4" />
              Tidak ada tahun aktif
            </span>
          )}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={activeTahunAnggaran}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 w-fit transition-colors ${
            activeTahunAnggaran 
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60' 
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
          title={activeTahunAnggaran ? 'Tidak dapat menambah tahun anggaran karena masih ada tahun yang aktif' : 'Tambah tahun anggaran baru'}
        >
          <CirclePlus size={20} />
          Tambah Tahun Anggaran
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
       <table className="min-w-full divide-y divide-gray-200">
         <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">
                No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                Tahun
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                Total Anggaran
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                Periode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">
                Keterangan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  Memuat data...
                </td>
              </tr>
            ) : tahunAnggaran.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  Belum ada tahun anggaran
                </td>
              </tr>
            ) : (
              tahunAnggaran.map((item, index) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {item.tahun_anggaran}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      Rp {formatCurrency(item.total_anggaran)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPeriode(item.tanggal_mulai, item.tanggal_selesai)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.deskripsi || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    {editingId ? "Edit Tahun Anggaran" : "Tambah Tahun Anggaran"}
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Tahun Anggaran */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tahun Anggaran
                      </label>
                      <input
                        type="number"
                        min="2020"
                        max="2030"
                        value={formData.tahun_anggaran}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            tahun_anggaran: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="2024"
                        required
                      />
                    </div>

                    {/* Total Anggaran */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Total Anggaran (Rp)
                      </label>
                      <input
                        type="text"
                        value={formData.total_anggaran}
                        onChange={handleCurrencyChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="1,000,000,000"
                        required
                      />
                    </div>

                    {/* Tanggal Mulai */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tanggal Mulai
                      </label>
                      <input
                        type="date"
                        value={formData.tanggal_mulai}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            tanggal_mulai: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>

                    {/* Tanggal Selesai */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tanggal Selesai
                      </label>
                      <input
                        type="date"
                        value={formData.tanggal_selesai}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            tanggal_selesai: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>

                    {/* Deskripsi */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Keterangan
                      </label>
                      <textarea
                        value={formData.deskripsi}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            deskripsi: e.target.value,
                          }))
                        }
                        rows="3"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Deskripsi tahun anggaran..."
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-red-700 text-sm">{error}</span>
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md flex items-center gap-2 transition-colors"
                      >
                        <Delete className="w-5 h-5" />
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className={`px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 flex items-center gap-2 transition-colors ${
                          loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <Save className="w-5 h-5" />
                        {loading ? "Menyimpan..." : "Simpan"}
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

export default TahunAnggaran;