// "use client"

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import NavSideSuper from '../components/NavSideSuper';
// import NavSide from '../components/NavSide';
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEye, faEyeSlash, faEnvelope } from "@fortawesome/free-solid-svg-icons";
// import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'; // Assuming 'faWhatsapp' belongs to the brand icons
// import jwtDecode from 'jwt-decode';


// const initialFormData = {
//     name: '',
//     email: '',
//     password: '',
//     adminCompanyName: '',
//     phoneNumber: '',

// };

// const EmployeeRegistration = () => {
//     const [formData, setFormData] = useState(initialFormData);
//     const [successMessage, setSuccessMessage] = useState('');
//     const [showPassword, setShowPassword] = useState(false);
//     const [adminCompanies, setAdminCompanies] = useState([]);
//     const [showModal, setShowModal] = useState(false); // State to control modal visibility
//     const [error, setError] = useState(null);
//     const router = useRouter();
//     const [authenticated, setAuthenticated] = useState(true); // Assuming the user is initially authenticated
//     const [userRole, setUserRole] = useState('');

//     const togglePasswordVisibility = () => {
//         setShowPassword(!showPassword);
//     };


//     useEffect(() => {
//         const token = localStorage.getItem('authToken');
//         if (!token) {
//             // If the user is not authenticated, redirect to the login page
//             setAuthenticated(false);
//             router.push('/login');
//             return;
//         }

//         const decodedToken = jwtDecode(token);
//         console.log(decodedToken)
//         const role = decodedToken.role || 'guest';
//         setUserRole(role);


//         // Check if the user has the superadmin role
//         if (role !== 'admin' && role !== 'superAdmin') {
//             // If the user is not a superadmin, redirect to the login page
//             router.push('/forbidden');
//             return;
//         }


//         // Fetch the list of admin's companies from the API
//         const fetchAdminCompanies = async () => {
//             try {
//                 const response = await axios.get('http://localhost:5000/api/company/companies');
//                 if (response.status === 200) {
//                     setAdminCompanies(response.data);
//                 }
//             } catch (err) {
//                 console.error('Error fetching admin companies:', err);
//             }
//         };

//         fetchAdminCompanies();
//     }, []);


//     const handleChange = (e) => {
//         const { name, value } = e.target;

