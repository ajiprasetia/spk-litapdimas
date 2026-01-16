// src/components/User/Peneliti/Proposal.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { 
  CirclePlus, 
  CircleX, 
  CircleCheck, 
  Clock, 
  AlertCircle, 
  Eye, 
  FileText,
  Delete,
  Save,
  CheckCircle2
} from "lucide-react";
import ProposalServices from "../../../services/Shared/ProposalServices";
import { TahunAnggaranServices } from "../../../services/Admin/TahunAnggaranServices";

const Proposal = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);

  // Tahun Anggaran State
  const [tahunAnggaranList, setTahunAnggaranList] = useState([]);
  const [selectedTahunAnggaran, setSelectedTahunAnggaran] = useState("");
  const [activeTahunAnggaran, setActiveTahunAnggaran] = useState(null);
  const [loadingTahun, setLoadingTahun] = useState(false);

  // Klaster State
  const [klasterList, setKlasterList] = useState([]);
  const [loadingKlaster, setLoadingKlaster] = useState(false);

  const [formData, setFormData] = useState({
    tahun_anggaran_id: "",
    judul: "",
    klaster_id: "",
    bidang_ilmu: "",
    outline: "",
  });

  const [files, setFiles] = useState({
    file_proposal: null,
    file_rab: null,
  });

  const bidangIlmuOptions = [
    "Tarbiyah dan Keguruan",
    "Ushuluddin",
    "Psikologi",
    "Ekonomi dan Ilmu Sosial",
    "Syariah dan Ilmu Hukum",
    "Dakwah dan Ilmu Komunikasi",
    "Sains dan Teknologi",
    "Pertanian dan Peternakan",
  ];

  // Load tahun anggaran
  useEffect(() => {
    const loadTahunAnggaran = async () => {
      try {
        setLoadingTahun(true);
        const [allTahun, activeTahun] = await Promise.all([
          TahunAnggaranServices.getAllTahunAnggaran(),
          TahunAnggaranServices.getActiveTahunAnggaran()
        ]);

        setTahunAnggaranList(allTahun);
        setActiveTahunAnggaran(activeTahun);

        // Set default to active tahun anggaran only on first load
        if (activeTahun && selectedTahunAnggaran === "") {
          setSelectedTahunAnggaran(activeTahun.id.toString());
        }
      } catch (error) {
        console.error("Error loading tahun anggaran:", error);
        setError("Gagal memuat tahun anggaran");
      } finally {
        setLoadingTahun(false);
      }
    };

    loadTahunAnggaran();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load klaster berdasarkan tahun anggaran untuk filter utama
  const loadKlaster = useCallback(async () => {
    if (!selectedTahunAnggaran) {
      setKlasterList([]);
      return;
    }

    try {
      setLoadingKlaster(true);
      const klasterData = await ProposalServices.getKlasterByTahunAnggaran(selectedTahunAnggaran);
      setKlasterList(klasterData);
    } catch (error) {
      console.error("Error loading klaster:", error);
      setKlasterList([]);
    } finally {
      setLoadingKlaster(false);
    }
  }, [selectedTahunAnggaran]);

  useEffect(() => {
    loadKlaster();
  }, [loadKlaster]);

  // Load klaster untuk modal berdasarkan tahun anggaran yang dipilih di form
  const loadKlasterForModal = useCallback(async (tahunAnggaranId) => {
    if (!tahunAnggaranId) {
      setKlasterList([]);
      return;
    }

    try {
      setLoadingKlaster(true);
      const klasterData = await ProposalServices.getKlasterByTahunAnggaran(tahunAnggaranId);
      setKlasterList(klasterData);
    } catch (error) {
      console.error("Error loading klaster for modal:", error);
      setKlasterList([]);
    } finally {
      setLoadingKlaster(false);
    }
  }, []);

  // Load proposal berdasarkan tahun anggaran
  const loadProposals = useCallback(async () => {
    if (!selectedTahunAnggaran) {
      setProposals([]);
      return;
    }

    try {
      setLoading(true);
      const data = await ProposalServices.getAllProposal(selectedTahunAnggaran);
      setProposals(data);
    } catch (error) {
      console.error("Error loading proposals:", error);
      setError("Gagal memuat data proposal");
    } finally {
      setLoading(false);
    }
  }, [selectedTahunAnggaran]);

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      Object.keys(files).forEach((key) => {
        if (files[key]) {
          formDataToSend.append(key, files[key]);
        }
      });

      const response = await ProposalServices.createProposal(formDataToSend);
      setSuccess(response.message);
      await loadProposals();
      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.message || "Gagal mengajukan proposal");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (id) => {
    try {
      const data = await ProposalServices.getProposalById(id);
      setSelectedProposal(data);
      setIsDetailModalOpen(true);
    } catch (error) {
      setError("Gagal memuat detail proposal");
    }
  };

  const handleTambahProposal = () => {
    // Set default tahun anggaran saat menambah proposal baru
    const defaultTahunAnggaran = selectedTahunAnggaran;
    setFormData(prev => ({
      ...prev,
      tahun_anggaran_id: defaultTahunAnggaran,
      klaster_id: "" // Reset klaster saat buka modal
    }));
    
    // Load klaster untuk tahun anggaran yang dipilih
    if (defaultTahunAnggaran) {
      loadKlasterForModal(defaultTahunAnggaran);
    }
    
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setFormData({
        tahun_anggaran_id: "",
        judul: "",
        klaster_id: "",
        bidang_ilmu: "",
        outline: "",
      });
      setFiles({
        file_proposal: null,
        file_rab: null,
      });
      // Reset klaster list ke yang sesuai dengan filter utama
      if (selectedTahunAnggaran) {
        loadKlaster();
      } else {
        setKlasterList([]);
      }
    }, 300);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setTimeout(() => {
      setSelectedProposal(null);
    }, 300);
  };

  const getSelectedTahunInfo = () => {
    const selectedTahun = tahunAnggaranList.find(
      tahun => tahun.id.toString() === selectedTahunAnggaran
    );
    return selectedTahun;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Belum Diperiksa":
        return <Clock size={20} className="text-gray-600" />;
      case "Ditolak":
        return <CircleX size={20} className="text-red-600" />;
      case "Tahap Review":
        return <AlertCircle size={20} className="text-blue-600" />;
      case "Dalam Evaluasi Akhir":
        return <Clock size={20} className="text-yellow-600" />;
      case "Lolos Pendanaan":
        return <CircleCheck size={20} className="text-green-600" />;
      case "Tidak Lolos Pendanaan":
        return <CircleX size={20} className="text-red-600" />;
      default:
        return <Clock size={20} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Belum Diperiksa":
        return "text-gray-600 bg-gray-100";
      case "Ditolak":
        return "text-red-600 bg-red-100";
      case "Tahap Review":
        return "text-blue-600 bg-blue-100";
      case "Dalam Evaluasi Akhir":
        return "text-yellow-600 bg-yellow-100";
      case "Lolos Pendanaan":
        return "text-green-600 bg-green-100";
      case "Tidak Lolos Pendanaan":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
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

  return (
     <div className="bg-white rounded-xl p-2 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 h-14 w-14 rounded-full flex items-center justify-center shadow-md">
          <FileText className="text-white" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Proposal Penelitian
          </h2>
          <p className="text-gray-600 mt-1">
            Kelola dan ajukan proposal penelitian Anda
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
          onClick={handleTambahProposal}
          disabled={!selectedTahunAnggaran}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            !selectedTahunAnggaran
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
          title={!selectedTahunAnggaran ? 'Pilih tahun anggaran terlebih dahulu' : 'Tambah proposal baru'}
        >
          <CirclePlus size={20} />
          Tambah Proposal
        </button>
      </div>

      {/* Info & Stats */}
      {selectedTahunAnggaran && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total Proposal di tahun {getSelectedTahunInfo()?.tahun_anggaran}:{" "}
            <span className="font-medium text-green-600">{proposals.length}</span>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">
                Judul Proposal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                Klaster
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                Bidang Ilmu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                Tanggal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                Detail
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
            ) : !selectedTahunAnggaran ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  Pilih tahun anggaran untuk melihat proposal
                </td>
              </tr>
            ) : proposals.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  Belum ada proposal di tahun {getSelectedTahunInfo()?.tahun_anggaran}
                </td>
              </tr>
            ) : (
              proposals.map((proposal, index) => (
                <tr key={proposal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="font-medium">{proposal.judul}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {proposal.nama_klaster}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {proposal.bidang_ilmu}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(proposal.status)}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          proposal.status
                        )}`}
                      >
                        {proposal.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(proposal.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleOpenDetail(proposal.id)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                    >
                      <Eye size={20} />
                      <span className="text-sm">Detail</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah Proposal */}
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
                    Tambah Proposal
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Tahun Anggaran */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tahun Anggaran
                      </label>
                      <select
                        value={formData.tahun_anggaran_id}
                        onChange={(e) => {
                          const newTahunAnggaranId = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            tahun_anggaran_id: newTahunAnggaranId,
                            klaster_id: "", // Reset klaster when tahun anggaran changes
                          }));
                          
                          // Load klaster for the new tahun anggaran
                          if (newTahunAnggaranId) {
                            loadKlasterForModal(newTahunAnggaranId);
                          } else {
                            setKlasterList([]);
                          }
                        }}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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

                    {/* Judul */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Judul Proposal
                      </label>
                      <input
                        type="text"
                        value={formData.judul}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            judul: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>

                    {/* Klaster */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Klaster
                      </label>
                      {loadingKlaster ? (
                        <div className="mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                          Memuat klaster...
                        </div>
                      ) : (
                        <select
                          value={formData.klaster_id}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              klaster_id: e.target.value,
                            }))
                          }
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                          disabled={!formData.tahun_anggaran_id}
                        >
                          <option value="">
                            {!formData.tahun_anggaran_id 
                              ? "Pilih tahun anggaran terlebih dahulu" 
                              : klasterList.length === 0
                              ? "Tidak ada klaster untuk tahun anggaran ini"
                              : "Pilih Klaster"}
                          </option>
                          {klasterList.map((klaster) => (
                            <option key={klaster.id} value={klaster.id.toString()}>
                              {klaster.nama_klaster}
                            </option>
                          ))}
                        </select>
                      )}
                      {formData.tahun_anggaran_id && klasterList.length === 0 && !loadingKlaster && (
                        <p className="mt-1 text-sm text-amber-600">
                          Belum ada klaster yang tersedia untuk tahun anggaran ini. 
                    
                        </p>
                      )}
                    </div>

                    {/* Bidang Ilmu */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Bidang Ilmu
                      </label>
                      <select
                        value={formData.bidang_ilmu}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            bidang_ilmu: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      >
                        <option value="">Pilih Bidang Ilmu</option>
                        {bidangIlmuOptions.map((bidang) => (
                          <option key={bidang} value={bidang}>
                            {bidang}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Outline */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Outline Proposal
                      </label>
                      <textarea
                        value={formData.outline}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            outline: e.target.value,
                          }))
                        }
                        rows={4}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>

                    {/* File Proposal */}
                                       <div>
                      <label className="block text-sm font-medium text-gray-700">
                        File Proposal (PDF)
                      </label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) =>
                          setFiles({
                            ...files,
                            file_proposal: e.target.files[0],
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-green-50 file:text-green-700
                        hover:file:bg-green-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        File RAB (PDF)
                      </label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) =>
                          setFiles({
                            ...files,
                            file_rab: e.target.files[0],
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-green-50 file:text-green-700
                        hover:file:bg-green-100"
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
                        className={`px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 flex items-center gap-2 transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <Save className="w-5 h-5" />
                        {loading ? "Mengajukan..." : "Ajukan Proposal"}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal Detail Proposal */}
      <Transition appear show={isDetailModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={handleCloseDetailModal}
        >
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
                    Detail Proposal
                  </Dialog.Title>

                  {selectedProposal && (
                    <div className="space-y-6">
                      {/* Info Section */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm col-span-full">
                          <h4 className="text-sm font-medium text-gray-700">
                            Judul Proposal:
                          </h4>
                          <p className="mt-1">{selectedProposal.judul}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <h4 className="text-sm font-medium text-gray-700">
                            Tahun Anggaran:
                          </h4>
                          <p className="mt-1">{selectedProposal.tahun_anggaran}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <h4 className="text-sm font-medium text-gray-700">
                            Klaster:
                          </h4>
                          <p className="mt-1">{selectedProposal.nama_klaster}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <h4 className="text-sm font-medium text-gray-700">
                            Bidang Ilmu:
                          </h4>
                          <p className="mt-1">{selectedProposal.bidang_ilmu}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <h4 className="text-sm font-medium text-gray-700">
                            Tanggal Pengajuan:
                          </h4>
                          <p className="mt-1">
                            {new Date(selectedProposal.created_at).toLocaleDateString("id-ID", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Outline Section */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Outline Proposal:
                        </h4>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                          {selectedProposal.outline}
                        </p>
                      </div>

                      {/* Files Section */}
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() =>
                            window.open(
                              ProposalServices.getProposalFileUrl(selectedProposal.file_proposal),
                              "_blank"
                            )
                          }
                          className="flex items-center gap-2 p-3 text-blue-600 border border-blue-200 hover:text-blue-800 bg-blue-50 rounded-lg"
                        >
                          <FileText size={20} />
                          <span>Lihat Proposal</span>
                        </button>
                        <button
                          onClick={() =>
                            window.open(
                              ProposalServices.getRABFileUrl(selectedProposal.file_rab),
                              "_blank"
                            )
                          }
                          className="flex items-center gap-2 p-3 text-blue-600 border border-blue-200 hover:text-blue-800 bg-blue-50 rounded-lg"
                        >
                          <FileText size={20} />
                          <span>Lihat RAB</span>
                        </button>
                      </div>

                      {/* Status Section */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Status Proposal:</h4>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(selectedProposal.status)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProposal.status)}`}>
                            {selectedProposal.status}
                          </span>
                        </div>
                      </div>

                      {/* Notes Section */}
                      {selectedProposal.catatan_admin && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <h4 className="font-medium text-red-700 mb-2">Catatan Admin:</h4>
                          <p className="text-red-600">{selectedProposal.catatan_admin}</p>
                        </div>
                      )}

                      {/* Close Button */}
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={handleCloseDetailModal}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md flex items-center gap-2"
                        >
                          <Delete className="w-5 h-5" />
                          Tutup
                        </button>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Proposal;