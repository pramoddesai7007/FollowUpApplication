'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash, faEye, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import NavSideEmp from '../components/NavSideEmp';
import Image from 'next/image';
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


const LeadListEmp = () => {
  const [leads, setLeads] = useState([]);
  const [viewLead, setViewLead] = useState(null);
  const [editLead, setEditLead] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [completeImageUrl, setPreviewImageUrl] = useState('');
  const [editedLead, setEditedLead] = useState(null);
  const [authenticated, setAuthenticated] = useState(true);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false); 
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage] = useState(15); // Set the number of leads per page

  const calculateSerialNumber = (index) => {
    return index + (currentPage - 1) * leadsPerPage + 1;
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to the first page when searching
  };

  const filteredLeads = leads.filter((lead) =>
    lead.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );



  const handleEditSave = async () => {
     // Check if any required fields are empty
     if (!editedLead.customerName || !editedLead.companyName || !editedLead.contactNo || !editedLead.email || !editedLead.description) {
      setErrorModalMessage('Please fill in all required fields');
      setIsErrorModalOpen(true);
      return;
    }
    // Check if contactNo contains exactly 10 digits
    if (!/^\d{10}$/.test(editedLead.contactNo)) {
      setErrorModalMessage('Contact number must be exactly 10 digits');
      setIsErrorModalOpen(true);
      return;
  }
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(`http://103.159.85.246:4000/api/lead/editLead/${editedLead._id}`, editedLead, {
        headers: {
          Authorization: token,
        },
      });

      if (response.status === 200) {
        console.log('Lead edited successfully');
        // Close the edit modal and update the leads data
        setIsEditModalOpen(false);
        setLeads((prevLeads) =>
          prevLeads.map((lead) => (lead._id === editedLead._id ? editedLead : lead))
        );
      } else {
        console.error('Failed to edit lead');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const router=useRouter()
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

    const fetchLeads = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://103.159.85.246:4000/api/lead/leadList', {
          headers: {
            Authorization: token,
          },
        });
        console.log(response.data)
        setLeads(response.data);
      } catch (error) {
        console.error('Error fetching leads:', error);
      }
    };

    fetchLeads();
  }, []);

  const handleViewClick = (lead) => {
    setViewLead(lead);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (lead) => {
    setEditedLead(lead);
    setIsEditModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(`http://103.159.85.246:4000/api/lead/deleteLead/${leadToDelete._id}`, {
        headers: {
          Authorization: token,
        },
      });

      if (response.status === 200) {
        console.log('Lead deleted successfully');
        // Remove the deleted lead from the leads list
        setLeads((prevLeads) => prevLeads.filter((lead) => lead._id !== leadToDelete._id));
        // Close the delete confirmation modal
        setIsDeleteModalOpen(false);
      } else {
        console.error('Failed to delete lead');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleDeleteLead = (leadId) => {
    // Find the lead to delete and set it in the state
    const lead = leads.find((lead) => lead._id === leadId);
    setLeadToDelete(lead);
    // Open the delete confirmation modal
    setIsDeleteModalOpen(true);
  };

  const handlePicturePreview = (imageUrl) => {
    const completeImageUrl = `http://103.159.85.246:4000/${imageUrl}`; // Generate the complete image URL
    console.log(completeImageUrl)
    setPreviewImageUrl(completeImageUrl);
    setIsPreviewModalOpen(true);
  };

  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const exportToExcel = async () => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    // Filter and map the data including the header fields and employee names
    const tasksToExport = filteredLeads.map(lead => {
      console.log(filteredLeads)
      return {
        'CustomerName': lead.customerName,
        'ContactNo': lead.contactNo,
        'Email': lead.email,

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
    const fileName = 'Lead_list' + fileExtension;
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
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-indigo-500">Lead List</h2>

        <div className="flex justify-center items-center mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search ..."
            className="px-3 py-1 border border-gray-400 rounded-full w-full md:w-1/3"
          />
        </div>
        <div className="relative mb-7 md:mb-12">
          <button
            className="bg-green-700 text-white font-extrabold py-1 md:py-1.5 px-2 md:px-3 rounded-lg md:absolute -mt-2 md:-mt-12 top-0 right-0 text-sm md:text-sm flex items-center mr-1" // Positioning
            onClick={() => exportToExcel(filteredLeads)}                    >
            <FontAwesomeIcon icon={faFileExcel} className="text-lg mr-1 font-bold" />
            <span className="font-bold">Export</span>
          </button>
        </div>


        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead className='bg-violet-300'>
              <tr>
                <th className="px-4 py-2 border-b">Sr.No</th>
                <th className="px-4 py-2 border-b">Customer Name</th>
                {/* <th className="border border-gray-200 p-3">Company Name</th> */}
                {/* <th className=" p-3">Description</th> */}
                <th className="px-4 py-2 border-b">Contact No</th>
                <th className="px-4 py-2 border-b">Email</th>
                <th className="px-4 py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length > 0 ? (
                currentLeads.map((lead, index) => (
                  <tr key={lead._id}>
                    <td className="px-4 py-2 border text-center border-violet-300">{calculateSerialNumber(index)}</td>
                    <td className="px-4 py-2 border text-center border-violet-300">{lead.customerName}</td>
                    {/* <td className="border border-gray-200 p-3">{lead.companyName}</td> */}
                    {/* <td className="border border-violet-300 p-3">{lead.description}</td> */}
                    <td className="px-4 py-2 border text-center border-violet-300">{lead.contactNo}</td>
                    <td className="px-3 py-2 border text-center border-violet-300">{lead.email}</td>
                    <td className="px-4 py-2 border text-center border-violet-300">
                      <div style={{ display: 'flex' }}>
                        <FontAwesomeIcon
                          icon={faEye}
                          className="text-blue-500 hover:underline cursor-pointer md:pl-2 pl-2 "
                          onClick={() => handleViewClick(lead)}
                        />
                        <FontAwesomeIcon
                          icon={faPenToSquare}
                          className="text-orange-500 hover:underline cursor-pointer md:pl-5 pl-2"
                          onClick={() => handleEditClick(lead)}
                        />
                        <FontAwesomeIcon
                          icon={faTrash}
                          className="text-red-500 hover:underline cursor-pointer md:-mr-16 pl-5"
                          onClick={() => handleDeleteLead(lead._id)}
                        />

                      </div>

                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className='px-4 py-2 text-center border font-semibold'>
                    No any Lead Added
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <ul className="flex justify-center items-center mt-4">
          {Array.from({ length: Math.ceil(filteredLeads.length / leadsPerPage) }, (_, index) => (
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


        {isViewModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="modal-container bg-white w-72 md:w-96 p-6 rounded shadow-lg">
              <div className="p-2 text-center text-sm md:text-base">
                <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">Lead Details</h3>
                {viewLead && (
                  <div>
                    <p className="mb-2 text-left justify-center">
                      <strong  >Created By:</strong> {viewLead.assignedByName}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong  >Customer Name:</strong> {viewLead.customerName}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong    >Company Name:</strong> {viewLead.companyName}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong>Contact No:</strong> {viewLead.contactNo}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong  >Email:</strong> {viewLead.email}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong>Description:</strong> {viewLead.description}
                    </p>
                    <p className="mb-2 text-left justify-center">
                      <strong>Picture:</strong>{" "}
                      {viewLead.leadPicture ? (
                        <button
                          type="button"
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-1 ml-2"
                          onClick={() => handlePicturePreview(viewLead.leadPicture)}
                        >
                          Preview
                        </button>
                      ) : (
                        "Not Added"
                      )}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded mt-4"
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

        {isEditModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="modal-container bg-white w-72 md:w-96 p-5 rounded shadow-lg mt-2 md:mt-0">
              <div className="text-center">
                <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-400">Edit Lead</h3>
                {editedLead && (
                  <div>
                    <div className="mb-1">
                      <label htmlFor="customerName" className="text-left justify-center block mb-1 text-sm md:text-base">
                        Customer Name
                      </label>
                      <input
                        type="text"
                        name="customerName"
                        value={editedLead.customerName}
                        onChange={(e) => setEditedLead({ ...editedLead, customerName: e.target.value })}
                        className="border border-gray-200 p-1 w-full rounded text-sm md:text-base"
                      />
                    </div>
                    <div className="mb-1">
                      <label htmlFor="companyName" className="text-left justify-center block mb-1 text-sm md:text-base">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={editedLead.companyName}
                        onChange={(e) => setEditedLead({ ...editedLead, companyName: e.target.value })}
                        className="border border-gray-200 p-1 w-full rounded text-sm md:text-base"
                      />
                    </div>
                    <div className="mb-1">
                      <label htmlFor="contactNo" className="text-left justify-center block mb-1 text-sm md:text-base">
                        Contact No
                      </label>
                      <input
                        type="text"
                        name="contactNo"
                        value={editedLead.contactNo}
                        onChange={(e) => setEditedLead({ ...editedLead, contactNo: e.target.value })}
                        className="border border-gray-200 p-1 w-full rounded text-sm md:text-base"
                      />
                    </div>
                    <div className="mb-1">
                      <label htmlFor="email" className="text-left justify-center block mb-1 text-sm md:text-base">
                        Email
                      </label>
                      <input
                        type="text"
                        name="email"
                        value={editedLead.email}
                        onChange={(e) => setEditedLead({ ...editedLead, email: e.target.value })}
                        className="border border-gray-200 p-1 w-full rounded text-sm md:text-base"
                      />
                    </div>
                    <div className="mb-1">
                      <label htmlFor="description" className="text-left justify-center block mb-1 text-sm md:text-base">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={editedLead.description}
                        onChange={(e) => setEditedLead({ ...editedLead, description: e.target.value })}
                        className="border border-gray-200 p-1 w-full rounded text-sm md:text-base"
                      />
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={handleEditSave}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 text-sm md:text-base"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditModalOpen(false)}
                        className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded text-sm md:text-base"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
        {isErrorModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
    <div className="modal-container bg-white sm:w-96 sm:p-5 rounded shadow-lg">
      <div className="p-5 text-center">
        <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <p className="mb-5 justify-center font-medium">{errorModalMessage}</p>
        <div className="mt-4">
          <button
            onClick={() => setIsErrorModalOpen(false)}
            className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded text-sm md:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="modal-container bg-white sm:p-4 sm:w-96 rounded shadow-lg">
              <div className="p-5 text-center">
                <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <p className="mb-3 text-center font-medium">Delete this lead?</p>
                <div className="mt-4">
                  <button
                    onClick={handleConfirmDelete}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 mr-4 rounded text-sm md:text-base"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded text-sm md:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default LeadListEmp;