//         // Validate phone number input
//         if (name === "phoneNumber") {
//             // Check if the entered value is numeric and consists of exactly 10 digits
//             if (/^\d{0,10}$/.test(value)) { // Allow up to 10 digits
//                 setFormData({ ...formData, [name]: value });
//                 setError(null); // Clear any previous error message
//             } else {
//                 setError("Phone number must be up to 10 digits.");
//             }
//         } else {
//             setFormData({ ...formData, [name]: value });
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!formData.phoneNumber || formData.phoneNumber.length !== 10) {
//             // If phone number field is empty or its length is not equal to 10, set showModal state to true
//             setShowModal(true);
//             return; // Prevent further execution of the handleSubmit function
//         }
//         try {
//             const response = await axios.post('http://localhost:5000/api/employee/register', formData);

//             if (response.status === 201) {
//                 setFormData({
//                     name: '',
//                     email: '',
//                     password: '',
//                     adminCompanyName: '',
//                     phoneNumber: '',
//                 });
//                 setSuccessMessage('Admin added successfully.');

//                 const { email, password, phoneNumber } = formData;
//                 const link = 'http://localhost:3000/employeeLogin'
//                 const message = `*Welcome! You appointed as Admin for Followup Application*%0A%0A*Username:* ${email}%0A*Password:* ${password}%0A*Login:* ${link}`;
//                 const whatsappWebURL = `https://web.whatsapp.com/send?phone=${phoneNumber}\n&text=${message}`;

//                 window.open(whatsappWebURL, '_blank');
//                 router.push('/empList');
//             }
//         } catch (err) {
//             if (err.response) {
//                 setError(err.response.data.error);
//             } else {
//                 setError('An error occurred while registering the employee.');
//             }
//         }
//     };

//     return (
//         <>
//             {/* <NavSideSuper /> */}

//             {userRole === 'admin' && <NavSide />}
//             {userRole === 'superAdmin' && <NavSideSuper />}
//             <div className='p-2 md:p-1 bg-slate-50 '>
//                 <div className="mx-auto max-w-md p-6 bg-white rounded-lg shadow-md mt-16 md:mt-28 border border-gray-300">
//                     <h2 className="text-xl font-bold text-left text-orange-500 -mt-3">Admin Registration</h2>
//                     <form onSubmit={handleSubmit} className="mt-5 space-y-4">
//                         <div>
//                             <label className="block text-xs md:text-sm font-medium">Name <span className="text-red-500 text-md">*</span></label>
//                             <input
//                                 type="text"
//                                 name="name"
//                                 placeholder='Enter Admin Name'
//                                 value={formData.name}
//                                 onChange={handleChange}
//                                 required
//                                 className="w-full px-4 py-1 md:py-2 border rounded-md focus:ring focus:ring-indigo-400 text-xs md:text-sm"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-xs md:text-sm font-medium">Phone Number<span className="text-red-500 text-md">*</span></label>
//                             <input
//                                 type="text"
//                                 name="phoneNumber"
//                                 placeholder='Enter Phone Number'
//                                 value={formData.phoneNumber}
//                                 onChange={handleChange}
//                                 className="w-full px-4 py-1 md:py-2 border rounded-md focus:ring focus:ring-indigo-400 text-xs md:text-sm"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-xs md:text-sm font-medium">Email <span className="text-red-500 text-md">*</span></label>
//                             <div className="relative">
//                                 <input
//                                     type="email"
//                                     name="email"
//                                     placeholder='Enter Email Id'
//                                     value={formData.email}
//                                     onChange={handleChange}
//                                     required
//                                     className="w-full px-4 py-1 md:py-2 border rounded-md focus:ring focus:ring-indigo-400 text-xs md:text-sm"
//                                 />
//                                 <span
//                                     className="absolute right-4 top-2 cursor-pointer"
//                                 >
//                                     <FontAwesomeIcon
//                                         icon={faEnvelope}
//                                         className='text-gray-500'
//                                     />
//                                 </span>
//                             </div>
//                         </div>
//                         <div>
//                             <label className="block text-xs md:text-sm font-medium">Password <span className="text-red-500 text-md">*</span></label>
//                             <div className="relative">
//                                 <input
//                                     type={showPassword ? 'text' : 'password'}
//                                     name="password"
//                                     placeholder="********"
//                                     value={formData.password}
//                                     onChange={handleChange}
//                                     required
//                                     className="w-full px-4 py-1 md:py-2 border rounded-md focus:ring focus:ring-indigo-400 text-xs md:text-sm"
//                                 />

//                                 <span
//                                     className="absolute right-3 top-2 cursor-pointer"
//                                     onClick={togglePasswordVisibility}
//                                 >
//                                     <FontAwesomeIcon
//                                         icon={showPassword ? faEye : faEyeSlash}
//                                         className='text-gray-500'
//                                     />
//                                 </span>

//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-xs md:text-sm font-medium">Select Company Name<span className="text-red-500 text-md">*</span></label>
//                             <select
//                                 name="adminCompanyName"
//                                 value={formData.adminCompanyName}
//                                 onChange={handleChange}
//                                 required
//                                 className="w-full px-2 py-2 border rounded-md focus:ring focus:ring-indigo-400 text-xs md:text-sm"
//                             >
//                                 <option value="">Select Company</option>
//                                 {adminCompanies.map((company) => (
//                                     <option key={company._id} value={company.companyName}>
//                                         {company.companyName}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         {error && <p className="text-red-500">{error}</p>}
//                         {successMessage && <p className="text-green-500">{successMessage}</p>}

//                         <div className='relative'>
//                             <button
//                                 type="submit"
//                                 className="w-full font-bold py-2 px-4 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-400 text-xs md:text-sm"
//                             >
//                                 Register & Send
//                             </button>
//                             <span
//                                 className="absolute right-28 cursor-pointer text-2xl"
//                             >
//                                 <FontAwesomeIcon
//                                     icon={faWhatsapp}
//                                     className='text-white'
//                                 />
//                             </span>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//             {/* Modal */}
//             {showModal && (
//                 <div className="fixed z-10 inset-0 overflow-y-auto">
//                     <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//                         <div className="fixed inset-0 transition-opacity" aria-hidden="true">
//                             <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
//                         </div>
//                         <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
//                         <div className="inline-block align-middle bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:align-middle sm:max-w-md sm:w-full">
//                             <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
//                                 <div className="sm:flex sm:items-start">

//                                     <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
//                                         <h3 className="text-lg font-medium leading-6 text-gray-900">Please fill Phone Number Field</h3>

//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse justify-center">
//                                 <button type="button" onClick={() => setShowModal(false)} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
//                                     Close
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// };

// export default EmployeeRegistration;




"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import NavSideSuper from '../components/NavSideSuper';
import NavSide from '../components/NavSide';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'; // Assuming 'faWhatsapp' belongs to the brand icons
import jwtDecode from 'jwt-decode';

const initialFormData = {
    name: '',
    email: '',
    password: '',
    adminCompanyName: '',
    phoneNumber: '',
    salary: '',
    dailyShift: '',
    totalHrs: '',
    upto: '',
    secondTabEmail: '',
    type: '',
};

const EmployeeRegistration = () => {
    const [formData, setFormData] = useState(initialFormData);
    const [successMessage, setSuccessMessage] = useState('');
    const [activeTab, setActiveTab] = useState('first');
    const [showPassword, setShowPassword] = useState(false);
    const [adminCompanies, setAdminCompanies] = useState([]);
    const [showModal, setShowModal] = useState(false); // State to control modal visibility
    const [error, setError] = useState(null);
    const router = useRouter();
    const [authenticated, setAuthenticated] = useState(true); // Assuming the user is initially authenticated
    const [userRole, setUserRole] = useState('');
    const [selectedRole, setSelectedRole] = useState({
        isEmployee: false,
        isSalesEmployee: false,
    });

    const handleCheckboxChange = (role) => {
        if (role === 'isEmployee') {
            console.log('Selected Role: Ordinary Employee');

            setSelectedRole({ isEmployee: true, isSalesEmployee: false });
            setFormData((prevState) => ({
                ...prevState,
                type: 'Ordinary Employee',
            }));
        } else if (role === 'isSalesEmployee') {
            console.log('Selected Role: Sales Employee');
            setSelectedRole({ isEmployee: false, isSalesEmployee: true });
            setFormData((prevState) => ({
                ...prevState,
                type: 'Sales Employee',
            }));
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const handleNextClick = () => {
        if (activeTab === 'first') setActiveTab('second');
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
        const role = decodedToken.role || 'guest';
        setUserRole(role);

        if (role !== 'admin' && role !== 'superAdmin') {
            // If the user is not an admin or superAdmin, redirect to the forbidden page
            router.push('/forbidden');
            return;
        }

        // If the user is an admin, set the adminCompanyName directly
        if (role === 'admin') {
            setFormData((prevFormData) => ({
                ...prevFormData,
                adminCompanyName: decodedToken.adminCompanyName || '',
            }));
        } else {
            // Fetch the list of admin's companies from the API for superAdmin
            const fetchAdminCompanies = async () => {
                try {
                    const response = await axios.get('http://localhost:5000/api/company/companies');
                    if (response.status === 200) {
                        setAdminCompanies(response.data);
                    }
                } catch (err) {
                    console.error('Error fetching admin companies:', err);
                }
            };
            fetchAdminCompanies();
        }
    }, [router]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Validate phone number input
        if (name === "phoneNumber") {
            // Check if the entered value is numeric and consists of exactly 10 digits
            if (/^\d{0,10}$/.test(value)) { // Allow up to 10 digits
                setFormData({ ...formData, [name]: value });
                setError(null); // Clear any previous error message
            } else {
                setError("Phone number must be up to 10 digits.");
            }
        } setFormData((prevFormData) => {
            const updatedFormData = {
                ...prevFormData,
                [name]: value
            };

            // Calculate the Hourly Rate
            const { salary, dailyShift, totalHrs } = updatedFormData;
            const totalSalary = parseFloat(salary) || 0;
            const dailyShiftValue = parseFloat(dailyShift) || 0;
            const totalHrsValue = parseFloat(totalHrs) || 0;

            if (totalHrsValue !== 0 && dailyShiftValue !== 0) {
                updatedFormData.upto = (totalSalary / totalHrsValue) / dailyShiftValue;
            } else {
                updatedFormData.upto = '';
            }

            return updatedFormData;
        });
    };

    useEffect(() => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            secondTabEmail: prevFormData.email,
        }));
    }, [formData.email]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.phoneNumber || formData.phoneNumber.length !== 10) {
            // If phone number field is empty or its length is not equal to 10, set showModal state to true
            setShowModal(true);
            return; // Prevent further execution of the handleSubmit function
        }
        try {
            const response = await axios.post('http://localhost:5000/api/employee/register', formData);

            console.log('Set rate response:', response);


            await axios.post('http://localhost:5000/api/salary/set-rate', {
                name: formData.name,
                email: formData.email,
                hourlyRate: formData.upto,
            });

            if (response.status === 201) {
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    adminCompanyName: '',
                    phoneNumber: '',
                    salary: '',
                    dailyShift: '',
                    totalHrs: '',
                    upto: '',
                    secondTabEmail: '',
                    type: '',
                });
                
                setSuccessMessage('Admin added successfully.');
                
                const { email, password, phoneNumber } = formData;
                const link = 'http://localhost:3000/employeeLogin'
                const message = `*Welcome! You appointed as Admin for Followup Application*%0A%0A*Username:* ${email}%0A*Password:* ${password}%0A*Login:* ${link}`;
                const whatsappWebURL = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;

                window.open(whatsappWebURL, '_blank');
                // router.push('/empList');

                if (userRole === 'superAdmin') {
                    router.push('/empList');
                } else if (userRole === 'admin') {
                    router.push('/subList');
                }
            }
        } catch (err) {
            if (err.response) {
                setError(err.response.data.error);
            } else {
                setError('An error occurred while registering the employee.');
            }
        }
    };

    return (
        <>
            {userRole === 'admin' && <NavSide />}
            {userRole === 'superAdmin' && <NavSideSuper />}
            <div className='p-2 md:p-1 bg-slate-50 '>
                <div className="mx-auto max-w-md p-6 bg-white rounded-lg shadow-md mt-16 md:mt-16 border border-gray-300">
                    <h2 className="text-xl font-bold leading-tight tracking-tight text-orange-500 md:text-xl dark:text-white text-center mt-5">
                        {activeTab === 'first' ? 'Admin Registration' : 'Salary Details'}
                    </h2>
                    <form onSubmit={handleSubmit} className="mt-2 space-y-2 lg:-mt-2 md:space-y-2 ">
                        <div className="w-full mx-auto mt-4 rounded lg:ml-1">
                            <ul id="tabs" className="inline-flex w-full px-1 pt-2">
                                <li className={`px-4 py-2 -mb-px font-semibold text-gray-800 border-b-2 rounded-t opacity-50 ${activeTab === 'first' ? 'border-blue-400 opacity-100' : ''}`}>
                                    <a onClick={() => handleTabClick('first')} href="#first">General Info</a>
                                </li>
                                <li className={`px-4 py-2 font-semibold text-gray-800 rounded-t opacity-50 ${activeTab === 'second' ? 'border-blue-400 opacity-100' : ''}`}>
                                    <a onClick={() => handleTabClick('second')} href="#second">Salary Info</a>
                                </li>
                            </ul>
                            <div id="tab-contents">
                                <div id="first" className={`p-4 ${activeTab === 'first' ? '' : 'hidden'}`}>
                                    <div className="flex flex-wrap grid-cols-3 gap-2">
                                        <div className="w-full md:w-80">
                                            <label className="block text-xs md:text-sm font-medium">Name <span className="text-red-500 text-md">*</span></label>
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder='Enter Admin Name'
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-1 md:py-2 border rounded-md focus:ring focus:ring-indigo-400 text-xs md:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs md:text-sm font-medium">Phone Number<span className="text-red-500 text-md">*</span></label>
                                            <input
                                                type="text"
                                                name="phoneNumber"
                                                placeholder='Enter Phone Number'
                                                value={formData.phoneNumber}
                                                onChange={handleChange}
                                                className="w-full px-4 py-1 md:py-2 border rounded-md focus:ring focus:ring-indigo-400 text-xs md:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs md:text-sm font-medium">Email <span className="text-red-500 text-md">*</span></label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    name="email"
                                                    placeholder='Enter Email Id'
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-1 md:py-2 border rounded-md focus:ring focus:ring-indigo-400 text-xs md:text-sm"
                                                />
                                                <span
                                                    className="absolute right-4 top-2 cursor-pointer"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faEnvelope}
                                                        className='text-gray-500'
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs md:text-sm font-medium">Password <span className="text-red-500 text-md">*</span></label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="password"
                                                    placeholder="********"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-1 md:py-2 border rounded-md focus:ring focus:ring-indigo-400 text-xs md:text-sm"
                                                />
                                                <span
                                                    className="absolute right-3 top-2 cursor-pointer"
                                                    onClick={togglePasswordVisibility}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={showPassword ? faEye : faEyeSlash}
                                                        className='text-gray-500'
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs md:text-sm font-medium">Company Name<span className="text-red-500 text-md">*</span></label>
                                            {userRole === 'admin' ? (
                                                <input
                                                    type="text"
                                                    name="adminCompanyName"
                                                    value={formData.adminCompanyName}
                                                    readOnly
                                                    className="w-full px-4 py-1 md:py-2 border rounded-md focus:ring focus:ring-indigo-400 text-xs md:text-sm bg-gray-100"
                                                />
                                            ) : (
                                                <select
                                                    name="adminCompanyName"
                                                    value={formData.adminCompanyName}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-2 py-2 border rounded-md focus:ring focus:ring-indigo-400 text-xs md:text-sm"
                                                >
                                                    <option value="">Select Company</option>
                                                    {adminCompanies.map((company) => (
                                                        <option key={company._id} value={company.companyName}>
                                                            {company.companyName}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div id="second" className={`p-4 ${activeTab === 'second' ? '' : 'hidden'}`}>
                                <div className="flex flex-wrap grid-cols-4 gap-2">
                                    <div className="w-full md:w-64">
                                        <label htmlFor="salary" className="block mb-0 text-sm font-medium text-gray-900 dark:text-white">
                                            Salary <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="salary"
                                            id="salary"
                                            className="w-full px-4 py-1 text-xs md:text-sm border rounded-md"
                                            placeholder="Enter Salary"
                                            required
                                            value={formData.salary}
                                            onChange={handleChange}
                                            min={0}
                                        />
                                    </div>
                                    <div className="w-full md:w-64">
                                        <label htmlFor="dailyShift" className="block mb-0 text-sm font-medium text-gray-900 dark:text-white">
                                            Daily Shift (hours) <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="dailyShift"
                                            id="dailyShift"
                                            className="w-full px-4 py-1 text-xs md:text-sm border rounded-md"
                                            placeholder="Enter Daily Shift"
                                            required
                                            value={formData.dailyShift}
                                            onChange={handleChange}
                                            min={0}
                                        />
                                    </div>
                                    <div className="w-full md:w-64">
                                        <label htmlFor="totalHrs" className="block mb-0 text-sm font-medium text-gray-900 dark:text-white">
                                            Total Days (per month) <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="totalHrs"
                                            id="totalHrs"
                                            className="w-full px-4 py-1 text-xs md:text-sm border rounded-md"
                                            placeholder="Enter Total Hours"
                                            required
                                            value={formData.totalHrs}
                                            onChange={handleChange}
                                            min={0}
                                        />
                                    </div>
                                    <div className="w-full md:w-64">
                                        <label htmlFor="upto" className="block mb-0 text-sm font-medium text-gray-900 dark:text-white">
                                            Hourly Rate
                                        </label>
                                        <input
                                            type="text"
                                            name="upto"
                                            id="upto"
                                            className="w-full px-4 py-1 text-xs md:text-sm border rounded-md bg-gray-200"
                                            placeholder="Hourly Rate"
                                            readOnly
                                            value={formData.upto}

                                        />
                                    </div>
                                    <div className="w-full md:w-64">
                                        <label htmlFor="secondTabEmail" className="block mb-0 text-sm font-medium text-gray-900 dark:text-white">
                                            Email (Auto-filled) <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="secondTabEmail"
                                            id="secondTabEmail"
                                            className="w-full px-4 py-1 text-xs md:text-sm border rounded-md bg-gray-200"
                                            placeholder="Enter Email"
                                            required
                                            readOnly
                                            value={formData.secondTabEmail}
                                        />
                                    </div>
                                </div>
                                <div className="w-full md:w-64 flex items-center whitespace-nowrap mt-5">
                                    <label className="font-semibold text-sm"> Type of Employee : </label>
                                    <div className="flex items-center mr-4 ml-5">
                                        <input
                                            type="checkbox"
                                            name="isEmployee"
                                            id="isEmployee"
                                            className="mr-2 cursor-pointer"
                                            checked={selectedRole.isEmployee}
                                            onChange={() => handleCheckboxChange('isEmployee')}
                                        />
                                        <label htmlFor="isEmployee" className="text-sm font-medium text-gray-900 dark:text-white">
                                            Ordinary Employee
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="isSalesEmployee"
                                            id="isSalesEmployee"
                                            className="mr-2 cursor-pointer"
                                            checked={selectedRole.isSalesEmployee}
                                            onChange={() => handleCheckboxChange('isSalesEmployee')}
                                        />
                                        <label htmlFor="isSalesEmployee" className="text-sm font-medium text-gray-900 dark:text-white">
                                            Sales Employee
                                        </label>
                                    </div>
                                </div>

                            </div>
                        </div>
                        {error && <p className="text-red-500">{error}</p>}
                        {successMessage && <p className="text-green-500">{successMessage}</p>}
                        <div className='relative'>
                            <div className="flex items-center justify-center mt-4">
                                {activeTab === 'second' && (
                                    <>
                                        <button
                                            type="submit"
                                            className="col-span-2 bg-blue-700 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg w-64 text-sm md:text-base"
                                        >
                                            Register
                                        </button>
                                        <span
                                            className="absolute right-28 cursor-pointer text-2xl"
                                        >
                                            <FontAwesomeIcon
                                                icon={faWhatsapp}
                                                className='text-white'
                                            />
                                        </span>
                                    </>
                                )}
                                {activeTab === 'first' && (
                                    <button
                                        type="button"
                                        className="col-span-2 bg-blue-700 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg w-64 text-sm md:text-base"
                                        onClick={handleNextClick}
                                    >
                                        Next
                                    </button>
                                )}
                            </div>

                        </div>
                    </form>
                </div>
            </div>
            {/* Modal */}
            {showModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-middle bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:align-middle sm:max-w-md sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">Please fill Phone Number Field</h3>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse justify-center">
                                <button type="button" onClick={() => setShowModal(false)} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EmployeeRegistration;
