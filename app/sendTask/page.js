'use client';


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation, faPenToSquare, faTrash, faEye, faSpinner, faShareNodes, faPlus, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { format, parse, isBefore } from 'date-fns';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import NavSide from '../components/NavSide';
import * as XLSX from 'xlsx';
import jwtDecode from 'jwt-decode';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';


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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const ShareButton = ({ task }) => {
  const [assignedByName, setAssignedByName] = useState('');


  useEffect(() => {
    const fetchAssignedByName = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`http://103.159.85.246:4000/api/task/${task._id}`, {
          headers: {
            Authorization: token,
          },
        });

        if (response.status === 200) {
          setAssignedByName(response.data.assignedBy.name);
        }
      } catch (error) {
        console.error('Error fetching assignedBy name:', error);
      }
    };

    fetchAssignedByName();
  }, [task._id]);

  const handleShareClick = () => {
    const recipient = task.phoneNumber;
    const title = task.title;
    const description = task.description;
    const startDate = task.startDate;
    const assignedBy = assignedByName; // Use the fetched name
    const endDate = new Date(task.deadlineDate);
    const formattedEndDate = endDate.toLocaleDateString('en-GB');

    const message = `*New Task is created by : ${assignedBy}*%0A%0A*Task Title:* ${title}%0A*Description:* ${description}%0A*Start Date:* ${startDate}%0A*End Date:* ${formattedEndDate}%0A*Assigned By:* ${assignedBy}`;

    const whatsappWebURL = `https://web.whatsapp.com/send?phone=${recipient}&text=${message}`;

    window.open(whatsappWebURL);
  };

  return (
    <button
      onClick={handleShareClick}
      className="text-green-800 hover:underline cursor-pointer -mr-7 text-lg"
    >
      <FontAwesomeIcon icon={faWhatsapp} />
    </button>
  );
};
const itemsPerPage = 15; // Number of items to display per page

const SendTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [viewTask, setViewTask] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Add a loading state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [completeImageUrl, setPreviewImageUrl] = useState('');
  const [authenticated, setAuthenticated] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };


  const getTasksForCurrentPage = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const tasksToDisplay = filteredTasks.slice(startIndex, endIndex);

    if (tasksToDisplay.length === 0 && filteredTasks.length > 0) {
      return filteredTasks.slice(0, itemsPerPage); // Show the first page if the current page is empty
    }

    return tasksToDisplay;
  };

  const calculateSerialNumber = (index) => {
    return index + (currentPage - 1) * itemsPerPage + 1;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);


  const handlePicturePreview = (imageUrl) => {
    const completeImageUrl = `http://103.159.85.246:4000/${imageUrl}`; // Generate the complete image URL
    console.log(completeImageUrl)
    setPreviewImageUrl(completeImageUrl);
    setIsPreviewModalOpen(true);
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
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
      const fetchAllTasks = async () => {
        try {
          const token = localStorage.getItem('authToken');
          const response = await axios.get('http://103.159.85.246:4000/api/task/list', {
            headers: {
              Authorization: token,
            },
          });

          if (response.status === 200) {
            if (Array.isArray(response.data.tasks)) {
              const currentDate = new Date();
              const currentTime = currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit'});
              const formattedCurrentTime = currentTime.split(':').map((part, index) => index === 0 ? part.padStart(2, '0') : part).join(':');
              console.log(formattedCurrentTime);
              const tasksWithAssignedNames = await Promise.all(
                response.data.tasks.map(async (task) => {
                  try {
                    const employeeResponse = await axios.get(`http://103.159.85.246:4000/api/subemployee/${task.assignTo}`, {
                      headers: {
                        Authorization: token,
                      },
                    });

                    if (employeeResponse.status === 200) {
                      task.assigneeName = employeeResponse.data.name;
                    }
                  } catch (error) {
                    // If the employee is not found, set assigneeName as 'Employee Not Found'
                    task.assigneeName = 'Employee Not Found';
                  }

                  task.startDate = formatDate(task.startDate);
                  const formattedDeadlineDate = format(new Date(task.deadlineDate), 'dd/MM/yyyy');
                  task.deadlineDate = parse(formattedDeadlineDate, 'dd/MM/yyyy', new Date());

                  // Check if the task is completed or overdue
                  // if (task.status === 'completed') {
                  //   // Task is completed, no need to check deadline
                  // } else if (isBefore(task.deadlineDate, currentDate) && task.endTime < formattedCurrentTime) {
                  //   task.status = 'overdue';
                  // } else {
                  //   task.status = 'pending';
                  // }

                  return task;
                })
              );

              setTasks(tasksWithAssignedNames);
            } else {
              console.error('API response is not an array:', response.data);
            }
          } else {
            console.error('Failed to fetch tasks');
          }
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchAllTasks();
    
  }, []);

  useEffect(() => {
    const filtered = tasks.filter((task) => {
      const assigneeName = task.assigneeName.toLowerCase();
      const startDate = task.startDate.toLowerCase();
      const deadlineDate = formatDate(task.deadlineDate);
      const status = task.status.toLowerCase();
      const title = task.title.toLowerCase();
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
  }, [searchQuery, tasks]);

  const handleDeleteClick = (taskId) => {
    setDeleteTaskId(taskId);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(`http://103.159.85.246:4000/api/task/delete/${deleteTaskId}`, {
        headers: {
          Authorization: token,
        },
      });

      if (response.status === 200) {
        console.log('Task deleted successfully');
        setIsDeleteModalOpen(false);
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== deleteTaskId));
      } else {
        console.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (taskId) => {
    router.push(`/editForm/${taskId}`);
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
        taskData.startDate = formatDate(taskData.startDate);
        taskData.deadlineDate = formatDate(taskData.deadlineDate);

        const employeeResponse = await axios.get(`http://103.159.85.246:4000/api/subemployee/${taskData.assignTo}`, {
          headers: {
            Authorization: token,
          },
        });

        if (employeeResponse.status === 200) {
          taskData.assigneeName = employeeResponse.data.name;
        }

        console.log('Picture URL:', taskData.picture)
        console.log('Audio URL:', taskData.audio);


        setViewTask(taskData);
        setIsViewModalOpen(true);
      } else {
        console.error('Failed to fetch task details');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const exportToExcel = async () => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    const employeeNames = {}; // A map to store employee names

    // Fetch employee names
    await Promise.all(
      tasks.map(async (task) => {
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
      return {
        'Title': task.title,
        'Status': task.status,
        'StartDate': task.startDate,
        'DeadLine': task.deadlineDate,
        'AssignTo': employeeNames[task.assignTo] || task.assignTo, // Assign the name if available, otherwise use the ID
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
    const fileName = 'All_Task_list' + fileExtension;
    saveAs(data, fileName);
  };

  return (
    <>
      <NavSide />

      <div className="m-5 pl-0 md:pl-64 mt-20">
        <h1 className="text-xl md:text-2xl font-bold mb-4 text-orange-500 text-center md:text-left">Send Tasks</h1>
        <div className="flex justify-center items-center mb-4">
          <input
            type="text"
            placeholder="Search Tasks"
            className="px-3 py-1 border border-gray-400 rounded-full w-full md:w-1/3"
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
        </div>


        <div className="relative mb-16 md:mb-16 md:-mt-14">
          <button
            className="bg-green-500 text-white font-bold py-1 px-5 md:px-4 rounded-lg absolute top-2 right-3 md:right-0"
            onClick={() => router.push('/taskForm')}
          >
            <FontAwesomeIcon icon={faPlus} className="text-lg mr-1 font-bold" />
            <span className="font-bold">Add New</span>
          </button>
        </div>

        <div className="relative mb-7 md:mb-14">
          <button
            className="bg-green-700 text-white font-extrabold py-1 md:py-1.5 px-2 md:px-3 rounded-lg md:absolute -mt-2 md:-mt-12 top-2 right-32 text-sm md:text-sm flex items-center mr-1" // Positioning
            onClick={() => exportToExcel(filteredTasks)}                    >
            <FontAwesomeIcon icon={faFileExcel} className="text-lg mr-1 font-bold" />
            <span className="font-bold">Export</span>
          </button>
        </div>

        {/* <button onClick={() => exportToExcel(filteredTasks)}>Export to Excel</button> */}

        {loading ? (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-gray-700">
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className="text-white text-4xl"
            />
          </div>
        ) : (

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto md:mt-5">
              <thead className='bg-orange-500 text-white'>
                <tr>
                  <th className="px-4 py-2 text-center">Sr.No.</th>
                  <th className="px-4 py-2 text-center">Title</th>
                  <th className="px-4 py-2 text-center">Status</th>
                  <th className="px-4 py-2 text-center">StartDate</th>
                  <th className="px-4 py-2 text-center">Deadline</th>
                  <th className="px-4 py-2 text-center">AssignTo</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length > 0 ? (
                  getTasksForCurrentPage().map((task, index) => (
                    <tr key={task._id} className="hover:bg-gray-100 text-sm cursor-pointer">
                      <td className="border px-4 py-1.5 text-center font-semibold">{calculateSerialNumber(index)}</td>
                      <td className="border px-4 py-1.5 font-bold text-violet-900">{task.title}</td>
                      <td className="text-center border px-2 py-1">
                        <span className={`rounded-full font-bold px-5 py-1 ${task.status === 'completed' ? 'text-green-800 bg-green-200' :
                          task.status === 'overdue' ? 'text-red-800 bg-red-200' :
                            task.status === 'pending' ? 'text-blue-800 bg-blue-200' :
                              ''
                          }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="border px-4 py-1.5">{task.startDate}</td>
                      <td className="border px-4 py-1.5">{formatDate(task.deadlineDate)}</td>
                      <td className="border px-4 py-1.5 text-center font-semibold">{task.assigneeName}</td>
                      <td className="border px-4 py-1.5">
                        <FontAwesomeIcon
                          icon={faEye}
                          className="text-blue-500 hover:underline mr-3 cursor-pointer pl-3"
                          onClick={() => handleViewClick(task._id)}
                        />
                        <FontAwesomeIcon
                          icon={faPenToSquare}
                          className="text-orange-500 hover:underline mr-3 cursor-pointer"
                          onClick={() => handleEdit(task._id)}
                        />
                        <FontAwesomeIcon
                          icon={faTrash}
                          className="text-red-500 hover:underline mr-3 cursor-pointer"
                          onClick={() => handleDeleteClick(task._id)}
                        />

                        <ShareButton task={task} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-2 text-center border font-semibold">
                      No any task send.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="flex justify-center mt-4">
              {Array.from({ length: Math.ceil(filteredTasks.length / itemsPerPage) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-4 py-1 mx-1 ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'
                    }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {isViewModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="modal-container bg-white w-72 md:w-96 sm:p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>

              <div className="p-2 text-center text-sm md:text-base">
                <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-400 text-center">Task Details</h3>
                {viewTask && (
                  <div>
                    <p className="mb-2 text-left justify-center ">
                      <strong>AssignedBy:</strong> {viewTask.assignedBy.name}
                    </p>
                    <p className="mb-2 text-left justify-center ">
                      <strong>AssignTo:</strong> {viewTask.assigneeName}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong>Title:</strong> {viewTask.title}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong>Description:</strong> {viewTask.description}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong>Date:</strong> {viewTask.startDate}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong>Start Time:</strong> {viewTask.startTime}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong>DeadLine:</strong> {viewTask.deadlineDate}
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


                  </div>
                )}
                <button
                  type="button"
                  className="bg-red-500 hover:bg-red-700 text-black font-bold py-2 px-4 rounded mt-4 mr-2"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}


        {isDeleteModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="modal-container bg-white sm:w-96 sm:p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setIsDeleteModalOpen(false)}></button>
              <div className="p-2 text-center">
                {/* <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">Confirm Deletion</h3> */}
                <FontAwesomeIcon icon={faCircleExclamation} className='text-3xl md:text-5xl text-orange-600 mt-2' />
                <p className="mb-3 text-center justify-center mt-3">
                  Are you sure you want to delete this task?
                </p>
                <button
                  type="button"
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4 mr-2 text-xs md:text-base"
                  onClick={() => handleDelete()}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mt-4 text text-xs md:text-base"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </button>
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
                  width={400}
                  height={300}
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

      </div>
    </>
  );
};

export default SendTasks;

