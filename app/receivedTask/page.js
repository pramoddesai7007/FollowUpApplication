// 'use client'

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faSpinner, faEye, faFileExcel } from '@fortawesome/free-solid-svg-icons';
// import Image from 'next/image';
// import { format, parse, isBefore } from 'date-fns';
// import NavSideEmp from '../components/NavSideEmp';
// import * as XLSX from 'xlsx';
// import { useRouter } from 'next/navigation';

// import jwtDecode from 'jwt-decode';


// const saveAs = (data, fileName) => {
//   const a = document.createElement('a');
//   document.body.appendChild(a);
//   a.style = 'display: none';
//   const url = window.URL.createObjectURL(data);
//   a.href = url;
//   a.download = fileName;
//   a.click();
//   window.URL.revokeObjectURL(url);
// };



// const formatDateString = (dateString) => {
//   const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
//   const date = new Date(dateString).toLocaleDateString(undefined, options);
//   return date;
// };

// const formatDateDisplay = (dateString) => {
//   const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
//   return new Date(dateString).toLocaleDateString('en-GB', options);
// };



// function parseEndTime(endTime) {
//   const currentDate = new Date();
//   const timeString = format(currentDate, 'yyyy-MM-dd') + ' ' + endTime;
//   return parse(timeString, 'yyyy-MM-dd h:mm a', new Date());
// }

// const ReceivedTaskList = () => {
//   const [tasks, setTasks] = useState([]);
//   const [viewTask, setViewTask] = useState(null);
//   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//   const [loading, setLoading] = useState(true); // Add a loading state
//   const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
//   const [completeImageUrl, setPreviewImageUrl] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [tasksPerPage] = useState(15); // Define tasks to show per page
//   const [searchTerm, setSearchTerm] = useState(''); // State to hold the search term
//   const [authenticated, setAuthenticated] = useState(true);


//   const handleSearch = (event) => {
//     setSearchTerm(event.target.value); // Set the search term as the user types
//     setCurrentPage(1); // Reset to the first page when searching
//   };


//   const calculateSerialNumber = (index) => {
//     return index + (currentPage - 1) * tasksPerPage + 1;
//   };

//   const handlePicturePreview = (imageUrl) => {
//     const completeImageUrl = `http://103.159.85.246:4000/${imageUrl}`; // Generate the complete image URL
//     setPreviewImageUrl(completeImageUrl);
//     setIsPreviewModalOpen(true);
//   };

//   const handleMarkAsCompleteClick = async (taskId) => {
//     try {
//       const token = localStorage.getItem('authToken');
//       const response = await axios.put(
//         `http://103.159.85.246:4000/api/task/complete/${taskId}`,
//         {},
//         {
//           headers: {
//             Authorization: token,
//           },
//         }
//       );

//       if (response.status === 200) {
//         // Remove the task from the tasks state
//         setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
//         console.log('Marked as Completed');
//       } else {
//         console.error('Failed to mark task as complete');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   const router = useRouter()

//   useEffect(() => {

//     const token = localStorage.getItem('authToken');
//     if (!token) {
//       // If the user is not authenticated, redirect to the login page
//       setAuthenticated(false);
//       router.push('/login');
//       return;
//     }

//     const decodedToken = jwtDecode(token);
//     console.log(decodedToken)
//     const userRole = decodedToken.role || 'guest';

//     // Check if the user has the superadmin role
//     if (userRole !== 'sub-employee') {
//       // If the user is not a superadmin, redirect to the login page
//       router.push('/forbidden');
//       return;
//     }
//     const loadFormattedTasks = async () => {
//       if (typeof window === 'undefined') {
//         return;
//       }

//       const token = localStorage.getItem('authToken');
//       if (!token) {
//         // If the user is not authenticated, redirect to the login page
//         setAuthenticated(false);
//         router.push('/login');
//         return;
//       }

//       const decodedToken = jwtDecode(token);
//       console.log(decodedToken)
//       const userRole = decodedToken.role || 'guest';

//       // Check if the user has the superadmin role
//       if (userRole !== 'sub-employee') {
//         // If the user is not a superadmin, redirect to the login page
//         router.push('/forbidden');
//         return;
//       }


//       try {
//         const response = await axios.get(
//           'http://103.159.85.246:4000/api/task/listTaskEmp',
//           {
//             headers: {
//               Authorization: token,
//               'Content-Type': 'application/json',
//             },
//           }
//         );

