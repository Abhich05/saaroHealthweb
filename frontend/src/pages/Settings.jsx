import React, { useEffect, useMemo, useState, useContext } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
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
import SettingsSkeletonLoader from '../components/ui/SettingsSkeletonLoader';
import MapPicker from '../components/maps/MapPicker';
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
    // OPD locations state (realtime editable)
    const [opdLocations, setOpdLocations] = useState([{
        id: crypto.randomUUID(),
        clinicName: '',
        city: '',
        address: '',
        days: { Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false, Sun: false },
        startTime: '09:00',
        endTime: '17:00',
        slotMins: 10,
        active: true,
        mapLocation: null // reserved for Google Maps coords/address
    }]);

    // Map picker modal state
    const [mapPickerOpen, setMapPickerOpen] = useState(false);
    const [mapPickerLocId, setMapPickerLocId] = useState(null);

    // OPD validation state (ids of invalid cards)
    const [invalidOpdIds, setInvalidOpdIds] = useState([]);

    // Inline map open state per card
    const [openMapIds, setOpenMapIds] = useState([]);

    // Load Google Maps API (for inline maps)
    const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const { isLoaded: isMapLibLoaded, loadError: mapLibError } = useLoadScript({
        googleMapsApiKey: mapsApiKey || '',
    });

    const validateOpdLocations = () => {
        const invalidIds = opdLocations.filter(loc => {
            const hasDay = Object.values(loc.days || {}).some(Boolean);
            const validTimes = !!loc.startTime && !!loc.endTime && loc.startTime < loc.endTime;
            return !(hasDay && validTimes);
        }).map(l => l.id);
        setInvalidOpdIds(invalidIds);
        if (invalidIds.length) {
            toast.error(`Please select days and valid timings for ${invalidIds.length} OPD location(s).`);
            return false;
        }
        return true;
    };

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
                    const normalizeUrl = (url) => {
                        try {
                            const apiOrigin = new URL(axiosInstance.defaults.baseURL).origin;
                            const resolved = new URL(url, apiOrigin);
                            const pageIsHttps = window.location.protocol === 'https:';
                            if (resolved.hostname.includes('localhost') && !window.location.hostname.includes('localhost')) {
                                return `${apiOrigin}${resolved.pathname}`;
                            }
                            if (pageIsHttps && resolved.protocol !== 'https:') {
                                return `https://${resolved.host}${resolved.pathname}`;
                            }
                            return resolved.href;
                        } catch (e) {
                            return url;
                        }
                    };
                    const safeAvatar = normalizeUrl(profileData.avatar);
                    setAvatarPreview(safeAvatar);
                    setAvatarFileName(safeAvatar.split('/').pop() || 'profile.jpg');
                }
                // load OPD locations if available
                if (profileData.opdLocations && Array.isArray(profileData.opdLocations) && profileData.opdLocations.length > 0) {
                    setOpdLocations(profileData.opdLocations.map(loc => ({ ...loc, id: loc.id || crypto.randomUUID() })));
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
                opdLocations: opdLocations,
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
                                    <SettingsSkeletonLoader />
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
                                                    onError={(e) => {
                                                        e.target.src = "https://randomuser.me/api/portraits/lego/1.jpg";
                                                    }}
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

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold">OPD Locations</h3>
                                            <button
                                                onClick={() => setOpdLocations(prev => [...prev, {
                                                    id: crypto.randomUUID(), clinicName: '', city: '', address: '', days: { Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false, Sun: false }, startTime: '09:00', endTime: '17:00', slotMins: 10, active: true, mapLocation: null
                                                }])}
                                                className="bg-[#ede9fe] font-semibold px-5 py-2 rounded-full text-black"
                                            >
                                                Add OPD Location
                                            </button>
                                        </div>

                                        {opdLocations.map((loc, idx) => (
                                            <div key={loc.id} className={`p-4 border rounded-lg bg-white ${invalidOpdIds.includes(loc.id) ? 'border-red-300' : ''}`}>
                                                {/* Header row */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-sm font-semibold text-[#120F1A]">OPD Slot {idx + 1}</span>
                                                    <label className="flex items-center gap-2 text-sm">
                                                        <span>Active</span>
                                                        <input type="checkbox" checked={loc.active} onChange={(e) => setOpdLocations(prev => prev.map(p => p.id===loc.id ? { ...p, active: e.target.checked } : p))} />
                                                    </label>
                                                </div>

                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex-1">
                                                        <div className="mt-0">
                                                            <label className="block text-sm font-medium">Active Days</label>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {Object.keys(loc.days).map(day => (
                                                                    <label key={day} className={`px-3 py-1 rounded-full cursor-pointer ${loc.days[day] ? 'bg-[#5e3bea] text-white' : 'bg-[#EBE8F2]'}`}>
                                                                        <input type="checkbox" checked={loc.days[day]} onChange={(e) => setOpdLocations(prev => prev.map(p => p.id===loc.id ? { ...p, days: { ...p.days, [day]: e.target.checked } } : p))} className="mr-2" />
                                                                        {day}
                                                                    </label>
                                                                ))}
                                                            </div>
                                                            {invalidOpdIds.includes(loc.id) && !Object.values(loc.days || {}).some(Boolean) && (
                                                                <p className="text-xs text-red-500 mt-1">Select at least one day.</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="w-72">
                                                        <label className="block text-sm font-medium">Timings</label>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <input type="time" value={loc.startTime} onChange={(e) => setOpdLocations(prev => prev.map(p => p.id===loc.id ? { ...p, startTime: e.target.value } : p))} className={`w-full border rounded p-2 ${invalidOpdIds.includes(loc.id) && !(loc.startTime && loc.endTime && loc.startTime < loc.endTime) ? 'border-red-300' : ''}`} />
                                                            <span className="text-gray-500">-</span>
                                                            <input type="time" value={loc.endTime} onChange={(e) => setOpdLocations(prev => prev.map(p => p.id===loc.id ? { ...p, endTime: e.target.value } : p))} className={`w-full border rounded p-2 ${invalidOpdIds.includes(loc.id) && !(loc.startTime && loc.endTime && loc.startTime < loc.endTime) ? 'border-red-300' : ''}`} />
                                                        </div>

                                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                                            <button onClick={() => setOpdLocations(prev => prev.filter(p => p.id !== loc.id))} className="px-3 py-1 bg-red-500 text-white rounded">Remove</button>
                                                            <button onClick={() => setOpdLocations(prev => {
                                                                const copy = { ...loc, id: crypto.randomUUID() };
                                                                return [...prev, copy];
                                                            })} className="px-3 py-1 bg-gray-100 rounded">Duplicate</button>
                                                            <button onClick={() => {
                                                                setOpenMapIds(prev => prev.includes(loc.id) ? prev.filter(id => id !== loc.id) : [...prev, loc.id]);
                                                            }} className="px-3 py-1 bg-gray-200 rounded">{openMapIds.includes(loc.id) ? 'Hide Map' : 'Show Map'}</button>
                                                            <button
                                                                onClick={() => setOpdLocations(prev => prev.map(p => p.id===loc.id ? { ...p, mapLocation: null } : p))}
                                                                className="px-3 py-1 bg-gray-100 rounded"
                                                                disabled={!loc.mapLocation}
                                                            >Clear Map</button>
                                                            {loc.mapLocation && (
                                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Map set</span>
                                                            )}
                                                        </div>
                                                        {openMapIds.includes(loc.id) && (
                                                            <div className="mt-3 border rounded overflow-hidden" style={{ height: 280 }}>
                                                                {!mapsApiKey ? (
                                                                    <div className="h-full w-full bg-gray-50 flex items-center justify-center text-sm text-gray-600">
                                                                        Map demo — API key not set. Add VITE_GOOGLE_MAPS_API_KEY to show interactive map.
                                                                    </div>
                                                                ) : !isMapLibLoaded ? (
                                                                    <div className="h-full flex items-center justify-center text-sm text-gray-500">Loading map…</div>
                                                                ) : mapLibError ? (
                                                                    <div className="h-full flex items-center justify-center text-sm text-red-600">Failed to load map</div>
                                                                ) : (
                                                                    <GoogleMap
                                                                        mapContainerStyle={{ width: '100%', height: '100%' }}
                                                                        center={loc.mapLocation || { lat: 28.6139, lng: 77.2090 }}
                                                                        zoom={14}
                                                                        onClick={(e) => {
                                                                            const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                                                                            setOpdLocations(prev => prev.map(p => p.id===loc.id ? { ...p, mapLocation: coords } : p));
                                                                        }}
                                                                        options={{ streetViewControl: false, mapTypeControl: false }}
                                                                    >
                                                                        { (loc.mapLocation) && (
                                                                            <Marker
                                                                                position={loc.mapLocation}
                                                                                draggable={true}
                                                                                onDragEnd={(e) => {
                                                                                    const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                                                                                    setOpdLocations(prev => prev.map(p => p.id===loc.id ? { ...p, mapLocation: coords } : p));
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </GoogleMap>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="flex gap-3 mt-4">
                                            <button onClick={async () => {
                                                // Validate first
                                                if (!validateOpdLocations()) return;
                                                // Save OPD locations to profile (doctor)
                                                try {
                                                    const doctorId = localStorage.getItem('doctorId');
                                                    await axiosInstance.put(`/doctor/${doctorId}/opd-locations`, { opdLocations });
                                                    toast.success('OPD locations saved');
                                                    setInvalidOpdIds([]);
                                                } catch (err) {
                                                    console.error(err);
                                                    toast.error('Failed to save OPD locations');
                                                }
                                            }} className="px-4 py-2 bg-purple-600 text-white rounded">Save OPD Locations</button>

                                            <button onClick={() => {
                                                // reset to initial single blank
                                                setOpdLocations([{
                                                    id: crypto.randomUUID(), clinicName: '', city: '', address: '', days: { Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false, Sun: false }, startTime: '09:00', endTime: '17:00', slotMins: 10, active: true, mapLocation: null
                                                }]);
                                                setInvalidOpdIds([]);
                                            }} className="px-4 py-2 bg-gray-200 rounded">Reset</button>
                                        </div>
                                    </div>

                                    {/* Removed stray global Active toggle (hidden) */}
                                    <div className="hidden mt-6 bg-[#FAFAFA] rounded-md p-4 flex justify-between items-center">
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
                <MapPicker
                    isOpen={mapPickerOpen}
                    onClose={() => setMapPickerOpen(false)}
                    onSelect={(coords) => {
                        setOpdLocations(prev => prev.map(p => p.id === mapPickerLocId ? { ...p, mapLocation: coords } : p));
                        setMapPickerOpen(false);
                    }}
                    initialPosition={(opdLocations.find(l => l.id === mapPickerLocId)?.mapLocation) || { lat: 28.6139, lng: 77.2090 }}
                />
            </div>
        </div>
    );
};

export default Settings;
