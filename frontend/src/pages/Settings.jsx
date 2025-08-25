import React, { useEffect, useMemo, useState, useContext, useRef } from 'react';
import { GoogleMap, Marker, useLoadScript, Autocomplete } from '@react-google-maps/api';
import GenericTable from '../components/ui/GenericTable';
import TabHeader from '../components/ui/TabHeader';
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import { reviewData, templatesData } from '../data/SettingsData';
import { FiSearch, FiCamera } from 'react-icons/fi';
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
    // Branding assets state
    const [brandingLogoPreview, setBrandingLogoPreview] = useState(null);
    const [brandingLogoFileName, setBrandingLogoFileName] = useState('');
    const [brandingLogoFile, setBrandingLogoFile] = useState(null);
    const [brandingLogoIsPdf, setBrandingLogoIsPdf] = useState(false);

    const [brandingLetterheadPreview, setBrandingLetterheadPreview] = useState(null);
    const [brandingLetterheadFileName, setBrandingLetterheadFileName] = useState('');
    const [brandingLetterheadFile, setBrandingLetterheadFile] = useState(null);
    const [brandingLetterheadIsPdf, setBrandingLetterheadIsPdf] = useState(false);

    const [brandingSignaturePreview, setBrandingSignaturePreview] = useState(null);
    const [brandingSignatureFileName, setBrandingSignatureFileName] = useState('');
    const [brandingSignatureFile, setBrandingSignatureFile] = useState(null);
    const [brandingSignatureIsPdf, setBrandingSignatureIsPdf] = useState(false);

    // URL normalizer to handle localhost/https for previews
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

    // Branding theme state (colors + font)
    const [brandingColors, setBrandingColors] = useState({
        primary: '#5e3bea',
        secondary: '#7c69a7',
        neutral: '#120F1A',
    });
    const [brandingFont, setBrandingFont] = useState({ family: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"', size: 14 });

    // Get current user/doctor context
    const doctorName = useContext(DoctorNameContext);
    const user = useContext(UserContext);

    const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [responseText, setResponseText] = useState('');

    const [name, setName] = useState('');
    const [clinicName, setClinicName] = useState('');
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
        libraries: ['places']
    });

    // Unsaved changes tracking
    const [isDirty, setIsDirty] = useState(false);
    const markDirty = () => setIsDirty(true);
    useEffect(() => {
        const beforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', beforeUnload);
        return () => window.removeEventListener('beforeunload', beforeUnload);
    }, [isDirty]);

    // Intercept tab change when there are unsaved changes
    const handleTabChange = (nextTabId) => {
        if (isDirty && nextTabId !== activeTab) {
            const ok = window.confirm('You have unsaved changes. Are you sure you want to switch tabs?');
            if (!ok) return;
        }
        setActiveTab(nextTabId);
    };

    // Autocomplete refs per OPD card
    const autoRefs = useRef({});

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

    // Branding file handlers
    const isPdf = (s) => typeof s === 'string' && s.toLowerCase().endsWith('.pdf');
    const handleBrandingChange = (type) => (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const isImage = file.type.startsWith('image/');
        const isPdfFile = file.type === 'application/pdf';
        if (!(isImage || isPdfFile)) {
            toast.error('Please select an image or PDF file');
            return;
        }
        const url = URL.createObjectURL(file);
        if (type === 'logo') {
            setBrandingLogoFile(file);
            setBrandingLogoFileName(file.name);
            setBrandingLogoPreview(url);
            setBrandingLogoIsPdf(isPdfFile);
        } else if (type === 'letterhead') {
            setBrandingLetterheadFile(file);
            setBrandingLetterheadFileName(file.name);
            setBrandingLetterheadPreview(url);
            setBrandingLetterheadIsPdf(isPdfFile);
        } else if (type === 'signature') {
            setBrandingSignatureFile(file);
            setBrandingSignatureFileName(file.name);
            setBrandingSignaturePreview(url);
            setBrandingSignatureIsPdf(isPdfFile);
        }
        markDirty();
    };

    const removeBranding = (type) => {
        if (type === 'logo') {
            setBrandingLogoFile(null);
            setBrandingLogoPreview(null);
            setBrandingLogoFileName('');
            setBrandingLogoIsPdf(false);
        } else if (type === 'letterhead') {
            setBrandingLetterheadFile(null);
            setBrandingLetterheadPreview(null);
            setBrandingLetterheadFileName('');
            setBrandingLetterheadIsPdf(false);
        } else if (type === 'signature') {
            setBrandingSignatureFile(null);
            setBrandingSignaturePreview(null);
            setBrandingSignatureFileName('');
            setBrandingSignatureIsPdf(false);
        }
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
        { id: 'branding', label: 'Branding' },
        { id: 'templates', label: 'Templates' },
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
            markDirty();
        }
    };
    const removeAvatar = () => {
    setAvatarPreview(null);
    setAvatarFileName('');
    const input = document.getElementById("avatar-upload");
    if (input) input.value = null;
    markDirty();
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
                endpoint = `/doctor/change-password`;
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
                setClinicName(profileData.clinicName || '');
                
                // Set avatar if available
                if (profileData.avatar) {
                    const safeAvatar = normalizeUrl(profileData.avatar);
                    setAvatarPreview(safeAvatar);
                    setAvatarFileName(safeAvatar.split('/').pop() || 'profile.jpg');
                }
                // Branding assets
                if (profileData.brandingLogo) {
                    const safe = normalizeUrl(profileData.brandingLogo);
                    setBrandingLogoPreview(safe);
                    setBrandingLogoFileName(safe.split('/').pop());
                    setBrandingLogoIsPdf(safe.toLowerCase().endsWith('.pdf'));
                }
                if (profileData.brandingLetterhead) {
                    const safe = normalizeUrl(profileData.brandingLetterhead);
                    setBrandingLetterheadPreview(safe);
                    setBrandingLetterheadFileName(safe.split('/').pop());
                    setBrandingLetterheadIsPdf(safe.toLowerCase().endsWith('.pdf'));
                }
                if (profileData.brandingSignature) {
                    const safe = normalizeUrl(profileData.brandingSignature);
                    setBrandingSignaturePreview(safe);
                    setBrandingSignatureFileName(safe.split('/').pop());
                    setBrandingSignatureIsPdf(safe.toLowerCase().endsWith('.pdf'));
                }
                // Branding theme
                if (profileData.brandingColors) {
                    setBrandingColors(prev => ({
                        ...prev,
                        ...profileData.brandingColors,
                    }));
                }
                if (profileData.brandingFont) {
                    setBrandingFont(prev => ({
                        ...prev,
                        ...profileData.brandingFont,
                    }));
                }
                // load OPD locations if available in profile
                if (profileData.opdLocations && Array.isArray(profileData.opdLocations) && profileData.opdLocations.length > 0) {
                    setOpdLocations(profileData.opdLocations.map(loc => ({ ...loc, id: loc.id || crypto.randomUUID() })));
                } else if (!isUserLogin && doctorId) {
                    // fallback: fetch from dedicated endpoint
                    try {
                        const opdRes = await axiosInstance.get(`/doctor/${doctorId}/opd-locations`);
                        const list = opdRes.data?.opdLocations || [];
                        if (Array.isArray(list) && list.length > 0) {
                            setOpdLocations(list.map(loc => ({ ...loc, id: loc.id || crypto.randomUUID() })));
                        }
                    } catch (e) {
                        // ignore silently, keep default blank state
                    }
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
                brandingColors,
                brandingFont,
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
                    // Update preview immediately with normalized URL
                    const safeAvatar = normalizeUrl(uploadResponse.data.avatarUrl);
                    setAvatarPreview(safeAvatar);
                } catch (uploadError) {
                    toast.error('Failed to upload avatar. Profile updated without avatar.');
                }
            }
            // Upload branding assets if newly selected
            try {
                if (brandingLogoFile) {
                    const fd = new FormData();
                    fd.append('brandingLogo', brandingLogoFile);
                    const res = await axiosInstance.post('/fileUploader/branding/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                    profileData.brandingLogo = res.data.url;
                }
                if (brandingLetterheadFile) {
                    const fd = new FormData();
                    fd.append('brandingLetterhead', brandingLetterheadFile);
                    const res = await axiosInstance.post('/fileUploader/branding/letterhead', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                    profileData.brandingLetterhead = res.data.url;
                }
                if (brandingSignatureFile) {
                    const fd = new FormData();
                    fd.append('brandingSignature', brandingSignatureFile);
                    const res = await axiosInstance.post('/fileUploader/branding/signature', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                    profileData.brandingSignature = res.data.url;
                }
            } catch (e) {
                toast.error('Failed to upload one or more branding assets.');
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
            
            // Notify header to update without full reload
            window.dispatchEvent(new CustomEvent('profile-updated', {
                detail: { avatar: profileData.avatar, name: profileData.name }
            }));
            setIsDirty(false);
            
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
                    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
                        <h1
                            className="text-3xl leading-10 font-semibold mb-4"
                            style={{ color: brandingColors.neutral }}
                        >
                            Settings
                        </h1>
                        <div className='flex justify-start w-max mb-4 ml-0'>
                            <TabHeader
                                tabs={tabs}
                                activeTabId={activeTab}
                                setActiveTabId={handleTabChange}
                                // Remove default blue and inject brand styles for active tab
                                activeBg=""
                                activeText=""
                                activeBorder="border-2"
                                inactiveBg="bg-gray-100"
                                inactiveText="text-gray-700"
                                inactiveBorder="border-2 border-gray-200"
                                inactiveHover="hover:bg-gray-200"
                                activeStyle={{ backgroundColor: brandingColors.primary, color: '#ffffff', borderColor: brandingColors.primary }}
                                inactiveStyle={{}}
                            />
                        </div>

                            {activeTab === 'profile' && (
                            <div className="space-y-6">
                                {profileLoading ? (
                                    <SettingsSkeletonLoader />
                                ) : (
                                    <>
                                        <h2 className="text-lg font-semibold text-gray-900">Profile & Availability</h2>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                                    {/* Left: Avatar / Upload card */}
                                    <div className="lg:col-span-1">
                                        <label className="block font-medium text-gray-700 mb-2">Profile Picture</label>
                                        <div className="flex flex-col items-center">
                                            {/* Avatar with camera overlay */}
                                            <div className="relative w-28 h-28">
                                                {avatarPreview ? (
                                                    <img
                                                        src={avatarPreview}
                                                        alt="Avatar Preview"
                                                        className="w-28 h-28 rounded-full object-cover border-2 border-gray-300"
                                                        onError={(e) => { e.target.src = 'https://randomuser.me/api/portraits/lego/1.jpg'; }}
                                                    />
                                                ) : (
                                                    <div className="w-28 h-28 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center text-gray-500 text-sm">
                                                        Photo
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    onChange={handleAvatarChange}
                                                    className="hidden"
                                                    id="avatar-upload"
                                                    accept="image/*"
                                                />
                                                <label
                                                    htmlFor="avatar-upload"
                                                    className="absolute -bottom-1 -right-1 p-2 rounded-full bg-black/60 hover:bg-black/70 text-white cursor-pointer shadow-md"
                                                    title="Change photo"
                                                >
                                                    <FiCamera size={16} />
                                                </label>
                                            </div>
                                            {/* Bio under avatar */}
                                            <div className="w-full mt-6">
                                                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio / About</label>
                                                <textarea
                                                    id="bio"
                                                    value={bio}
                                                    onChange={(e) => { setBio(e.target.value); markDirty(); }}
                                                    placeholder="Tell us about yourself..."
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 h-28 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Form fields */}
                                    <div className="lg:col-span-2">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                                <input
                                                    id="name"
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => { setName(e.target.value); markDirty(); }}
                                                    placeholder="Enter your name"
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                                <input
                                                    id="mobile"
                                                    type="tel"
                                                    value={mobile}
                                                    onChange={(e) => { setMobile(e.target.value); markDirty(); }}
                                                    placeholder="Enter mobile number"
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => { setEmail(e.target.value); markDirty(); }}
                                                    placeholder="Enter your email"
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                                                <input
                                                    id="experience"
                                                    type="number"
                                                    value={experience}
                                                    onChange={(e) => { setExperience(e.target.value); markDirty(); }}
                                                    placeholder="e.g., 5"
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                                                <input
                                                    id="specialization"
                                                    type="text"
                                                    value={specialization}
                                                    onChange={(e) => { setSpecialization(e.target.value); markDirty(); }}
                                                    placeholder="e.g., Cardiology, Pediatrics"
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                                                <input
                                                    id="education"
                                                    type="text"
                                                    value={education}
                                                    onChange={(e) => { setEducation(e.target.value); markDirty(); }}
                                                    placeholder="e.g., MBBS, MD"
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>

                                            {/* Save button */}
                                            <div className="sm:col-span-2 flex justify-end pt-4 border-t border-gray-100">
                                                <button
                                                    onClick={handleSaveProfile}
                                                    disabled={profileSaving}
                                                    className="w-full sm:w-auto text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 hover:opacity-90 focus:outline-none"
                                                    style={{ backgroundColor: brandingColors.primary }}
                                                    onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 3px ${brandingColors.primary}33`; }}
                                                    onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                                                >
                                                    {profileSaving ? 'Saving...' : 'Save Profile'}
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                

                                <div className="mt-10">
                                    <h2 className="text-xl font-bold text-left mb-4">
                                        OPD & Appointment Timing Management
                                    </h2>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold">OPD Locations</h3>
                                            <button
                                                onClick={() => { setOpdLocations(prev => [...prev, {
                                                    id: crypto.randomUUID(), clinicName: '', city: '', address: '', days: { Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false, Sun: false }, startTime: '09:00', endTime: '17:00', slotMins: 10, active: true, mapLocation: null
                                                }]); markDirty(); }}
                                                className="font-semibold px-5 py-2 rounded-full text-white"
                                                style={{ backgroundColor: brandingColors.primary }}
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
                                                        <input type="checkbox" checked={loc.active} onChange={(e) => { setOpdLocations(prev => prev.map(p => p.id===loc.id ? { ...p, active: e.target.checked } : p)); markDirty(); }} />
                                                    </label>
                                                </div>

                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex-1">
                                                        <div className="mt-0">
                                                            <label className="block text-sm font-medium">Active Days</label>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {Object.keys(loc.days).map(day => (
                                                                    <label key={day} className={`px-3 py-1 rounded-full cursor-pointer ${loc.days[day] ? 'bg-[#5e3bea] text-white' : 'bg-[#EBE8F2]'}`}>
                                                                        <input type="checkbox" checked={loc.days[day]} onChange={(e) => { setOpdLocations(prev => prev.map(p => p.id===loc.id ? { ...p, days: { ...p.days, [day]: e.target.checked } } : p)); markDirty(); }} className="mr-2" />
                                                                        {day}
                                                                    </label>
                                                                ))}
                                                            </div>
                                                            {invalidOpdIds.includes(loc.id) && !Object.values(loc.days || {}).some(Boolean) && (
                                                                <p className="text-xs text-red-500 mt-1">Select at least one day.</p>
                                                            )}
                                                        </div>
                                                        {/* Inline Map directly below Active Days */}
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
                                                                        markDirty();
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
                                                                                markDirty();
                                                                            }}
                                                                        />
                                                                    )}
                                                                </GoogleMap>
                                                            )}
                                                        </div>

                                                    </div>

                                                    <div className="w-72">
                                                        <label className="block text-sm font-medium">Timings</label>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <input type="time" value={loc.startTime} onChange={(e) => { setOpdLocations(prev => prev.map(p => p.id===loc.id ? { ...p, startTime: e.target.value } : p)); markDirty(); }} className={`w-full border rounded p-2 ${invalidOpdIds.includes(loc.id) && !(loc.startTime && loc.endTime && loc.startTime < loc.endTime) ? 'border-red-300' : ''}`} />
                                                            <span className="text-gray-500">-</span>
                                                            <input type="time" value={loc.endTime} onChange={(e) => { setOpdLocations(prev => prev.map(p => p.id===loc.id ? { ...p, endTime: e.target.value } : p)); markDirty(); }} className={`w-full border rounded p-2 ${invalidOpdIds.includes(loc.id) && !(loc.startTime && loc.endTime && loc.startTime < loc.endTime) ? 'border-red-300' : ''}`} />
                                                        </div>

                                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                                            <button onClick={() => { setOpdLocations(prev => prev.filter(p => p.id !== loc.id)); markDirty(); }} className="px-3 py-1 bg-red-500 text-white rounded">Remove</button>
                                                            <button onClick={() => { setOpdLocations(prev => {
                                                                const copy = { ...loc, id: crypto.randomUUID() };
                                                                return [...prev, copy];
                                                            }); markDirty(); }} className="px-3 py-1 bg-gray-100 rounded">Duplicate</button>
                                                            <button
                                                                onClick={() => { setMapPickerLocId(loc.id); setMapPickerOpen(true); }}
                                                                className="px-3 py-1 bg-[#ede9fe] rounded"
                                                            >Search on Map</button>
                                                            {/* Map is now always visible below Active Days; toggle removed */}
                                                            <button
                                                                onClick={() => { setOpdLocations(prev => prev.map(p => p.id===loc.id ? { ...p, mapLocation: null } : p)); markDirty(); }}
                                                                className="px-3 py-1 bg-gray-100 rounded"
                                                                disabled={!loc.mapLocation}
                                                            >Clear Map</button>
                                                            {loc.mapLocation && (
                                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Map set</span>
                                                            )}
                                                        </div>
                                                        {/* Clinic details */}
                                                        <div className="mt-3 grid grid-cols-1 gap-2">
                                                            <div>
                                                                <label className="block text-xs text-gray-600">Clinic Name</label>
                                                                <input
                                                                    type="text"
                                                                    value={loc.clinicName}
                                                                    onChange={(e) => setOpdLocations(prev => prev.map(p => p.id===loc.id ? { ...p, clinicName: e.target.value } : p))}
                                                                    className="w-full border rounded p-2 text-sm"
                                                                    placeholder="e.g., City Heart Clinic"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs text-gray-600">City</label>
                                                                <input
                                                                    type="text"
                                                                    value={loc.city}
                                                                    onChange={(e) => { setOpdLocations(prev => prev.map(p => p.id===loc.id ? { ...p, city: e.target.value } : p)); markDirty(); }}
                                                                    className="w-full border rounded p-2 text-sm"
                                                                    placeholder="e.g., Jaipur"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs text-gray-600">Address</label>
                                                                {isMapLibLoaded && (
                                                                    <Autocomplete
                                                                        onLoad={(ref) => { autoRefs.current[loc.id] = ref; }}
                                                                        onPlaceChanged={() => {
                                                                            const ref = autoRefs.current[loc.id];
                                                                            if (!ref) return;
                                                                            const place = ref.getPlace();
                                                                            const formatted = place?.formatted_address || '';
                                                                            const geometry = place?.geometry?.location;
                                                                            let coords = null;
                                                                            if (geometry) {
                                                                                coords = { lat: geometry.lat(), lng: geometry.lng() };
                                                                            }
                                                                            // Attempt to extract city from address components
                                                                            let cityName = loc.city;
                                                                            const comps = place?.address_components || [];
                                                                            const locality = comps.find(c => c.types.includes('locality'));
                                                                            const administrative = comps.find(c => c.types.includes('administrative_area_level_2'));
                                                                            if (locality) cityName = locality.long_name;
                                                                            else if (administrative) cityName = administrative.long_name;
                                                                            setOpdLocations(prev => prev.map(p => p.id===loc.id ? { ...p, address: formatted, city: cityName, mapLocation: coords || p.mapLocation } : p));
                                                                            markDirty();
                                                                        }}
                                                                    >
                                                                        <input
                                                                            type="text"
                                                                            value={loc.address}
                                                                            onChange={(e) => { setOpdLocations(prev => prev.map(p => p.id===loc.id ? { ...p, address: e.target.value } : p)); markDirty(); }}
                                                                            className="w-full border rounded p-2 text-sm"
                                                                            placeholder="Street, Area, Pincode"
                                                                        />
                                                                    </Autocomplete>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {/* (Old conditional map removed) */}
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
                                                    setIsDirty(false);
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
                                                markDirty();
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

                        {activeTab === 'branding' && (
                            <div>
                                <h2 className="text-[#120F1A] text-[22px] font-semibold mb-4">Branding</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Controls */}
                                    <div className="p-4 border rounded-lg bg-white space-y-4">
                                        <h3 className="font-semibold">Theme</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Primary</label>
                                                <input type="color" value={brandingColors.primary} onChange={(e)=>setBrandingColors(c=>({...c, primary: e.target.value}))} className="w-12 h-10 p-0 border rounded" />
                                                <input type="text" value={brandingColors.primary} onChange={(e)=>setBrandingColors(c=>({...c, primary: e.target.value}))} className="mt-2 w-full border rounded px-2 py-1 text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Secondary</label>
                                                <input type="color" value={brandingColors.secondary} onChange={(e)=>setBrandingColors(c=>({...c, secondary: e.target.value}))} className="w-12 h-10 p-0 border rounded" />
                                                <input type="text" value={brandingColors.secondary} onChange={(e)=>setBrandingColors(c=>({...c, secondary: e.target.value}))} className="mt-2 w-full border rounded px-2 py-1 text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Neutral</label>
                                                <input type="color" value={brandingColors.neutral} onChange={(e)=>setBrandingColors(c=>({...c, neutral: e.target.value}))} className="w-12 h-10 p-0 border rounded" />
                                                <input type="text" value={brandingColors.neutral} onChange={(e)=>setBrandingColors(c=>({...c, neutral: e.target.value}))} className="mt-2 w-full border rounded px-2 py-1 text-sm" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium mb-1">Font Family</label>
                                                <select value={brandingFont.family} onChange={(e)=>setBrandingFont(f=>({...f, family: e.target.value}))} className="w-full border rounded px-2 py-2 text-sm">
                                                    <option value="Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'">Inter / System</option>
                                                    <option value="Roboto, system-ui, -apple-system, Segoe UI, Inter, Helvetica Neue, Arial, sans-serif">Roboto</option>
                                                    <option value="Segoe UI, Inter, system-ui, -apple-system, Roboto, Helvetica Neue, Arial, sans-serif">Segoe UI</option>
                                                    <option value="Nunito, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif">Nunito</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Base Font Size</label>
                                                <input type="number" min={12} max={20} value={brandingFont.size} onChange={(e)=>setBrandingFont(f=>({...f, size: Number(e.target.value)}))} className="w-full border rounded px-2 py-2 text-sm" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500">These settings will be used across prescription templates and docs.</p>
                                    </div>

                                    {/* Live Preview */}
                                    <div className="p-4 border rounded-lg bg-white">
                                        <h3 className="font-semibold mb-3">Live Preview</h3>
                                        <div
                                            className="rounded-lg border"
                                            style={{
                                                borderColor: brandingColors.secondary,
                                                fontFamily: brandingFont.family,
                                                fontSize: `${brandingFont.size}px`,
                                            }}
                                        >
                                            <div className="p-4 flex items-center gap-3" style={{ background: '#fff' }}>
                                                {brandingLogoPreview ? (
                                                    isPdf(brandingLogoPreview) ? (
                                                        <div className="w-12 h-12 flex items-center justify-center border rounded text-xs">PDF</div>
                                                    ) : (
                                                        <img src={brandingLogoPreview} alt="logo" className="w-12 h-12 object-contain" />
                                                    )
                                                ) : (
                                                    <div className="w-12 h-12 rounded bg-gray-100" />
                                                )}
                                                <div>
                                                    <div className="font-bold text-lg" style={{ color: brandingColors.neutral }}>{clinicName || 'Clinic Name'}</div>
                                                    <div className="text-sm" style={{ color: brandingColors.secondary }}>Prescription Template</div>
                                                </div>
                                            </div>
                                            <div className="h-1" style={{ background: brandingColors.primary }} />
                                            <div className="p-4 space-y-2">
                                                <div className="w-2/3 h-3 bg-gray-100 rounded" />
                                                <div className="w-1/2 h-3 bg-gray-100 rounded" />
                                                <div className="w-5/6 h-3 bg-gray-100 rounded" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={profileSaving}
                                        className="text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                                        style={{ backgroundColor: brandingColors.primary }}
                                    >
                                        {profileSaving ? 'Saving...' : 'Save Branding'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'templates' && (
                            <div>
                                <h2 className="text-[#120F1A] text-[22px] font-semibold mb-4">Templates & Branding</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Logo */}
                                    <div className="p-4 border rounded-lg bg-white">
                                        <h3 className="font-semibold mb-1">Clinic Logo</h3>
                                        <p className="text-sm text-gray-500 mb-3">PNG/JPG/SVG up to 10MB</p>
                                        {brandingLogoPreview && (
                                            <div className="mb-3">
                                                {brandingLogoIsPdf || brandingLogoFileName.toLowerCase().endsWith('.pdf') ? (
                                                    <object data={brandingLogoPreview} type="application/pdf" className="w-full h-36 border rounded">
                                                        <a href={brandingLogoPreview} target="_blank" rel="noreferrer" className="text-blue-600 underline">Open PDF</a>
                                                    </object>
                                                ) : (
                                                    <img src={brandingLogoPreview} alt="Logo preview" className="w-full h-36 object-contain border rounded" />
                                                )}
                                            </div>
                                        )}
                                        {brandingLogoFileName && (
                                            <p className="text-xs text-gray-600 truncate mb-2">{brandingLogoFileName}</p>
                                        )}
                                        <div className="flex gap-2">
                                            <label className="inline-block bg-[#ede9fe] text-[#120F1A] px-4 py-2 rounded-3xl text-sm cursor-pointer hover:bg-[#ddd6fe] transition">
                                                Upload
                                                <input type="file" accept="image/*,.pdf" onChange={handleBrandingChange('logo')} className="hidden" />
                                            </label>
                                            {(brandingLogoPreview || brandingLogoFileName) && (
                                                <button onClick={() => removeBranding('logo')} className="px-3 py-2 text-sm bg-gray-100 rounded">Clear</button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Letterhead */}
                                    <div className="p-4 border rounded-lg bg-white">
                                        <h3 className="font-semibold mb-1">Letterhead</h3>
                                        <p className="text-sm text-gray-500 mb-3">Image or PDF up to 10MB</p>
                                        {brandingLetterheadPreview && (
                                            <div className="mb-3">
                                                {brandingLetterheadIsPdf || brandingLetterheadFileName.toLowerCase().endsWith('.pdf') ? (
                                                    <object data={brandingLetterheadPreview} type="application/pdf" className="w-full h-36 border rounded">
                                                        <a href={brandingLetterheadPreview} target="_blank" rel="noreferrer" className="text-blue-600 underline">Open PDF</a>
                                                    </object>
                                                ) : (
                                                    <img src={brandingLetterheadPreview} alt="Letterhead preview" className="w-full h-36 object-cover border rounded" />
                                                )}
                                            </div>
                                        )}
                                        {brandingLetterheadFileName && (
                                            <p className="text-xs text-gray-600 truncate mb-2">{brandingLetterheadFileName}</p>
                                        )}
                                        <div className="flex gap-2">
                                            <label className="inline-block bg-[#ede9fe] text-[#120F1A] px-4 py-2 rounded-3xl text-sm cursor-pointer hover:bg-[#ddd6fe] transition">
                                                Upload
                                                <input type="file" accept="image/*,.pdf" onChange={handleBrandingChange('letterhead')} className="hidden" />
                                            </label>
                                            {(brandingLetterheadPreview || brandingLetterheadFileName) && (
                                                <button onClick={() => removeBranding('letterhead')} className="px-3 py-2 text-sm bg-gray-100 rounded">Clear</button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Signature */}
                                    <div className="p-4 border rounded-lg bg-white">
                                        <h3 className="font-semibold mb-1">Doctor Signature</h3>
                                        <p className="text-sm text-gray-500 mb-3">PNG/JPG up to 10MB</p>
                                        {brandingSignaturePreview && (
                                            <div className="mb-3">
                                                {brandingSignatureIsPdf || brandingSignatureFileName.toLowerCase().endsWith('.pdf') ? (
                                                    <object data={brandingSignaturePreview} type="application/pdf" className="w-full h-36 border rounded">
                                                        <a href={brandingSignaturePreview} target="_blank" rel="noreferrer" className="text-blue-600 underline">Open PDF</a>
                                                    </object>
                                                ) : (
                                                    <img src={brandingSignaturePreview} alt="Signature preview" className="w-full h-36 object-contain border rounded" />
                                                )}
                                            </div>
                                        )}
                                        {brandingSignatureFileName && (
                                            <p className="text-xs text-gray-600 truncate mb-2">{brandingSignatureFileName}</p>
                                        )}
                                        <div className="flex gap-2">
                                            <label className="inline-block bg-[#ede9fe] text-[#120F1A] px-4 py-2 rounded-3xl text-sm cursor-pointer hover:bg-[#ddd6fe] transition">
                                                Upload
                                                <input type="file" accept="image/*,.pdf" onChange={handleBrandingChange('signature')} className="hidden" />
                                            </label>
                                            {(brandingSignaturePreview || brandingSignatureFileName) && (
                                                <button onClick={() => removeBranding('signature')} className="px-3 py-2 text-sm bg-gray-100 rounded">Clear</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
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
                    onSelect={(payload) => {
                        const { coords, clinicName, address, city } = payload || {};
                        setOpdLocations(prev => prev.map(p => p.id === mapPickerLocId ? { ...p, mapLocation: coords || p.mapLocation, clinicName: clinicName || p.clinicName, address: address || p.address, city: city || p.city } : p));
                        setMapPickerOpen(false);
                    }}
                    initialPosition={(opdLocations.find(l => l.id === mapPickerLocId)?.mapLocation) || { lat: 28.6139, lng: 77.2090 }}
                />
            </div>
        </div>
    );
};

export default Settings;