//         if (response.status === 200) {
//           const formattedTasks = response.data.tasks.map((task) => ({
//             ...task,
//             deadlineDate: formatDateString(task.deadlineDate),
//             startDate: formatDateString(task.startDate),
//           }));
//           setTasks(formattedTasks);
//         } else {
//           console.error('Failed to fetch tasks');
//         }
//       } catch (error) {
//         console.error('Error fetching tasks:', error);
//       } finally {
//         setLoading(false); // Set loading to false when tasks are fetched
//       }
//     };

//     loadFormattedTasks();
//   }, []);

//   // Function to set row color and status based on task status and deadline date
//   const getStatusColorAndText = (task) => {
//     const currentDate = new Date();
//     const currentTime = currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
//     const formattedCurrentTime = currentTime.split(':').map((part, index) => index === 0 ? part.padStart(2, '0') : part).join(':');
//     console.log(formattedCurrentTime);
//     const formattedDeadlineDate = format(new Date(task.deadlineDate), 'dd/MM/yyyy');
//     task.deadlineDate = parse(formattedDeadlineDate, 'dd/MM/yyyy', new Date());

//     if (task.status === 'completed') {
//       return {
//         colorClass: ' bg-green-200 rounded-full font-semibold text-center text-green-900',
//         statusText: 'Completed',
//       };
//     } else if (task.status === 'overdue') {
//       return { colorClass: 'bg-red-300 rounded-full font-semibold text-center text-red-800', statusText: 'Overdue' };
//     } else {
//       return { colorClass: 'bg-blue-300 rounded-full font-semibold text-center text-blue-700', statusText: 'Pending' };
//     }
//   };


//   const handleViewClick = async (taskId) => {
//     try {
//       const token = localStorage.getItem('authToken');
//       const response = await axios.get(`http://103.159.85.246:4000/api/task/${taskId}`, {
//         headers: {
//           Authorization: token,
//         },
//       });

//       if (response.status === 200) {
//         const taskData = response.data;
//         console.log(taskData);
//         // Format the date for the task
//         taskData.deadlineDate = formatDateString(taskData.deadlineDate);
//         taskData.startDate = formatDateString(taskData.startDate);

//         setViewTask(taskData);
//         setIsViewModalOpen(true);
//       } else {
//         console.error('Failed to fetch task details');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   const filteredTasks = tasks.filter((task) =>
//     task.title.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const indexOfLastTask = currentPage * tasksPerPage;
//   const indexOfFirstTask = indexOfLastTask - tasksPerPage;
//   const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

//   // Function to handle page change
//   const paginate = pageNumber => setCurrentPage(pageNumber);
//   const exportToExcel = async () => {
//     const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
//     const fileExtension = '.xlsx';


//     // Fetch employee names


//     // Filter and map the data including the header fields and employee names
//     const tasksToExport = filteredTasks.map(task => {
//       return {
//         'Title': task.title,
//         'Status': task.status,
//         'StartDate': task.startDate,
//         'DeadLine': task.deadlineDate,
//         'AssignTo': task.assignTo, // Assign the name if available, otherwise use the ID
//       };
//     });

//     // Create a worksheet from the filtered task data
//     const ws = XLSX.utils.json_to_sheet(tasksToExport);
//     const wb = { Sheets: { data: ws }, SheetNames: ['data'] };

//     // Convert the workbook to an array buffer
//     const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

//     // Create a Blob from the array buffer
//     const data = new Blob([excelBuffer], { type: fileType });

//     // Set the filename and save the file using saveAs function
//     const fileName = 'receivedTask_list' + fileExtension;
//     saveAs(data, fileName);
//   };

//   if (!authenticated) {
//     // If the user is not authenticated, render nothing (or a message) and redirect to login
//     return null;
//   }

//   return (
//     <>
//       <NavSideEmp />
//       <div className="m-5 pl-5 md:pl-72 mt-20">
//         <h1 className="text-xl md:text-2xl font-bold mb-4 text-left text-orange-500">Received Task List</h1>

