// src/components/Admin/Klaster/ManajemenKlaster.jsx
import React, { useState, useEffect, useCallback } from "react";
import { KlasterServices } from "../../../services/Admin/KlasterServices";
import { TahunAnggaranServices } from "../../../services/Admin/TahunAnggaranServices";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  CirclePlus,
  CircleMinus,
  Edit,
  Trash2,
  Delete,
  Save,
  CheckCircle2,
  AlertCircle,
  Layers
} from "lucide-react";

const ManajemenKlaster = () => {
  const [klaster, setKlaster] = useState([]);
  const [tahunAnggaranList, setTahunAnggaranList] = useState([]);
  const [selectedTahunAnggaran, setSelectedTahunAnggaran] = useState("");
  const [activeTahunAnggaran, setActiveTahunAnggaran] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTahun, setLoadingTahun] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nama_klaster: "",
    kuota_pendanaan: "",
    tahun_anggaran_id: "",
    persyaratan_administratif: [""],
    output: [""],
    outcomes: [""],
  });

  useEffect(() => {
    loadTahunAnggaran();
  }, []);

  const loadTahunAnggaran = async () => {
    try {
      setLoadingTahun(true);
      
      // Load semua tahun anggaran dan tahun aktif
      const [allTahun, activeTahun] = await Promise.all([
        TahunAnggaranServices.getAllTahunAnggaran(),
        TahunAnggaranServices.getActiveTahunAnggaran()
      ]);
      
      setTahunAnggaranList(allTahun);
      setActiveTahunAnggaran(activeTahun);
      
      // Set default selected tahun: aktif dulu, kalau tidak ada ambil yang terbaru
      if (activeTahun) {
        setSelectedTahunAnggaran(activeTahun.id.toString());
      } else if (allTahun.length > 0) {
        setSelectedTahunAnggaran(allTahun[0].id.toString());
      }
    } catch (error) {
      setError("Gagal memuat tahun anggaran");
    } finally {
      setLoadingTahun(false);
    }
  };

  const loadKlaster = useCallback(async () => {
    if (!selectedTahunAnggaran) return;
    
    try {
      setLoading(true);
      const data = await KlasterServices.getKlasterByTahun(selectedTahunAnggaran);
      setKlaster(data);
    } catch (error) {
      setError(error.response?.data?.message || "Tidak terhubung ke server");
    } finally {
      setLoading(false);
    }
  }, [selectedTahunAnggaran]);

  useEffect(() => {
    loadKlaster();
  }, [loadKlaster]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Filter out empty strings and format kuota_pendanaan as number
      const cleanData = {
        ...formData,
        kuota_pendanaan: parseInt(formData.kuota_pendanaan),
        tahun_anggaran_id: parseInt(formData.tahun_anggaran_id),
        persyaratan_administratif: formData.persyaratan_administratif.filter(
          (item) => item.trim()
        ),
        output: formData.output.filter((item) => item.trim()),
        outcomes: formData.outcomes.filter((item) => item.trim()),
      };

      if (editingId) {
        const response = await KlasterServices.updateKlaster(editingId, cleanData);
        setSuccess(response.message);
      } else {
        const response = await KlasterServices.createKlaster(cleanData);
        setSuccess(response.message);
      }

      await loadKlaster();
      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus klaster ini?")) {
      try {
        const response = await KlasterServices.deleteKlaster(id);
        setSuccess(response.message);
        await loadKlaster();
      } catch (error) {
        setError(error.response?.data?.message || "Gagal menghapus klaster");
      }
    }
  };

  const handleEdit = (data) => {
    setEditingId(data.id);
    setFormData({
      nama_klaster: data.nama_klaster,
      kuota_pendanaan: data.kuota_pendanaan.toString(),
      tahun_anggaran_id: data.tahun_anggaran_id.toString(),
      persyaratan_administratif: data.persyaratan_administratif,
      output: data.output,
      outcomes: data.outcomes,
    });
    setIsModalOpen(true);
  };

  // Dynamic field handlers
  const handleAddField = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const handleRemoveField = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleFieldChange = (field, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingId(null);
      setFormData({
        nama_klaster: "",
        kuota_pendanaan: "",
        tahun_anggaran_id: "",
        persyaratan_administratif: [""],
        output: [""],
        outcomes: [""],
      });
    }, 300);
  };

  const handleTambahKlaster = () => {
    // Set default tahun anggaran saat menambah klaster baru
    setFormData(prev => ({
      ...prev,
      tahun_anggaran_id: selectedTahunAnggaran
    }));
    setIsModalOpen(true);
  };

  const getSelectedTahunInfo = () => {
    const selectedTahun = tahunAnggaranList.find(
      tahun => tahun.id.toString() === selectedTahunAnggaran
    );
    return selectedTahun;
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
          <Layers className="text-white" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Manajemen Klaster
          </h2>
          <p className="text-gray-600 mt-1">
            Kelola klaster dan persyaratan penelitian
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

      {/* Filter Tahun Anggaran */}
      
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
             
              <label className="text-sm font-medium text-gray-700">
                Tahun Anggaran:
              </label>
            </div>
            {loadingTahun ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500"></div>
                <span className="text-sm text-gray-500">Memuat...</span>
              </div>
            ) : (
              <select
                value={selectedTahunAnggaran}
                onChange={(e) => setSelectedTahunAnggaran(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Pilih Tahun Anggaran</option>
                {tahunAnggaranList.map((tahun) => (
                  <option key={tahun.id} value={tahun.id.toString()}>
                    {tahun.tahun_anggaran} 
                    {activeTahunAnggaran && tahun.id === activeTahunAnggaran.id && " (Aktif)"}
                    {tahun.status === "Selesai" && " (Selesai)"}
                  </option>
                ))}
              </select>
            )}
           
          </div>
          
          <button
            onClick={handleTambahKlaster}
            disabled={!selectedTahunAnggaran}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              !selectedTahunAnggaran 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
            title={!selectedTahunAnggaran ? 'Pilih tahun anggaran terlebih dahulu' : 'Tambah klaster baru'}
          >
            <CirclePlus size={20} />
            Tambah Klaster
          </button>
        </div>

      {/* Info & Stats */}
      {selectedTahunAnggaran && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total Klaster di tahun {getSelectedTahunInfo()?.tahun_anggaran}:{" "}
            <span className="font-medium text-green-600">{klaster.length}</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
       <table className="min-w-full divide-y divide-gray-200">
         <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">
                No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                Nama Klaster
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                Kuota Pendanaan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">
                Persyaratan Administratif
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">
                Output & Outcomes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
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
            ) : !selectedTahunAnggaran ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  Pilih tahun anggaran untuk melihat klaster
                </td>
              </tr>
            ) : klaster.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  Belum ada klaster di tahun {getSelectedTahunInfo()?.tahun_anggaran}
                </td>
              </tr>
            ) : (
              klaster.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {item.nama_klaster}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.kuota_pendanaan} Proposal
                  </td>
                  <td className="px-6 py-4">
                    <ul className="space-y-2">
                      {item.persyaratan_administratif.map((syarat, idx) => (
                        <li
                          key={idx}
                          className="grid"
                          style={{ gridTemplateColumns: "1.5rem auto" }}
                        >
                          <span className="text-sm text-gray-600">
                            {idx + 1}.
                          </span>
                          <span className="text-sm text-gray-900">{syarat}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-3">
                      {/* Output */}
                      <div>
                        <h5 className="text-xs font-medium text-gray-600 mb-1">
                          Output:
                        </h5>
                        <ul className="space-y-1">
                          {item.output.map((out, idx) => (
                            <li
                              key={idx}
                              className="grid"
                              style={{ gridTemplateColumns: "1.5rem auto" }}
                            >
                              <span className="text-xs text-gray-600">
                                {idx + 1}.
                              </span>
                              <span className="text-xs text-gray-900">{out}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Outcomes */}
                      <div>
                        <h5 className="text-xs font-medium text-gray-600 mb-1">
                          Outcomes:
                        </h5>
                        <ul className="space-y-1">
                          {item.outcomes.map((outcome, idx) => (
                            <li
                              key={idx}
                              className="grid"
                              style={{ gridTemplateColumns: "1.5rem auto" }}
                            >
                              <span className="text-xs text-gray-600">
                                {idx + 1}.
                              </span>
                              <span className="text-xs text-gray-900">
                                {outcome}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    {editingId ? "Edit Klaster" : "Tambah Klaster"}
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Tahun Anggaran */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tahun Anggaran
                      </label>
                      <select
                        value={formData.tahun_anggaran_id}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            tahun_anggaran_id: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      >
                        <option value="">Pilih Tahun Anggaran</option>
                        {tahunAnggaranList.map((tahun) => (
                          <option key={tahun.id} value={tahun.id.toString()}>
                            {tahun.tahun_anggaran} 
                            {activeTahunAnggaran && tahun.id === activeTahunAnggaran.id && " (Aktif)"}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Nama Klaster */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nama Klaster
                      </label>
                      <input
                        type="text"
                        value={formData.nama_klaster}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            nama_klaster: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>

                    {/* Kuota Pendanaan */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Kuota Pendanaan
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.kuota_pendanaan}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            kuota_pendanaan: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>

                    {/* Persyaratan Administratif */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Persyaratan Administratif
                      </label>
                      {formData.persyaratan_administratif.map((syarat, index) => (
                        <div key={index} className="flex gap-2 mt-2">
                          <span className="mt-2">{index + 1}.</span>
                          <input
                            type="text"
                            value={syarat}
                            onChange={(e) =>
                              handleFieldChange(
                                "persyaratan_administratif",
                                index,
                                e.target.value
                              )
                            }
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveField("persyaratan_administratif", index)
                            }
                            className="text-red-600 hover:text-red-800"
                          >
                            <CircleMinus size={20} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddField("persyaratan_administratif")}
                        className="mt-2 ml-6 flex items-center text-sm text-green-600 hover:text-green-800"
                      >
                        <CirclePlus size={20} className="mr-1" />
                        Tambah Persyaratan
                      </button>
                    </div>

                    {/* Output */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Output
                      </label>
                      {formData.output.map((output, index) => (
                        <div key={index} className="flex gap-2 mt-2">
                          <span className="mt-2">{index + 1}.</span>
                          <input
                            type="text"
                            value={output}
                            onChange={(e) =>
                              handleFieldChange("output", index, e.target.value)
                            }
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveField("output", index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <CircleMinus size={20} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddField("output")}
                        className="mt-2 ml-6 flex items-center text-sm text-green-600 hover:text-green-800"
                      >
                        <CirclePlus size={20} className="mr-1" />
                        Tambah Output
                      </button>
                    </div>

                    {/* Outcomes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Outcomes
                      </label>
                      {formData.outcomes.map((outcome, index) => (
                        <div key={index} className="flex gap-2 mt-2">
                          <span className="mt-2">{index + 1}.</span>
                          <input
                            type="text"
                            value={outcome}
                            onChange={(e) =>
                              handleFieldChange("outcomes", index, e.target.value)
                            }
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveField("outcomes", index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <CircleMinus size={20} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddField("outcomes")}
                        className="mt-2 ml-6 flex items-center text-sm text-green-600 hover:text-green-800"
                      >
                        <CirclePlus size={20} className="mr-1" />
                        Tambah Outcomes
                      </button>
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

export default ManajemenKlaster;