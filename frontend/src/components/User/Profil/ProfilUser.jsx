// src/components/User/Profil/ProfilUser.jsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { ProfileServices } from "../../../services/User/ProfileServices";
import { Camera, Save, CheckCircle2, AlertCircle, User } from "lucide-react";

const ProfilUser = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [profile, setProfile] = useState({
    foto_profil: "",
    jenis_kelamin: "",
    nomor_whatsapp: "",
    alamat: "",
    online_profil: "",
    profesi: "",
    nip_niy: "",
    nidn: "",
    jabatan_fungsional: "",
    bidang_ilmu: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await ProfileServices.getProfile();
      setProfile(data || {});
    } catch (error) {
      setError(error.response?.data?.message || "Tidak terhubung ke server");
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      const result = await ProfileServices.updateProfilePhoto(file);
      setProfile((prev) => ({ ...prev, foto_profil: result.photoPath }));
      setSuccess(result.message);
    } catch (error) {
      setError(error.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await ProfileServices.updateProfile(profile);
      setSuccess(result.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setError(error.response?.data?.message || "Terjadi kesalahan");
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

  return (
    <div className="bg-white rounded-xl p-2 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 h-14 w-14 rounded-full flex items-center justify-center shadow-md">
          <User className="text-white" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Biodata</h2>
          <p className="text-gray-600 mt-1">
            Lengkapi informasi profil Anda untuk mengakses fitur lengkap
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
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

        <div className="flex flex-col space-y-4">
          <div className="flex items-start space-x-8">
            <div className="relative">
              <div
                className="w-40 h-48 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 cursor-pointer"
                onClick={handlePhotoClick}
              >
                {profile.foto_profil ? (
                  <img
                    src={ProfileServices.getProfilePhotoUrl(
                      profile.foto_profil
                    )}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <div className="text-white opacity-0 hover:opacity-100">
                    Ubah Foto
                  </div>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </div>

            <div className="flex-1 grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Jenis Kelamin
                </label>
                <select
                  name="jenis_kelamin"
                  value={profile.jenis_kelamin || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nama
                </label>
                <input
                  type="text"
                  value={user?.nama || ""}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nomor WhatsApp
                </label>
                <input
                  type="text"
                  name="nomor_whatsapp"
                  value={profile.nomor_whatsapp || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Alamat
              </label>
              <textarea
                name="alamat"
                value={profile.alamat || ""}
                onChange={handleInputChange}
                rows="3"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Online Profil
              </label>
              <input
                type="url"
                name="online_profil"
                value={profile.online_profil || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Profesi
              </label>
              <select
                name="profesi"
                value={profile.profesi || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Pilih Profesi</option>
                <option value="Dosen">Dosen</option>
                <option value="Laboran">Laboran</option>
                <option value="Pustakawan">Pustakawan</option>
                <option value="Arsiparis">Arsiparis</option>
                <option value="Pranata Komputer">Pranata Komputer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                NIP/NIY
              </label>
              <input
                type="text"
                name="nip_niy"
                value={profile.nip_niy || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {profile.profesi === "Dosen" && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  NIDN
                </label>
                <input
                  type="text"
                  name="nidn"
                  value={profile.nidn || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Jabatan Fungsional
              </label>
              <select
                name="jabatan_fungsional"
                value={profile.jabatan_fungsional || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Pilih Jabatan</option>
                <option value="Laboran">Laboran</option>
                <option value="Pustakawan">Pustakawan</option>
                <option value="Arsiparis">Arsiparis</option>
                <option value="Pranata Komputer">Pranata Komputer</option>
                <option value="Asisten Ahli">Asisten Ahli</option>
                <option value="Lektor">Lektor</option>
                <option value="Lektor Kepala">Lektor Kepala</option>
                <option value="Guru Besar">Guru Besar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bidang Ilmu
              </label>
              <select
                name="bidang_ilmu"
                value={profile.bidang_ilmu || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Pilih Bidang Ilmu</option>
                <option value="Tarbiyah dan Keguruan">
                  Tarbiyah dan Keguruan
                </option>
                <option value="Ushuluddin">Ushuluddin</option>
                <option value="Psikologi">Psikologi</option>
                <option value="Ekonomi dan Ilmu Sosial">
                  Ekonomi dan Ilmu Sosial
                </option>
                <option value="Syariah dan Ilmu Hukum">
                  Syariah dan Ilmu Hukum
                </option>
                <option value="Dakwah dan Ilmu Komunikasi">
                  Dakwah dan Ilmu Komunikasi
                </option>
                <option value="Sains dan Teknologi">Sains dan Teknologi</option>
                <option value="Pertanian dan Peternakan">
                  Pertanian dan Peternakan
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-5">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center space-x-2 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Save className="w-5 h-5" />
            <span>{loading ? "Menyimpan..." : "Simpan Profil"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilUser;
