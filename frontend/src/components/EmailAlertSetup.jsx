import React, { useState, useEffect } from 'react';
import { Mail, Bell, X, Check, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

// Dummy locations data
const DUMMY_LOCATIONS = [
  { id: 1, name: '🔴 Odzala-Kokoua, Congo', region: 'Odzala-Kokoua, Congo', risk: 'HIGH', country: 'Congo' },
  { id: 2, name: '🟡 Murchison Falls, Uganda', region: 'Murchison Falls, Uganda', risk: 'MEDIUM', country: 'Uganda' },
  { id: 3, name: '🟢 Valmiki Nagar Forest, Bihar', region: 'Valmiki Nagar Forest, Bihar', risk: 'LOW', country: 'India' },
  { id: 4, name: '🟢 Kasai Biosphere, DRC', region: 'Kasai Biosphere, DRC', risk: 'LOW', country: 'DRC' },
  { id: 5, name: '🔴 Amazon Reference', region: 'Amazon Reference', risk: 'HIGH', country: 'Brazil' },
  { id: 6, name: '🟡 Siberian Taiga', region: 'Siberian Taiga', risk: 'MEDIUM', country: 'Russia' },
  { id: 7, name: '🟢 European Forests', region: 'European Forests', risk: 'LOW', country: 'Europe' },
  { id: 8, name: '🔴 Southeast Asian Rainforest', region: 'Southeast Asian Rainforest', risk: 'HIGH', country: 'Indonesia' },
];

export function EmailAlertSetup() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('HIGH'); // HIGH, MEDIUM, ALL
  const [registeredAlerts, setRegisteredAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Load registered alerts from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('emailAlerts') || '[]');
    setRegisteredAlerts(saved);
  }, []);

  const handleRegisterAlert = async (e) => {
    e.preventDefault();
    
    if (!email || !selectedRegion) {
      setMessageType('error');
      setMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Save to localStorage
      const newAlert = {
        id: Date.now(),
        email,
        region: selectedRegion,
        threshold: alertThreshold,
        createdAt: new Date().toISOString(),
      };

      const updated = [...registeredAlerts, newAlert];
      setRegisteredAlerts(updated);
      localStorage.setItem('emailAlerts', JSON.stringify(updated));

      // Send verification email
      await api.post('/alerts/register-email', {
        email,
        region: selectedRegion,
        threshold: alertThreshold,
      });

      setMessageType('success');
      setMessage(`✓ Alert registered! Email sent to ${email}`);
      
      // Reset form
      setEmail('');
      setSelectedRegion('');
      setAlertThreshold('HIGH');

      setTimeout(() => {
        setShowModal(false);
        setMessage('');
      }, 2000);
    } catch (error) {
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Failed to register alert');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = (id) => {
    const updated = registeredAlerts.filter(a => a.id !== id);
    setRegisteredAlerts(updated);
    localStorage.setItem('emailAlerts', JSON.stringify(updated));
  };

  return (
    <>
      {/* Floating Alert Setup Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-emerald-700 transition-colors font-bold"
        title="Setup email alerts"
      >
        <Mail size={20} />
        <span className="hidden sm:inline">Email Alerts</span>
        {registeredAlerts.length > 0 && (
          <span className="ml-2 bg-white text-emerald-600 px-2 py-0.5 rounded-full text-xs font-bold">
            {registeredAlerts.length}
          </span>
        )}
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={24} />
                <h2 className="text-xl font-bold">Email Alerts</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Registration Form */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800">Register for Alerts</h3>
                
                <form onSubmit={handleRegisterAlert} className="space-y-4">
                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  {/* Region Dropdown */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Area Name to Monitor
                    </label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white cursor-pointer"
                    >
                      <option value="">-- Select a monitored area --</option>
                      {DUMMY_LOCATIONS.map((location) => (
                        <option key={location.id} value={location.region}>
                          {location.name} ({location.country})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Alert Threshold */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Alert Threshold
                    </label>
                    <select
                      value={alertThreshold}
                      onChange={(e) => setAlertThreshold(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="HIGH">HIGH Risk Only</option>
                      <option value="MEDIUM">MEDIUM & HIGH Risk</option>
                      <option value="ALL">All Risk Levels</option>
                    </select>
                  </div>

                  {/* Message */}
                  {message && (
                    <div
                      className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                        messageType === 'success'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {messageType === 'success' ? (
                        <Check size={18} />
                      ) : (
                        <AlertCircle size={18} />
                      )}
                      {message}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Registering...' : 'Register Alert'}
                  </button>
                </form>
              </div>

              {/* Registered Alerts */}
              {registeredAlerts.length > 0 && (
                <div className="border-t border-slate-200 pt-6 space-y-3">
                  <h3 className="font-bold text-slate-800">Your Registered Alerts</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {registeredAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between gap-3"
                      >
                        <div className="flex-1 text-sm">
                          <p className="font-bold text-slate-800">{alert.region}</p>
                          <p className="text-xs text-slate-600">{alert.email}</p>
                          <p className="text-xs text-emerald-600 font-medium mt-1">
                            Threshold: {alert.threshold}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                          title="Remove alert"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-blue-700">
                <p className="font-bold mb-2">📧 How it works:</p>
                <ul className="space-y-1 text-xs">
                  <li>✓ Register your email and area to monitor</li>
                  <li>✓ Get instant emails when risk changes</li>
                  <li>✓ Choose your alert threshold level</li>
                  <li>✓ Manage multiple alerts at once</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
