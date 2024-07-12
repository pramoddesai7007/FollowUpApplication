
'use client';
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation, faPenToSquare, faTrash, faEye, faSpinner, faShareNodes, faPlus, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { format, parse, isBefore } from 'date-fns';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import NavSide from '../components/NavSide';
import * as XLSX from 'xlsx';
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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const itemsPerPage = 15; // Number of items to display per page


const TimeCard = () => {
  const [tasks, setTasks] = useState([]);
  const [viewTask, setViewTask] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [completeImageUrl, setPreviewImageUrl] = useState('');
  const [authenticated, setAuthenticated] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [error, setError] = useState(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [employeeNames, setEmployeeNames] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  
  // Utility function to format date to yyyy-mm
  const formatDateToYYYYMM = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    let month = d.getMonth() + 1;

    if (month < 10) month = `0${month}`;

    return `${year}-${month}`;
  };

  // Get current date in yyyy-mm format
  const currentDate = formatDateToYYYYMM(new Date());
  const [selectedMonth, setSelectedMonth] = useState(currentDate);

  const router = useRouter();

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const getTasksForCurrentPage = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const tasksToDisplay = filteredTasks.slice(startIndex, endIndex);

    if (tasksToDisplay.length === 0 && filteredTasks.length > 0) {
      return filteredTasks.slice(0, itemsPerPage);
    }

    return tasksToDisplay;
  };

  const calculateSerialNumber = (index) => {
    return index + (currentPage - 1) * itemsPerPage + 1;
  };

  const handlePicturePreview = (imageUrl) => {
    const completeImageUrl = `http://103.159.85.246:4000/${imageUrl}`;
    setPreviewImageUrl(completeImageUrl);
    setIsPreviewModalOpen(true);
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {

    const fetchEmployeeNames = async () => {
      try {
        const response = await axios.get('http://103.159.85.246:4000/api/salary/fetch-work-hours');
        const names = response.data.map(employee => employee.email);
        console.log(names)
        setEmployeeNames(names);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeNames();
  }, []);




  useEffect(() => {
    const filterTasks = () => {
      let filtered = tasks;

      if (searchQuery) {
        filtered = filtered.filter((task) => {
          const assigneeName = task.assigneeName.toLowerCase();
          const title = task.title.toLowerCase();
          const status = task.status.toLowerCase();
          const startDate = task.startDate.toLowerCase();
          const deadlineDate = formatDate(task.deadlineDate);
          const query = searchQuery.toLowerCase();

          return (
            assigneeName.includes(query) ||
            title.includes(query) ||
            status.includes(query) ||
            startDate.includes(query) ||
            deadlineDate.includes(query)
          );
        });
      }

      setFilteredTasks(filtered);
    };

    filterTasks();
  }, [searchQuery, tasks]);

  const handleDeleteClick = (taskId) => {
    setDeleteTaskId(taskId);
    setIsDeleteModalOpen(true);
  };

  const handleErrorModalClose = () => {
    if (error && error.includes('not authorized')) {
      setIsErrorModalOpen(false);
      setError(null);
    } else {
      setIsDeleteModalOpen(false);
      setIsErrorModalOpen(false);
      setError(null);
    }
  };

  const handleEmployeeChange = (e) => {
    setSelectedEmployee(e.target.value);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const deleteResponse = await axios.delete(`http://103.159.85.246:4000/api/task/delete/${deleteTaskId}`, {
        headers: {
          Authorization: token,
        },
      });

      if (deleteResponse.status === 200) {
        console.log('Task deleted successfully');
        setIsDeleteModalOpen(false);
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== deleteTaskId));
      } else {
        setError('Failed to delete task');
        setIsErrorModalOpen(true);
        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Not Authority To Delete This Task !!!');
      setIsErrorModalOpen(true);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <NavSide />
      <div className="m-5 pl-0 md:pl-64 mt-20">
        <h1 className="text-xl md:text-2xl font-bold mb-4 text-orange-500 text-center md:text-left">Time Card</h1>
           {/* <div className="flex justify-center items-center mb-4 space-x-2">
          <input
            type="date"
            className="px-3 py-1 border border-gray-400 rounded w-full md:w-52"
            value={startDate.split('-').reverse().join('-')}
            onChange={(e) => setStartDate(e.target.value.split('-').reverse().join('-'))}
          />
          <input
            type="date"
            className="px-3 py-1 border border-gray-400 rounded w-full md:w-52"
            value={endDate.split('-').reverse().join('-')}
            onChange={(e) => setEndDate(e.target.value.split('-').reverse().join('-'))}
          />
          <input
            type="text"
            placeholder="Search Tasks"
            className="px-3 py-1 border border-gray-400 rounded w-full md:w-52"
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
        </div> */}
        <div className="flex justify-center items-center mb-4 space-x-2">
        <div className="overflow-x-auto">
            <div className="flex items-center space-x-2 rounded">
              <label htmlFor="employeeSelect" className="text-sm font-medium text-gray-700">
                Select Employee:
              </label>
              <select
                id="employeeSelect"
                name="employeeSelect"
                className="block w-44 px-3 py-2 border bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus: border-gray-400 sm:text-sm"
                value={selectedEmployee}
                onChange={handleEmployeeChange}
              >
                <option value="">Select an employee</option>
                {employeeNames.map((employeeName, index) => (
                  <option key={index} value={employeeName}>
                    {employeeName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <input
            type="month"
            className="px-3 py-1 border border-gray-400 rounded w-full md:w-40"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
          <input
            type="text"
            placeholder="Search Tasks"
            className="px-3 py-1 border border-gray-400 rounded w-full md:w-52"
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
        </div>
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
           
            <table className="min-w-full table-auto">
              <thead className='bg-orange-500 text-white'>
                <tr>
                  <th className="px-4 py-2 text-center">Sr.No.</th>
                  <th className="px-4 py-2 text-center">In Date</th>
                  <th className="px-4 py-2 text-center">In Time</th>
                  <th className="px-4 py-2 text-center">Out Date</th>
                  <th className="px-4 py-2 text-center">Out Date</th>
                  <th className="px-4 py-2 text-center">Duration</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
             
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

        {isErrorModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="modal-container bg-white sm:w-96 sm:p-6 rounded shadow-lg" >
              <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={handleErrorModalClose}></button>
              <div className="p-2 text-center">
                <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">Error</h3>
                <p className="mb-3 text-center justify-center mt-3">{error}</p>
                <button
                  type="button"
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4 mr-2 text-xs md:text-base"
                  onClick={handleErrorModalClose}
                >
                  Close
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
      </div>
    </>
  );
};

export default TimeCard;