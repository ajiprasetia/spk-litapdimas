// src/components/Admin/Kriteria/SubKriteria.jsx
import React, { useState, useEffect } from "react";
import { SubKriteriaServices } from "../../../services/Admin/SubKriteriaServices";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  CirclePlus,
  Edit,
  Trash2,
  AlertCircle,
  Delete,
  Save,
  CheckCircle2,
  ListFilter
} from "lucide-react";

const TIPE_OPTIONS = ["Low", "Middle", "High"];

const SubKriteria = () => {
  const [kriteria, setKriteria] = useState([]);
  const [subKriteria, setSubKriteria] = useState([]);
  const [selectedKriteria, setSelectedKriteria] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    kriteria_id: "",
    tipe: "Low",
    skor: "",
    deskripsi: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await SubKriteriaServices.getAllSubKriteria();
      setKriteria(response.kriteria);
      setSubKriteria(response.subKriteria);
      if (response.kriteria.length > 0) {
        setSelectedKriteria(response.kriteria[0]);
      }
    } catch (error) {
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleKriteriaChange = (kriteriaId) => {
    const selected = kriteria.find((k) => k.id === parseInt(kriteriaId));
    setSelectedKriteria(selected);
  };

  const getSkorRange = (tipe, bobot) => {
    const bobotValue = Math.round(bobot * 100);

    const ranges = {
      Low: {
        min: 1,
        max: Math.round(bobotValue / 3),
      },
      Middle: {
        min: Math.round(bobotValue / 3) + 1,
        max: Math.round((bobotValue * 2) / 3),
      },
      High: {
        min: Math.round((bobotValue * 2) / 3) + 1,
        max: bobotValue,
      },
    };

    return ranges[tipe];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = {
        ...formData,
        kriteria_id: selectedKriteria.id,
      };

      if (editingId) {
        const response = await SubKriteriaServices.updateSubKriteria(
          editingId,
          data
        );
        setSubKriteria(response.data);
        setSuccess(response.message);
      } else {
        const response = await SubKriteriaServices.createSubKriteria(data);
        setSubKriteria(response.data);
        setSuccess(response.message);
      }

      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (data = null) => {
    if (data) {
      setEditingId(data.id);
      setFormData({
        tipe: data.tipe,
        skor: data.skor,
        deskripsi: data.deskripsi,
      });
    } else {
      setFormData({
        tipe: "Low",
        skor: "",
        deskripsi: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingId(null);
      setFormData({
        tipe: "Low",
        skor: "",
        deskripsi: "",
      });
    }, 300);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus sub kriteria ini?")) {
      try {
        await SubKriteriaServices.deleteSubKriteria(id);
        setSuccess("Sub kriteria berhasil dihapus");
        loadData();
      } catch (error) {
        setError("Gagal menghapus sub kriteria");
      }
    }
  };

  const filteredSubKriteria = subKriteria.filter(
    (sk) => sk.kriteria_id === selectedKriteria?.id
  );

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
          <ListFilter className="text-white" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Sub Kriteria
          </h2>
          <p className="text-gray-600 mt-1">
            Kelola parameter penilaian untuk setiap kriteria
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

      {/* Kriteria Selector */}
      <div className="flex items-center justify-between gap-4">
        <select
          value={selectedKriteria?.id || ""}
          onChange={(e) => handleKriteriaChange(e.target.value)}
          className="px-4 py-2 border rounded-lg w-full max-w-md flex-grow focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {kriteria.map((k) => (
            <option key={k.id} value={k.id}>
              {k.kode_kriteria} - {k.nama_kriteria} (Bobot: {k.bobot}%)
            </option>
          ))}
        </select>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 flex-shrink-0"
        >
          <CirclePlus size={20} />
          Tambah Sub Kriteria
        </button>
      </div>

      {selectedKriteria && (
        <div className="bg-blue-50 border border-blue-400 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Range Skor:</h4>
          <div className="grid grid-cols-3 gap-4 text-sm text-blue-600">
            {TIPE_OPTIONS.map((tipe) => {
              const range = getSkorRange(tipe, selectedKriteria.bobot / 100);
              return (
                <div key={tipe}>
                  <span className="font-medium">{tipe}:</span>{" "}
                  {range.min.toFixed(2)} - {range.max.toFixed(2)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub Kriteria Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
       <table className="min-w-full divide-y divide-gray-200">
         <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipe
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Skor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deskripsi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
            ) : filteredSubKriteria.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Belum ada Sub kriteria
                </td>
              </tr>
            ) : (
              filteredSubKriteria.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium
            ${
              item.tipe === "Low"
                ? "bg-red-100 text-red-800"
                : item.tipe === "Middle"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
                    >
                      {item.tipe}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.skor}</td>
                  <td className="px-6 py-4">{item.deskripsi}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
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
                    {editingId ? "Edit Sub Kriteria" : "Tambah Sub Kriteria"}
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tipe
                      </label>
                      <select
                        value={formData.tipe}
                        onChange={(e) =>
                          setFormData({ ...formData, tipe: e.target.value })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      >
                        {TIPE_OPTIONS.map((tipe) => (
                          <option key={tipe} value={tipe}>
                            {tipe}
                          </option>
                        ))}
                      </select>
                      {selectedKriteria && (
                        <p className="mt-1 text-sm text-gray-500">
                          Range skor:{" "}
                          {getSkorRange(
                            formData.tipe,
                            selectedKriteria.bobot / 100
                          ).min.toFixed(2)}{" "}
                          -
                          {getSkorRange(
                            formData.tipe,
                            selectedKriteria.bobot / 100
                          ).max.toFixed(2)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Skor
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.skor}
                        onChange={(e) =>
                          setFormData({ ...formData, skor: e.target.value })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Deskripsi
                      </label>
                      <textarea
                        value={formData.deskripsi}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            deskripsi: e.target.value,
                          })
                        }
                        rows="3"
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

export default SubKriteria;
