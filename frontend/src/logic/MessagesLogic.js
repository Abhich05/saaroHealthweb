import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { DoctorIdContext } from '../App';

const WABA_NUMBER = import.meta.env.VITE_WABA_NUMBER || '+911234567890';

const useMessagesLogic = () => {
  const doctorId = useContext(DoctorIdContext);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isPlaceholderWaba = WABA_NUMBER === '+911234567890';

  // Fetch patients for the doctor
  useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
    setError('');
    axiosInstance.get(`/patient/get-all/${doctorId}`)
      .then(res => {
        const patientContacts = (res.data.patient || []).map((item, idx) => {
          const patient = item.patientId || item; // handle both population and direct
          return {
            id: patient._id,
            name: patient.fullName || patient.name || 'Patient',
            role: 'Patient',
            time: '',
            status: 'read',
            img: '/profile.png', // fallback image
            phone: patient.phoneNumber,
            uid: patient.uid,
          };
        });
        setContacts(patientContacts);
        setSelectedContact(patientContacts[0] || null);
        setLoading(false);
      })
      .catch(() => {
        setContacts([]);
        setSelectedContact(null);
        setError('Failed to fetch patients');
        setLoading(false);
      });
  }, [doctorId]);

  // Fetch messages for selected contact
  useEffect(() => {
    if (!selectedContact || !doctorId) return;
    setLoading(true);
    setError('');
    axiosInstance.get(`/messages`, {
      params: {
        doctorId,
        patientId: selectedContact.id,
      },
    })
      .then(res => {
        setMessages(Array.isArray(res.data.messages) ? res.data.messages : []);
        setLoading(false);
      })
      .catch(() => {
        setMessages([]);
        setError('Failed to fetch messages');
        setLoading(false);
      });
  }, [selectedContact, doctorId]);

  // Send message
  const sendMessage = () => {
    if (!message.trim() || !selectedContact) return;
    setError('');
    setLoading(true);
    const payload = {
      doctorId,
      patientId: selectedContact.id,
      sender: 'doctor',
      content: message,
    };
    axiosInstance.post(`/messages`, payload)
      .then(res => {
        setMessages(prev => [
          ...prev,
          res.data.message,
        ]);
        setMessage('');
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to send message');
        setLoading(false);
      });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  const callUser = () => alert('Calling ' + (selectedContact?.name || ''));
  const shareFile = () => alert('Opening file dialog');

  // Filter contacts
  const filteredData = contacts.filter((contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory =
      filterCategory === 'All' ||
      contact.role.toLowerCase() + 's' === filterCategory.toLowerCase() ||
      contact.role.toLowerCase() === filterCategory.toLowerCase();
    const matchStatus = status ? contact.status === 'unread' : true;
    return matchesSearch && matchesCategory && matchStatus;
  });

  return {
    contacts,
    selectedContact,
    setSelectedContact,
    message,
    setMessage,
    messages,
    setMessages,
    status,
    setStatus,
    searchText,
    setSearchText,
    filterCategory,
    setFilterCategory,
    loading,
    error,
    sendMessage,
    handleKeyDown,
    callUser,
    shareFile,
    filteredData,
    isPlaceholderWaba,
  };
};

export default useMessagesLogic; 