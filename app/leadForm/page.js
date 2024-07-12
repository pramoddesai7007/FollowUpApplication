'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavSide from '../components/NavSide';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import jwtDecode from 'jwt-decode';



const LeadForm = () => {
    const router = useRouter()
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [authenticated, setAuthenticated] = useState(true); // Assuming the user is initially authenticated
    const [formData, setFormData] = useState({
        customerName: '',
        companyName: '',
        contactNo: '',
        email: '',
        description: '',
        ownerName: '',
        website: '',
        leadPicture: null,
    });

    const handleModalClose = () => {
        setIsSuccessModalOpen(false)
        router.push('/leadList')
    }

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, leadPicture: e.target.files[0] });
    };

    const clearForm = () => {
        setFormData({
            customerName: '',
            companyName: '',
            contactNo: '',
            email: '',
            description: '',
            ownerName: '',
            website: '',
            leadPicture: null,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataWithFile = new FormData();
        for (const key in formData) {
            formDataWithFile.append(key, formData[key]);
        }

        const token = localStorage.getItem('authToken');
        const headers = { Authorization: token };

        try {
            const response = await axios.post('http://103.159.85.246:4000/api/lead/createLead', formDataWithFile, { headers });
            console.log('Lead created:', response.data);
            setSuccessMessage('Lead Created Successfully')
            setIsSuccessModalOpen(true)


            // Send the lead notification
            const leadNotificationData = {
                message: 'A new lead has been created',
                description: formData.description,
                customerName: formData.customerName,
                companyName: formData.companyName,
                contactNo: formData.contactNo,
                email: formData.email,
                ownerName: formData.ownerName,
                website: formData.website,
            };

            // Send the lead notification with the file
            const leadNotificationFormData = new FormData();
            for (const key in leadNotificationData) {
                leadNotificationFormData.append(key, leadNotificationData[key]);
            }
            leadNotificationFormData.append('leadPicture', formData.leadPicture);

            const leadNotificationResponse = await axios.post('http://103.159.85.246:4000/api/lead/create/Notification', leadNotificationFormData, { headers });
            console.log('Lead notification created:', leadNotificationResponse.data);
            setSuccessMessage("Lead Created Successfully")
            setIsSuccessModalOpen(true)
            clearForm();
            // router.push('/leadList')
        } catch (error) {
            console.error('Error creating lead:', error);
        }
    };

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
    }, [router]);

    if (!authenticated) {
        // Render nothing if not authenticated (or redirect to login)
        return null;
    }
    return (
        <>

            {isSuccessModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-container bg-white sm:w-96 sm:p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>

                        <div className="p-2 text-center">
                            {/* Customize this section to display your success message */}
                            <FontAwesomeIcon icon={faCircleCheck} className='text-3xl md:text-5xl text-green-600 mt-2' />
                            <p className="mb-3 text-center justify-center mt-3">
                                {successMessage}
                            </p>
                            <button
                                type="button"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 mr-2 text text-xs md:text-base"
                                onClick={handleModalClose}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <NavSide />
            <div className="w-full md:flex justify-center items-center min-h-screen md:mt-10 md:pl-28 bg-slate-50">
                <div className="w-full md:w-1/2 mt-24 md:mt-0 lg:mt-0">
                    <div className="w-max-w-2xl overflow-x-auto border border-gray-200 rouned-lg p-5 bg-white shadow-md rounded ">
                        <h1 className="text-xl font-bold mb-4 text-orange-500">Create Lead</h1>
                        <div className="mb-2">
                            <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="description">
                                Lead Title
                            </label>
                            <input
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder='Enter Lead Title'
                                className="border rounded-md px-2 py-1 text-xs md:text-sm w-full"
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="customerName">
                                Customer Name
                            </label>
                            <input
                                type="text"
                                id="customerName"
                                name="customerName"
                                value={formData.customerName}
                                onChange={handleInputChange}
                                placeholder='Enter Name'
                                className="border rounded-md px-2 py-1 text-xs md:text-sm w-full"
                            />
                        </div>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                            <div className="mb-2">
                                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="companyName">
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    id="companyName"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleInputChange}
                                    placeholder='Company name'
                                    className="border rounded-md px-2 py-1 text-xs md:text-sm w-full"
                                />
                            </div>
                            <div className="mb-2 ">
                                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="ownerName">
                                    Owner&apos;s Name
                                </label>
                                <input
                                    type="text"
                                    id="ownerName"
                                    name="ownerName"
                                    value={formData.ownerName}
                                    onChange={handleInputChange}
                                    placeholder='Enter Owners name'
                                    className="border rounded-md px-2 py-1 text-xs md:text-sm w-full"
                                />
                            </div>

                            <div className="mb-2 ">
                                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    type="text"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder='Enter Email'
                                    className="border rounded-md px-2 py-1 text-xs md:text-sm w-full"
                                />
                            </div>

                            <div className="mb-2">
                                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="contactNo">
                                    Mobile No
                                </label>
                                <input
                                    type="text"
                                    id="contactNo"
                                    name="contactNo"
                                    value={formData.contactNo}
                                    onChange={handleInputChange}
                                    placeholder='Enter Mobile No.'
                                    className="border rounded-md px-2 py-1 text-xs md:text-sm w-full"
                                />
                            </div>
                            <div className="mb-2">
                                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="website">
                                    Website
                                </label>
                                <input
                                    type="text"
                                    id="website"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleInputChange}
                                    placeholder='Enter WebSite URL'
                                    className="border rounded-md px-2 py-1 text-xs md:text-sm w-full"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="leadPicture">
                                    Lead Picture
                                </label>
                                <input
                                    type="file"
                                    id="leadPicture"
                                    name="leadPicture"
                                    onChange={handleChange}
                                    className="border rounded-md px-2 py-1 text-xs md:text-xs w-full"
                                />
                            </div>

                            <div className="col-span-2 flex justify-center">
                                <button
                                    type="submit"
                                    className="text-sm md:text-base  bg-blue-500 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Create Lead
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LeadForm;
