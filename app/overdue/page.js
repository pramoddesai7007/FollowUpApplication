'use client'

import React, { useState, useEffect } from 'react';
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


const Overdue = () => {
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTask, setViewTask] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [completeImageUrl, setPreviewImageUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [authenticated, setAuthenticated] = useState(true);
  const [successMessage, setSuccessMessage] = useState(''); // Define success message state
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(15); // Define tasks to show per page

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for Edit Task modal
  const [editedTask, setEditedTask] = useState(null);


  const paginate = pageNumber => setCurrentPage(pageNumber);

  const calculateSerialNumber = (index) => {
    return index + (currentPage - 1) * tasksPerPage + 1;
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };


  const handlePicturePreview = (imageUrl) => {
    const completeImageUrl = `http://103.159.85.246:4000/${imageUrl}`; // Generate the complete image URL
    setPreviewImageUrl(completeImageUrl);
    setIsPreviewModalOpen(true);
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  const router = useRouter()

  // Fetch overdue tasks when the component mounts
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

    const fetchOverdueTasks = async () => {
      try {
        const authToken = localStorage.getItem('authToken');

        const response = await axios.get('http://103.159.85.246:4000/api/task/tasks/overdue', {
          headers: {
            Authorization: authToken,
          },
        });

        console.log(response.data)
        if (response.data && response.data.overdueTasks) {
          // Map assignTo and assignedBy IDs to names
          const tasksWithNames = await Promise.all(
            response.data.overdueTasks.map(async (task) => {
              const assignToNameResponse = await axios.get(`http://103.159.85.246:4000/api/subemployee/${task.assignTo}`, {
                headers: {
                  Authorization: authToken, // Include Authorization header for employee request
                },
              });
              const assignedByNameResponse = await axios.get(`http://103.159.85.246:4000/api/employee/${task.assignedBy}`, {
                headers: {
                  Authorization: authToken, // Include Authorization header for employee request
                },
              });
              const assignToName = assignToNameResponse.data.name;
              const assignedByName = assignedByNameResponse.data.name;
              return {
                ...task,
                assignTo: assignToName,
                assignedBy: assignedByName,
              };
            })
          );
          setOverdueTasks(tasksWithNames);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching overdue tasks:', error);
        setLoading(false);
      }
    };

    fetchOverdueTasks();

  }, []);

  useEffect(() => {
    const filtered = overdueTasks.filter((task) => {
      console.log(overdueTasks)
      const assigneeName = task.assignTo.toLowerCase();
      const startDate = task.startDate.toLowerCase();
      const deadlineDate = formatDate(task.deadlineDate);
      const status = task.status.toLowerCase();
      const title = task.title.toLowerCase();
      const query = searchQuery.toLowerCase();

      return (
        assigneeName.includes(query) ||
        deadlineDate.includes(query) ||
        title.includes(query) ||
        status.includes(query) ||
        startDate.includes(query)
      );
    });

    setFilteredTasks(filtered);
  }, [searchQuery, overdueTasks]);


  // Function to handle viewing a task
  const handleViewTask = (task) => {
    setViewTask(task); // Set the task to be viewed
  };

  // Function to close the view modal
  const handleCloseViewModal = () => {
    setViewTask(null); // Clear the task to close the modal
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
    const fileName = 'Overdue Tasks_list' + fileExtension;
    saveAs(data, fileName);
  };


  const openEditModal = (task) => {
    // Format the date to "yyyy-MM-dd" format
    console.log("openEdit Modal open")
    const formattedStartDate = task.startDate.split('T')[0];
    const formattedDeadlineDate = task.deadlineDate.split('T')[0];
    setEditedTask({ ...task, startDate: formattedStartDate, deadlineDate: formattedDeadlineDate });
    setIsEditModalOpen(true); // Open the Edit Modal
  };

  const saveChanges = async () => {
    try {
      // Format the date back to ISO format
      const formattedStartDate = editedTask.startDate + 'T00:00:00.000Z';
      const formattedDeadlineDate = editedTask.deadlineDate + 'T00:00:00.000Z';

      const updatedTaskData = {
        startDate: formattedStartDate,
        deadlineDate: formattedDeadlineDate,
        // assignTo: editedTask.assignTo, // Pass the ObjectId of the selected Subemployee
      };

      console.log(updatedTaskData);
      if (
        editedTask.startDate !== updatedTaskData.startDate ||
        editedTask.deadlineDate !== updatedTaskData.deadlineDate
      ) {
        await axios.put(`http://103.159.85.246:4000/api/task/open/${editedTask._id}`, updatedTaskData, {
          headers: {
            Authorization: localStorage.getItem('authToken'),
          },
        });

        // Remove the task from the list
      setOverdueTasks(overdueTasks.filter((task) => task._id !== editedTask._id)); // Corrected function name

        setSuccessMessage('Task marked as open successfully.');


        setTimeout(() => {
          setSuccessMessage('');
        }, 2000);

        setEditedTask(null);
      } else {
        // Handle a case where no changes are made
        console.log("No changes made in the task.");
      }
    } catch (error) {
      console.error('Error updating task:', error);
      // Handle errors here
    }
  };

  return (
    <>

      <NavSide />
      <div className="m-5 pl-1 md:pl-64 mt-20">
        <h1 className="text-xl font-bold mb-4 text-orange-500 md:text-2xl">Overdue Tasks</h1>

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
            <table className="min-w-full border-collapse table-auto">
              <thead className='bg-orange-500 text-white'>
                <tr>
                  <th className="px-4 py-2">Sr. No.</th>
                  <th className="px-4 py-2">Task Title</th>
                  <th className="px-4 py-2">Status</th>
                  {/* <th className="px-4 py-2">Assigned By</th> */}
                  <th className="px-4 py-2">Started Date</th>
                  <th className="px-4 py-2">DeadLine</th>
                  <th className="px-4 py-2">Assign To</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {overdueTasks.length > 0 ? (
                  currentTasks.map((task, index) => (
                    <tr key={task._id} className='hover:bg-gray-100 text-sm cursor-pointer'>
                      <td className="border px-4 py-1.5 text-center font-semibold">{calculateSerialNumber(index)}</td>
                      <td className="px-4 py-1.5 text-center border font-bold text-red-900">{task.title}</td>
                      <td className="px-4 py-1.5 text-center border"><span className='px-2 py-1 bg-red-200 text-red-800 rounded-full text-sm font-bold'>Overdue</span> </td>
                      <td className="px-4 py-1.5 text-center border">
                        {new Date(task.startDate).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-1.5 text-center border">
                        {new Date(task.deadlineDate).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-1.5 text-center border font-semibold">{task.assignTo}</td>
                      <td className="border px-12 py-1.5 text-center">
                        <FontAwesomeIcon
                          icon={faEye}
                          className="text-blue-500 hover:underline cursor-pointer text-lg"
                          onClick={() => handleViewTask(task)}
                        />

                        <button
                          className="bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-green-700 ml-4 text-sm"
                          onClick={() => openEditModal(task)}
                        >
                          Mark as Open
                        </button>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-2 text-center border font-semibold">
                      No overdue tasks found.
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
                    className={`${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}
                  px-4 py-2 rounded`}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
            </ul>
          </div>

        )}
      </div>

      {isEditModalOpen && editedTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-gray-700">
          <div className="bg-white p-4 w-72 md:w-96 rounded-md">
            <h2 className="text-xl font-semibold mb-4 text-center">Edit Task</h2>
            <div className="mb-4">
              <label htmlFor="startDate" className="block mb-1">Start Date:</label>
              <input
                type="date"
                id="startDate"
                value={editedTask.startDate}
                onChange={(e) => setEditedTask({ ...editedTask, startDate: e.target.value })}
                className="px-2 py-1 border rounded-md focus:ring focus:ring-indigo-400 w-full"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="deadlineDate" className="block mb-1">Deadline Date:</label>
              <input
                type="date"
                id="deadlineDate"
                value={editedTask.deadlineDate}
                onChange={(e) => setEditedTask({ ...editedTask, deadlineDate: e.target.value })}
                className="px-2 py-1 border rounded-md focus:ring focus:ring-indigo-400 w-full"
              />
            </div>
            <div className="flex justify-center">
              <button
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 mr-2 text-sm md:text-base"
                onClick={saveChanges}
              >
                Save Changes
              </button>
              <button
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-700 text-sm md:text-base"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Task Modal */}
      {viewTask && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-gray-700">
          <div className="modal-container bg-white w-72 md:w-96 sm:p-6 text-xs md:text-base rounded-md">
            <div className='p-2 text-center'>
              <h2 className="text-xl text-center font-semibold mb-4">Task Details</h2>
              <div>
                <p className="mb-2 text-left justify-center">
                  <strong>AssignedBy:</strong> {viewTask.assignedBy}
                </p>
                <p className="mb-2 text-left justify-center">
                  <strong>AssignTo:</strong> {viewTask.assignTo}
                </p>
                <p className="mb-2 text-left justify-center">
                  <strong>Title:</strong> {viewTask.title}
                </p>
                <p className="mb-2 text-left justify-center">
                  <strong>Description:</strong> {viewTask.description}
                </p>
                <p className="mb-2 text-left justify-center">
                  <strong>Status:</strong> Overdue
                </p>
                <p className="mb-2 text-left justify-center">
                  <strong>Date:</strong> {new Date(viewTask.startDate).toLocaleDateString('en-GB')}
                </p>
                <p className="mb-2 text-left justify-center">
                  <strong>Start Time:</strong> {viewTask.startTime}
                </p>
                <p className="mb-2 text-left justify-center">
                  <strong>DeadLine:</strong> {new Date(viewTask.deadlineDate).toLocaleDateString('en-GB')}
                </p>
                <p className="mb-2 text-left justify-center">
                  <strong>End Time:</strong> {viewTask.endTime}
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

                <p className="mb-2 text-left flex item-center">
                  <span className='mr-1 '><strong>Audio:</strong></span>{" "}
                  {viewTask.audio ? (
                    <audio controls className='w-64 h-8 md:w-96 md-h-10 text-lg'>
                      <source src={`http://103.159.85.246:4000/${viewTask.audio}`} type="audio/mp3" />
                      Your browser does not support the audio element.
                    </audio>

                  ) : (
                    "Not Added"
                  )}
                </p>
                <p className='text-center'>
                  <button
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                    onClick={handleCloseViewModal}
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
          <div className="modal-container bg-white w-96 p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setIsPreviewModalOpen(false)}></button>
            <div className="p-1 text-center">
              <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">Image Preview</h3>
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

export default Overdue;