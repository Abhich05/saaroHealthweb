import React, { useState, useContext, useEffect } from 'react';
import GenericTable from '../components/ui/GenericTable';
import TabHeader from '../components/ui/TabHeader';
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import { reviewData, templatesData } from '../data/SettingsData';
import { FiSearch } from 'react-icons/fi';
import Pagination from '../components/ui/Pagination';
import { UserContext, DoctorNameContext } from '../App';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import Loading from '../components/ui/Loading';
 // <-- your existing Pagination component

const reviewColumns = [
    { label: 'Patient Name', accessor: 'name' },
    { label: 'Rating', accessor: 'rating' },
    { label: 'Review Text', accessor: 'text' },
    { label: 'Date', accessor: 'date' },
    { label: 'Status', accessor: 'status' },
    { label: 'Action', accessor: 'action' },
];



const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [reviews, setReviews] = useState(reviewData);
    const [avatarFileName, setAvatarFileName] = useState('');

    // Get current user/doctor context
    const doctorName = useContext(DoctorNameContext);
    const user = useContext(UserContext);

    const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [responseText, setResponseText] = useState('');

    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [experience, setExperience] = useState(0);
    const [specialization, setSpecialization] = useState('');
    const [education, setEducation] = useState('');
    const [bio, setBio] = useState('');

    // Password change state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordErrors, setPasswordErrors] = useState({});

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // Profile loading state
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);

    const tabs = [
        { id: 'profile', label: 'Profile & Availability' },
        { id: 'reviews', label: 'Manage Reviews' },
        { id: 'templates', label: 'Templates & Branding' },
        { id: 'security', label: 'Security' },
    ];

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size should be less than 5MB');
                return;
            }
            
            setAvatarPreview(URL.createObjectURL(file));
            setAvatarFileName(file.name);
        }
    };
    const removeAvatar = () => {
    setAvatarPreview(null);
    setAvatarFileName('');
    document.getElementById("logo-upload").value = null;
};

    const handlePasswordChange = async () => {
        // Reset errors
        setPasswordErrors({});
        
        // Validation
        const errors = {};
        
        if (!currentPassword) {
            errors.currentPassword = 'Current password is required';
        }
        
        if (!newPassword) {
            errors.newPassword = 'New password is required';
        } else if (newPassword.length < 8) {
            errors.newPassword = 'New password must be at least 8 characters';
        }
        
        if (!confirmPassword) {
            errors.confirmPassword = 'Please confirm your new password';
        } else if (newPassword !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        
        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            return;
        }
        
        try {
            // Determine if it's a doctor or user login
            const isUserLogin = localStorage.getItem('isUserLogin') === 'true';
            const doctorId = localStorage.getItem('doctorId');
            
            let endpoint;
            if (isUserLogin) {
                // User password change
                endpoint = '/user/change-password';
            } else {
                // Doctor password change
                endpoint = `/${doctorId}/change-password`;
            }
            
            console.log('Changing password for:', isUserLogin ? 'user' : 'doctor');
            console.log('Using endpoint:', endpoint);
            
            const response = await axiosInstance.put(endpoint, {
                currentPassword,
                newPassword
            });
            
            toast.success('Password changed successfully!');
            
            // Clear form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPasswordErrors({});
            
        } catch (error) {
            console.error('Password change error:', error);
            const errorMessage = error.response?.data?.error || 'Failed to change password';
            toast.error(errorMessage);
        }
    };

    // Fetch profile data on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setProfileLoading(true);
                const isUserLogin = localStorage.getItem('isUserLogin') === 'true';
                const doctorId = localStorage.getItem('doctorId');
                
                let endpoint;
                if (isUserLogin) {
                    // Fetch user profile
                    endpoint = '/user/me';
                } else {
                    // Fetch doctor profile
                    endpoint = `/doctor/${doctorId}/profile`;
                }
                
                console.log('Fetching profile from:', endpoint);
                
                const response = await axiosInstance.get(endpoint);
                const profileData = response.data.doctor || response.data.user;
                
                console.log('Profile data received:', profileData);
                
                // Update form fields with fetched data
                setName(profileData.name || '');
                setEmail(profileData.email || '');
                setMobile(profileData.mobile || '');
                setExperience(profileData.experience || 0);
                setSpecialization(profileData.specialization || '');
                setEducation(profileData.education || '');
                setBio(profileData.bio || '');
                
                // Set avatar if available
                if (profileData.avatar) {
                    setAvatarPreview(profileData.avatar);
                    setAvatarFileName(profileData.avatar.split('/').pop() || 'profile.jpg');
                }
                
            } catch (error) {
                console.error('Error fetching profile:', error);
                toast.error('Failed to load profile data');
            } finally {
                setProfileLoading(false);
            }
        };
        
        fetchProfile();
    }, []);

    const handleSaveProfile = async () => {
        console.log('=== SAVE PROFILE FUNCTION CALLED ===');
        try {
            setProfileSaving(true);
            const isUserLogin = localStorage.getItem('isUserLogin') === 'true';
            const doctorId = localStorage.getItem('doctorId');
            
            console.log('=== SAVE PROFILE DEBUG ===');
            console.log('Is user login:', isUserLogin);
            console.log('Doctor ID:', doctorId);
            console.log('Current form data:', { name, email, mobile, experience, specialization, education, bio });
            console.log('localStorage items:', {
                isUserLogin: localStorage.getItem('isUserLogin'),
                doctorId: localStorage.getItem('doctorId'),
                userId: localStorage.getItem('userId'),
                doctorName: localStorage.getItem('doctorName'),
                userName: localStorage.getItem('userName')
            });
            
            // Prepare profile data
            const profileData = {
                name: name.trim(),
                email: email.trim(),
                mobile: mobile.trim(),
                experience: experience,
                specialization: specialization.trim(),
                education: education.trim(),
                bio: bio.trim(),
            };
            
            // Add avatar if changed
            if (avatarPreview && avatarPreview.startsWith('blob:')) {
                try {
                    // Convert blob URL to file
                    const response = await fetch(avatarPreview);
                    const blob = await response.blob();
                    const file = new File([blob], avatarFileName, { type: blob.type });
                    
                    // Upload avatar
                    const formData = new FormData();
                    formData.append('avatar', file);
                    
                    const uploadResponse = await axiosInstance.post('/fileUploader/avatar', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                    
                    profileData.avatar = uploadResponse.data.avatarUrl;
                } catch (uploadError) {
                    toast.error('Failed to upload avatar. Profile updated without avatar.');
                }
            }
            
            let endpoint;
            if (isUserLogin) {
                // Update user profile
                endpoint = '/user/profile';
            } else {
                // Update doctor profile
                endpoint = `/doctor/${doctorId}/profile`;
            }
            
            const response = await axiosInstance.put(endpoint, profileData);
            
            toast.success('Profile updated successfully!');
            
            // Update localStorage with new name if it changed
            if (isUserLogin) {
                localStorage.setItem('userName', profileData.name);
            } else {
                localStorage.setItem('doctorName', profileData.name);
            }
            
            // Trigger a page refresh to update the header
            window.location.reload();
            
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to update profile';
            toast.error(errorMessage);
        } finally {
            setProfileSaving(false);
        }
    };


    const filteredData = reviews.filter((row) => {
  return row.name?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
         row.rating?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
         row.date?.toString().toLowerCase().includes(searchTerm.toLowerCase());
});


    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 p-2 bg-white overflow-y-auto">
                    <div className=" max-w-[90%] mx-auto py-8 space-y-10">
                        <h1 className="text-3xl leading-10 font-semibold mb-4">Settings</h1>
                        <div className='flex justify-start w-max mb-4 ml-0'>
                            <TabHeader tabs={tabs} activeTabId={activeTab} setActiveTabId={setActiveTab} />
                        </div>

                            {activeTab === 'profile' && (
                            <div className="space-y-6">
                                {profileLoading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <Loading />
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-lg font-semibold text-gray-900">Profile & Availability</h2>
                                <div className="flex items-center gap-4">
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-1">Profile Picture</label>
                                        
                                        {/* Avatar Preview */}
                                        {avatarPreview && (
                                            <div className="mb-4 flex justify-center">
                                                <img 
                                                    src={avatarPreview} 
                                                    alt="Avatar Preview" 
                                                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                                                />
                                            </div>
                                        )}
                                        
                                        <div className="mb-6 max-w-lg border-2 border-dashed border-gray-300 p-6 rounded-lg text-center">
    <p className="font-medium mb-1">Upload picture</p>
    <p className="text-sm text-gray-500 mb-2">
        Recommended size: 512 × 512 pixels
    </p>
    <input
        type="file"
        onChange={handleAvatarChange}
        className="hidden"
        id="logo-upload"
    />
    <label
        htmlFor="logo-upload"
        className="inline-block px-4 py-1 bg-gray-200 rounded cursor-pointer hover:bg-gray-300 text-sm"
    >
        Upload
    </label>

    {avatarFileName && (
        <div className="mt-4 flex items-center justify-between bg-gray-100 px-4 py-2 rounded-md text-sm text-gray-700">
            <span className="truncate">{avatarFileName}</span>
            <button
                onClick={removeAvatar}
                className="text-red-500 hover:text-red-700 ml-4 text-lg"
                title="Remove file"
            >
                &times;
            </button>
        </div>
    )}
</div>

                                    </div>
                                </div>

                                <div className="flex flex-col gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your name"
                                            className="w-1/2 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                        <input
                                            id="mobile"
                                            type="tel"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                            placeholder="Enter mobile number"
                                            className="w-1/2 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            className="w-1/2 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                                        <input
                                            id="experience"
                                            type="number"
                                            value={experience}
                                            onChange={(e) => setExperience(e.target.value)}
                                            placeholder="e.g., 5"
                                            className="w-1/2 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                                        <input
                                            id="specialization"
                                            type="text"
                                            value={specialization}
                                            onChange={(e) => setSpecialization(e.target.value)}
                                            placeholder="e.g., Cardiology, Pediatrics"
                                            className="w-1/2 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                                        <input
                                            id="education"
                                            type="text"
                                            value={education}
                                            onChange={(e) => setEducation(e.target.value)}
                                            placeholder="e.g., MBBS, MD"
                                            className="w-1/2 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio / About</label>
                                    <textarea
                                        id="bio"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Tell us about yourself..."
                                        className="w-1/2 border border-gray-300 rounded-lg px-4 py-2 h-28 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>


                                <div className="mt-6">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={profileSaving}
                                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                                    >
                                        {profileSaving ? 'Saving...' : 'Save Profile'}
                                    </button>
                                </div>

                                <div className="mt-10">
                                    <h2 className="text-xl font-bold text-left mb-4">
                                        OPD & Appointment Timing Management
                                    </h2>

                                    <div className="flex flex-col md:flex-row justify-around  gap-4">
                                        {/* Left column */}
                                        <div className="flex-1 space-y-4 text-left">
                                            <button className="bg-[#ede9fe] font-semibold px-5 py-2 rounded-full text-black">
                                                Add OPD Location
                                            </button>

                                            <div className="flex flex-wrap justify-between items-start gap-6 w-full">
                                                <div className="flex-1 min-w-[200px]">
                                                    <h3 className="font-semibold text-lg text-gray-800">Clinic Name</h3>
                                                    <p className="text-[#66578f] text-400 text-sm">City, Full Address</p>
                                                </div>

                                                <div className="flex-shrink-0 w-full max-w-md">
                                                    <img
                                                        src="/building.png"
                                                        alt="Clinic"
                                                        className="rounded-xl object-cover w-[320px] h-[171px]"
                                                    />
                                                </div>
                                            </div>


                                            <div className="flex flex-wrap gap-2">
                                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                                                    <span key={day} className="px-4 py-2 bg-[#EBE8F2] rounded-full text-sm">{day}</span>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-2 gap-8 w-1/2">
                                                <div className="space-y-1">
                                                    <p className="text-sm text-[#66578f] text-400">Start Time</p>
                                                    <p className="text-[#120F1A] text-400 font-small">9:00 AM</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm text-[#66578f] text-400">End Time</p>
                                                    <p className="text-[#120F1A] text-400 font-small">5:00 PM</p>
                                                </div>
                                                <div className="space-y-1 col-span-2">
                                                    <p className="text-sm text-[#66578f] text-400">Time Slot</p>
                                                    <p className="text-[#120F1A] text-400 font-small">10 Mins.</p>
                                                </div>
                                            </div>
                                        </div>


                                    </div>

                                    {/* Toggle */}
                                    <div className="mt-6 bg-[#FAFAFA] rounded-md p-4 flex justify-between items-center">
                                        <span className="font-medium text-[#120F1A] text-400">Active</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" />
                                            <div
                                            className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-[#ddd6fe] 
                                            peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] 
                                            after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 
                                            after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
                                            peer-checked:bg-[#5e3bea]"
                                            ></div>
                                        </label>
                                    </div>

                                </div>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div>
                                <h2 className="text-lg font-semibold mb-3">Manage Reviews</h2>
                                <div className="relative w-full mb-4">
                                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by date or rating"
                                        className="w-full pl-10 pr-4 py-2 border rounded-xl bg-[#f1ecf9] text-[#000000] focus:outline-none text-sm"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>
                                <GenericTable
                                    columns={reviewColumns}
                                    data={paginatedData.map((row) => ({
                                        ...row,
                                        action: (
                                            <button
                                                className="text-[#7c69a7] text-sm font-semibold"
                                                onClick={() => {
                                                    setSelectedReview(row);
                                                    setResponseText(row.response || "");
                                                    setIsRespondModalOpen(true);
                                                }}
                                            >
                                                Respond
                                            </button>
                                        ),
                                    }))}
                                    renderCell={(row, accessor) => {
                                        if (accessor === 'status') {
                                            return (
                                                <span className="text-sm px-3 py-1 bg-[#EBE8F2] text-[#120F1A] w-[120px] text-center rounded-full">
                                                    {row[accessor]}
                                                </span>
                                            );
                                        }
                                        if (accessor === 'name') {
                                            return <span className="text-sm">{row[accessor]}</span>;
                                        }
                                        if (accessor === 'action') {
                                            return row[accessor];
                                        }
                                        return <span className="text-sm text-[#7c69a7]">{row[accessor]}</span>;
                                    }}
                                />

                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={(page) => setCurrentPage(page)}
                                />

                                {isRespondModalOpen && (
                                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-y-auto">
                                        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
                                            <button
                                                onClick={() => setIsRespondModalOpen(false)}
                                                className="absolute top-4 right-4 text-xl text-gray-600 hover:text-black"
                                            >
                                                &times;
                                            </button>
                                            <h2 className="text-xl font-semibold mb-4">Respond to {selectedReview.name}</h2>
                                            <p className="text-gray-700 mb-2 italic">"{selectedReview.text}"</p>
                                            <textarea
                                                value={responseText}
                                                onChange={(e) => setResponseText(e.target.value)}
                                                placeholder="Write your response here..."
                                                className="w-full border rounded px-3 py-2 h-32 resize-none"
                                            />
                                            <div className="flex justify-end gap-4 mt-6">
                                                <button
                                                    onClick={() => setIsRespondModalOpen(false)}
                                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const updatedReviews = reviews.map((r) =>
                                                            r === selectedReview ? { ...r, response: responseText, status: "Responded" } : r
                                                        );
                                                        setReviews(updatedReviews);
                                                        setIsRespondModalOpen(false);
                                                        setSelectedReview(null);
                                                        setResponseText('');
                                                    }}
                                                    className="px-4 py-2 bg-[#5e3bea] text-white rounded-md"
                                                >
                                                    Submit Response
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'templates' && (
                            <div>
                                <h2 className="text-[#120F1A] text-[22px] font-semibold  mb-3 ">Prescription & Discharge Templates</h2>
                                {templatesData.map((item, idx) => (
                                    <div key={idx} className="mb-4 flex flex-row justify-between items-start">
                                        <div>
                                            <p className="block mb-1 text-[#120F1A] text-[16px] text-800">{item.label}</p>
                                            <p className='mb-1 text-sm text-[#66578F] text-400'>{item.des}</p>
                                            <label className="inline-block bg-[#ede9fe] text-[#120F1A] px-4 py-2 rounded-3xl text-sm cursor-pointer hover:bg-[#ddd6fe] transition">
                                                Upload
                                                <input type="file" className="hidden" />
                                            </label>
                                        </div>
                                        <img
                                            src={item.img}
                                            alt={item.label}
                                            className="w-[300px] h-[180px] object-cover rounded-lg"
                                        />
                                    </div>
                                ))}
                                <h2 className="text-[#120F1A] text-[22px] font-semibold  mb-3 ">Preview</h2>
                                <img src="/preview.png" className="w-full"/>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                                
                                {/* Current User Info */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Current Account</h3>
                                    <div className="text-sm text-gray-600">
                                        {localStorage.getItem('isUserLogin') === 'true' ? (
                                            <div>
                                                <p><strong>Name:</strong> {localStorage.getItem('userName')}</p>
                                                <p><strong>Role:</strong> {localStorage.getItem('userRole')}</p>
                                                <p><strong>Email:</strong> {localStorage.getItem('userEmail') || 'N/A'}</p>
                                                <p><strong>Clinic:</strong> {localStorage.getItem('clinicName')}</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p><strong>Name:</strong> {doctorName || 'Doctor'}</p>
                                                <p><strong>Role:</strong> Doctor</p>
                                                <p><strong>ID:</strong> {localStorage.getItem('doctorId')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="max-w-md space-y-4">
                                    <div>
                                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                            Current Password
                                        </label>
                                        <input
                                            id="currentPassword"
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => {
                                                setCurrentPassword(e.target.value);
                                                setPasswordErrors(prev => ({ ...prev, currentPassword: '' }));
                                            }}
                                            placeholder="Enter your current password"
                                            className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                                passwordErrors.currentPassword ? 'border-red-500' : ''
                                            }`}
                                        />
                                        {passwordErrors.currentPassword && (
                                            <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                            New Password
                                        </label>
                                        <input
                                            id="newPassword"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => {
                                                setNewPassword(e.target.value);
                                                setPasswordErrors(prev => ({ ...prev, newPassword: '' }));
                                            }}
                                            placeholder="Enter your new password"
                                            className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                                passwordErrors.newPassword ? 'border-red-500' : ''
                                            }`}
                                        />
                                        {passwordErrors.newPassword && (
                                            <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm New Password
                                        </label>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
                                            }}
                                            placeholder="Confirm your new password"
                                            className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                                passwordErrors.confirmPassword ? 'border-red-500' : ''
                                            }`}
                                        />
                                        {passwordErrors.confirmPassword && (
                                            <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                                        )}
                                    </div>

                                    <button
                                        onClick={handlePasswordChange}
                                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Settings;
