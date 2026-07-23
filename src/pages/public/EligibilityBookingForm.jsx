import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { getServicesForCountry } from '../../constants/countryServices';

const EligibilityBookingForm = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    nationality: '', countryOfResidence: '', preferredLanguage: 'English',
    serviceType: '', applicantsCount: 'Main Only', date: '', timeSlot: ''
  });
  const [fingerprint, setFingerprint] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const initFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setFingerprint(result.visitorId);
    };
    initFingerprint();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatus('loading');
      const payload = { ...formData, deviceFingerprint: fingerprint };
      const res = await axios.post('https://aaa-consultancy-production.up.railway.app/api/v1/booking/eligibility', payload);

      if (res.data.success) {
        setStatus('success');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setStatus('blocked');
      } else {
        setStatus('error');
      }
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto bg-white p-8 border border-gray-200 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Booking Confirmed!</h2>
          <p>Your eligibility assessment has been booked. A consultant will reach out to you shortly.</p>
        </div>
      </div>
    );
  }

  if (status === 'blocked') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto bg-white p-8 border border-gray-200 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Action Required</h2>
          <p>Your booking cannot be processed automatically. Please contact our support team at info@aaabusinessconsultancy.com.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto bg-white p-8 border border-gray-200 rounded-lg shadow">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Book Eligibility Assessment</h2>
          <p className="mt-2 text-sm text-gray-600">Please provide your details below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input type="text" required name="firstName" value={formData.firstName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input type="text" required name="lastName" value={formData.lastName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" required name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input type="tel" required name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nationality</label>
              <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Country of Residence</label>
              <input type="text" name="countryOfResidence" value={formData.countryOfResidence} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Service Type</label>
              <select name="serviceType" value={formData.serviceType} onChange={handleChange} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option value="">Select Service</option>
                {getServicesForCountry(formData.countryOfResidence).map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Preferred Date</label>
              <input type="date" required name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Preferred Time</label>
              <input type="time" required name="timeSlot" value={formData.timeSlot} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={status === 'loading' || !fingerprint}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {status === 'loading' ? 'Booking...' : 'Book Assessment'}
              </button>
            </div>
          </div>
          {status === 'error' && (
            <p className="mt-2 text-sm text-red-600 text-center">An error occurred. Please try again.</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default EligibilityBookingForm;
