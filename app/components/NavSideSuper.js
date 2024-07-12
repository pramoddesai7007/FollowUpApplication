'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListUl, faTableCellsLarge, faUser, faClipboardList, faUserPlus, faSquarePlus, faBuilding, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect} from 'react';
import { faSignOutAlt, faKey } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const NavSideSuper = () => {
    const router = useRouter();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isEmployeeOpen, setEmployeeOpen] = useState(false);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [profilePictureURL, setProfilePictureURL] = useState(null);
    const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
    const [isAdminOpen, setAdminOpen] = useState(false);
    const [changePasswordErrors, setChangePasswordErrors] = useState({});

    const [changePasswordData, setChangePasswordData] = useState({
        email: '',
        currentPassword: '',
        newPassword: '',
    });


    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const toggleEmployee = () => {
        setEmployeeOpen(!isEmployeeOpen);
    };
    const toggleAdmin = () => {
        setAdminOpen(!isAdminOpen);
    };

    const openChangePasswordModal = () => {
        setChangePasswordModalOpen(true);
    };

    // Function to close the changePassword modal
    const closeChangePasswordModal = () => {
        setChangePasswordModalOpen(false);
    };

    const handleChangePassword = async () => {
        // Function to change the password
        try {
            const response = await axios.post('http://localhost:5000/api/auth/changePassword', {
                email: changePasswordData.email,
                currentPassword: changePasswordData.currentPassword,
                newPassword: changePasswordData.newPassword,
            });

            if (response.status === 200) {
                // Password changed successfully
                console.log("Password changed Successfully")
                setChangePasswordData('')
                setChangePasswordModalOpen(false);

                // Add any success message handling here
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                // Handle validation errors
                setChangePasswordErrors(error.response.data.errors);
            } else {
                console.error('Error changing password:', error);
                // Handle other errors here
            }
        }
    };



    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        localStorage.removeItem('empUsername');
        localStorage.removeItem('subUsername');
        router.push('/login');
    };

    useEffect(() => {
        const closeDropdown = (event) => {
            if (isDropdownOpen) {
                if (
                    event.target.closest('.dropdown') === null &&
                    event.target.closest('.dropdown-toggle') === null
                ) {
                    setDropdownOpen(false);
                }
            }
        };

        if (typeof window !== 'undefined') {
            document.addEventListener('click', closeDropdown);
        }

        return () => {
            if (typeof window !== 'undefined') {
                document.removeEventListener('click', closeDropdown);
            }
        };
    }, [isDropdownOpen]);

    
    useEffect(() => {
        const storedProfilePictureURL = localStorage.getItem('profilePictureURL');

        if (storedProfilePictureURL) {
            setProfilePictureURL(storedProfilePictureURL);
        }
    }, []);

    const handleProfilePictureUpload = async (file) => {
        try {
            const formData = new FormData();
            formData.append('profilePicture', file);
            const response = await axios.post('http://localhost:5000/api/task/upload-profile-picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const newProfilePictureURL = response.data.profilePictureURL;

            localStorage.setItem('profilePictureURL', newProfilePictureURL);

            setProfilePictureURL(newProfilePictureURL);
            setDropdownOpen(false);
        } catch (error) {
            console.error('Error uploading profile picture:', error);
        }
    };

    const handleProfilePictureClick = (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('profilePictureUpload');
        fileInput.click();
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleProfilePictureUpload(file);
        }
    };


    return (
        <>
            <nav className="fixed top-0 right-0 z-50 w-full bg-gray-300 text-black border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="px-3 py-3 lg:px-5 lg:pl-3">
                    <div className="flex items-center justify-between">

                        <div className="flex items-center justify-start">
                            <button onClick={toggleSidebar} data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar" aria-controls="logo-sidebar" type="button" className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                                <span className="sr-only">Open sidebar</span>
                                <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                                </svg>
                            </button>
                            <Link href="#" className="flex ml-2 md:mr-24">
                                <span className="self-center text-base md:text-xl font-semibold whitespace-nowrap dark:text-white md:pl-10 text-gray-900">SuperAdmin</span>
                            </Link>
                        </div>

                        <div className="flex items-center">
                            <div className="flex items-center ml-3">
                                <div className="relative inline-block text-left dropdown">
                                    <button
                                        onClick={toggleDropdown}
                                        className="dropdown-toggle text-white flex items-center focus:outline-none"
                                    >
                                        {profilePictureURL ? (
                                            <div className="profile-picture-container">
                                                <Image
                                                    src={profilePictureURL}
                                                    alt="Profile"
                                                    width={32}
                                                    height={32}
                                                    className="profile-picture"
                                                />
                                            </div>
                                        ) : (
                                            <Image
                                                src="/images/man.png"
                                                alt="User"
                                                width={28}
                                                height={28}
                                                className="profile-picture"
                                            />
                                        )}

                                        <span className="ml-2">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-4 h-4 inline-block"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </span>
                                    </button>
                                    {isDropdownOpen && (
                                        <div className="origin-top-right absolute right-0 mt-3 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                            <div
                                                className="py-1"
                                                role="menu"
                                                aria-orientation="vertical"
                                                aria-labelledby="options-menu"
                                            >
                                                <Link
                                                    href="#"
                                                    onClick={handleProfilePictureClick}
                                                    className="px-4 py-1 text-sm text-gray-700 hover:bg-gray-300 hover:text-gray-900 flex items-center font-normal"
                                                >
                                                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                                                    User Profile Picture
                                                </Link>

                                                <button
                                                    onClick={openChangePasswordModal}
                                                    className="px-4 py-1 w-full text-left text-sm text-gray-900 hover:bg-gray-300 hover:text-gray-900 flex items-center font-normal"
                                                    role="menuitem"
                                                >
                                                    <FontAwesomeIcon icon={faKey} className="mr-2" />
                                                    Change Password
                                                </button>

                                                <button
                                                    onClick={logout}
                                                    className="px-4 py-1 w-full text-left text-sm text-gray-900 hover:bg-gray-300 flex items-center font-semibold"
                                                    role="menuitem"
                                                >
                                                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    id="profilePictureUpload"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleProfilePictureChange}
                                />

                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            

            {isChangePasswordModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-container bg-white md:w-2/5 lg:w-2/5 p-8 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg md:text-xl font-semibold mb-4 ">Change Password</h2>
                        <form>
                            <div className="form-group mb-4">
                                <label htmlFor="email" className="block text-gray-700 text-sm md:text-base">Email <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder='Enter Your Email'
                                    className={`w-full p-2 border text-xs md:text-base rounded py-1 ${changePasswordErrors.email ? 'border-red-500' : ''}`}
                                    value={changePasswordData.email}
                                    onChange={(e) => setChangePasswordData({ ...changePasswordData, email: e.target.value })}
                                    required
                                />
                                {changePasswordErrors.email && (
                                    <div className="text-red-500">{changePasswordErrors.email}</div>
                                )}
                            </div>
                            <div className="form-group mb-4">
                                <label htmlFor="currentPassword" className="block text-gray-700 text-sm md:text-base">Current Password<span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    placeholder='Enter Current Password'
                                    className={`w-full p-2 border text-xs md:text-base rounded py-1 ${changePasswordErrors.currentPassword ? 'border-red-500' : ''}`}
                                    value={changePasswordData.currentPassword}
                                    onChange={(e) => setChangePasswordData({ ...changePasswordData, currentPassword: e.target.value })}
                                    required
                                />
                                {changePasswordErrors.currentPassword && (
                                    <div className="text-red-500">{changePasswordErrors.currentPassword}</div>
                                )}
                            </div>
                            <div className="form-group mb-4">
                                <label htmlFor="newPassword" className="block text-gray-700 text-sm md:text-base">New Password<span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    placeholder='Enter New Password'
                                    name="newPassword"
                                    className={`w-full p-2 border text-xs md:text-base rounded py-1 ${changePasswordErrors.newPassword ? 'border-red-500' : ''}`}
                                    value={changePasswordData.newPassword}
                                    onChange={(e) => setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })}
                                    required
                                />
                                {changePasswordErrors.newPassword && (
                                    <div className="text-red-500">{changePasswordErrors.newPassword}</div>
                                )}
                            </div>
                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    className="bg-blue-500 hover-bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 text-xs md:text-sm"
                                    onClick={handleChangePassword}
                                >
                                    Change Password
                                </button>
                                <button
                                    type="button"
                                    className="bg-gray-300 hover-bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded text-xs md:text-sm"
                                    onClick={closeChangePasswordModal}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* SideBar Content */}
            <aside id="logo-sidebar" className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700`} aria-label="Sidebar">
                <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
                    <ul className="space-y-2 font-medium">
                        <li>
                            <Link href="/vectorSuper" className="flex items-center p-2 text-gray-950 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group mr-2">
                                <FontAwesomeIcon icon={faTableCellsLarge} size='xl'
                                    style={{ color: "#3ca8be", marginLeft: '5px' }} />
                                <span className="ml-3">Dashboard</span>
                            </Link>
                        </li>

                        <li>
                            <button onClick={toggleAdmin} className="flex items-center w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group">
                                <FontAwesomeIcon icon={faBuilding} size='xl'
                                    style={{ color: 'red', marginLeft: '8px' }}

                                />
                                <span className="ml-3 pl-1">Company</span>
                                <FontAwesomeIcon icon={faAngleUp} className={`w-5 h-5 ml-auto ${isAdminOpen ? 'rotate-0' : 'rotate-180'}`} />
                            </button>



                            {isAdminOpen && (
                                <ul className="ml-6 space-y-2 font-medium">
                                    <li>
                                        <Link href='/compList' className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group">
                                            <FontAwesomeIcon icon={faListUl} size='xl'
                                                style={{ color: 'red', marginLeft: '5px' }}
                                            />
                                            <span className='ml-3'>Company List</span>

                                        </Link>
                                    </li>
                                    <li>
                                        <Link href='/company' className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group">
                                            <FontAwesomeIcon icon={faSquarePlus} size='xl'
                                                style={{ color: 'red', marginLeft: '5px' }}
                                            />
                                            <span className='ml-3 pl-1'>Add Company</span>
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>


                        <li>
                            <button onClick={toggleEmployee} className="flex items-center w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group">
                                <FontAwesomeIcon icon={faUser} size='xl'
                                    style={{ color: '#3ca8be', marginLeft: '5px' }}
                                />

                                <span className="ml-3 pl-2">Admin</span>
                                <FontAwesomeIcon icon={faAngleUp} className={`w-5 h-5 ml-auto ${isEmployeeOpen ? 'rotate-0' : 'rotate-180'}`} />
                            </button>
                            {isEmployeeOpen && (
                                <ul className="ml-6 space-y-2 font-medium">
                                    <li>
                                        <Link href="/empList" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group">
                                            <FontAwesomeIcon icon={faClipboardList} size='xl'
                                                style={{ color: 'blue', marginLeft: '12px' }}
                                                onClick={() => handleDeleteClick(company._id)}
                                            />
                                            <span className='pl-3 ml-1'>Admin List </span>

                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/employee" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover-bg-gray-700 group">
                                        
                                            <FontAwesomeIcon icon={faUserPlus} size='xl'
                                                style={{ color: 'indigo', marginLeft: '11px' }}
                                                onClick={() => handleDeleteClick(company._id)}
                                            />
                                            <span className='pl-1 ml-1'> Add Admin</span>
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>
                    </ul>
                </div>
            </aside>
        </>
    )
}

export default NavSideSuper