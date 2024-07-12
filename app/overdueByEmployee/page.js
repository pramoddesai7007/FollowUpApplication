
'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faSpinner ,faFileExcel} from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import NavSideEmp from '../components/NavSideEmp';
import * as XLSX from 'xlsx';

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

// Helper function to fetch employee name by ID
const getEmployeeName = async (employeeId, authToken) => {
  try {
    const response = await axios.get(`http://103.159.85.246:4000/api/employee/${employeeId}`, {
      headers: {
        Authorization: authToken,
      },
    });
    return response.data.name;
  } catch (error) {
    console.error(`Error fetching employee name for ID ${employeeId}:`, error);
    return '';
  }
};

const OverdueByEmployee = () => {
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTask, setViewTask] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [completeImageUrl, setPreviewImageUrl] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(15); // Set the number of tasks per page

  const calculateSerialNumber = (index) => {
    return index + (currentPage - 1) * tasksPerPage + 1;
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to the first page when searching
  };

  const filteredTasks = overdueTasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handlePicturePreview = (imageUrl) => {
    const completeImageUrl = `http://103.159.85.246:4000/${imageUrl}`; // Generate the complete image URL
    setPreviewImageUrl(completeImageUrl);
    setIsPreviewModalOpen(true);
  };


  useEffect(() => {
    const fetchOverdueTasks = async () => {
      try {
        const token = localStorage.getItem('authToken');

        const response = await axios.get('http://103.159.85.246:4000/api/task/tasks/over', {
          headers: {
            Authorization: token,
          },
        });

        if (response.data && response.data.overdueTasks) {
          setOverdueTasks(response.data.overdueTasks);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching overdue tasks:', error);
        setLoading(false);
      }
    };

    fetchOverdueTasks();
  }, []);

  // Function to handle viewing a task
  const handleViewTask = async (task) => {
    const authToken = localStorage.getItem('authToken');

    // Fetch and set names for assignedBy and assignTo
    const assignedByName = await getEmployeeName(task.assignedBy, authToken);
    const assignToName = await getEmployeeName(task.assignTo, authToken);

    setViewTask({
      ...task,
      assignedBy: assignedByName,
      assignTo: assignToName,
    });
  };

  // Function to close the view modal
  const handleCloseViewModal = () => {
    setViewTask(null); // Clear the task to close the modal
  };

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
        'StartDate': formatDate(task.startDate),
        'DeadLine': formatDate(task.deadlineDate),
        // 'AssignTo': task.assignTo, // Assign the name if available, otherwise use the ID
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
    const fileName = 'OverdueTask_list' + fileExtension;
    saveAs(data, fileName);
  };

  return (
    <>
      {/* <Navbar />
      <EmployeeSidebar /> */}
      <NavSideEmp />
      <div className=" m-5 pl-5 md:pl-72 mt-20">
        <h1 className="text-xl md:text-2xl font-bold mb-4 text-orange-800">Overdue Tasks</h1>

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
            <table className="min-w-full border-collapse table-auto">
              <thead className='bg-red-600 text-white'>
                <tr>
                  <th className="px-4 py-2 border-b">Sr.No</th>
                  <th className="px-4 py-2 border-b">Title</th>
                  <th className="px-4 py-2 border-b">Status</th>
                  <th className="px-4 py-2 border-b">Date</th>
                  <th className="px-4 py-2 border-b">Deadline</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {overdueTasks.length > 0 ? (
                  currentTasks.map((task, index) => (
                    <tr key={task._id} className='hover:bg-gray-100 text-sm cursor-pointer'>
                      <td className="px-4 py-1.5 border text-center border-red-300 font-semibold">{calculateSerialNumber(index)}</td>
                      <td className="px-4 py-1.5 border text-left border-red-300 font-bold text-red-950">{task.title}</td>
                      <td className="px-4 py-1.5 border text-center font-semibold text-red-950 border-red-300">

                      <span className='px-4 py-1.5 bg-blue-200 text-blue-800 rounded-full text-sm font-bold'>{task.status}</span></td>

                      <td className="px-4 py-1.5 border text-center border-red-300">{formatDate(task.startDate)}</td>
                      <td className="px-4 py-1.5 border text-center border-red-300">{formatDate(task.deadlineDate)}</td>
                      <td className="border px-4 py-1.5 text-center border-red-300 ">
                        <FontAwesomeIcon
                          icon={faEye}
                          className="text-blue-500 hover:underline cursor-pointer text-xl"
                          onClick={() => handleViewTask(task)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-2 border text-center font-semibold">
                      No Overdue Tasks found
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

      </div>

      {/* View Task Modal */}
      {viewTask && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-gray-700">
          <div className="modal-container  bg-white sm:p-6 p-2 w-72 md:w-96 rounded-md">
            <div className='p-2 text-center text-sm md:text-base'>
              <h2 className="text-2xl font-semibold mb-4">Task Details</h2>
              <p className="mb-2 text-left justify-center">
                <strong>Assigned By:</strong> {viewTask.assignedBy}
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
                <strong>Date:</strong> {formatDate(viewTask.startDate)}
              </p>
              <p className="mb-2 text-left justify-center">
                <strong>Start Time:</strong> {viewTask.startTime}
              </p>
              <p className="mb-2 text-left justify-center">
                <strong>Deadline:</strong> {formatDate(viewTask.deadlineDate)}
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
    </>
  );
};

export default OverdueByEmployee;