// src/components/User/Profil/BerkasUser.jsx
import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { BerkasUserServices } from "../../../services/User/BerkasUserServices";
import {
  FileText,
  Edit,
  Trash2,
  CirclePlus,
  Delete,
  Save,
  Files,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const BerkasUser = () => {
  const [berkas, setBerkas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nama_berkas: "",
  });

  useEffect(() => {
    loadBerkas();
  }, []);

  const loadBerkas = async () => {
    try {
      setLoading(true);
      const data = await BerkasUserServices.getAllBerkas();
      setBerkas(data);
    } catch (error) {
      setError(error.response?.data?.message || "Tidak terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("nama_berkas", formData.nama_berkas);
      if (selectedFile) {
        formDataToSend.append("file_berkas", selectedFile);
      }

      let result;
      if (editingId) {
        result = await BerkasUserServices.updateBerkas(
          editingId,
          formDataToSend
        );
      } else {
        result = await BerkasUserServices.createBerkas(formDataToSend);
      }

      setSuccess(result.message);
      await loadBerkas();
      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (data) => {
    setEditingId(data.id);
    setFormData({
      nama_berkas: data.nama_berkas,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus berkas ini?")) {
      try {
        const result = await BerkasUserServices.deleteBerkas(id);
        setSuccess(result.message);
        await loadBerkas();
      } catch (error) {
        setError(error.response?.data?.message || "Terjadi kesalahan");
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
    setEditingId(null);
    setSelectedFile(null);
    setFormData({
      nama_berkas: "",
    });
  }, 300);
  };

  const handlePreviewFile = (fileName) => {
    const url = BerkasUserServices.getBerkasUrl(fileName);
    window.open(url, "_blank");
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
          <Files className="text-white" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Berkas
          </h2>
          <p className="text-gray-600 mt-1">
            Upload berkas-berkas pendukung
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-green-50 border-l-4 border-green-500 rounded-lg shadow-sm flex items-start gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-500 mt-0.5" />
          <div className="text-green-800 font-medium">{success}</div>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-red-50 border-l-4 border-red-500 rounded-lg shadow-sm flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-500 mt-0.5" />
          <div className="text-red-800 font-medium">{error}</div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <CirclePlus size={20} />
          Tambah Berkas
        </button>
      </div>
      
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
       <table className="min-w-full divide-y divide-gray-200">
         <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              No
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nama Berkas
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tanggal Upload
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Berkas
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
          ) : berkas.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                Belum ada berkas
              </td>
            </tr>
          ) : (
            berkas.map((item, index) => (
              <tr key={item.id}className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900">
                    {item.nama_berkas}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handlePreviewFile(item.file_berkas)}
                    className="flex items-center text-xm text-blue-600 hover:text-blue-800"
                  >
                    <FileText size={20} className="mr-2" />
                    Lihat Berkas
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
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
      
      {/* Modal Form */}
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
                    {editingId ? "Edit Berkas" : "Upload Berkas"}
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nama Berkas
                      </label>
                      <input
                        type="text"
                        value={formData.nama_berkas}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nama_berkas: e.target.value,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        File Berkas (PDF)
                      </label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-medium
                          file:bg-green-50 file:text-green-700
                          hover:file:bg-green-100"
                        required={!editingId}
                      />
                      {!selectedFile && editingId && (
                        <p className="mt-1 text-sm text-gray-500">
                          Biarkan kosong jika tidak ingin mengubah file
                        </p>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md flex items-center gap-2 transition-colors"
                      >
                        <Delete className="w-5 h-5" />
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md
                          hover:bg-green-700 focus:outline-none focus-visible:ring-2 
                          focus-visible:ring-green-500 focus-visible:ring-offset-2
                          flex items-center gap-2 transition-colors
                          ${loading ? "opacity-50 cursor-not-allowed" : ""}
                        `}
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

export default BerkasUser;