//         <div className="flex justify-center items-center mb-4">
//           <input
//             type="text"
//             value={searchTerm}
//             onChange={handleSearch}
//             placeholder="Search ..."
//             className="px-3 py-1 border border-gray-400 rounded-full w-full md:w-1/3"
//           />
//         </div>
//         <div className="relative mb-7 md:mb-10">
//           <button
//             className="bg-green-700 text-white font-extrabold py-1 md:py-1.5 px-2 md:px-3 rounded-lg md:absolute -mt-2 md:-mt-12 top-0 right-0 text-sm md:text-sm flex items-center mr-1" // Positioning
//             onClick={() => exportToExcel(filteredTasks)}                    >
//             <FontAwesomeIcon icon={faFileExcel} className="text-lg mr-1 font-bold" />
//             <span className="font-bold">Export</span>
//           </button>
//         </div>

//         {loading ? (
//           <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-gray-700">
//             <FontAwesomeIcon
//               icon={faSpinner} // Use your FontAwesome spinner icon
//               spin // Add the "spin" prop to make the icon spin
//               className="text-white text-4xl" // You can customize the size and color
//             />
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className='bg-orange-600 text-white'>
//                 <tr>
//                   <th className="px-4 py-2 ">Sr.No.</th>
//                   <th className="px-4 py-2 ">Title</th>
//                   <th className="px-4 py-2 ">Status</th>
//                   <th className="px-4 py-2 ">Date</th>
//                   <th className="px-4 py-2 ">DeadLine</th>
//                   <th className="px-4 py-2 ">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">

//                 {currentTasks.length > 0 ? (
//                   currentTasks.map((task, index) => {
//                     const { colorClass, statusText } = getStatusColorAndText(task);

//                     const isStatusOverdueOrCompleted = task.status === 'overdue' || task.status === 'completed';

//                     return (
//                       // <tr key={task._id} className={`hover:bg-gray-100 ${colorClass}`}>
//                       <tr key={task._id} className='text-sm'>
//                         <td className="border px-4 py-1.5 text-center">{calculateSerialNumber(index)}</td>

//                         <td className="border px-6 py-1.5 whitespace-nowrap">{task.title}</td>
//                         {/* <td className={`px-6 py-2 whitespace-nowrap font-bold`}>{statusText}</td> */}
//                         <td className="border px-4 py-1.5 text-center">
//                           <span className={`border px-4 py-1 text-left ${colorClass}`}>
//                             {statusText}
//                           </span>
//                         </td>
//                         <td className="border px-6 py-1.5 whitespace-nowrap text-center">{formatDateDisplay(task.startDate)}</td>
//                         <td className="border px-6 py-1.5 whitespace-nowrap text-center">{formatDateDisplay(task.deadlineDate)}</td>
//                         {/* <td className="border px-5 py-2 whitespace-nowrap">
//                           <FontAwesomeIcon
//                             icon={faEye}
//                             className="text-blue-500 cursor-pointer text-xl text-right pl-6"
//                             onClick={() => handleViewClick(task._id)}
//                           />
//                           {!((task.status === 'completed') || (new Date(task.deadlineDate) < new Date())) && (
//                             <button
//                               className={`bg-green-400 hover:bg-green-700 text-black font-bold py-2 px-4 rounded-xl mx-3 text-sm`}
//                               onClick={() => handleMarkAsCompleteClick(task._id)}
//                             >
//                               Mark as Complete
//                             </button>
//                           )}
//                         </td> */}
//                         <td className="border px-5 py-1.5 whitespace-nowrap">
//                           <FontAwesomeIcon
//                             icon={faEye}
//                             className="text-blue-500 cursor-pointer text-xl text-right pl-6"
//                             onClick={() => handleViewClick(task._id)}
//                           />
//                           {!((task.status === 'completed') || task.status === 'overdue') && (
//                             <button
//                               className={`bg-green-600 hover:bg-green-800 text-white font-bold py-1 px-4 rounded-xl mx-3 text-sm -mr-10`}
//                               onClick={() => handleMarkAsCompleteClick(task._id)}
//                             >
//                               Mark as Complete
//                             </button>
//                           )}
//                           {(task.status === 'completed' || task.status === 'overdue') && (
//                             <button className="bg-green-200 text-black font-bold py-1 px-4 rounded-xl mx-3 text-sm pointer-events-none" disabled>
//                               Mark as Complete
//                             </button>
//                           )}
//                         </td>


