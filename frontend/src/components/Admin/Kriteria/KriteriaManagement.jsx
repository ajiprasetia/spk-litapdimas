// src/components/Admin/Kriteria/KriteriaManagement.jsx
import React, { useState, useEffect } from "react";
import { KriteriaServices } from "../../../services/Admin/KriteriaServices";
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
  LayoutList

} from "lucide-react";

const Kriteria = () => {
  const [kriteria, setKriteria] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [nextKode, setNextKode] = useState("");
  const [isBobotExist, setIsBobotExist] = useState(false);
  const [formData, setFormData] = useState({
    nama_kriteria: "",
  });

  useEffect(() => {
    loadKriteria();
    checkBobotExists();
  }, []);

  const checkBobotExists = async () => {
    try {
      const data = await KriteriaServices.getAllKriteria();
      const hasBobot = data.some((item) => item.bobot > 0);
      setIsBobotExist(hasBobot);
    } catch (error) {
      console.error("Error checking bobot:", error);
    }
  };

  const loadKriteria = async () => {
    try {
      setLoading(true);
      const data = await KriteriaServices.getAllKriteria();
      setKriteria(data);
      // Update status bobot
      const hasBobot = data.some((item) => item.bobot > 0);
      setIsBobotExist(hasBobot);
    } catch (error) {
      setError(error.response?.data?.message || "Tidak terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  const loadNextKode = async () => {
    try {
      const response = await KriteriaServices.getNextKodeKriteria();
      setNextKode(response.kode);
    } catch (error) {
      console.error("Error loading next kode:", error);
    }
  };

  const handleOpenModal = async (isEdit = false, data = null) => {
    if (isEdit) {
      setEditingId(data.id);
      setFormData({
        nama_kriteria: data.nama_kriteria,
        kode_kriteria: data.kode_kriteria,
      });
    } else {
      await loadNextKode();
      setFormData({
        nama_kriteria: "",
        kode_kriteria: nextKode,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (editingId) {
        const response = await KriteriaServices.updateKriteria(
          editingId,
          formData
        );
        setSuccess(response.message);
      } else {
        if (isBobotExist) {
          setError("Tidak dapat menambah kriteria karena bobot sudah dihitung");
          return;
        }
        const response = await KriteriaServices.createKriteria(formData);
        setSuccess(response.message);
      }

      await loadKriteria();
      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (isBobotExist) {
      setError("Tidak dapat menghapus kriteria karena bobot sudah dihitung");
      return;
    }

    if (window.confirm("Apakah Anda yakin ingin menghapus kriteria ini?")) {
      try {
        const response = await KriteriaServices.deleteKriteria(id);
        setSuccess(response.message);
        await loadKriteria();
        checkBobotExists();
      } catch (error) {
        setError(error.response?.data?.message || "Gagal menghapus kriteria");
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingId(null);
      setFormData({
        nama_kriteria: "",
      });
    }, 300);
  };

  const getTotalBobot = () => {
    return kriteria.reduce((sum, item) => sum + Number(item.bobot || 0), 0);
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
        <div className="bg-gradient-to-br from-green-500 to-green-600 h-14 w-14 rounded-full flex items-center justify-center shadow-md">
          <LayoutList className="text-white" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Kriteria
          </h2>
          <p className="text-gray-600 mt-1">
            Kelola kriteria penilaian untuk proposal penelitian
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

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Total Bobot:{" "}
          <span className="font-medium text-green-600">
            {Math.min(getTotalBobot(), 100).toFixed(2)}%
          </span>
        </div>
        <button
          onClick={() => handleOpenModal()}
          disabled={isBobotExist}
          className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2
            ${isBobotExist ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <CirclePlus size={20} />
          Tambah Kriteria
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
       <table className="min-w-full divide-y divide-gray-200">
         <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Kriteria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bobot
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Memuat data...
                </td>
              </tr>
            ) : kriteria.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Belum ada kriteria
                </td>
              </tr>
            ) : (
              kriteria.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold whitespace-nowrap">
                    {item.kode_kriteria}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.nama_kriteria}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    {item.bobot ? `${item.bobot}%` : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenModal(true, item)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={isBobotExist}
                      className={`text-red-600 hover:text-red-900
                        ${isBobotExist ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isBobotExist && (
        <div className="text-sm text-red-600 flex items-center gap-2">
          <AlertCircle size={20} />
          Fungsi tambah dan hapus kriteria dinonaktifkan karena bobot sudah
          dihitung. Silahkan reset bobot di menu bobot kriteria mengaktifkan
          kembali
        </div>
      )}

      {/* Form Modal */}
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
                    {editingId ? "Edit Kriteria" : "Tambah Kriteria"}
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Kode Kriteria
                      </label>
                      <input
                        type="text"
                        value={editingId ? formData.kode_kriteria : nextKode}
                        className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-100 shadow-sm"
                        disabled
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nama Kriteria
                      </label>
                      <input
                        type="text"
                        value={formData.nama_kriteria}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nama_kriteria: e.target.value,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>

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
                        className={`px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md
                          hover:bg-green-700 focus:outline-none focus-visible:ring-2 
                          focus-visible:ring-green-500 focus-visible:ring-offset-2
                          flex items-center gap-2 transition-colors
                          ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
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

export default Kriteria;
