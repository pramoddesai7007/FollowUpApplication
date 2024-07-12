'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx';
import NavSideSuper from '../components/NavSideSuper';

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


const UserList = () => {
    const [employees, setEmployees] = useState([]);

    const calculateSerialNumber = (index) => {
        return index + (currentPage - 1) * employeesPerPage + 1;
    };
    const [searchQuery, setSearchQuery] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [employeesPerPage] = useState(15); // Change the number as per your preference


    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    useEffect(() => {
        // Fetch the list of employees from your API endpoint
        const fetchEmployees = async () => {
            try {
                const response = await axios.get(`http://103.159.85.246:4000/api/employee/subemployee/list`);
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
            <NavSideSuper />
            <div className="m-5 pl-1 md:pl-64 mt-20">

                <h1 className="text-xl font-bold mb-4 text-orange-500 text-center md:text-left md:text-2xl">Users List</h1>

                <div className="flex justify-center items-center mb-4">
                    <input
                        type="text"
                        placeholder="Search Users"
                        className="px-3 py-1 border border-gray-400 rounded-full w-full md:w-1/2"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                    />
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
                                <th className="px-4 py-2 text-center text-gray-700">Email</th>
                                <th className="px-4 py-2 text-center text-gray-700">PhoneNumber</th>
                                <th className="px-4 py-2 text-center text-gray-700">Company Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.length > 0 ? (
                                currentEmployees.map((employee, index) => (
                                    <tr key={employee._id}>
                                        <td className="border px-4 py-2 text-center">{calculateSerialNumber(index)}</td>
                                        <td className="border px-4 py-2 text-center">{employee.name}</td>
                                        <td className="border px-4 py-2 text-center">{employee.email}</td>
                                        <td className="border px-4 py-2 text-center">{employee.phoneNumber}</td>
                                        <td className="border px-4 py-2 text-center">{employee.adminCompanyName}</td>

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
            </div>
        </>
    );
};

export default UserList;