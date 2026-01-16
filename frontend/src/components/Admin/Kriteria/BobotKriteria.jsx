// src/components/Admin/Kriteria/BobotKriteria.jsx
import React, { useState, useEffect } from "react";
import { BobotKriteriaServices } from "../../../services/Admin/BobotKriteriaServices";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AlertCircle, RefreshCw, Calculator, Scale, CheckCircle2 } from "lucide-react";

const SKALA_LINGUISTIK = [
  { value: "9", label: "9 - Mutlak lebih penting" },
  { value: "7", label: "7 - Sangat lebih penting" },
  { value: "5", label: "5 - Lebih penting" },
  { value: "3", label: "3 - Sedikit lebih penting" },
  { value: "1", label: "1 - Sama penting" },
  { value: "1/3", label: "1/3 - Sedikit kurang penting" },
  { value: "1/5", label: "1/5 - Kurang penting" },
  { value: "1/7", label: "1/7 - Sangat kurang penting" },
  { value: "1/9", label: "1/9 - Mutlak kurang penting" },
];

const initializeMatrix = (size) => {
  return Array(size)
    .fill()
    .map(() => Array(size).fill("1"));
};

const BobotKriteria = () => {
  const [kriteria, setKriteria] = useState([]);
  const [matriksPerbandingan, setMatriksPerbandingan] = useState([]);
  const [bobotResult, setBobotResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await BobotKriteriaServices.getLatestBobot();
      setKriteria(response.kriteria);

      if (response.bobot) {
        setBobotResult(response.bobot);
        // Inisialisasi matriks juga meski ada hasil bobot
        setMatriksPerbandingan(initializeMatrix(response.kriteria.length));
      } else {
        // Inisialisasi matriks kosong
        setMatriksPerbandingan(initializeMatrix(response.kriteria.length));
      }
    } catch (error) {
      setError("Gagal memuat data kriteria");
    } finally {
      setLoading(false);
    }
  };

  const handleMatrixChange = (i, j, value) => {
    const newMatrix = [...matriksPerbandingan];
    newMatrix[i][j] = value;
    // Set reciprocal value
    if (i !== j) {
      newMatrix[j][i] = getKebalikan(value);
    }
    setMatriksPerbandingan(newMatrix);
  };

  const getKebalikan = (nilai) => {
    if (nilai === "1") return "1";
    if (nilai.startsWith("1/")) return nilai.substring(2);
    return `1/${nilai}`;
  };

  const handleHitung = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      const response = await BobotKriteriaServices.hitungBobot(matriksPerbandingan);
      setBobotResult(response.data);
      if (response.data.is_valid) {
        setSuccess(response.message);
      } else {
        setError(response.message);
      }
      // Scroll ke atas halaman
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setError(error.response?.data?.message || "Gagal menghitung bobot");
      // Set hasil perhitungan meski tidak konsisten
      if (error.response?.data?.data) {
        setBobotResult(error.response.data.data);
      }
      // Scroll ke atas halaman juga saat error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm("Apakah Anda yakin ingin mereset perhitungan bobot?")) {
      try {
        setLoading(true);
        setError("");
        const response = await BobotKriteriaServices.resetBobot();
        setBobotResult(null);
        // Inisialisasi ulang matriks setelah reset
        setMatriksPerbandingan(initializeMatrix(kriteria.length));
        setSuccess(response.message);
      } catch (error) {
        setError(error.response?.data?.message || "Gagal mereset bobot");
      } finally {
        setLoading(false);
      }
    }
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined) return "0.0000";
    if (typeof value !== "number") value = Number(value);
    return value.toFixed(4);
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
          <Scale className="text-white" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Bobot Fuzzy AHP</h2>
          <p className="text-gray-600 mt-1">
            Hitung bobot kriteria menggunakan metode Fuzzy AHP
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

      {loading ? (
        <div className="flex justify-center items-center p-6 bg-gray-50 rounded-lg">
          <div className="text-center text-gray-500">
            Memuat data...
          </div>
        </div>
      ) : !bobotResult ? (
        kriteria.length === 0 ? (
          <div className="flex justify-center items-center p-6 bg-gray-50 rounded-lg">
            <div className="text-center text-gray-500">
              Belum ada kriteria untuk dihitung bobotnya
            </div>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-400 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">
                Petunjuk Pengisian:
              </h4>
              <p className="text-blue-600 text-sm">
                Bandingkan kriteria pada baris dengan kriteria pada kolom
                menggunakan skala yang tersedia. Nilai diagonal akan selalu 1
                (sama penting) dan nilai kebalikan akan terisi otomatis.
              </p>
            </div>

            {/* Matriks Perbandingan */}
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead>
                  <tr>
                    <th className="border p-2 bg-gray-50">Kriteria</th>
                    {kriteria.map((item) => (
                      <th key={item.id} className="border p-2 bg-gray-50">
                        ({item.kode_kriteria})
                        <br />
                        <span className="text-xs">{item.nama_kriteria}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {kriteria.map((row, i) => (
                    <tr key={row.id}>
                      <th className="border p-2 bg-gray-50 text-left">
                        ({row.kode_kriteria})
                        <br />
                        <span className="text-xs">{row.nama_kriteria}</span>
                      </th>
                      {kriteria.map((col, j) => (
                        <td key={col.id} className="border p-2">
                          {i === j ? (
                            <input
                              type="text"
                              value="1"
                              disabled
                              className="w-full text-center bg-gray-100"
                            />
                          ) : i < j ? (
                            <select
                              value={matriksPerbandingan[i][j]}
                              onChange={(e) =>
                                handleMatrixChange(i, j, e.target.value)
                              }
                              className="w-full text-left border border-gray-300 rounded px-2 py-1"
                            >
                              {SKALA_LINGUISTIK.map((scale) => (
                                <option key={scale.value} value={scale.value}>
                                  {scale.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={matriksPerbandingan[i][j]}
                              disabled
                              className="w-full text-center bg-gray-100"
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleHitung}
                disabled={loading}
                className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2
                  ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Calculator size={20} />
                {loading ? "Memproses..." : "Hitung Bobot"}
              </button>
            </div>
          </>
        )
      ) : (
        <>
          {/* Hasil Perhitungan */}
          <div className="flex justify-end">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <RefreshCw size={20} />
              Reset Bobot
            </button>
          </div>

          {/* Konsistensi Rasio */}
          <div className={`p-4 rounded-lg border ${
              bobotResult.is_valid
                ? "bg-green-50 border-green-400"
                : "bg-red-50 border-red-400"
            }`}
          >
            <h4
              className={`font-medium mb-2 ${
                bobotResult.is_valid ? "text-green-800" : "text-red-800"
              }`}
            >
              Konsistensi Rasio: {formatNumber(bobotResult.rasio_konsistensi)}
            </h4>
            <p
              className={
                bobotResult.is_valid ? "text-green-600" : "text-red-600"
              }
            >
              {bobotResult.is_valid
                ? "Matriks perbandingan konsisten (CR ≤ 0.1)"
                : "Matriks perbandingan tidak konsisten (CR > 0.1). Silakan perbaiki nilai perbandingan."}
            </p>
          </div>

          {/* Bobot Final */}
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium mb-4">Bobot Final</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border p-2">Kode</th>
                    <th className="px-4 border p-2 text-left">Kriteria</th>
                    <th className="border p-2">Bobot (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {kriteria.map((k, i) => (
                    <tr key={`bobot-${k.id}`}>
                      <td className="border p-2 text-center">
                        {k.kode_kriteria}
                      </td>
                      <td className="px-4 border p-2 text-left">
                        {k.nama_kriteria}
                      </td>
                      <td className="border p-2 text-center font-medium">
                        {(bobotResult.bobot_final[i] * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td
                      colSpan="2"
                      className="border p-2 text-right font-medium"
                    >
                      Total
                    </td>
                    <td className="border p-2 text-center font-medium">
                      {(
                        bobotResult.bobot_final.reduce((a, b) => a + b, 0) * 100
                      ).toFixed(2)}
                      %
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* matriks fuzzy */}
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium mb-4">Matriks Fuzzy</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr>
                      <th className="border p-2">Kriteria</th>
                      {kriteria.map((k) => (
                        <th key={`header-${k.id}`} className="border p-2">
                          {k.kode_kriteria}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {kriteria.map((k, i) => (
                      <tr key={`row-${k.id}`}>
                        <th className="border p-2">{k.kode_kriteria}</th>
                        {kriteria.map((_, j) => (
                          <td
                            key={`cell-${i}-${j}`}
                            className="border p-1 text-center"
                          >
                            ({bobotResult.hasil_fuzzy.l[i][j].toFixed(2)},
                            {bobotResult.hasil_fuzzy.m[i][j].toFixed(2)},
                            {bobotResult.hasil_fuzzy.u[i][j].toFixed(2)})
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Nilai Sintesis Fuzzy */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium mb-4">Nilai Sintesis Fuzzy</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr>
                      <th className="border p-2">Kriteria</th>
                      <th className="border p-2">L</th>
                      <th className="border p-2">M</th>
                      <th className="border p-2">U</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kriteria.map((k, i) => (
                      <tr key={`sintesis-${k.id}`}>
                        <th className="border p-2">{k.kode_kriteria}</th>
                        <td className="border p-2 text-center">
                          {bobotResult.hasil_sintesis[i].l.toFixed(4)}
                        </td>
                        <td className="border p-2 text-center">
                          {bobotResult.hasil_sintesis[i].m.toFixed(4)}
                        </td>
                        <td className="border p-2 text-center">
                          {bobotResult.hasil_sintesis[i].u.toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Derajat Kemungkinan */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium mb-4">Derajat Kemungkinan</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr>
                      <th className="border p-2">Kriteria</th>
                      {kriteria.map((k) => (
                        <th
                          key={`derajat-header-${k.id}`}
                          className="border p-2"
                        >
                          {k.kode_kriteria}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {kriteria.map((k, i) => (
                      <tr key={`derajat-row-${k.id}`}>
                        <th className="border p-2">{k.kode_kriteria}</th>
                        {kriteria.map((_, j) => (
                          <td
                            key={`derajat-cell-${i}-${j}`}
                            className="border p-2 text-center"
                          >
                            {bobotResult.hasil_derajat[i][j].toFixed(4)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visualisasi Bobot */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium mb-4">Visualisasi Bobot Kriteria</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={kriteria.map((k, i) => ({
                      name: k.kode_kriteria,
                      bobot: bobotResult.bobot_final[i] * 100,
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                    <Legend />
                    <Bar dataKey="bobot" name="Bobot (%)" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BobotKriteria;