//                       </tr>
//                     );
//                   })
//                 ) : (
//                   <tr>
//                     <td colSpan="8" className='px-4 py-2 text-center border font-semibold'>
//                       No Received Tasks Found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {!loading && (
//           <ul className="flex justify-center items-center mt-4">
//             {Array.from({ length: Math.ceil(tasks.length / tasksPerPage) }, (_, index) => (
//               <li key={index} className="px-3 py-2">
//                 <button
//                   onClick={() => paginate(index + 1)}
//                   className={`${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
//                     } px-4 py-2 rounded`}
//                 >
//                   {index + 1}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         )}

//         {/* View Task Modal */}
//         {isViewModalOpen && (
//           <div
//             className="fixed inset-0 flex items-center justify-center z-50"
//             style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
//           >
//             <div
//               className="modal-container bg-white w-72 md:w-96 sm:p-6 rounded shadow-lg"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <button
//                 type="button"
//                 className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//                 onClick={() => setIsViewModalOpen(false)}
//               >
//                 {/* Close button icon */}
//               </button>
//               <div className="p-2 text-center text-sm md:text-base">
//                 <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">
//                   Task Details
//                 </h3>
//                 {viewTask && (
//                   <div>
//                     <p className="mb-1 text-left justify-center">
//                       <strong>Title:</strong> {viewTask.title}
//                     </p>
//                     <p className="mb-1 text-left justify-center">
//                       <strong>Description:</strong> {viewTask.description}
//                     </p>
//                     {/* <p className="mb-2 text-left justify-center">
//                       <strong>Status:</strong> {viewTask.status}
//                     </p> */}
//                     <p className="mb-1 text-left justify-center">
//                       <strong>Start Date:</strong> {viewTask.startDate}
//                     </p>
//                     <p className="mb-1 text-left justify-center">
//                       <strong>Start Time:</strong> {viewTask.startTime}
//                     </p>
//                     <p className="mb-1 text-left justify-center">
//                       <strong>Deadline Date:</strong> {viewTask.deadlineDate}
//                     </p>
//                     <p className="mb-1 text-left justify-center">
//                       <strong>End Time:</strong> {viewTask.endTime}
//                     </p>
//                     {/* <p className="mb-2 text-left justify-center">
//                       <strong>Assigned By:</strong> {viewTask.assignedBy?.name}
//                     </p> */}
//                     <p className="mb-1 text-left justify-center">
//                       <strong>Assigned By:</strong>{' '}
//                       {viewTask.assignedBy ? viewTask.assignedBy.name : 'Self'}
//                     </p>
//                     <p className="mb-1 text-left justify-center">
//                       <strong>Picture:</strong>{" "}
//                       {viewTask.picture ? (
//                         <button
//                           type="button"
//                           className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-1 ml-2"
//                           onClick={() => handlePicturePreview(viewTask.picture)}
//                         >
//                           Preview
//                         </button>
//                       ) : (
//                         "Not Added"
//                       )}
//                     </p>

//                     <p className="mb-2 text-left flex  item-center">
//                       {/* <strong>Audio:</strong>{" "}
//                       {viewTask.audio ? ( */}
//                       <span className='mr-1'> <strong>Audio:</strong></span>{" "}
//                       {viewTask.audio ? (
//                         <audio controls className='w=64 h-8 md:w-96 md:h-10 text-lg'>
//                           <source src={`http://103.159.85.246:4000/${viewTask.audio}`} type="audio/mp3" />
//                           Your browser does not support the audio element.
//                         </audio>

//                       ) : (
//                         "Not Added"
//                       )}
//                     </p>
//                   </div>
//                 )}

//                 <button
//                   type="button"
//                   className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
//                   onClick={() => setIsViewModalOpen(false)}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {isPreviewModalOpen && (
//           <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
//             <div className="modal-container bg-white w-72 md:w-96 p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
//               <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setIsPreviewModalOpen(false)}></button>
//               <div className="p-8 text-center">
//                 <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">Image Preview</h3>
//                 <Image
//                   src={completeImageUrl}
//                   alt="Preview"
//                   width={400} // Adjust the width as needed
//                   height={300} // Adjust the height as needed
//                 />
//                 <button
//                   type="button"
//                   className="bg-red-500 hover:bg-red-700 text-black font-bold py-2 px-4 rounded mt-4 mr-2 text-sm md:text-base"
//                   onClick={() => setIsPreviewModalOpen(false)}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default ReceivedTaskList;













'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faEye, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import { format, parse, isBefore } from 'date-fns';
import NavSideEmp from '../components/NavSideEmp';
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



