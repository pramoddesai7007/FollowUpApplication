'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faEye, faFileExcel } from '@fortawesome/free-solid-svg-icons';
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

const CompletedTaskList = () => {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false); // State for "View Task" modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [editedTask, setEditedTask] = useState(null);
  const [subemployees, setSubemployees] = useState([]); // State to store Subemployee names and ObjectIds
  const [successMessage, setSuccessMessage] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [completeImageUrl, setPreviewImageUrl] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for Edit Task modal
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [authenticated, setAuthenticated] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 15; // Number of tasks to display per page

  const calculateSerialNumber = (index) => {
    return index + 1 + (currentPage - 1) * tasksPerPage;
  };

  const handlePicturePreview = (imageUrl) => {
    const completeImageUrl = `http://103.159.85.246:4000/${imageUrl}`; // Generate the complete image URL
    setPreviewImageUrl(completeImageUrl);
    setIsPreviewModalOpen(true);
  };


  function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  function formatDateList(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are 0-based, so add 1
    const year = date.getFullYear();

    // Ensure two-digit formatting for day and month
    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(month).padStart(2, '0');

    return `${formattedDay}/${formattedMonth}/${year}`;
  }


  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to the first page when performing a search

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
    
      const fetchCompletedTasks = async () => {
        try {
          const response = await axios.get('http://103.159.85.246:4000/api/task/tasks/completed', {
            headers: {
              Authorization: localStorage.getItem('authToken'),
            },
          });

          const completedTasksWithAssigneeNames = await Promise.all(
            response.data.completedTasks.map(async (task) => {
              const assigneeResponse = await axios.get(`http://103.159.85.246:4000/api/subemployee/${task.assignTo}`, {
                headers: {
                  Authorization: localStorage.getItem('authToken'),
                },
              });
              const assigneeName = assigneeResponse.data.name;
              return { ...task, assignTo: assigneeName };
            })
          );

          setCompletedTasks(completedTasksWithAssigneeNames);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching completed tasks:', error);
          setLoading(false);
        }
      };

      fetchCompletedTasks();
    
  }, []);



  useEffect(() => {
    const filtered = completedTasks.filter((completedTask) => {
      console.log(completedTasks)
      const assigneeName = completedTask.assignTo.toLowerCase();
      const startDate = completedTask.startDate.toLowerCase();
      const deadlineDate = formatDate(completedTask.deadlineDate);
      const status = completedTask.status.toLowerCase();
      const title = completedTask.title.toLowerCase();
      const query = searchQuery.toLowerCase();

      return (
        assigneeName.includes(query) ||
        title.includes(query) ||
        status.includes(query) ||
        startDate.includes(query) ||
        deadlineDate.includes(query)
      );
    });

    setFilteredTasks(filtered);
  }, [searchQuery, completedTasks]);

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  // Handlers for navigating pages
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };



  useEffect(() => {
    // Fetch Subemployee names and ObjectIds and populate the dropdown list
    const fetchSubemployees = async () => {
      try {
        const response = await axios.get('http://103.159.85.246:4000/api/employee/subemployees/list', {
          headers: {
            Authorization: localStorage.getItem('authToken'),
          },
        });

        const subemployeeData = response.data.map((subemployee) => ({
          _id: subemployee._id, // Assuming MongoDB ObjectId
          name: subemployee.name,
        }));

        setSubemployees(subemployeeData);
      } catch (error) {
        console.error('Error fetching Subemployee data:', error);
      }
    };

    fetchSubemployees();
  }, []);

  const closeViewModal = () => {
    setSelectedTask(null);
    setViewModalOpen(false);
  };

  const hideActions = typeof window !== 'undefined' ? window.localStorage.getItem('subUsername') : null;


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
        setCompletedTasks(completedTasks.filter((task) => task._id !== editedTask._id));

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

  const openViewModal = (task) => {
    setSelectedTask(task);
    setViewModalOpen(true);
  };

  const exportToExcel = async () => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    const employeeNames = {}; // A map to store employee names

    // Fetch employee names
    await Promise.all(
      filteredTasks.map(async (task) => {
        if (!employeeNames[task.assignTo]) {
          try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`http://103.159.85.246:4000/api/subemployee/${task.assignTo}`, {
              headers: {
                Authorization: token,
              },
            });

            if (response.status === 200) {
              employeeNames[task.assignTo] = response.data.name;
            }
          } catch (error) {
            console.error(`Error fetching employee name for ID ${task.assignTo}:`, error);
          }
        }
      })
    );

    // Filter and map the data including the header fields and employee names
    const tasksToExport = filteredTasks.map(task => {
      const formattedStartDate = formatDate(task.startDate);
      const formattedDeadline = formatDate(task.deadlineDate);

      return {
        'Title': task.title,
        'Status': task.status,
        'StartDate': formattedStartDate,
        'DeadLine': formattedDeadline,
        'AssignTo': employeeNames[task.assignTo] || task.assignTo, // Assign the name if available, otherwise use the ID
      };
    });

    function formatDate(dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
      const day = date.getDate().toString().padStart(2, '0');
      return `${day}-${month}-${year}`; // Change the date format here as needed
    }
    // Create a worksheet from the filtered task data
    const ws = XLSX.utils.json_to_sheet(tasksToExport);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };

    // Convert the workbook to an array buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Create a Blob from the array buffer
    const data = new Blob([excelBuffer], { type: fileType });

    // Set the filename and save the file using saveAs function
    const fileName = 'All_Task_list' + fileExtension;
    saveAs(data, fileName);
  };
  return (
    <>
      <NavSide />

      <div className="m-5 pl-1 md:pl-64 mt-20">
        <h1 className="text-xl md:text-2xl font-bold mb-4 text-orange-500 text-center md:text-left">Completed Tasks</h1>
        <div className="flex justify-center items-center mb-4">
          <input
            type="text"
            placeholder="Search Tasks"
            className="px-3 py-1 border border-gray-400 rounded-full w-full md:w-1/2"
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
        </div>

        <div className="relative mb-7 md:mb-14">
          <button
            className="bg-green-700 text-white font-extrabold py-1 md:py-1.5 px-2 md:px-3 rounded-lg md:absolute -mt-2 md:-mt-12 top-2 right-16 text-sm md:text-sm flex items-center mr-1" // Positioning
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
          <div>

            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className='bg-orange-500 text-white'>
                  <tr>
                    <th className="px-4 py-2">Sr. No.</th>
                    <th className="px-4 py-2">Task Title</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">StartedDate</th>
                    <th className="px-4 py-2">DeadLine</th>
                    <th className="px-4 py-2">Assigned To</th>
                    {!hideActions ? (
                      <th className="px-4 py-2">Actions</th>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {completedTasks.length > 0 ? (
                    currentTasks.map((task, index) => (
                      <tr key={task._id} className='hover:bg-gray-100 text-sm cursor-pointer'>
                        <td className="border px-4 py-1.5 text-center font-semibold">{calculateSerialNumber(index)}</td>
                        <td className="border px-4 py-1.5">
                          <div>
                            <h2 className="text-base font-bold text-blue-800 text-center">{task.title}</h2>
                          </div>
                        </td>
                        <td className="border px-4 py-1.5 text-center">
                          <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-sm">
                            Completed
                          </span>
                        </td>
                        <td className="border px-4 py-1.5 text-center">{formatDateList(task.startDate)}</td>
                        <td className="border px-4 py-1.5 text-center">{formatDateList(task.deadlineDate)}</td>
                        <td className="border px-4 py-1.5 text-center font-semibold">{task.assignTo}</td>
                        <td className={`border px-4 py-1.5 text-center ${hideActions ? 'hidden' : ''}`}>
                          {!hideActions && (
                            <div className="flex items-center">
                              <FontAwesomeIcon
                                icon={faEye}
                                className="text-blue-500 hover:underline mr-5 cursor-pointer pl-5 text-xl"
                                onClick={() => openViewModal(task)} // Add a View button here
                              />
                              <button
                                className="bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-green-700 ml-4 text-sm"
                                onClick={() => openEditModal(task)}
                              >
                                Mark as Open
                              </button>
                            </div>

                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className='px-4 py-2 text-center border font-semibold'>
                        No Completed Tasks Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>


            <div className="flex justify-center mt-4">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-4 py-1 mx-1 ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed bottom-5 right-5 bg-green-500 text-white py-2 px-4 rounded-md">
          {successMessage}
        </div>
      )}

      {/* View Task Modal */}
      {viewModalOpen && selectedTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-gray-700">
          <div className="modal-container bg-white w-72 md:w-96 p-3 text-sm md:text-base rounded-md mt-16 md:mt-10">
            <div className='p-2 text-center'>
              <h2 className="text-xl font-semibold mb-5 text-center">View Task</h2>
              {/* <div className='text-left pl-8'> */}
              {/* Display task details here */}

              <p className="mb-2 text-left justify-center">
                <strong>Title:</strong> {selectedTask.title}
              </p>
              <p className='mb-2 text-left justify-center'><strong>Description:</strong> {selectedTask.description}</p>
              <p className='mb-2 text-left justify-center'><strong>Status:</strong> Completed</p>
              <p className='mb-2 text-left justify-center'><strong>Date:</strong> {formatDateList(selectedTask.startDate)}</p>
              <p className='mb-2 text-left justify-center'><strong>DeadLine:</strong> {formatDateList(selectedTask.deadlineDate)}</p>
              <p className='mb-2 text-left justify-center'><strong>Assigned To:</strong> {selectedTask.assignTo}</p>

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
                    <source src={`http://103.159.85.246:4000/${selectedTask.audio}`} type="audio/mp3" />
                    Your browser does not support the audio element.
                  </audio>

                ) : (
                  "Not Added"
                )}
              </p>



              <div className='text-center'>
                <button
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 mt-5"
                  onClick={closeViewModal}
                >
                  Close
                </button>
              </div>
              {/* </div> */}
            </div>
          </div>
        </div>
      )}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-container bg-white w-72 p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
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

      {/* ... (existing code) */}
    </>
  );
};

export default CompletedTaskList;
