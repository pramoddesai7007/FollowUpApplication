'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListUl, faBuilding, faAngleUp, faTasks, faSquareCheck, faHourglassStart, faExclamationCircle, faPenToSquare, faTableCellsLarge, faUser, faLinesLeaning, faClipboardList, faUserPlus, faBarsStaggered, faSquarePlus, faUpload, faClock, faUserTie, faPlus, faGear, faTowerBroadcast } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect, useCallback } from 'react';
import { faSignOutAlt, faBell, faEnvelope, faKey } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const NavSide = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isTasksOpen, setTasksOpen] = useState(false);
    const [isEmployeeOpen, setEmployeeOpen] = useState(false);
    const [isSettingOpen, setIsSettingOpen] = useState(false);
    const [isLeadOpen, setLeadOpen] = useState(false); // Add this state
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [profilePictureURL, setProfilePictureURL] = useState(null);
    const [role, setRole] = useState('Admin');
    const [newTasks, setNewTasks] = useState([]);
    const [newReminderTasks, setNewReminderTasks] = useState([]);
    const [showReminders, setShowReminder] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [reminderCount, setReminderCount] = useState(0); // State variable for reminder count
    const [notificationCount, setNotificationCount] = useState(0); // State variable for notification count
    const [envelopeNotifications, setEnvelopeNotifications] = useState([]); // State variable for envelope (lead) notifications
    const [envelopeNotificationCount, setEnvelopeNotificationCount] = useState(0); // Count of envelope notifications
    const [isLeadDropdownOpen, setLeadDropdownOpen] = useState(false); // State variable for lead dropdown
    const [isLeadModalOpen, setLeadModalOpen] = useState(false);
    const [approachingDeadlineTasks, setApproachingDeadlineTasks] = useState([]);
    const [selectedLeadNotification, setSelectedLeadNotification] = useState(null);
    const [empUsername, setEmpUsername] = useState('');
    const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
    const [isAdminOpen, setAdminOpen] = useState(false);
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
    const toggleLead = () => {
        setLeadOpen(!isLeadOpen);
    };

    const toggleTasks = () => {
        setTasksOpen(!isTasksOpen);
    };

    const toggleEmployee = () => {
        setEmployeeOpen(!isEmployeeOpen);
    };
    const toggleSetting = () => {
        setIsSettingOpen(!isSettingOpen);
    };

    const toggleAdmin = () => {
        setAdminOpen(!isAdminOpen);
    };

    const [changePasswordErrors, setChangePasswordErrors] = useState({});

    const router = useRouter();


    const openChangePasswordModal = () => {
        console.log('Change password modal opened.'); // Add this line

        setChangePasswordModalOpen(true);
    };

    // Function to close the changePassword modal
    const closeChangePasswordModal = () => {
        setChangePasswordModalOpen(false);
    };

    const toggleLeadDropdown = () => {
        setLeadDropdownOpen(!isLeadDropdownOpen);
    };


    const openModal = () => {
        setModalOpen(true);
    };

    const reminderModalOpen = () => {
        setIsReminderModalOpen(true)
    }

    const reminderModalClose = () => {
        setIsReminderModalOpen(false)
    }

    const closeModal = () => {
        setModalOpen(false);
    };

    const openLeadModal = (notification) => {
        setSelectedLeadNotification(notification);
        setLeadModalOpen(true);
    };

    const closeLeadModal = () => {
        setSelectedLeadNotification(null);
        setLeadModalOpen(false);
    };

    // Notification function
    const handleLeadNotificationClick = async (notification) => {
        try {
            if (!notification.clicked) {
                // Mark the notification as clicked in the local state
                const updatedEnvelopeNotifications = envelopeNotifications.map((envelopeNotification) => {
                    if (envelopeNotification._id === notification._id) {
                        return { ...envelopeNotification, clicked: true };
                    }
                    return envelopeNotification;
                });

                // Filter out the viewed notification from the list
                const filteredNotifications = updatedEnvelopeNotifications.filter(
                    (envelopeNotification) => envelopeNotification._id !== notification._id
                );

                setEnvelopeNotifications(filteredNotifications);

                // Update the envelope notification count
                const updatedCount = envelopeNotificationCount - 1;
                setEnvelopeNotificationCount(updatedCount);

                setSelectedLeadNotification(notification);
                setLeadModalOpen(true);

                // Call the provided API endpoint to mark the notification as read on the server
                await axios.put(`http://localhost:5000/api/lead/notifications/${notification._id}`, null, {
                    headers: {
                        Authorization: localStorage.getItem('authToken'),
                    },
                });

                setLeadDropdownOpen(false);
            }
        } catch (error) {
            console.error('Error handling lead notification click:', error);
        }
    };


    // Change Password Function
    const handleChangePassword = async () => {
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

    const handleTaskClick = async (task) => {
        setSelectedTask(task);
        setShowNotifications(false);
        setShowReminder(false);
        openModal();
        reminderModalOpen()

        // Remove the task from the list by filtering it out
        const updatedNewTasks = newTasks.filter((newTask) => newTask._id !== task._id);
        setNewTasks(updatedNewTasks);
        localStorage.setItem('newTasks', JSON.stringify(updatedNewTasks));

        // Update the notification count
        setNotificationCount((prevCount) => prevCount - 1);

        // Mark the notification as read on the server
        try {
            await axios.put(`http://localhost:5000/api/notification/${task._id}/read`, null, {
                headers: {
                    Authorization: localStorage.getItem('authToken'),
                },
            });
        } catch (error) {
            console.error('Error marking notification as read on the server:', error);
        }
    };

    // Logout Function
    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        localStorage.removeItem('empUsername');
        localStorage.removeItem('subUsername');
        router.push('/login');
    };


    const fetchAssignedByName = useCallback(async (taskId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/employee/${taskId}`, {
                headers: {
                    Authorization: localStorage.getItem('authToken'),
                },
            });

            if (response.status === 200) {
                return response.data.name;
            }
        } catch (error) {
            console.error('Error fetching assigned by name:', error);
        }
    }, []);


    // Get Notification Function
    const fetchNotifications = useCallback(async () => {
        try {
            // const empUsername = localStorage.getItem('empUsername');
            // if (!empUsername && typeof window !== 'undefined') 
            {

                const response = await axios.get('http://localhost:5000/api/notification/notification', {
                    headers: {
                        Authorization: localStorage.getItem('authToken'),
                    },
                });

                if (response.status === 200) {
                    const notifications = response.data;

                    // Map the notifications to add 'assignedByName' property
                    const updatedNotifications = await Promise.all(
                        notifications.map(async (task) => {
                            // Fetch assignedByName for each task
                            task.assignedByName = await fetchAssignedByName(task.userId);
                            return task;
                        })
                    );

                    setNewTasks(updatedNotifications);
                    // Calculate the initial notification count
                    const initialNotificationCount = updatedNotifications.filter((task) => !task.clicked).length;
                    setNotificationCount(initialNotificationCount);
                }
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, [fetchAssignedByName]);

    // Get Lead Notification Function
    const fetchEnvelopeNotifications = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/lead/notifications');

            if (response.status === 200) {
                const notifications = response.data;
                console.log(notifications)
                // Filter out envelope notifications (lead notifications)
                const envelopeNotifications = notifications.filter((notification) => {
                    return notification; // Adjust this condition based on your API response
                });

                setEnvelopeNotifications(envelopeNotifications);

                // Calculate the initial envelope notification count
                const initialEnvelopeNotificationCount = envelopeNotifications.filter((notification) => !notification.clicked).length;
                setEnvelopeNotificationCount(initialEnvelopeNotificationCount);
            }
        } catch (error) {
            console.error('Error fetching envelope notifications:', error);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        fetchEnvelopeNotifications();
    }, [fetchNotifications, fetchEnvelopeNotifications]);


    // useEffect(() => {
    //     if (typeof window !== 'undefined') {
    //         const subUsername = localStorage.getItem('subUsername');
    //         const newRole = subUsername ? 'Employee' : 'Admin';
    //         setRole(newRole);
    //     }
    // }, []);


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
        fetchNotifications();
        fetchEnvelopeNotifications();
    }, [fetchNotifications, fetchEnvelopeNotifications]);

    const handleReminderTaskClick = async (task) => {
        console.log(task);
        setSelectedTask(task);
        setShowNotifications(false);
        setShowReminder(false);
        reminderModalOpen();

        // Remove the task from the list by filtering it out
        const updatedNewTasks = newReminderTasks.filter(
            (newTask) => newTask._id !== task._id
        );
        console.log(updatedNewTasks);
        setNewReminderTasks(updatedNewTasks);
        localStorage.setItem("newReminderTasks", JSON.stringify(updatedNewTasks));

        // Update the task list and notification count
        const updatedApproachingDeadlineTasks = approachingDeadlineTasks.filter(
            (approachingTask) => approachingTask._id !== task._id
        );
        setApproachingDeadlineTasks(updatedApproachingDeadlineTasks);
        setReminderCount(updatedApproachingDeadlineTasks.length);

        // Mark the notification as read on the server
        try {
            await axios.put(
                `http://localhost:5000/api/reminderNotification/${task._id}/read`,
                null,
                {
                    headers: {
                        Authorization: localStorage.getItem("authToken"),
                    },
                }
            );
        } catch (error) {
            console.error("Error marking notification as read on the server:", error);
        }
    };

    useEffect(() => {
        const usernameFromStorage = localStorage.getItem('empUsername');
        if (usernameFromStorage) {
            const capitalizedUsername = usernameFromStorage.charAt(0).toUpperCase() + usernameFromStorage.slice(1);
            setEmpUsername(capitalizedUsername.split('.')[0]
                .split('@')[0]); // Splitting the username by dot and getting the first part
        }
    }, []); // Empty dependency array ensures this effect runs only once, after initial render


    useEffect(() => {
        const storedProfilePictureURL = localStorage.getItem('profilePictureURL');

        if (storedProfilePictureURL) {
            setProfilePictureURL(storedProfilePictureURL);
        }
    }, []);

    // Handle Picture-Upload Function
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

    const handleNotificationClick = () => {
        setShowNotifications(!showNotifications);
    };

    const handleReminderClick = () => {
        setShowReminder(!showReminders);
    };


    // const fetchApproachingEndTimeTasks = async () => {
    //     try {
    //         const response = await axios.get(
    //             "http://localhost:5000/api/reminderNotification/reminder",
    //             {
    //                 headers: {
    //                     Authorization: localStorage.getItem("authToken"),
    //                 },
    //             }
    //         );
    //         console.log(response);
    //         if (response.status === 200) {
    //             const approachingEndTimeTasks = response.data.tasks;
    //             setApproachingDeadlineTasks(approachingEndTimeTasks);
    //             // Calculate the initial notification count
    //             const initialReminderCount = approachingEndTimeTasks.filter(
    //                 (task) => !task.clicked
    //             ).length;
    //             setReminderCount(initialReminderCount);
    //         } else {
    //             console.error("Failed to fetch approaching end time tasks:");
    //         }
    //     } catch (error) {
    //         console.error("Error fetching approaching end time tasks:", error);
    //     }
    // };

    useEffect(() => {
        fetchNotifications();
        fetchEnvelopeNotifications();
        // fetchApproachingEndTimeTasks()
    }, [fetchNotifications, fetchEnvelopeNotifications]);

    function formatDateTime(dateTimeString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const date = new Date(dateTimeString);
        const formattedDate = date.toLocaleDateString('en-GB', options);
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        const formattedTime = date.toLocaleTimeString(undefined, timeOptions);
        return `${formattedDate} ${formattedTime}`;
    }



    // const [clockInTime, setClockInTime] = useState(null);
    // const [runningTime, setRunningTime] = useState('');
    // const [isClockedIn, setIsClockedIn] = useState(false);




    // const handleClockIn = async () => {
    //     try {
    //         const response = await axios.post('http://localhost:5000/api/salary/clock-ins', {
    //             email: 'niru@gmail.com', // Replace with actual user email
    //             role: 'sales', // Replace with actual role
    //             ip: '192.168.1.1', // Replace with actual IP
    //             lat: 12.3456, // Replace with actual latitude
    //             long: 78.9012 // Replace with actual longitude
    //         });

    //         if (response.status === 200) {
    //             // alert('Clocked in successfully');
    //             const clockInDate = new Date();
    //             setClockInTime(clockInDate); // Set the clock-in time to the current time
    //             localStorage.setItem('clockInTime', clockInDate.toISOString());
    //             setIsClockedIn(true);
    //         }
    //     } catch (error) {
    //         console.error('Error clocking in:', error);
    //         alert('Failed to clock in');
    //     }
    // };


    // const handleClockOut = async () => {
    //     try {
    //         const response = await axios.post('http://localhost:5000/api/salary/clock-outs', {
    //             email: 'niru@gmail.com', // Replace with actual user email
    //             role: 'sales', // Replace with actual role
    //             ip: '192.168.1.1', // Replace with actual IP
    //             lat: 12.3456, // Replace with actual latitude
    //             long: 78.9012 // Replace with actual longitude
    //         });

    //         if (response.status === 200) {
    //             // alert('Clocked out successfully');
    //             setIsClockedIn(false);
    //             setRunningTime('');
    //             localStorage.removeItem('clockInTime');
    //         }
    //     } catch (error) {
    //         console.error('Error clocking out:', error);
    //         alert('Failed to clock out');
    //     }
    // };

    // useEffect(() => {
    //     const storedClockInTime = localStorage.getItem('clockInTime');
    //     if (storedClockInTime) {
    //       setClockInTime(new Date(storedClockInTime));
    //       setIsClockedIn(true);
    //     }
    //   }, []);



    // useEffect(() => {
    //     let timer;
    //     if (isClockedIn && clockInTime) {
    //         timer = setInterval(() => {
    //             const now = new Date();
    //             const duration = now - new Date(clockInTime);
    //             const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    //             const minutes = Math.floor((duration / (1000 * 60)) % 60);
    //             const seconds = Math.floor((duration / 1000) % 60);
    //             setRunningTime(`${hours}h ${minutes}m ${seconds}s`);
    //         }, 1000);
    //     }

    //     return () => clearInterval(timer);
    // }, [isClockedIn, clockInTime]);



    return (
        <>
            <nav className="fixed top-0 right-0 z-50 w-full bg-blue-400 text-black border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
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
                                <span className="self-center text-base md:text-2xl font-semibold whitespace-nowrap dark:text-white md:pl-10 text-white">Admin</span>
                            </Link>
                        </div>


                        <div className="flex items-center">
                            <button
                                onClick={toggleLeadDropdown}
                                className="dropdown-toggle text-white flex items-center focus:outline-none mr-5"
                            >
                                <FontAwesomeIcon icon={faEnvelope} className="text-xl fa-lg justify-between text-white" />
                                {envelopeNotificationCount > 0 && (
                                    <span className="bg-red-500 text-white rounded-full w-4 h-4 text-xs text-center absolute m-4 mt-0 -mr-2">
                                        {envelopeNotificationCount}
                                    </span>
                                )}
                            </button>

                            {isLeadDropdownOpen && (
                                <div className={`origin-bottom-right absolute right-3 md:right-24 ${envelopeNotifications.length > 0 ? 'mt-9' : 'mt-20'} mt-14 md:mt-9 w-48 md:w-72 top-6 ${envelopeNotifications.length > 0 ? 'h-28' : 'h-12'} overflow-y-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5`}>
                                    <div
                                        className="py-1"
                                        role="menu"
                                        aria-orientation="vertical"
                                        aria-labelledby="lead-notifications-menu"
                                    >
                                        {envelopeNotifications.length > 0 ? (
                                            envelopeNotifications.map((notification, index) => (
                                                <div
                                                    key={index}
                                                    className={` px-4 py-3 text-sm text-gray-700 hover-bg-gray-300 cursor-pointer ${notification.clicked ? 'bg-red-500' : ''}`}
                                                    role="menuitem"
                                                    onClick={() => handleLeadNotificationClick(notification)}
                                                >
                                                    <div className="mb-2"><strong>{notification.message}</strong></div>
                                                    <div className="mb-2"><strong>Title:</strong> {notification.description}</div>
                                                    <div className="mb-2"><strong>Created By:</strong> {notification.assignedByName}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-2 text-sm text-gray-700">No new lead notifications.</div>
                                        )}
                                    </div>
                                </div>
                            )}


                            <button
                                onClick={handleNotificationClick}
                                className="dropdown-toggle text-white flex items-center focus:outline-none"
                            >
                                <FontAwesomeIcon icon={faBell} className="text-xl fa-lg justify-between mr-1 text-white" />
                                {notificationCount > 0 && (
                                    <span className="relative bg-red-500 text-white rounded-full w-4 h-4 text-xs shadow-lg text-center top-0 right-3.5 -mt-3">

                                        {notificationCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className={`origin-bottom-right absolute right-3 md:right-24 ${newTasks.length > 0 ? 'mt-9' : 'mt-20'} mt-14 md:mt-9 w-48 md:w-72 top-6 ${newTasks.length > 0 ? 'h-32' : 'h-12'} overflow-y-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5`}>

                                    <div
                                        className="py-1"
                                        role="menu"
                                        aria-orientation="vertical"
                                        aria-labelledby="notifications-menu"
                                    >
                                        {newTasks.length > 0 ? (
                                            newTasks.map((task, index) => (
                                                <div
                                                    key={index}
                                                    className={`px-4 py-2 text-sm text-gray-700 hover:bg-gray-300 cursor-pointer ${task.clicked ? 'bg-red-200' : ''}`}
                                                    role="menuitem"
                                                    onClick={() => handleTaskClick(task)}
                                                >
                                                    <div className='mx-2'>
                                                        <div className='my-2'><strong>{task.assignedByName}</strong> <span className='mx-1'>{formatDateTime(task.createdAt)}</span></div>
                                                        <div className='my-1'><strong>{task.message}</strong></div>
                                                        <div className='my-1'><strong>Title :</strong> {task.title}</div>
                                                        {/* <div className='mb-3'><strong>Task ID :</strong> {task._id.slice(17, 23)}</div> */}
                                                        <hr />
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-2 text-sm text-gray-700">
                                                No new notifications.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}



                            {/* <button
                onClick={handleReminderClick}
                className="dropdown-toggle text-white flex items-center focus:outline-none"
              >
                <FontAwesomeIcon
                  icon={faClock}
                  className="text-lg md:text-xl fa-lg justify-between text-white pr-3"
                />
                {reminderCount > 0 && (
                  <span className="relative bg-red-500 text-white rounded-full w-4 h-4 text-xs shadow-lg text-center top-0 right-3.5 -mt-3">
                    {reminderCount}
                  </span>
                )}
              </button> */}



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
                                    accept=".jpg, .jpeg, .png" // Allow only .jpg, .jpeg, and .png files
                                    style={{ display: 'none' }}
                                    onChange={handleProfilePictureChange}
                                />
                            </div>
                            <div>
                                <p className='font-semibold text-base ml-4 mr-3'><i> {empUsername}</i></p>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {isModalOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                >
                    <div
                        className="modal-container bg-white w-96 p-6 rounded shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover-bg-gray-200 hover-text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark-hover-bg-gray-600 dark-hover-text-white"
                            onClick={() => closeModal()}
                        >
                        </button>

                        <div className="p-1 text-center">
                            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark-text-gray-400">
                                Task Details
                            </h3>
                            <div>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Title:</strong> {selectedTask.title}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Description:</strong> {selectedTask.description}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Status:</strong> {selectedTask.status}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Start Date:</strong> {formatDateTime(selectedTask.startDate)}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Start Time:</strong> {selectedTask.startTime}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Deadline Date:</strong> {formatDateTime(selectedTask.deadlineDate)}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>End Time:</strong> {selectedTask.endTime}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Assigned By:</strong> {selectedTask.assignedByName}
                                </p>
                                {/* <p className="mb-2 text-left justify-center">
                                    <strong>Picture : </strong><Link href='/receivedTask'> Go to All Tasks to show</Link>
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Audio : </strong><i> Open All Task List to Listen</i>
                                </p> */}
                            </div>
                            <button
                                type="button"
                                className="bg-blue-500 hover-bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                                onClick={() => closeModal()}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isLeadModalOpen && selectedLeadNotification && (
                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-container bg-white w-96 p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover-bg-gray-200 hover-text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark-hover-bg-gray-600 dark-hover-text-white"
                            onClick={closeLeadModal}
                        >
                            {/* Close button icon */}
                        </button>
                        <div className="p-1 text-center">
                            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark-text-gray-400">
                                Lead Details
                            </h3>
                            <div>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Created By : </strong><strong>{selectedLeadNotification.assignedByName}</strong>
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Title:</strong> {selectedLeadNotification.description}
                                </p>

                                <p className="mb-2 text-left justify-center">
                                    <strong>Customer Name:</strong> {selectedLeadNotification.customerName}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Company Name:</strong> {selectedLeadNotification.companyName}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Contact No:</strong> {selectedLeadNotification.contactNo}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Email Id:</strong> {selectedLeadNotification.email}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Owner Name:</strong> {selectedLeadNotification.ownerName}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Website:</strong> {selectedLeadNotification.website}
                                </p>
                                {/* Add more lead notification details here */}
                            </div>
                            <button
                                type="button"
                                className="bg-blue-500 hover-bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                                onClick={closeLeadModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isReminderModalOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                >
                    <div
                        className="modal-container bg-white w-72 md:w-96 p-2 md:p-6 rounded shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover-bg-gray-200 hover-text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark-hover-bg-gray-600 dark-hover-text-white"
                            onClick={() => reminderModalClose()}
                        ></button>

                        <div className="p-2 text-center text-sm md:text-base">
                            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark-text-gray-400">
                                Task Details
                            </h3>
                            <div>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Title:</strong> {selectedTask.title}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Description:</strong> {selectedTask.description}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Status:</strong> {selectedTask.status}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Start Date:</strong>{" "}
                                    {formatDateTime(selectedTask.startDate)}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Start Time:</strong> {selectedTask.startTime}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Deadline Date:</strong>{" "}
                                    {formatDateTime(selectedTask.deadlineDate)}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>End Time:</strong> {selectedTask.endTime}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Assigned By:</strong> {selectedTask.assignedByname}
                                    {/* <strong>Assigned By:</strong> {selectedTask.assignedByName || selectedTask.assignedBy.name} */}
                                </p>
                                {/* <p className="mb-2 text-left justify-center">
                                    <strong>Picture : </strong><Link href='/receivedTask'><u>Click to go to list see the picture</u> </Link>
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Audio : </strong><Link href='/receivedTask'><u>Click to go to list to Listen the Audio</u> </Link>
                                </p> */}
                            </div>
                            <button
                                type="button"
                                className="bg-blue-500 hover-bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                                onClick={() => reminderModalClose()}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isChangePasswordModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-container bg-white md:w-2/5 lg:w2/5 p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                        <form>
                            <div className="form-group mb-4">
                                <label htmlFor="email" className="block text-gray-700">Email:</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder='Enter Email Id'
                                    className={`w-full p-2 border rounded ${changePasswordErrors.email ? 'border-red-500' : ''}`}
                                    value={changePasswordData.email}
                                    onChange={(e) => setChangePasswordData({ ...changePasswordData, email: e.target.value })}
                                />
                                {changePasswordErrors.email && (
                                    <div className="text-red-500">{changePasswordErrors.email}</div>
                                )}
                            </div>
                            <div className="form-group mb-4">
                                <label htmlFor="currentPassword" className="block text-gray-700">Current Password:</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    placeholder='Enter Your Current Password'
                                    className={`w-full p-2 border rounded ${changePasswordErrors.currentPassword ? 'border-red-500' : ''}`}
                                    value={changePasswordData.currentPassword}
                                    onChange={(e) => setChangePasswordData({ ...changePasswordData, currentPassword: e.target.value })}
                                />
                                {changePasswordErrors.currentPassword && (
                                    <div className="text-red-500">{changePasswordErrors.currentPassword}</div>
                                )}
                            </div>
                            <div className="form-group mb-4">
                                <label htmlFor="newPassword" className="block text-gray-700">New Password:</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    placeholder='Enter New Password'
                                    className={`w-full p-2 border rounded ${changePasswordErrors.newPassword ? 'border-red-500' : ''}`}
                                    value={changePasswordData.newPassword}
                                    onChange={(e) => setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })}
                                />
                                {changePasswordErrors.newPassword && (
                                    <div className="text-red-500">{changePasswordErrors.newPassword}</div>
                                )}
                            </div>
                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    className="bg-blue-500 hover-bg-blue-700 text-white font-bold py-2 px-4 rounded mr-3"
                                    onClick={handleChangePassword}
                                >
                                    Change Password
                                </button>
                                <button
                                    type="button"
                                    className="bg-gray-300 hover-bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded"
                                    onClick={closeChangePasswordModal}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}



            <aside id="logo-sidebar"
                className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700`} aria-label="Sidebar">
                <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
                    <ul className="space-y-2 font-medium">
                        <li>

                            {/* {!isClockedIn ? (
                                <Link href="" className="flex items-center p-2 text-gray-950 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group mr-2 mb-3 bg-gray-300" onClick={handleClockIn}>
                                    <FontAwesomeIcon icon={faClock} size='xl' style={{ color: "orange", marginLeft: '5px' }} />
                                    <span className="ml-3">Clock In</span>
                                </Link>
                            ) : (
                                <Link href="" className="flex items-center p-2 text-gray-950 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group mr-2 mb-3 bg-gray-300 mx-2" onClick={handleClockOut}>
                                    <FontAwesomeIcon icon={faClock} size='xl' style={{ color: "green", marginLeft: '5px' }} />
                                    <span className="ml-3">Clock Out</span>
                                </Link>
                            )}

                            {isClockedIn && (
                                <div className="-mt-2 text-gray-700 dark:text-gray-300 bg-gray-200 rounded-lg font-sans px-4 p-2">
                                    <div className='ml-2 text-sm'><i>Clocked In</i> : <span className='font-bold'>{clockInTime.toLocaleTimeString()}</span> </div>
                                    <div className='ml-2 text-sm'>Run Time : {runningTime}</div>
                                </div>
                            )} */}
                            <Link href="/vector" className="flex items-center p-2 text-gray-950 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group mr-2">
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
                                    {/* <li>
                                        <Link href='/compList' className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group">
                                            <FontAwesomeIcon icon={faListUl} size='xl'
                                                style={{ color: 'red', marginLeft: '5px' }}
                                            />
                                            <span className='ml-3'>Company List</span>

                                        </Link>
                                    </li> */}
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
                            <button onClick={toggleTasks} className="flex items-center w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group mr-2">
                                <FontAwesomeIcon icon={faTasks} size='xl'
                                    style={{ color: "", marginLeft: '5px' }} />

                                <span className="ml-3">Tasks</span>
                                <FontAwesomeIcon
                                    icon={faAngleUp}
                                    className={`w-5 h-5 ml-auto ${isTasksOpen ? 'rotate-0' : 'rotate-180'}`}
                                />

                            </button>
                            {isTasksOpen && (
                                <ul className="ml-6 space-y-2 font-medium">
                                    <li>
                                        <Link href="/taskForm" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group">
                                            <FontAwesomeIcon icon={faPenToSquare} size='xl' style={{ color: "#de4f35", marginLeft: '15px' }} />
                                            <span className="ml-3 pl-1">Add Task</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/taskList" className="flex items-center p-2 text-gray-950 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group">
                                            <FontAwesomeIcon icon={faTasks} size='xl'
                                                style={{ color: "purple", marginLeft: '15px' }} />
                                            <span className="ml-3 pl-1">All Tasks</span>
                                        </Link>
                                    </li>
                                    <li>
                                    </li>

                                    <li>
                                        <Link href="/completedTask" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group">
                                            <FontAwesomeIcon icon={faSquareCheck} size='xl'
                                                style={{ color: "#037705", marginLeft: '15px' }} />
                                            <span className="ml-3 pl-1">Completed Tasks</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/pending" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group">
                                            <FontAwesomeIcon icon={faHourglassStart} size='xl'
                                                style={{ color: "#2a5fbb", marginLeft: '15px' }} />
                                            <span className="ml-3 pl-2">Pending Tasks</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/overdue"
                                            className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group">
                                            <FontAwesomeIcon icon={faExclamationCircle} size='xl'
                                                style={{ color: "#FF5733", marginLeft: '13px' }} />
                                            <span className="ml-3 pl-1">Overdue Tasks</span>


                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/sendTask"
                                            className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group">
                                            <FontAwesomeIcon icon={faUpload} size='xl'
                                                style={{ color: "rgb(255, 215, 0)", marginLeft: '15px' }} />
                                            <span className="ml-3 pl-1">Send Tasks</span>
                                        </Link>
                                    </li>

                                </ul>
                            )}
                        </li>

                        <li>
                            <button onClick={toggleEmployee} className="flex items-center w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group mr-2" >

                                <FontAwesomeIcon icon={faUser} size='xl'
                                    style={{ color: "#2d62be", }} />
                                <span className="ml-3 pl-2">Employee</span>
                                <FontAwesomeIcon
                                    icon={faAngleUp}
                                    className={`w-5 h-5 ml-auto ${isEmployeeOpen ? 'rotate-0' : 'rotate-180'}`}
                                />

                            </button>

                            {isEmployeeOpen && (
                                <ul className="ml-6 space-y-2 font-medium">

                                    <li>
                                        <Link href="/employee" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover-bg-gray-700 group">

                                            <FontAwesomeIcon icon={faUserTie} size='xl'
                                                style={{ color: 'indigo', marginLeft: '19px' }}
                                                onClick={() => handleDeleteClick(company._id)}
                                            />
                                            <span className='ml-5'> Add Admin</span>
                                        </Link>
                                    </li>

                                    <li>
                                        <Link href="/subemp" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover-bg-gray-700 group pl-2">
                                            <FontAwesomeIcon icon={faUserPlus} size='xl'
                                                style={{ color: "indigo", marginLeft: '17px' }} />
                                            <span className="ml-3">Add Employee</span>
                                        </Link>
                                    </li>

                                    <li>
                                        <Link href="/subList" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group pl-3">
                                            <FontAwesomeIcon icon={faClipboardList} size='xl' style={{ color: "#f19513", marginLeft: '15px' }} />
                                            <span className="ml-3 pl-2">Employee List</span>
                                        </Link>

                                    </li>
                                </ul>
                            )}
                        </li>

                        <li>
                            <button
                                onClick={toggleLead}
                                className="flex items-center w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group mr-2"
                            >
                                <FontAwesomeIcon icon={faLinesLeaning} size='xl'
                                    style={{ color: "#f1f524", }} />
                                <span className="ml-3 pl-2">Lead</span>

                                <FontAwesomeIcon
                                    icon={faAngleUp}
                                    className={`w-5 h-5 ml-auto ${isLeadOpen ? 'rotate-0' : 'rotate-180'}`}
                                />
                            </button>
                            {isLeadOpen && (
                                <ul className="ml-6 space-y-2 font-medium">
                                    <li>
                                        <Link href="/leadForm" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group">
                                            <FontAwesomeIcon icon={faSquarePlus} size='xl'
                                                style={{ color: "#f23a3a", marginLeft: '15px' }} />
                                            <span className="ml-3">Create Lead</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/leadList" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group">
                                            <FontAwesomeIcon icon={faBarsStaggered} size='xl'
                                                style={{ color: "#f29d3a", marginLeft: '15px' }} />
                                            <span className="ml-3">Lead List</span>
                                        </Link>

                                    </li>
                                </ul>
                            )}
                        </li>


                        <li>
                            <button onClick={toggleSetting} className="flex items-center w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group mr-2" >

                                <FontAwesomeIcon icon={faGear} size='xl'
                                    style={{ color: "#2d62be", }} />
                                <span className="ml-3 pl-2">Settings</span>
                                <FontAwesomeIcon
                                    icon={faAngleUp}
                                    className={`w-5 h-5 ml-auto ${isSettingOpen ? 'rotate-0' : 'rotate-180'}`}
                                />

                            </button>

                            {isSettingOpen && (
                                <ul className="ml-6 space-y-2 font-medium">

                                    <li>
                                        <Link href="/ipManagement" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover-bg-gray-700 group">

                                            <FontAwesomeIcon icon={faTowerBroadcast} size='xl'
                                                style={{ color: 'indigo', marginLeft: '19px' }}
                                                onClick={() => handleDeleteClick(company._id)}
                                            />
                                            <span className='ml-5'> Add IPs</span>
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

export default NavSide