const formatDateString = (dateString) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const date = new Date(dateString).toLocaleDateString(undefined, options);
  return date;
};

const formatDateDisplay = (dateString) => {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-GB', options);
};



function parseEndTime(endTime) {
  const currentDate = new Date();
  const timeString = format(currentDate, 'yyyy-MM-dd') + ' ' + endTime;
  return parse(timeString, 'yyyy-MM-dd h:mm a', new Date());
}

const ReceivedTaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [viewTask, setViewTask] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Add a loading state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [completeImageUrl, setPreviewImageUrl] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(15); // Define tasks to show per page
  const [searchTerm, setSearchTerm] = useState(''); // State to hold the search term
  const [authenticated, setAuthenticated] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState(null); // State to track the selected task for image upload
  const [selectedImage, setSelectedImage] = useState(null); // State to hold the selected image

  const handleSearch = (event) => {
    setSearchTerm(event.target.value); // Set the search term as the user types
    setCurrentPage(1); // Reset to the first page when searching
  };

  const calculateSerialNumber = (index) => {
    return index + (currentPage - 1) * tasksPerPage + 1;
  };

  const handlePicturePreview = (imageUrl) => {
    const completeImageUrl = `http://103.159.85.246:4000/${imageUrl}`; // Generate the complete image URL
    setPreviewImageUrl(completeImageUrl);
    setIsPreviewModalOpen(true);
  };

  const handleMarkAsCompleteClick = async (taskId) => {
    try {
      setSelectedTaskId(taskId); // Set the selected task ID before marking as complete
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      // if (selectedImage) {
      //   formData.append('image', selectedImage);
      // }

      const response = await axios.put(
        `http://103.159.85.246:4000/api/task/complete/${taskId}`,
        formData,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
        console.log('Marked as Completed');
      } else {
        console.error('Failed to mark task as complete');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const router = useRouter();
  
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
    const loadFormattedTasks = async () => {
      if (typeof window === 'undefined') {
        return;
      }

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


      try {
        const response = await axios.get(
          'http://103.159.85.246:4000/api/task/listTaskEmp',
          {
            headers: {
              Authorization: token,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.status === 200) {
          const formattedTasks = response.data.tasks.map((task) => ({
            ...task,
            deadlineDate: formatDateString(task.deadlineDate),
            startDate: formatDateString(task.startDate),
          }));
          setTasks(formattedTasks);
        } else {
          console.error('Failed to fetch tasks');
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false); // Set loading to false when tasks are fetched
      }
    };

    loadFormattedTasks();
  }, []);

  // Function to set row color and status based on task status and deadline date
  const getStatusColorAndText = (task) => {
    const currentDate = new Date();
    const currentTime = currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const formattedCurrentTime = currentTime.split(':').map((part, index) => index === 0 ? part.padStart(2, '0') : part).join(':');
    console.log(formattedCurrentTime);
    const formattedDeadlineDate = format(new Date(task.deadlineDate), 'dd/MM/yyyy');
    task.deadlineDate = parse(formattedDeadlineDate, 'dd/MM/yyyy', new Date());

    if (task.status === 'completed') {
      return {
        colorClass: ' bg-green-200 rounded-full font-semibold text-center text-green-900',
        statusText: 'Completed',
      };
    } else if (task.status === 'overdue') {
      return { colorClass: 'bg-red-300 rounded-full font-semibold text-center text-red-800', statusText: 'Overdue' };
    } else {
      return { colorClass: 'bg-blue-300 rounded-full font-semibold text-center text-blue-700', statusText: 'Pending' };
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

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  // Function to handle page change
  const paginate = pageNumber => setCurrentPage(pageNumber);
  const exportToExcel = async () => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';


    // Fetch employee names


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
    const fileName = 'receivedTask_list' + fileExtension;
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
        <h1 className="text-xl md:text-2xl font-bold mb-4 text-left text-orange-500">Received Task List</h1>

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
              <thead className='bg-orange-600 text-white'>
                <tr>
                  <th className="px-4 py-2 ">Sr.No.</th>
                  <th className="px-4 py-2 ">Title</th>
                  <th className="px-4 py-2 ">Status</th>
                  <th className="px-4 py-2 ">Date</th>
                  <th className="px-4 py-2 ">DeadLine</th>
                  <th className="px-4 py-2 ">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentTasks.length > 0 ? (
                  currentTasks.map((task, index) => {
                    const { colorClass, statusText } = getStatusColorAndText(task);
                    const isStatusOverdueOrCompleted = task.status === 'overdue' || task.status === 'completed';

                    return (
                      <tr key={task._id}>
                        <td className="border px-4 py-2 text-center">{calculateSerialNumber(index)}</td>
                        <td className="border px-6 py-2 whitespace-nowrap">{task.title}</td>
                        <td className="border px-4 py-2 text-center">
                          <span className={`border px-4 py-1 text-left ${colorClass}`}>
                            {statusText}
                          </span>
                        </td>
                        <td className="border px-6 py-2 whitespace-nowrap text-center">{formatDateDisplay(task.startDate)}</td>
                        <td className="border px-6 py-2 whitespace-nowrap text-center">{formatDateDisplay(task.deadlineDate)}</td>
                        <td className="border px-5 py-2 whitespace-nowrap">
                          <FontAwesomeIcon
                            icon={faEye}
                            className="text-blue-500 cursor-pointer text-xl text-right pl-6"
                            onClick={() => handleViewClick(task._id)}
                          />
                         {!isStatusOverdueOrCompleted && (
                            <>
                              <button
                                className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded-xl mx-3 text-sm -mr-10"
                                onClick={() => handleMarkAsCompleteClick(task._id)}
                              >
                                Mark as Complete
                              </button>
                              {selectedTaskId === task._id && (
                                <>
                                  <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl mx-3 text-sm -mr-10"
                                    onClick={() => document.getElementById(`upload-${task._id}`).click()}
                                  >
                                    Add Image
                                  </button>
                                  <input
                                    id={`upload-${task._id}`}
                                    type="file"
                                    style={{ display: 'none' }}
                                    onChange={(e) => setSelectedImage(e.target.files[0])}
                                  />
                                </>
                              )}
                            </>
                          )}
                          {isStatusOverdueOrCompleted && (
                            <button className="bg-green-200 text-black font-bold py-2 px-4 rounded-xl mx-3 text-sm pointer-events-none" disabled>
                              Mark as Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className='px-4 py-2 text-center border font-semibold'>
                      No Received Tasks Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (
          <ul className="flex justify-center items-center mt-4">
            {Array.from({ length: Math.ceil(tasks.length / tasksPerPage) }, (_, index) => (
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
        )}

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
              <div className="p-2 text-center text-sm md:text-base">
                <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">
                  Task Details
                </h3>
                {viewTask && (
                  <div>
                    <p className="mb-1 text-left justify-center">
                      <strong>Title:</strong> {viewTask.title}
                    </p>
                    <p className="mb-1 text-left justify-center">
                      <strong>Description:</strong> {viewTask.description}
                    </p>
                    {/* <p className="mb-2 text-left justify-center">
                      <strong>Status:</strong> {viewTask.status}
                    </p> */}
                    <p className="mb-1 text-left justify-center">
                      <strong>Start Date:</strong> {viewTask.startDate}
                    </p>
                    <p className="mb-1 text-left justify-center">
                      <strong>Start Time:</strong> {viewTask.startTime}
                    </p>
                    <p className="mb-1 text-left justify-center">
                      <strong>Deadline Date:</strong> {viewTask.deadlineDate}
                    </p>
                    <p className="mb-1 text-left justify-center">
                      <strong>End Time:</strong> {viewTask.endTime}
                    </p>
                    {/* <p className="mb-2 text-left justify-center">
                      <strong>Assigned By:</strong> {viewTask.assignedBy?.name}
                    </p> */}
                    <p className="mb-1 text-left justify-center">
                      <strong>Assigned By:</strong>{' '}
                      {viewTask.assignedBy ? viewTask.assignedBy.name : 'Self'}
                    </p>
                    <p className="mb-1 text-left justify-center">
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

                    <p className="mb-2 text-left flex  item-center">
                      {/* <strong>Audio:</strong>{" "}
                      {viewTask.audio ? ( */}
                      <span className='mr-1'> <strong>Audio:</strong></span>{" "}
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
            <div className="modal-container bg-white w-72 md:w-96 p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setIsPreviewModalOpen(false)}></button>
              <div className="p-8 text-center">
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
      </div>
    </>
  );
};

export default ReceivedTaskList;