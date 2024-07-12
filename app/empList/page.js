'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faEye, faFileExcel, faPlus } from '@fortawesome/free-solid-svg-icons';
import NavSideSuper from '../components/NavSideSuper';
import * as XLSX from 'xlsx';
import jwtDecode from 'jwt-decode';


const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [employeeToEdit, setEmployeeToEdit] = useState(null);
    const [editedEmployee, setEditedEmployee] = useState({});
    const [viewEmployeeData, setViewEmployeeData] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false); // State to control the view modal
    const [currentPage, setCurrentPage] = useState(1);
    const [companies, setCompanies] = useState([]); // State to store the list of companies
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [authenticated, setAuthenticated] = useState(true);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const calculateSerialNumber = (index) => {
        return index + (currentPage - 1) * itemsPerPage + 1;
    };


    const itemsPerPage = 15; // Number of items to show per page

    const router = useRouter();

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const filteredEmployees = employees.filter((employee) => {
        return (
            employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.phoneNumber.includes(searchQuery) ||
            employee.adminCompanyName.toLowerCase().includes(searchQuery.toLowerCase()) // Include company name in search

        );
    });



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
        if (userRole !== 'superAdmin') {
            // If the user is not a superadmin, redirect to the login page
            router.push('/forbidden');
            return;
        }
        const fetchCompanies = async () => {
            try {
                const response = await fetch('http://103.159.85.246:4000/api/company/companies');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                console.log(data)
                setCompanies(data);
            } catch (error) {
                console.error('Error fetching companies:', error);
            }
        };

        fetchCompanies();

    }, []);


    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Calculate the indexes for pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEmployees = employees.slice(indexOfFirstItem, indexOfLastItem);
    const displayEmployees = searchQuery ? filteredEmployees : currentEmployees;


    useEffect(() => {
        fetch(`http://103.159.85.246:4000/api/employee/list?page=${currentPage}&limit=${itemsPerPage}`)
            .then((response) => response.json())
            .then((data) => {
                setEmployees(data);
            })
            .catch((error) => {
                console.error('Error fetching employees:', error);
            });
    }, [currentPage]); // Trigger this effect whenever the currentPage changes

    const handleEditClick = (employeeId) => {
        // Open the edit modal when the "Edit" button is clicked
        setIsEditModalOpen(true);
        const selectedEmployee = employees.find((employee) => employee._id === employeeId);

        // Set the selected employee for editing
        setEditedEmployee(selectedEmployee);

    };


    const editEmployee = async () => {
        try {
            // Validate phone number
        if (editedEmployee.phoneNumber.length !== 10) {
            setError('Phone number must be exactly 10 digits.');
            return;
        }
            const token = localStorage.getItem('authToken');
            if (!token) {
                setAuthenticated(false);
                router.push('/login');
                return;
            }
            // Update the editedEmployee object with the new values
            const updatedEmployee = {
                ...editedEmployee,
                phoneNumber: editedEmployee.phoneNumber,
                email: editedEmployee.email
            };

            // Send a PUT request to update the employee's details
            await axios.put(`http://103.159.85.246:4000/api/employee/edit/${editedEmployee._id}`, updatedEmployee);

            // Update the employee list with the edited data (optional)
            setEmployees(currentEmployees.map((employee) =>
                employee._id === editedEmployee._id ? updatedEmployee : employee
            ));

            // Close the edit modal
            closeModal();

            setIsSuccessModalOpen(true);
            setSuccessMessage('Admin Updated successfully');
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
            const response = await axios.get(`http://103.159.85.246:4000/api/employee/${employeeId}`);
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
            const token = localStorage.getItem('authToken');
            if (!token) {
                setAuthenticated(false);
                router.push('/login');
                return;
            }
            // Send a DELETE request to delete the employee by ID
            await axios.delete(`http://103.159.85.246:4000/api/employee/delete/${employeeId}`);

            // Update the employee list after successful deletion (optional)
            setEmployees(employees.filter((employee) => employee._id !== employeeId));

            // Close the delete modal
            closeModal();
            setIsSuccessModalOpen(true);
            setSuccessMessage('Admin deleted successfully!');

        } catch (error) {
            console.error('Error deleting employee:', error);
        }
    };

    const closeModal = () => {
        // Close both edit and delete modals when the close button or backdrop is clicked
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setEmployeeToEdit(null);
        setEmployeeToDelete(null);
    };

    const handleAddClick = () => {
        // Redirect to the "Add Employee" page
        router.push('/employee');
    };


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

    const exportToExcel = () => {
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';


        // Filter and map the data to include only the header fields
        const filteredEmployees = displayEmployees.map(employee => {
            return {
                'Name': employee.name,
                'Email': employee.email,
                'Phone Number': employee.phoneNumber,
                'Company Name': employee.adminCompanyName,
            };
        });

        const ws = XLSX.utils.json_to_sheet([...Object.values(filteredEmployees)]);
        const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: fileType });
        const fileName = 'admin_list' + fileExtension;
        saveAs(data, fileName);
    };

    if (!authenticated) {
        // Render nothing if not authenticated (or redirect to login)
        return null;
    }

    return (
        <>
            <NavSideSuper />
            <div className="m-5 pl-1 md:pl-64 mt-20">
                {error && <p className="text-red-500">{error}</p>}

                {/* Display success message */}
                {/* {successMessage && <p className="text-green-500">{successMessage}</p>} */}

                <h1 className="text-xl md:text-2xl font-bold mb-4 text-orange-500 text-center md:text-left">Admin List</h1>

                {/* Search Bar */}
                <div className="mb-2 flex justify-center md:pl-2 md:-mt-10">
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full md:w-1/3 border border-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 rounded-lg px-2 py-1 text-left mt-2"
                    />
                </div>

                {/* Add New Admin */}
                <div className="relative mb-7 md:mb-14 md:-mt-12">
                    <button
                        className="bg-green-500 text-white font-bold py-1 px-5 rounded-lg absolute top-3 right-1 text-sm md:text-base"
                        onClick={handleAddClick}
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-lg mr-1 font-bold" />
                        <span className="font-bold">Add New</span>
                    </button>
                </div>


                <div className="relative mb-7 md:mb-16">
                    <button
                        className="bg-green-700 text-white font-extrabold py-1 md:py-1 px-2 md:px-3 rounded-lg md:absolute -mt-2 md:-mt-10 top-1 right-36 text-sm md:text-base flex items-center mr-1" // Positioning
                        onClick={exportToExcel}
                    >
                        <FontAwesomeIcon icon={faFileExcel} className="text-lg mr-1 font-bold" />
                        <span className="font-bold">Export</span>
                    </button>
                </div>


                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto mt-1 md:mt-1 ">
                        <thead className='bg-orange-500 text-white text-sm md:text-base'>
                            <tr>
                                <th className="px-4 py-2 text-center">Sr No</th>
                                <th className="px-4 py-2 text-center">Name</th>
                                {/* <th className="px-4 py-2 text-center">Email</th> */}
                                <th className="px-4 py-1 text-center">PhoneNumber</th>
                                <th className="px-4 py-1 text-center">CompanyName</th>
                                <th className="px-4 py-2 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {displayEmployees.map((employee, index) => (
                                <tr key={employee._id}>
                                    <td className="border px-4 py-2 text-center">{calculateSerialNumber(index)}</td>
                                    <td className="border px-4 py-2 text-center font-semibold">{employee.name}</td>
                                    {/* <td className="border px-4 py-2">{employee.email}</td> */}
                                    <td className="border px-4 py-2 text-center">{employee.phoneNumber}</td>
                                    <td className="border px-4 py-2 text-center font-semibold">{employee.adminCompanyName}</td>
                                    <td className="border px-4 py-2">
                                        <FontAwesomeIcon
                                            icon={faEye}
                                            className="text-blue-500 hover:underline cursor-pointer pl-5"
                                            onClick={() => handleViewClick(employee._id)}
                                        />
                                        <FontAwesomeIcon
                                            icon={faPenToSquare}
                                            className="text-blue-500 hover:underline cursor-pointer pl-4"
                                            onClick={() => handleEditClick(employee._id)}
                                        />
                                        <FontAwesomeIcon
                                            icon={faTrash}
                                            className="text-blue-500 hover:underline cursor-pointer pl-5 -mr-14 "
                                            onClick={() => handleDeleteClick(employee._id)}
                                        />

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {employees.length > itemsPerPage && (
                        <div className="flex justify-center mt-3">
                            {Array.from({ length: Math.ceil(employees.length / itemsPerPage) }, (_, i) => (
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
                    {/* Edit Employee Modal */}
                    {isEditModalOpen && (
                        <div
                            className="fixed inset-0 flex items-center justify-center z-50"
                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                        >
                            <div
                                className="modal-container bg-white sm:w-96 sm:p-6 rounded shadow-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    type="button"
                                    className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                    onClick={closeModal}
                                >
                                    {/* Close button icon */}
                                </button>
                                <div className="p-14 text-center">
                                    <h3 className="mb-3 text-xl md:text-2xl font-semibold text-gray-500 dark:text-gray-400">Update Admin</h3>
                                    {/* Modal content */}
                                    <div className="mb-4">
                                        <label className="block text-gray-800 dark:text-gray-200 text-sm font-bold mb-0">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 rounded-md text-center text-sm md:text-base py-1"
                                            value={editedEmployee.name || ''}
                                            onChange={(e) => setEditedEmployee({ ...editedEmployee, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-800 dark:text-gray-200 text-sm font-bold mb-0">
                                            Email
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 rounded-md text-center text-sm md:text-base py-1"
                                            value={editedEmployee.email || ''}
                                            onChange={(e) => setEditedEmployee({ ...editedEmployee, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-800 dark:text-gray-200 text-sm font-bold mb-0">
                                            Phone Number
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 rounded-md text-center text-sm md:text-base py-1"
                                            value={editedEmployee.phoneNumber || ''}
                                            onChange={(e) => setEditedEmployee({ ...editedEmployee, phoneNumber: e.target.value })}
                                            minLength={10}
                                            maxLength={10}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-800 dark:text-gray-200 text-sm font-bold mb-0">
                                            Company Name
                                        </label>
                                        <select
                                            className="w-full border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 rounded-md text-center cursor-pointer text-sm md:text-base py-1"
                                            value={editedEmployee.adminCompanyName || ''}
                                            onChange={(e) => setEditedEmployee({ ...editedEmployee, adminCompanyName: e.target.value })}
                                        >
                                            <option value="">Select a Company</option>
                                            {companies.map((company) => (
                                                <option key={company._id} value={company.companyName}>
                                                    {company.companyName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className='-mb-10'>
                                        <button
                                            type="button"
                                            className="text-xs md:text-base px-5 py-2 text-white bg-green-500 hover:bg-green-600 rounded-md mr-4 transition duration-300 ease-in-out"
                                            onClick={editEmployee}
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            className="text-xs md:text-base px-3 py-2 text-white bg-green-700 hover:bg-green-600 rounded-md mr-2 transition duration-300 ease-in-out"
                                            onClick={closeModal}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete Employee Modal */}
                    {isDeleteModalOpen && (
                        <div
                            className="fixed inset-0 flex items-center justify-center z-50"
                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} // Semi-transparent background
                        >
                            <div
                                className="modal-container bg-white sm:w-96 sm:p-6 rounded shadow-lg"
                                onClick={closeModal} // Close the modal when the backdrop is clicked
                            >
                                <button
                                    type="button"
                                    className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                    onClick={closeModal} // Close the modal when the close button is clicked
                                >
                                    {/* Close button icon */}
                                </button>
                                <div className="p-4 text-center">
                                    <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    <h3 className="mb-5 text-lg font-normal text-gray-800 dark:text-gray-400">Delete This Admin?</h3>

                                    <button
                                        type="button"
                                        className="text-white text-xs md:text-sm bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg inline-flex items-center px-5 py-2.5 text-center mr-2"
                                        onClick={() => confirmDelete(employeeToDelete)} // Pass the selected employee's ID
                                    >
                                        Delete
                                    </button>
                                    <button
                                        type="button"
                                        className="text-gray-500 text-xs md:text-sm bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                                        onClick={closeModal} // Close the modal when "No, cancel" is clicked
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
                            <div className="modal-container bg-white sm:w-96 sm:p-6 rounded shadow-lg">
                                <button
                                    type="button"
                                    className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                    onClick={() => setIsViewModalOpen(false)} // Close the modal when the close button is clicked
                                >
                                </button>
                                <div className="p-6 text-center">
                                    <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">Admin Details</h3>
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
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        className="px-6 py-2 text-white bg-indigo-500 hover:bg-indigo-800 rounded-md mt-4 text-xs md:text-base"
                                        onClick={() => setIsViewModalOpen(false)} // Close the modal when "Close" is clicked
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isSuccessModalOpen && (
                        <div
                            className="fixed inset-0 flex items-center justify-center z-50"
                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                            onClick={() => setIsSuccessModalOpen(false)}
                        >
                            <div
                                className="modal-container bg-white sm:w-96 sm:p-6 rounded shadow-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-5 text-center">
                                    <FontAwesomeIcon icon={faCircleCheck} className="text-5xl mr-1 font-bold text-green-800" />

                                    <h3 className="mb-2 mt-5 text-sm md:text-base font-normal text-gray-800 dark:text-gray-400">{successMessage}</h3>
                                    <button
                                        type="button"
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md mt-4 mr-2 text text-xs md:text-base"
                                        onClick={() => setIsSuccessModalOpen(false)}
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default EmployeeList;