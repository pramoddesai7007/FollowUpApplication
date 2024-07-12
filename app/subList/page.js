'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faPlus, faTrash, faEye, faFileExcel } from '@fortawesome/free-solid-svg-icons';
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


const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [editedEmployee, setEditedEmployee] = useState(null);
  const [viewEmployeeData, setViewEmployeeData] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [authenticated, setAuthenticated] = useState(true);

  const calculateSerialNumber = (index) => {
    return index + (currentPage - 1) * employeesPerPage + 1;
  };
  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(15); // Change the number as per your preference

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };


  const clearSuccessMessage = () => {
    setTimeout(() => {
      setSuccessMessage('');
    }, 2000); // 2000 milliseconds (2 seconds)
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
        if (userRole !== 'admin') {
            // If the user is not a superadmin, redirect to the login page
            router.push('/forbidden');
            return;
        }

      // Fetch the list of employees from your API endpoint
      const fetchEmployees = async () => {
        try {
          const response = await axios.get(`http://103.159.85.246:4000/api/employee/subemployees/list`,
            {
              headers: {
                Authorization: localStorage.getItem('authToken'),
                // Other headers if needed
              }
            });
          setEmployees(response.data);
        } catch (error) {
          console.error('Error fetching employees:', error);
        }
      };

      fetchEmployees();
  }, []);


  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };


  const filteredEmployees = employees.filter((employee) => {
    return (
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.adminCompanyName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);

  const handleEditClick = (employeeId) => {
    // Open the edit modal when the "Edit" button is clicked
    setIsEditModalOpen(true);
    const selectedEmployee = employees.find((employee) => employee._id === employeeId);

    // Set the selected employee for editing
    setEditedEmployee(selectedEmployee);
  };

  const editEmployee = async () => {
        // Validate phone number
        if (editedEmployee.phoneNumber.length !== 10) {
          setError('Phone number must be exactly 10 digits.');
          return;
      }
    try {
      // Update the editedEmployee object with the new values
      const updatedEmployee = {
        ...editedEmployee,
        phoneNumber: editedEmployee.phoneNumber,
        email: editedEmployee.email,
      };

      // Send a PUT request to update the employee's details
      await axios.put(`http://103.159.85.246:4000/api/subemployee/update/${editedEmployee._id}`, updatedEmployee,
        {
          headers: {
            Authorization: localStorage.getItem('authToken'),
            // Other headers if needed
          }
        });

      // Update the employee list with the edited data (optional)
      setEmployees(employees.map((employee) =>
        employee._id === editedEmployee._id ? updatedEmployee : employee
      ));

      // Close the edit modal
      closeModal();

      setSuccessMessage('Employee details updated successfully');
      clearSuccessMessage();

      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error editing employee:', error);

      setError('Failed to update employee details');
      setSuccessMessage(''); // Clear any previous success messages
    }
  };

  const handleDeleteClick = (employeeId) => {
    // Open the delete modal when the "Delete" button is clicked
    setIsDeleteModalOpen(true);
    // Set the selected employee for deletion
    setEmployeeToDelete(employeeId);
  };

  const handleViewClick = async (employeeId) => {
    try {
      // Send a GET request to fetch the employee by ID
      const response = await axios.get(`http://103.159.85.246:4000/api/subemployee/${employeeId}`,
        {
          headers: {
            Authorization: localStorage.getItem('authToken'),
            // Other headers if needed
          }
        });
      const employeeData = response.data;

      // Set the employee data to the state
      setViewEmployeeData(employeeData);

      // Open the view modal
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };

  const confirmDelete = async (employeeId) => {
    try {
      // Send a DELETE request to delete the employee by ID
      await axios.delete(`http://103.159.85.246:4000/api/subemployee/delete/${employeeId}`,
        {
          headers: {
            Authorization: localStorage.getItem('authToken'),
            // Other headers if needed
          }
        });

      // Update the employee list after successful deletion (optional)
      setEmployees(employees.filter((employee) => employee._id !== employeeId));

      // Close the delete modal
      closeModal();
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const closeModal = () => {
    // Close both edit and delete modals when the close button or backdrop is clicked
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    // Reset the selected employee IDs
    setEmployeeToDelete(null);
  };

  const handleAddClick = () => {
    // Redirect to the "Add Employee" page
    router.push('/subemp');
  };
  const exportToExcel = async () => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';


    // Filter and map the data including the header fields and employee names
    const tasksToExport = filteredEmployees.map(employee => {
      console.log(filteredEmployees)
      return {
        'EmployeeName': employee.name,
        'Email': employee.email,
        'PhoneNumber': employee.phoneNumber,


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
    const fileName = 'AdminLeads List_list' + fileExtension;
    saveAs(data, fileName);
  };

  return (
    <>

      <NavSide />
      <div className="m-5 pl-1 md:pl-64 mt-20">
        {/* Display error message */}

        {error && <p className="text-red-500">{error}</p>}

        {/* Display success message */}
        {successMessage && (
          <div className="text-green-500">
            {successMessage}
          </div>
        )}
        {/* <h2 className="text-2xl font-semibold mb-4 text-orange-500">Employee List</h2> */}
        <h1 className="text-xl font-bold mb-4 text-orange-500 text-center md:text-left md:text-2xl">Employee List</h1>

        <div className="flex justify-center items-center mb-4">
          <input
            type="text"
            placeholder="Search Employees"
            className="px-3 py-1 border border-gray-400 rounded-full w-full md:w-1/3"  
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
        </div>


        <div className="relative mb-16 md:mb-16 md:-mt-10">
          <button
            className="bg-green-500 text-white font-bold py-1 px-5 md:px-4 rounded-lg absolute top-2 right-3 md:right-0 md:-mt-4"
            onClick={handleAddClick}
          >
            <FontAwesomeIcon icon={faPlus} className="text-lg mr-1 font-bold" />
            <span className="font-bold">Add New</span>
          </button>
        </div>

        
        <div className="relative mb-7 md:mb-14">
          <button
            className="bg-green-700 text-white font-extrabold py-1 md:py-1.5 px-2 md:px-3 rounded-lg md:absolute -mt-2 md:-mt-16 top-2 right-32 text-sm md:text-sm flex items-center mr-1" // Positioning
            onClick={() => exportToExcel(filteredEmployees)}                    >
            <FontAwesomeIcon icon={faFileExcel} className="text-lg mr-1 font-bold" />
            <span className="font-bold">Export</span>
          </button>
        </div>


        <div className="overflow-x-auto">
          <table className="min-w-full table-auto mt-1">
            <thead className='bg-orange-400 text-white'>
              <tr>
                <th className="px-1 py-2 text-center text-gray-700">Sr.No.</th>
                <th className="px-4 py-2 text-center text-gray-700">Name</th>
                <th className="px-4 py-2 text-center text-gray-700">Role</th>
                <th className="px-4 py-2 text-center text-gray-700">Type</th>
                <th className="px-4 py-2 text-center text-gray-700">Email</th>
                <th className="px-4 py-2 text-center text-gray-700">PhoneNumber</th>
                <th className="px-4 py-2 text-center text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? (
                currentEmployees.map((employee, index) => (
                  <tr key={employee._id}>
                    <td className="border px-4 py-1 text-center text-sm">{calculateSerialNumber(index)}</td>
                    <td className="border px-4 py-1 text-center text-sm">{employee.name}</td>
                    <td className="border px-4 py-1 text-center text-sm">{employee.role}</td>
                    <td className="border px-4 py-1 text-center text-sm">{employee.type}</td>
                    <td className="border px-4 py-1 text-center text-sm">{employee.email}</td>
                    <td className="border px-4 py-1 text-center text-sm">{employee.phoneNumber}</td>
                    <td className="border px-4 py-1">
                      <FontAwesomeIcon
                        icon={faEye}
                        className="text-blue-500 hover:underline cursor-pointer mr-3 pl-4 text-lg"
                        onClick={() => handleViewClick(employee._id)}
                      />
                      <FontAwesomeIcon
                        icon={faPenToSquare}
                        className="text-orange-500 hover:underline cursor-pointer mr-3 text-lg"
                        onClick={() => handleEditClick(employee._id)}
                      />
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="text-red-500 hover:underline cursor-pointer -mr-16 text-lg"
                        onClick={() => handleDeleteClick(employee._id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className='px-4 py-2 text-center border font-semibold'>
                    No Employee Added Yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {filteredEmployees.length > employeesPerPage && (
            <div className="flex justify-center mt-3">
              {Array.from({ length: Math.ceil(filteredEmployees.length / employeesPerPage) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`mx-1 px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-red-700 text-white' : 'bg-red-200 text-black'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>


        {/* Edit Employee Modal */}
        {isEditModalOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          >
            <div
              className="modal-container bg-white w-72 md:w-96 p-6 rounded shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={closeModal}
              >
                {/* Close button icon */}
              </button>
              <div className="p-2 text-center">
                <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">Edit Employee</h3>
                {/* Modal content */}
                <div className="mb-4">
                  <label className="block text-left text-gray-800 dark:text-gray-200 text-sm md:text-base font-medium mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 rounded-md p-2 text-sm md:text-base text-left"
                    value={editedEmployee.name || ''}
                    onChange={(e) => setEditedEmployee({ ...editedEmployee, name: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-left text-gray-800 dark:text-gray-200 text-sm md:text-base font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 rounded-md p-2 text-sm md:text-base text-left"
                    value={editedEmployee.email || ''}
                    onChange={(e) => setEditedEmployee({ ...editedEmployee, email: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-left text-gray-800 dark:text-gray-200 text-sm md:text-base font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 rounded-md p-2 text-sm md:text-base text-left"
                    value={editedEmployee.phoneNumber || ''}
                    onChange={(e) => setEditedEmployee({ ...editedEmployee, phoneNumber: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-left text-gray-800 dark:text-gray-200 text-sm md:text-base font-medium mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 rounded-md p-2 text-sm md:text-base text-left"
                    value={editedEmployee.adminCompanyName || ''}
                    onChange={(e) => setEditedEmployee({ ...editedEmployee, adminCompanyName: e.target.value })}
                    readOnly
                  />
                </div>

                <button
                  type="button"
                  className="px-6 py-2 text-white bg-green-500 hover:bg-green-600 rounded-md mr-4 transition duration-300 ease-in-out text-sm md:text-base"
                  onClick={editEmployee}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-white bg-green-700 hover:bg-green-600 rounded-md mr-4 transition duration-300 ease-in-out text-sm md:text-base"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Employee Modal */}
        {isDeleteModalOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          >
            <div
              className="modal-container bg-white w-72 md:w-96 p-6 rounded shadow-lg"
              onClick={closeModal}
            >
              <button
                type="button"
                className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={closeModal}
              >
                {/* Close button icon */}
              </button>
              <div className="p-6 text-center">
                <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <h3 className="mb-5 font-normal text-gray-800 dark:text-gray-400 text-sm md:text-base"> Delete this Employee?</h3>
                {/* Modal content */}
                <button
                  type="button"
                  className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-4 py-2 text-center mr-2"
                  onClick={() => confirmDelete(employeeToDelete)}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-4 py-2 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 mr-2"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {isViewModalOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          >
            <div className="modal-container bg-white w-72 md:w-96 rounded shadow-lg">
              <button
                type="button"
                className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={() => setIsViewModalOpen(false)}
              >
                {/* Close button icon */}
              </button>
              <div className="p-6 text-center">
                <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">Employee Details</h3>
                {viewEmployeeData && (
                  <div>
                    <p className="mb-2 text-left justify-center">
                      <strong>Name:</strong> {viewEmployeeData.name}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong>Phone Number:</strong> {viewEmployeeData.phoneNumber}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong>Email:</strong> {viewEmployeeData.email}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong>Company Name:</strong> {viewEmployeeData.adminCompanyName}
                    </p>
                    {/* Add more details here */}
                  </div>
                )}
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-800 font-bold rounded-md mt-4 text-xs md:text-base"
                  onClick={() => setIsViewModalOpen(false)}
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

export default EmployeeList;