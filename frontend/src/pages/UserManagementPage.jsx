import React, { useState, useContext, useEffect } from "react";
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import Button from "../components/ui/Button";
import SearchBar from "../components/ui/SearchBar";
import { MdDelete } from "react-icons/md";
import { dummyUsers, defaultRolePermissions } from "../data/dummyUserData";
import { toast } from "react-toastify";
import { DoctorIdContext } from '../App';
import axiosInstance from '../api/axiosInstance';
import Loading from "../components/ui/Loading";

const emptyUserTemplate = {
  name: "",
  email: "",
  phone: "",
  role: "custom",
  permissions: {
    dashboard: "none",
    appointments: "none",
    invoice: "none",
    patientQueue: "none",
    createRx: "none",
    allPatients: "none",
    ipd: "none",
    messages: "none",
    social: "none",
    automation: "none",
    library: "none",
    settings: "none",
  },
  avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
};

const UserManagementPage = () => {
  const doctorId = useContext(DoctorIdContext);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState({ ...emptyUserTemplate });
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState({ name: false, email: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCredentials, setShowCredentials] = useState(false);
  const [newUserCredentials, setNewUserCredentials] = useState(null);

  useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
    setError("");
    axiosInstance.get(`/${doctorId}/users`)
      .then(res => {
        setUsers(res.data.users || []);
      })
      .catch(() => setError("Failed to fetch users."))
      .finally(() => setLoading(false));
  }, [doctorId]);

  const handleSelectUser = (user) => {
    setSelectedUser({ ...user });
    setErrors({ name: false, email: false });
    setShowCredentials(false);
    setNewUserCredentials(null);
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    if (newRole !== "custom") {
      setSelectedUser((prev) => ({
        ...prev,
        role: newRole,
        permissions: defaultRolePermissions[newRole],
      }));
    } else {
      setSelectedUser((prev) => ({
        ...prev,
        role: "custom",
      }));
    }
  };

  const handlePermissionCheckboxChange = (section) => {
    const current = selectedUser.permissions[section];
    setSelectedUser((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [section]: current === "none" ? "view" : "none",
      },
    }));
  };

  const handlePermissionDropdownChange = (section, value) => {
    setSelectedUser((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [section]: value,
      },
    }));
  };

  const handleAddNewUser = async () => {
    console.log('=== ADD NEW USER FUNCTION CALLED ===');
    console.log('Doctor ID:', doctorId);
    console.log('Selected user data:', selectedUser);
    
    // Reset errors
    setErrors({ name: false, email: false });
    
    // Validation
    if (!selectedUser.name.trim()) {
      setErrors(prev => ({ ...prev, name: true }));
      console.log('Name validation failed');
      return;
    }
    if (!selectedUser.email.trim()) {
      setErrors(prev => ({ ...prev, email: true }));
      console.log('Email validation failed');
      return;
    }
    
    try {
      // Clean up the data before sending - remove id and other unnecessary fields
      const userData = {
        name: selectedUser.name.trim(),
        email: selectedUser.email.trim(),
        phone: selectedUser.phone.trim(),
        password: selectedUser.password || 'changeme123',
        role: selectedUser.role,
        permissions: selectedUser.permissions,
        avatar: selectedUser.avatar
      };
      
      console.log('Sending user data:', userData);
      console.log('Request URL:', `/${doctorId}/users`);
      
      const res = await axiosInstance.post(`/${doctorId}/users`, userData);
      
      // Show credentials modal
      setNewUserCredentials({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password
      });
      setShowCredentials(true);
      
      // Add to users list
      setUsers(prev => [...prev, res.data.user]);
      
      // Reset form
      setSelectedUser({ ...emptyUserTemplate });
      setErrors({ name: false, email: false });
      
      toast.success('User added successfully!');
    } catch (err) {
      console.error('Add user error:', err);
      console.error('Error response:', err.response?.data);
      toast.error(err?.response?.data?.error || 'Failed to add user');
    }
  };

  const handleSave = async () => {
    if (!selectedUser.id && !selectedUser._id) {
      toast.error("Please add a user first!");
      return;
    }
    try {
      const userId = selectedUser._id || selectedUser.id;
      
      // Clean up the data before sending - remove id and other unnecessary fields
      const userData = {
        name: selectedUser.name.trim(),
        email: selectedUser.email.trim(),
        phone: selectedUser.phone.trim(),
        role: selectedUser.role,
        permissions: selectedUser.permissions,
        avatar: selectedUser.avatar
      };
      
      // Only include password if it's been changed (not the default)
      if (selectedUser.password && selectedUser.password !== 'changeme123') {
        userData.password = selectedUser.password;
      }
      
      console.log('Saving user with data:', { userId, userData });
      
      const res = await axiosInstance.put(`/${doctorId}/users/${userId}`, userData);
      console.log('Save response:', res.data);
      
      setUsers((prev) => prev.map((user) => (user._id === userId || user.id === userId ? res.data.user : user)));
      toast.success("User permissions updated!");
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err?.response?.data?.error || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axiosInstance.delete(`/${doctorId}/users/${userId}`);
      setUsers(users.filter((u) => u._id !== userId && u.id !== userId));
      if (selectedUser?._id === userId || selectedUser?.id === userId) {
        setSelectedUser({ ...emptyUserTemplate });
        setErrors({ name: false, email: false });
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Remove full page loading
  if (error) return <div className="flex h-screen items-center justify-center text-red-600">{error}</div>;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="relative flex-1 p-6 overflow-y-auto">
          <div className="flex gap-6 max-w-7xl mx-auto">
            {/* Left */}
            <div className="flex-1 bg-white p-6 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl leading-10 font-semibold">User Roles and Permissions</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium">Name</label>
                  <input
                    type="text"
                    value={selectedUser.name}
                    onChange={(e) => {
                      setSelectedUser({ ...selectedUser, name: e.target.value });
                      setErrors((prev) => ({ ...prev, name: false }));
                    }}
                    className={`border p-2 w-full rounded ${errors.name ? "border-red-500" : ""}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => {
                      setSelectedUser({ ...selectedUser, email: e.target.value });
                      setErrors((prev) => ({ ...prev, email: false }));
                    }}
                    className={`border p-2 w-full rounded ${errors.email ? "border-red-500" : ""}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Phone Number</label>
                  <input
                    type="tel"
                    value={selectedUser.phone}
                    onChange={(e) => {
                      setSelectedUser({ ...selectedUser, phone: e.target.value });
                    }}
                    className="border p-2 w-full rounded"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Role</label>
                  <div className="relative">
                    <select
                      value={selectedUser.role}
                      onChange={handleRoleChange}
                      className="border p-2 w-full rounded appearance-none"
                    >
                      <option value="doctor">Doctor</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="billingStaff">Billing Staff</option>
                      <option value="admin">Admin</option>
                      <option value="custom">Custom</option>
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ▼
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium">Password</label>
                  <input
                    type="text"
                    value={selectedUser.password || 'changeme123'}
                    onChange={(e) => {
                      setSelectedUser({ ...selectedUser, password: e.target.value });
                    }}
                    className="border p-2 w-full rounded"
                    placeholder="Default: changeme123"
                  />
                </div>
              </div>

              <Button
                className="px-4 py-2  text-white text-sm rounded-md hover:bg-purple-700"
                onClick={handleAddNewUser}
              >
                + Add New User
              </Button>

              <h3 className="text-md font-medium mt-6 mb-2">Section Access Control</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(selectedUser.permissions).map(([section, level]) => {
                  const isChecked = level !== "none";
                  return (
                    <div key={section} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handlePermissionCheckboxChange(section)}
                      />
                      <span className="capitalize w-32">
                        {section.replace(/([A-Z])/g, " $1")}
                      </span>
                      {isChecked && (
                         <select
                          value={level}
                          onChange={(e) => handlePermissionDropdownChange(section, e.target.value)}
                          className="border p-1 rounded"
                        >
                          <option value="view">View</option>
                          <option value="edit">Edit</option>
                          <option value="full">Full</option>
                        </select> 

                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right */}
            <div className="w-74 bg-white p-2 rounded-xl flex flex-col h-[calc(100vh-120px)]">
              <SearchBar
                searchTerm={searchQuery}
                setSearchTerm={setSearchQuery}
                placeholder="Search users"
              />

              <div className="mt-3 flex-1 overflow-y-auto space-y-2">
                {loading ? (
                  // Loading skeleton for users
                  Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="p-2 rounded flex items-center justify-between animate-pulse">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-3 bg-gray-200 rounded w-32"></div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))
                ) : (
                  filteredUsers.map((user) => (
                  <div
                    key={user._id || user.id}
                    className={`p-2 rounded flex items-center justify-between cursor-pointer hover:bg-gray-100 ${
                      selectedUser?.id === user.id || selectedUser?._id === user._id ? "bg-gray-200" : ""
                    }`}
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="flex items-center space-x-2">
                      <img
                        src={user.avatar || "https://randomuser.me/api/portraits/lego/1.jpg"}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://randomuser.me/api/portraits/lego/1.jpg";
                        }}
                      />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-[14px] text-[#736e7D]">{user.email}</p>
                        <p className="text-[14px] text-[#736e7D]">{user.phone || 'No phone'}</p>
                        <p className="text-[14px] text-[#736e7D] italic">{user.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUser(user._id || user.id);
                      }}
                      className="text-gray-500 hover:text-red-600 transition"
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                ))
                )}
              </div>

              <div className="absolute bottom-2 right-3 flex gap-2 mt-4">
                <button
                  className="px-4 h-10 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition"
                  onClick={() => {
                    setSelectedUser({ ...emptyUserTemplate });
                    setErrors({ name: false, email: false });
                    setShowCredentials(false);
                    setNewUserCredentials(null);
                  }}
                >
                  Cancel
                </button>
                <Button
                  className="px-5 h-10 text-white text-sm rounded-md hover:bg-purple-700 transition"
                  onClick={handleSave}
                  disabled={!selectedUser}
                >
                  Save & Apply
                </Button>
              </div>
            </div>
          </div>

          {/* Credentials Modal */}
          {showCredentials && newUserCredentials && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">User Created Successfully!</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">{newUserCredentials.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{newUserCredentials.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900">{newUserCredentials.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <p className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">{newUserCredentials.password}</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Important:</strong> Please share these credentials with the user. 
                      They can change their password after first login.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button
                    className="px-4 py-2 text-white text-sm rounded-md hover:bg-purple-700"
                    onClick={() => {
                      setShowCredentials(false);
                      setNewUserCredentials(null);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserManagementPage;
