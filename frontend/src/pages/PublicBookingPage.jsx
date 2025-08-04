import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from '../api/axiosInstance';
import Button from "../components/ui/Button";

const PublicBookingPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    reason: "",
    preferredDate: "",
    preferredTime: ""
  });

  useEffect(() => {
    if (doctorId) {
      fetchDoctorInfo();
      fetchAvailableSlots();
    }
  }, [doctorId]);

  const fetchDoctorInfo = async () => {
    try {
      const response = await axiosInstance.get(`/doctor/${doctorId}`);
      setDoctorInfo(response.data.doctor);
    } catch (error) {
      console.error('Error fetching doctor info:', error);
      setError("Unable to load doctor information");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      // Get available slots for the next 30 days
      const today = new Date();
      const slots = [];
      
      for (let i = 1; i <= 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Generate time slots
        const timeSlots = [
          "9:00 AM", "10:00 AM", "11:00 AM", 
          "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
        ];
        
        timeSlots.forEach(time => {
          slots.push({
            date: dateStr,
            time: time,
            available: true
          });
        });
      }
      
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isDateAvailable = (date) => {
    const dateStr = formatDate(date);
    return availableSlots.some(slot => slot.date === dateStr);
  };

  const getTimeSlotsForDate = (date) => {
    const dateStr = formatDate(date);
    return availableSlots.filter(slot => slot.date === dateStr);
  };

  const handleDateSelect = (date) => {
    if (isDateAvailable(date)) {
      setSelectedDate(date);
      setSelectedSlot(null); // Reset time selection when date changes
    }
  };

  const handleTimeSelect = (slot) => {
    setSelectedSlot(slot);
    setFormData(prev => ({
      ...prev,
      preferredDate: slot.date,
      preferredTime: slot.time
    }));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isAvailable = isDateAvailable(date);
      const isSelected = selectedDate && formatDate(selectedDate) === formatDate(date);
      const isToday = formatDate(date) === formatDate(new Date());

      days.push(
        <div
          key={day}
          onClick={() => handleDateSelect(date)}
          className={`p-2 text-center cursor-pointer border rounded-md transition-colors ${
            isToday 
              ? 'bg-blue-100 border-blue-300' 
              : isSelected 
                ? 'bg-purple-100 border-purple-500' 
                : isAvailable 
                  ? 'hover:bg-gray-50 border-gray-200' 
                  : 'text-gray-400 cursor-not-allowed border-gray-100'
          }`}
        >
          <div className="text-sm font-medium">{day}</div>
          {isAvailable && (
            <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1"></div>
          )}
        </div>
      );
    }

    return days;
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError("Please select an appointment slot");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name: formData.fullName,
        phoneNumber: formData.phoneNumber,
        location: "Clinic A", // Default location
        date: formData.preferredDate,
        time: formData.preferredTime,
        type: "Online", // Default type
        email: formData.email,
        reason: formData.reason,
        source: "public_booking" // Track that this came from public booking
      };

      const response = await axiosInstance.post(`/appointment/${doctorId}`, payload);
      
      if (response.data) {
        setSuccess("Appointment booked successfully! You will receive a confirmation shortly.");
        // Reset form
        setFormData({
          fullName: "",
          phoneNumber: "",
          email: "",
          reason: "",
          preferredDate: "",
          preferredTime: ""
        });
        setSelectedSlot(null);
        setSelectedDate(null);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError(error.response?.data?.error || "Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <div className="h-8 bg-gray-200 rounded w-96 mx-auto mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Skeleton */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Calendar Skeleton */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
            
            {/* Calendar Header Skeleton */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Calendar Grid Skeleton */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded animate-pulse"></div>
              ))}
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>

            {/* Legend Skeleton */}
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-200 rounded mr-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-200 rounded mr-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Time Slots Skeleton */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
            <div className="text-center py-8">
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Doctor Info Skeleton */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (!doctorInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Book Appointment with Dr. {doctorInfo.name}
          </h1>
          <p className="text-gray-600">
            {doctorInfo.clinicName || "Medical Clinic"}
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Visit
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Brief description of your symptoms or reason for visit"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !selectedSlot}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Booking..." : "Book Appointment"}
              </Button>
            </form>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Select Date</h2>
            
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                ←
              </button>
              <h3 className="text-lg font-medium">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                →
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
              {renderCalendar()}
            </div>

            {/* Legend */}
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Available
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-2"></div>
                Today
              </div>
            </div>
          </div>

          {/* Time Slots */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Select Time</h2>
            
            {selectedDate ? (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Available times for {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                
                <div className="grid grid-cols-2 gap-2">
                  {getTimeSlotsForDate(selectedDate).map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => handleTimeSelect(slot)}
                      className={`p-3 text-center rounded-md border transition-colors ${
                        selectedSlot?.date === slot.date && selectedSlot?.time === slot.time
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>

                {selectedSlot && (
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
                    <p className="text-sm font-medium text-purple-700">
                      Selected: {selectedSlot.time} on {new Date(selectedSlot.date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>Please select a date to view available time slots</p>
              </div>
            )}
          </div>
        </div>

        {/* Doctor Information */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">About Dr. {doctorInfo.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">
                <strong>Clinic:</strong> {doctorInfo.clinicName || "Medical Clinic"}
              </p>
              <p className="text-gray-600">
                <strong>Specialization:</strong> {doctorInfo.specialization || "General Medicine"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">
                <strong>Experience:</strong> {doctorInfo.experience || "Not specified"} years
              </p>
              <p className="text-gray-600">
                <strong>Location:</strong> {doctorInfo.location || "Clinic A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicBookingPage; 