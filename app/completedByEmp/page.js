'use client'


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faSpinner, faFileExcel } from '@fortawesome/free-solid-svg-icons';
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


const CompletedTaskList = () => {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTask, setViewTask] = useState(null); // State to manage the task to be viewed
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [completeImageUrl, setPreviewImageUrl] = useState('');
  const [authenticated, setAuthenticated] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(15); // Number of tasks per page
  const [searchTerm, setSearchTerm] = useState('');

  const calculateSerialNumber = (index) => {
    return index + (currentPage - 1) * tasksPerPage + 1;
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to the first page when searching
  };

  const handlePicturePreview = (imageUrl) => {
    const completeImageUrl = `http://103.159.85.246:4000/${imageUrl}`; // Generate the complete image URL
    setPreviewImageUrl(completeImageUrl);
    setIsPreviewModalOpen(true);
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
    if (userRole !== 'sub-employee') {
      // If the user is not a superadmin, redirect to the login page
      router.push('/forbidden');
      return;
    }

    const fetchCompletedTasks = async () => {
      try {
        const response = await axios.get('http://103.159.85.246:4000/api/task/tasks/completedByEmp', {
          headers: {
            Authorization: localStorage.getItem('authToken'), // Include your JWT token here
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

  // Function to open the view modal for a task
  const openViewModal = (task) => {
    setViewTask(task); // Set the task to be viewed
  };

  // Function to close the view modal
  const closeViewModal = () => {
    setViewTask(null); // Clear the task to close the modal
  };

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;

  const filteredTasks = completedTasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  // Function to handle page change
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
    const fileName = 'Completed Task_list' + fileExtension;
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
        <h1 className="text-2xl font-semibold mb-4 text-orange-500">Completed Task List</h1>

        <div className="flex justify-center items-center mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by Task Title..."
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
          <div>

            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className='bg-green-500 text-white'>
                  <tr>
                    <th className="px-4 py-2">Sr.No.</th>
                    <th className="px-4 py-2">Task</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Assigned To</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTasks.length > 0 ? (
                    currentTasks.map((task, index) => (
                      <tr key={task._id}>
                        <td className="border border-green-500 px-4 py-2 text-center">{calculateSerialNumber(index)}</td>
                        <td className="border border-green-500  px-4 py-2">
                          <div>
                            <h2 className="text-base border-green-500  font-medium text-blue-800 text-left">{task.title}</h2>
                          </div>
                        </td>
                        <td className="border px-4 py-2 text-left border-green-500 ">{task.description}</td>
                        <td className="border px-4 py-2 text-center border-green-500 ">{task.assignTo}</td>
                        <td className="border px-4 py-2 text-center border-green-500 ">
                          <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-sm">
                            Completed
                          </span>
                        </td>
                        <td className="border px-4 py-2 text-center border-green-500 ">
                          <div className="flex items-center mx-5">
                            <FontAwesomeIcon
                              icon={faEye}
                              className="text-blue-500 hover:underline cursor-pointer text-lg"
                              onClick={() => openViewModal(task)} // Open view modal when clicked
                            />
                          </div>
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
          <div className="modal-container  bg-white sm:p-6 w-72 md:w-96 rounded-md">
            <div className='p-2 text-center text-sm md:text-base'>
              <h2 className="text-2xl font-semibold mb-4">Task Details</h2>
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
                <strong>Status:</strong> {viewTask.status}
              </p>
              <p className="mb-2 text-left justify-center">
                <strong>Date: </strong>{new Date(viewTask.startDate).toLocaleDateString('en-GB')}
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

              <button
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                onClick={closeViewModal}
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
            <div className="p-5 text-center">
              <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">Image Preview</h3>
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

export default CompletedTaskList;


// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import Navbar from '../components/Navbar';
// import Sidebar from '../components/Sidebar';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faEye } from '@fortawesome/free-solid-svg-icons';



// const CompletedTaskList = () => {
//   const [completedTasks, setCompletedTasks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editingTask, setEditingTask] = useState(null);

//   useEffect(() => {
//     const fetchCompletedTasks = async () => {
//       try {
//         const response = await axios.get('http://103.159.85.246:4000/api/task/tasks/completedByEmp', {
//           headers: {
//             Authorization: localStorage.getItem('authToken'), // Include your JWT token here
//           },
//         });

//         const completedTasksWithAssigneeNames = await Promise.all(
//           response.data.completedTasks.map(async (task) => {
//             const assigneeResponse = await axios.get(`http://103.159.85.246:4000/api/subemployee/${task.assignTo}`, {
//               headers: {
//                 Authorization: localStorage.getItem('authToken'),
//               },
//             });
//             const assigneeName = assigneeResponse.data.name;
//             return { ...task, assignTo: assigneeName };
//           })
//         );

//         setCompletedTasks(completedTasksWithAssigneeNames);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching completed tasks:', error);
//         setLoading(false);
//       }
//     };

//     fetchCompletedTasks();
//   }, []);

//   return (
//     <>
//       <Navbar />
//       <Sidebar />
//       <div className="container mx-auto mt-20 m-10 pl-64">
//         <h1 className="text-2xl font-semibold mb-4">Completed Task List</h1>
//         {loading ? (
//           <p className="text-gray-600">Loading completed tasks...</p>
//         ) : (
//           <div>
//             {completedTasks.length === 0 ? (
//               <p className="text-gray-600">No completed tasks found.</p>
//             ) : (
//               <table className="min-w-full table-auto">
//                 <thead>
//                   <tr>
//                     <th className="px-4 py-2">Sr. No.</th>
//                     <th className="px-4 py-2">Task</th>
//                     <th className="px-4 py-2">Description</th>
//                     <th className="px-4 py-2">Assigned To</th>
//                     <th className="px-4 py-2">Status</th>
//                     <th className="px-4 py-2 text-left">Actions</th>


//                   </tr>
//                 </thead>
//                 <tbody>
//                   {completedTasks.map((task, index) => (
//                     <tr key={task._id}>
//                       <td className="border px-4 py-2 text-center">{index + 1}</td>

//                       <td className="border px-4 py-2">
//                         {editingTask === task ? (
//                           <div>
//                             {/* Edit form */}
//                             <input
//                               type="text"
//                               value={editingTask.title}
//                               onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
//                             />
//                             <button onClick={() => saveEditedTask(editingTask)}>Save</button>
//                             <button onClick={cancelEditingTask}>Cancel</button>
//                           </div>
//                         ) : (
//                           <div>
//                             <h2 className=" text-base font-medium text-blue-800 text-center">{task.title}</h2>
//                           </div>
//                         )}
//                       </td>
//                       <td className="border px-4 py-2 text-center">{task.description}</td>
//                       <td className="border px-4 py-2 text-center">{task.assignTo}</td>
//                       <td className="border px-4 py-2 text-center">
//                         <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-sm">
//                           Completed
//                         </span>
//                       </td>
//                       <td className="border px-4 py-2 text-center">

//                         <div className="flex items-center">
//                           <FontAwesomeIcon
//                             icon={faEye}
//                             className="text-blue-500 hover:underline cursor-pointer mx-2"
//                             onClick={() => openViewModal(task)} // Open view modal when clicked
//                           />
//                         </div>

//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         )}
//       </div>
//     </>
//   );
// };




// export default CompletedTaskList;