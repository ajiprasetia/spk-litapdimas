import React, { useEffect, useState } from 'react';
import { Monitor, MapPin, Timer, Loader2 } from 'lucide-react';
import { RiwayatLoginServices } from '../../../services/Shared/RiwayatLoginServices';

const RiwayatLogin = ({ isOpen }) => {
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadLoginHistory();
    }
  }, [isOpen]);

  const loadLoginHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await RiwayatLoginServices.getRiwayatLogin(5);
      setLoginHistory(data);
    } catch (err) {
      console.error('Error loading login history:', err);
      setError('Gagal memuat riwayat login');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-3.5 w-72 bg-white rounded-xl shadow-xl border-2 border-green-200 z-40 flip-animation">
      <div className="p-3 border-b-2 border-green-200 bg-gray-50">
        <h3 className="font-semibold text-gray-800 text-base">Riwayat Login</h3>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 size={24} className="text-green-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            {error}
          </div>
        ) : loginHistory.length > 0 ? (
          loginHistory.map((log) => (
            <div
              key={log.id}
              className="p-4 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Monitor size={16} className="text-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-green-600 text-sm">{log.device}</h4>
                  <div className="flex items-center mt-1.5 text-xs text-gray-500">
                    <div className="p-1 bg-red-50 rounded-md mr-2">
                      <MapPin size={12} className="text-red-500" />
                    </div>
                    <span>{log.ipAddress}</span>
                  </div>
                  <div className="flex items-center mt-1.5 text-xs text-gray-400">
                    <div className="p-1 bg-blue-50 rounded-md mr-2">
                      <Timer size={12} className="text-blue-500" />
                    </div>
                    <span title={log.loginTime}>{log.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            Belum ada riwayat login
          </div>
        )}
      </div>
    </div>
  );
};

export default RiwayatLogin;