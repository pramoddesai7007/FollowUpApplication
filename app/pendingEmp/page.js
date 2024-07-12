'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faEye, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import NavSideEmp from '../components/NavSideEmp';
import * as XLSX from 'xlsx';
import jwtDecode from 'jwt-decode';
import { useRouter } from 'next/navigation';



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


const formatDateString = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const ReceivedTaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [viewTask, setViewTask] = useState(null); // Store the task to be viewed
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Initialize loading state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [completeImageUrl, setPreviewImageUrl] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(15); // Number of tasks per page
  const [searchTerm, setSearchTerm] = useState('');
  const [authenticated, setAuthenticated] = useState(true);


  let serialNumber = 1; // Initialize the serial number

  const calculateSerialNumber = (index) => {
    return index + (currentPage - 1) * tasksPerPage + 1;
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to the first page when searching
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePicturePreview = (imageUrl) => {
    const completeImageUrl = `http://103.159.85.246:4000/${imageUrl}`; // Generate the complete image URL
    setPreviewImageUrl(completeImageUrl);
    setIsPreviewModalOpen(true);
  };



  const handleMarkAsCompleteClick = async (taskId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(
        `http://103.159.85.246:4000/api/task/complete/${taskId}`,
        {},
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.status === 200) {
        // Remove the task from the tasks state
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
        console.log('Marked as Completed');
      } else {
        console.error('Failed to mark task as complete');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleViewClick = async (taskId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`http://103.159.85.246:4000/api/task/${taskId}`, {
        headers: {
          Authorization: token,
        },
      });

      if (response.status === 200) {
        const taskData = response.data;
        console.log(taskData);
        // Format the date for the task
        taskData.deadlineDate = formatDateString(taskData.deadlineDate);
        taskData.startDate = formatDateString(taskData.startDate);

        setViewTask(taskData);
        setIsViewModalOpen(true);
      } else {
        console.error('Failed to fetch task details');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const router=useRouter()

  useEffect(() => {
    const loadFormattedTasks = async () => {
      setLoading(true);

      if (typeof window === 'undefined') {
        return;
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        setAuthenticated(false);
        router.push('/login');
        return;
      }

      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role || 'guest';

      if (userRole !== 'sub-employee') {
        router.push('/forbidden');
        return;
      }

      try {
        const response = await axios.get('http://103.159.85.246:4000/api/task/tasksList/assignedTo', {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200) {
          const formattedTasks = response.data.tasks.map((task) => ({
            ...task,
            deadlineDate: formatDateString(task.deadlineDate),
            startDate: formatDateString(task.startDate),
          }));
          setTasks(formattedTasks);
          setLoading(false);
        } else {
          console.error('Failed to fetch tasks');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    loadFormattedTasks();
  }, []);



  
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
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
        'AssignTo': task.assignedBy?.name, // Assign the name if available, otherwise use the ID
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
    const fileName = 'Pending Task_list' + fileExtension;
    saveAs(data, fileName);
  };

  if (!authenticated) {
    // If the user is not authenticated, render nothing (or a message) and redirect to login
    return null;
  }

  return (
    <>
      <NavSideEmp />
      <div className="m-5 pl-5 md:pl-72 mt-20">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 m-3 text-orange-500">Pending Task List</h2>

        <div className="flex justify-center items-center mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search ..."
            className="px-3 py-1 border border-gray-400 rounded-full w-full md:w-1/3"
          />
        </div>
        <div className="relative mb-7 md:mb-10">
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className='bg-orange-500 text-white'>
                <tr>
                  <th className="px-4 py-2 ">Sr.No.</th>
                  <th className="px-4 py-2 ">Title</th>
                  <th className="px-4 py-2 ">Status</th>
                  <th className="px-4 py-2 ">Date</th>
                  <th className="px-4 py-2 ">DeadLine</th>
                  <th className="px-4 py-2 ">AssignedBy</th>
                  <th className="px-4 py-2 ">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 border border-gray-200">
                {tasks.length > 0 ? (
                  currentTasks.map((task, index) => (
                    <tr key={task._id} className='hover:bg-gray-100 text-sm cursor-pointer'>
                      <td className="px-2 py-1 whitespace-nowrap text-center border border-orange-400 font-semibold">{calculateSerialNumber(index)}</td>
                      <td className="px-2 py-1 whitespace-nowrap border border-orange-400 text-center font-bold text-orange-700">{task.title}</td>
                      <td className="px-6 py-1 whitespace-nowrap border border-orange-400 text-center">
                      <span className='px-4 py-1.5 bg-blue-200 text-blue-800 rounded-full text-sm font-bold'>{task.status}</span></td>
                      <td className="px-6 py-1 whitespace-nowrap border border-orange-400 text-center">{task.startDate}</td>
                      <td className="px-6 py-1 whitespace-nowrap border border-orange-400 text-center">{task.deadlineDate}</td>
                      <td className="px-6 py-1 whitespace-nowrap border border-orange-400 text-center">{task.assignedBy?.name ? task.assignedBy?.name : <strong>SELF</strong>}</td>
                      <td className="px-5 py-1 whitespace-nowrap border border-orange-400">

                        <FontAwesomeIcon
                          icon={faEye}
                          className="text-blue-500 hover:underline -mr-10 cursor-pointer pl-7 my-1 text-lg text-center"
                          onClick={() => handleViewClick(task._id)}
                        />
                        {/* <button
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-xl mx-3 my-1.5 text-sm"
                        onClick={() => handleMarkAsCompleteClick(task._id)}
                      >
                        Mark as Complete
                      </button> */}
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
          </div>
        )}
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
          )
          )}
        </ul>


        {/* View Task Modal */}
        {isViewModalOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          >
            <div
              className="modal-container bg-white w-72 md:w-96 sm:p-6 rounded shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={() => setIsViewModalOpen(false)}
              >
                {/* Close button icon */}
              </button>
              <div className="p-4 text-center text-sm md:text-base">
                <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">
                  Task Details
                </h3>
                {viewTask && (
                  <div>
                    {/* Display task details here */}
                    <p className="mb-2 text-left justify-center">
                      <strong>Title:</strong> {viewTask.title}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong>Description:</strong> {viewTask.description}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong>Status:</strong> {viewTask.status}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong>Start Date:</strong> {viewTask.startDate}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong>Start Time:</strong> {viewTask.startTime}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong>Deadline Date:</strong> {viewTask.deadlineDate}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong>End Time:</strong> {viewTask.endTime}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong>Assigned By:</strong> {viewTask.assignedBy?.name ? viewTask.assignedBy?.name : <strong>SELF</strong>}
                    </p>

                    <p className="mb-2 text-left justify-center">
                      <strong>Picture:</strong>{" "}
                      {viewTask.picture ? (
                        <button
                          type="button"
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-1 ml-2"
                          onClick={() => handlePicturePreview(viewTask.picture)}
                        >
                          Preview
                        </button>
                      ) : (
                        "Not Added"
                      )}
                    </p>

                    <p className="mb-2 text-left flex items-center">
                      {/* <strong>Audio:</strong>{" "} */}
                      <span className='mr-1 '><strong>Audio:</strong></span>{" "}
                      {viewTask.audio ? (
                        <audio controls className='w=64 h-8 md:w-96 md:h-10 text-lg'>
                          <source src={`http://103.159.85.246:4000/${viewTask.audio}`} type="audio/mp3" />
                          Your browser does not support the audio element.
                        </audio>

                      ) : (
                        "Not Added"
                      )}
                    </p>
                  </div>
                )}
                <button
                  type="button"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}


        {isPreviewModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="modal-container bg-white w-64 md:w-96 p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setIsPreviewModalOpen(false)}></button>
              <div className="p-2 text-center">
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
                  className="bg-red-500 hover:bg-red-700 text-black font-bold py-2 px-4 rounded mt-4 mr-2 text-sm md:text-base"
                  onClick={() => setIsPreviewModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ReceivedTaskList;

