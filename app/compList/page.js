'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faPenToSquare, faPlus } from '@fortawesome/free-solid-svg-icons';
import { faTrash, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import NavSideSuper from '../components/NavSideSuper';
import * as XLSX from 'xlsx';
import jwtDecode from 'jwt-decode';



const CompanyList = () => {
    const [companies, setCompanies] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [companyToDelete, setCompanyToDelete] = useState(null);
    const [editedCompany, setEditedCompany] = useState(null);
    const [searchQuery, setSearchQuery] = useState(''); // State for search query
    const [authenticated, setAuthenticated] = useState(true); // Assuming the user is initially authenticated
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isSuccessEditModalOpen, setIsSuccessEditModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');


    const itemsPerPage = 15; // Number of items to show per page
    const [currentPage, setCurrentPage] = useState(1);

    const router = useRouter()

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCompanies = companies
        .filter((company) =>
            company.companyName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(indexOfFirstItem, indexOfLastItem);

    // Function to change page
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);

    };

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to the first page when search query changes

    };

    useEffect(() => {
        const fetchData = async () => {
            try {
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
                // Fetch the list of companies from your API endpoint using Axios
                const response = await axios.get('http://localhost:5000/api/company/companies', {
                    headers: {
                        Authorization: token,
                    },
                });

                setCompanies(response.data);
            } catch (error) {
                console.error('Error fetching companies:', error);
            }
        };
        // Call the async function
        fetchData();
    }, [router]);

    if (!authenticated) {
        // If the user is not authenticated, render nothing (or a message) and redirect to login
        return null;
    }

    const handleEditClick = (companyId) => {
        // Open the edit modal when the "Edit" button is clicked
        setIsEditModalOpen(true);
        const selectedCompany = companies.find((company) => company._id === companyId);

        // Set the selected company for editing
        setEditedCompany(selectedCompany);
    };

    const editCompany = async () => {
        try {
            // Send a PUT request to update the company's details
            await axios.put(`http://localhost:5000/api/company/companies/${editedCompany._id}`, editedCompany);

            // Update the company list with the edited data (optional)
            setCompanies(companies.map((company) =>
                company._id === editedCompany._id ? editedCompany : company
            ));

            // Close the edit modal
            closeModal();
            setIsSuccessEditModalOpen(true);
            setSuccessMessage('Company updated successfully!');
        } catch (error) {
            console.error('Error editing company:', error);
        }
    };

    const handleDeleteClick = (companyId) => {
        // Open the delete modal when the "Delete" button is clicked
        setIsDeleteModalOpen(true);
        // Set the selected company for deletion
        setCompanyToDelete(companyId);
    };

    const confirmDelete = async (companyId) => {
        try {
            // Send a DELETE request to delete the company by ID
            await axios.delete(`http://localhost:5000/api/company/companies/${companyId}`);

            // Update the company list after successful deletion (optional)
            setCompanies(companies.filter((company) => company._id !== companyId));

            // Close the delete modal
            closeModal();
            setIsSuccessModalOpen(true);

        } catch (error) {
            console.error('Error deleting company:', error);
        }
    };

    const closeModal = () => {
        // Close both edit and delete modals when the close button or backdrop is clicked
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setCompanyToDelete(null);
        setEditedCompany(null);
        setIsSuccessModalOpen(false);
        setIsSuccessEditModalOpen(false)

    };

    const exportToExcel = () => {
        const fileType =
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';

        // Get the columns displayed in the table (from the thead)
        const columns = ['Sr.No.', 'Company Name'];

        // Filter the companies to include only the displayed columns and search query
        const filteredCompanies = companies
            .filter((company) =>
                company.companyName.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((company) => {
                return {
                    'Sr.No.': (companies.indexOf(company) + 1).toString(),
                    'Company Name': company.companyName,
                };
            });

        const ws = XLSX.utils.json_to_sheet([Object.keys(filteredCompanies[0]), ...filteredCompanies.map(Object.values)]);
        const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: fileType });
        const fileName = 'company_list' + fileExtension;
        saveAs(data, fileName);
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
    return (
        <>
            <NavSideSuper />

            <div className='m-2 md:mt-20 md:pl-28 pl-4'>
                <div className="container mx-auto -mt-16">
                    <h2 className="text-xl md:text-2xl font-bold text-center align-middle mb-3 text-orange-700 md:pl-32" style={{ marginTop: "135px" }} >List of Companies</h2>
                    <div className="mb-2 flex justify-center md:pl-28">
                        <input
                            type="text"
                            placeholder="Search by company name"
                            className="w-full md:w-1/3 border border-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 rounded-xl px-2 py-1 text-center mt-2"
                            value={searchQuery}
                            onChange={handleSearchInputChange}
                        />

                    </div>

                    <div className="relative mb-4 md:mb-16">
                        <button
                            className="bg-green-500 text-white font-extrabold py-1 md:py-2 px-2 md:px-3 rounded-md md:absolute md:-mt-12 top-2 right-2 text-sm md:text-sm flex items-center mr-1 mb-2" // Positioning
                            // style={{ right: '305px' }} // Adjust the right property to move the button to the left
                            onClick={() => router.push('/company')}
                        >
                            <FontAwesomeIcon icon={faPlus} className="text-lg mr-1 font-bold" />
                            <span className="font-bold">Add New</span> {/* Apply font-bold to the text beside the plus icon */}
                        </button>

                        <button
                            className="bg-green-700 text-white font-extrabold py-1 md:py-2 px-2  md:px-4 rounded-md md:absolute md:-mt-12 top-2 right-32 text-sm md:text-sm flex items-center mr-1" // Positioning
                            onClick={exportToExcel}
                        >
                            <FontAwesomeIcon icon={faFileExcel} className="text-lg mr-2 font-bold" />
                            <span className="font-bold">Excel</span>
                        </button>
                    </div>



                    <div className="flex justify-center items-center h-2/3 md:mb-56"> {/* Adjust spacing */}
                        <table className="table-auto w-full md:w-5/6 md:ml-44 md:-mt-10"> {/* Full width on mobile */}
                            <thead className='bg-orange-700 text-white'>
                                <tr>
                                    <th className="px-2 py-2 text-center">Sr.No.</th> {/* Add sr.no column */}
                                    <th className="px-2 py-2 text-center">Company Name</th>
                                    <th className="px-2 py-2 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentCompanies.filter((company) =>
                                    company.companyName.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                    .map((company, index) => (
                                        <tr key={company._id}>
                                            <td className="border px-2 py-2 text-center">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="border px-2 py-2 text-center font-bold">{company.companyName}</td>
                                            <td className="border px-2 py-2 text-center">
                                                <FontAwesomeIcon icon={faPenToSquare}
                                                    className="text-orange-500 hover:underline mr-1 cursor-pointer text-lg"
                                                    onClick={() => handleEditClick(company._id)} />
                                                <FontAwesomeIcon icon={faTrash}
                                                    className="text-orange-500 hover:underline mr-1 pl-3 cursor-pointer text-lg"
                                                    onClick={() => handleDeleteClick(company._id)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    {companies.length > itemsPerPage && (
                        <div className="flex justify-center mt-3 md:-mt-52 md:ml-36">
                            {Array.from({ length: Math.ceil(companies.length / itemsPerPage) }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => paginate(i + 1)}
                                    className={`mx-1 px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-red-700 text-white' : 'bg-red-200 text-black'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                    {/* Edit Company Modal */}
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
                                <div className="p-5 text-center">
                                    <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">Edit Company</h3>
                                    <div className="mb-4">
                                        <label className="block text-gray-800 dark:text-gray-200 text-sm md:text-lg font-medium mb-2">
                                            Company Name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 rounded-md text-center text-sm md:text-base"
                                            value={editedCompany.companyName || ''}
                                            onChange={(e) => setEditedCompany({ ...editedCompany, companyName: e.target.value })}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className="px-6 py-2 text-white bg-green-500 hover:bg-green-800 rounded-md mr-5 transition duration-300 ease-in-out text-xs md:text-base"
                                        onClick={editCompany}
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        className="px-4 py-2 text-white bg-green-700 hover:bg-green-600 rounded-md transition duration-300 ease-in-out text-xs md:text-base"
                                        onClick={closeModal}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isSuccessEditModalOpen && (
                        <div
                            className="fixed inset-0 flex items-center justify-center z-50"
                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                            onClick={closeModal}
                        >
                            <div
                                className="modal-container bg-white sm:w-96 sm:p-6 rounded shadow-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-5 text-center">
                                    <FontAwesomeIcon icon={faCircleCheck} className="text-5xl mr-1 font-bold text-green-800" />

                                    <h3 className="mb-2 mt-5 text-sm md:text-base font-semibold text-gray-800 dark:text-gray-400">Company Deleted Successfully!</h3>
                                    <button
                                        type="button"
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md mt-4 mr-2 text text-xs md:text-base"
                                        onClick={closeModal}
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isSuccessModalOpen && (
                        <div
                            className="fixed inset-0 flex items-center justify-center z-50"
                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                            onClick={closeModal}
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
                                <div className="p-5 text-center">
                                    <FontAwesomeIcon icon={faCircleCheck} className="text-5xl mr-1 font-bold text-green-800" />

                                    <h3 className="mb-2 mt-5 text-sm md:text-base font-semibold text-gray-800 dark:text-gray-400">Company Deleted Successfully!</h3>
                                    <button
                                        type="button"
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md mt-4 mr-2 text text-xs md:text-base"
                                        onClick={closeModal}
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete Company Modal */}
                    {isDeleteModalOpen && (
                        <div
                            className="fixed inset-0 flex items-center justify-center z-50"
                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                        >
                            <div
                                className="modal-container bg-white sm:w-96 sm:p-6 rounded shadow-lg"
                                onClick={closeModal}
                            >
                                <button
                                    type="button"
                                    className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                    onClick={closeModal}
                                >
                                    {/* Close button icon */}
                                </button>
                                <div className="p-5 text-center">
                                    <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    <h3 className="mb-5 text-sm md:text-base font-normal text-gray-800 dark:text-gray-400">Delete This Company?</h3>
                                    <button
                                        type="button"
                                        className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-xs md:text-sm inline-flex items-center px-5 py-2.5 text-center mr-2 "
                                        onClick={() => confirmDelete(companyToDelete)}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        type="button"
                                        className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 text-xs md:text-sm"
                                        onClick={closeModal}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div >
        </>
    );
};

export default CompanyList;