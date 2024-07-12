'use client'

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faSpinner, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import NavSide from '../components/NavSide';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';
import jwtDecode from 'jwt-decode';


const saveAs = (data, fileName) => {
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    const url = window.URL.createObjectURL(data);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
};


const PendingTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [completeImageUrl, setPreviewImageUrl] = useState('');
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredTasks, setFilteredTasks] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [tasksPerPage] = useState(15); // Define tasks to show per page

    const calculateSerialNumber = (index) => {
        return index + (currentPage - 1) * tasksPerPage + 1;
    };


    useEffect(() => {
        setFilteredTasks(tasks);
    }, [tasks]);

    const applySearchFilter = useCallback(() => {
        const filtered = tasks.filter(
            (task) =>
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.assignTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.startDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.deadlineDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.status.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredTasks(filtered);
    }, [searchQuery, tasks])

    // useEffect(() => {
    //     applySearchFilter();
    // }, [searchQuery]);

    useEffect(() => {
        applySearchFilter();
    }, [searchQuery, tasks]);

    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

    const paginate = pageNumber => setCurrentPage(pageNumber);


    const handleSearchInputChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handlePicturePreview = (imageUrl) => {
        const completeImageUrl = `http://localhost:5000/${imageUrl}`;
        setPreviewImageUrl(completeImageUrl);
        setIsPreviewModalOpen(true);
    };


    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };

    const router = useRouter()
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            // If the user is not authenticated, redirect to the login page
            setAuthenticated(false);
            router.push('/login');
            return;
        }

        const decodedToken = jwtDecode(token);
        console.log(decodedToken)
        const userRole = decodedToken.role || 'guest';

        // Check if the user has the superadmin role
        if (userRole !== 'admin') {
            // If the user is not a superadmin, redirect to the login page
            router.push('/forbidden');
            return;
        }
        const fetchPendingTasks = async () => {
            try {
                console.log('Fetching pending tasks...');
                const token = localStorage.getItem('authToken');
                const response = await axios.get('http://localhost:5000/api/task/tasks/pending', {
                    headers: {
                        Authorization: token,
                    },
                });

                console.log(response);

                const currentDate = new Date(); // Get the current date
                console.log(currentDate);

                const tasksWithNames = await Promise.all(
                    response.data.map(async (task) => {
                        // Fetch the employee name associated with the ID
                        const assigneeResponse = await axios.get(`http://localhost:5000/api/subemployee/${task.assignTo}`, {
                            headers: {
                                Authorization: token,
                            },
                        });

                        const assigneeName = assigneeResponse.data.name;
                        // Format the date as dd/mm/yyyy
                        const formattedStartDate = formatDate(task.startDate);
                        // const formattedDeadlineDate = task.deadlineDate;
                        const formattedDeadlineDate = formatDate(task.deadlineDate);

                        // Update the task object with the formatted date and name
                        return {
                            ...task,
                            startDate: formattedStartDate,
                            deadlineDate: formattedDeadlineDate,
                            assignTo: assigneeName,
                        };
                    })
                );

                console.log('All tasks:', tasksWithNames);

                setTasks(tasksWithNames);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching pending tasks:', error);
                setLoading(false);
            }
        };



        fetchPendingTasks();
    }, []);


    const handleViewClick = (taskId) => {
        // Find the selected task based on taskId
        const task = tasks.find((t) => t._id === taskId);
        setSelectedTask(task);
        // Open the view modal
        setViewModalOpen(true);
    };

    const closeViewModal = () => {
        // Close the view modal
        setViewModalOpen(false);
    };
    const exportToExcel = async () => {
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';


        // Filter and map the data including the header fields and employee names
        const tasksToExport = filteredTasks.map(task => {
            return {
                'Title': task.title,
                'Status': task.status,
                'StartDate': task.startDate,
                'DeadLine': task.deadlineDate,
                'AssignTo': task.assignTo, // Assign the name if available, otherwise use the ID
            };
        });

        // Create a worksheet from the filtered task data
        const ws = XLSX.utils.json_to_sheet(tasksToExport);
        const wb = { Sheets: { data: ws }, SheetNames: ['data'] };

        // Convert the workbook to an array buffer
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

        // Create a Blob from the array buffer
        const data = new Blob([excelBuffer], { type: fileType });

        // Set the filename and save the file using saveAs function
        const fileName = 'Pending Tasks_list' + fileExtension;
        saveAs(data, fileName);
    };


    return (
        <>
            <NavSide />
            <div className="m-5 pl-1 md:pl-64 mt-20">
                <h1 className="text-xl md:text-2xl font-bold mb-4 text-left text-orange-500">Pending Tasks</h1>

                <div className="flex justify-center items-center mb-4">
                    <input
                        type="text"
                        placeholder="Search Tasks"
                        className="px-3 py-1 border border-gray-400 rounded-full w-full md:w-1/2"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                    />
                </div>
                <div className="relative mb-7 md:mb-12">
                    <button
                        className="bg-green-700 text-white font-extrabold py-1 md:py-1.5 px-2 md:px-3 rounded-lg md:absolute -mt-2 md:-mt-12 top-0 right-0 text-sm md:text-sm flex items-center mr-1" // Positioning
                        onClick={() => exportToExcel(filteredTasks)}                    >
                        <FontAwesomeIcon icon={faFileExcel} className="text-lg mr-1 font-bold" />
                        <span className="font-bold">Export</span>
                    </button>
                </div>


                {loading ? (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-gray-700">
                        <FontAwesomeIcon
                            icon={faSpinner} // Use your FontAwesome spinner icon
                            spin // Add the "spin" prop to make the icon spin
                            className="text-white text-4xl" // You can customize the size and color
                        />
                    </div>
                ) : (

                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead className='bg-orange-500 text-white'>
                                <tr>
                                    <th className="px-4 py-2 text-center">Sr.No</th>
                                    <th className="px-4 py-2 text-center">Task Title</th>
                                    <th className="px-4 py-2 text-center">Status</th>
                                    <th className="px-4 py-2 text-center">StartDate</th>
                                    <th className="px-4 py-2 text-center">DeadLine</th>
                                    <th className="px-4 py-2 text-center">AssignTo</th>
                                    <th className="px-4 py-2 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.length > 0 ? (
                                    currentTasks.map((task, index) => (
                                        <tr key={task._id} className='hover:bg-gray-100 text-sm cursor-pointer'>
                                            <td className="border px-4 py-1.5 text-center font-semibold">{calculateSerialNumber(index)}</td>
                                            <td className="border px-4 py-1.5 text-center text-orange-600 font-bold">
                                                {task.title}
                                            </td>
                                            <td className="border px-4 py-1.5 text-center">
                                    <span className='px-4 py-1.5 bg-blue-200 text-blue-800 rounded-full text-sm font-bold'>{task.status}</span></td>
                                            <td className="border px-4 py-1.5 text-center">{task.startDate}</td>
                                            <td className="border px-4 py-1.5 text-center">{task.deadlineDate}</td>
                                            <td className="border px-4 py-1.5 text-center font-semibold">{task.assignTo}</td>
                                            <td className="border px-2 py-1.5">
                                                <FontAwesomeIcon
                                                    icon={faEye}
                                                    className="text-blue-500 hover:underline cursor-pointer text-xl ml-8"
                                                    onClick={() => handleViewClick(task._id)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className='px-4 py-2 text-center border font-semibold'>
                                            No Pending Tasks Found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <ul className="flex justify-center items-center mt-4">
                            {Array.from({ length: Math.ceil(filteredTasks.length / tasksPerPage) }, (_, index) => (
                                <li key={index} className="px-3 py-2">
                                    <button
                                        onClick={() => paginate(index + 1)}
                                        className={`${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                                            } px-4 py-2 rounded`}
                                    >
                                        {index + 1}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* View Task Modal */}
            {viewModalOpen && selectedTask && (
                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-container bg-white w-72 md:w-96 sm:p-6 text-xs md:text-base rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="p-2 text-center">

                            <h2 className="text-xl font-semibold mb-4">View Task</h2>
                            <div>
                                <p className="mb-2 text-left justify-center">
                                    <strong>AssignTo:</strong> {selectedTask.assignTo}
                                </p>
                                <p className="mb-2 text-center justify-center">
                                    <strong>Title:</strong> {selectedTask.title}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Description:</strong> {selectedTask.description}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Status:</strong> {selectedTask.status}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Date:</strong> {selectedTask.startDate}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>Start Time:</strong> {selectedTask.startTime}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>DeadLine:</strong> {selectedTask.deadlineDate}
                                </p>
                                <p className="mb-2 text-left justify-center">
                                    <strong>End Time:</strong> {selectedTask.endTime}
                                </p>

                                <p className="mb-2 text-left justify-center">
                                    <strong>Picture:</strong>{" "}
                                    {selectedTask.picture ? (
                                        <button
                                            type="button"
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-1 ml-2"
                                            onClick={() => handlePicturePreview(selectedTask.picture)}
                                        >
                                            Preview
                                        </button>
                                    ) : (
                                        "Not Added"
                                    )}
                                </p>

                                <p className="mb-2 text-left flex item-center">
                                    <span className='mr-1 '><strong>Audio:</strong></span>{" "}
                                    {selectedTask.audio ? (
                                        <audio controls className='w-64 h-8 md:w-96 md-h-10 text-lg'>
                                            <source src={`http://localhost:5000/${selectedTask.audio}`} type="audio/mp3" />
                                            Your browser does not support the audio element.
                                        </audio>

                                    ) : (
                                        "Not Added"
                                    )}
                                </p>

                                <p className='text-center'>
                                    <button
                                        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                                        onClick={closeViewModal}
                                    >
                                        Close
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isPreviewModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-container bg-white w-72 md:w-80 p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setIsPreviewModalOpen(false)}></button>
                        <div className="p-1 text-center">
                            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">Image Preview</h3>
                            {/* <img src={completeImageUrl} alt="Preview" className="mb-2" style={{ maxWidth: '100%', maxHeight: '300px' }} /> */}
                            <Image
                                src={completeImageUrl}
                                alt="Preview"
                                width={400} // Adjust the width as needed
                                height={300} // Adjust the height as needed
                            />
                            <button
                                type="button"
                                className="bg-red-500 hover:bg-red-700 text-black font-bold py-2 px-4 rounded mt-4 mr-2"
                                onClick={() => setIsPreviewModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PendingTasks;