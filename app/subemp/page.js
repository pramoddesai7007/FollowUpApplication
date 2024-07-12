// 'use client'
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import NavSide from '../components/NavSide';
// import { faEye, faEyeSlash, faEnvelope,faCircleCheck } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import jwtDecode from 'jwt-decode';



// const SubemployeeForm = () => {
//     const router = useRouter()
//     const [phoneNumberError, setPhoneNumberError] = useState(null);
//     const [subEmployee, setSubEmployee] = useState({
//         name: '',
//         email: '',
//         password: '',
//         adminCompanyName: '', // Pre-fill with the admin company name
//         phoneNumber: '',
//     });
//     const [error, setError] = useState(null);
//     const [successMessage, setSuccessMessage] = useState('');
//     const [showPassword, setShowPassword] = useState(false);
//     const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
//     const [authenticated, setAuthenticated] = useState(true); // Assuming the user is initially authenticated

//     const handleModalClose = () => {
//         setIsSuccessModalOpen(false)
//         router.push('/subList');
//     }

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
//         const userRole = decodedToken.role || 'guest';

//         // Check if the user has the superadmin role
//         if (userRole !== 'admin') {
//             // If the user is not a superadmin, redirect to the login page
//             router.push('/forbidden');
//             return;
//         }

//         // Fetch the admin's company name and pre-fill it in the form
//         const fetchAdminCompany = async () => {
//             try {
//                 const token = localStorage.getItem('authToken'); // Retrieve JWT token from localStorage
//                 const response = await axios.get('http://localhost:5000/api/employee/subemployees/company', {
//                     headers: {
//                         Authorization: token, // Include JWT token in the request headers
//                     },
//                 });
//                 setSubEmployee((prev) => ({
//                     ...prev,
//                     adminCompanyName: response.data.companyName,
//                 }));
//             } catch (error) {
//                 console.error('Error fetching admin company:', error);
//                 setError('Error fetching admin company');
//             }
//         };
//         fetchAdminCompany();
//     }, []);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         // Phone number validation using regex
//         const phoneNumberPattern = /^\d{10}$/; // Matches a 10-digit number
//         if (name === 'phoneNumber' && !phoneNumberPattern.test(value)) {
//             setPhoneNumberError('Phone number should be 10 digits');
//         } else {
//             setPhoneNumberError(null);
//         }
//         setSubEmployee((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         // Send a POST request to create the subemployee
//         try {
//             const token = localStorage.getItem('authToken'); // Retrieve JWT token from localStorage
//             await axios.post('http://localhost:5000/api/employee/registersub', subEmployee, {
//                 headers: {
//                     Authorization: token, // Include JWT token in the request headers
//                 },
//             });
//             setSuccessMessage('Employee registered successfully');
//             setError(null);

//             // Clear the form fields
//             setSubEmployee({
//                 name: '',
//                 email: '',
//                 password: '',
//                 adminCompanyName: subEmployee.adminCompanyName,
//                 phoneNumber: '',
//             });

//             setIsSuccessModalOpen(true)
//             // router.push('/subList');

//         } catch (error) {
//             console.error('Error registering subemployee:', error);
//             setError('Error registering subemployee');
//         }
//     };

//     if (!authenticated) {
//         // Render nothing if not authenticated (or redirect to login)
//         return null;
//       }


//     return (
//         <>
//             <NavSide />
//             <div>

//                 {isSuccessModalOpen && (
//                     <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
//                         <div className="modal-container bg-white sm:w-96 sm:p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
//                             <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={handleModalClose}></button>
//                             <div className="p-2 text-center">
//                                 {/* Customize this section to display your success message */}
//                                 <FontAwesomeIcon icon={faCircleCheck} className='text-3xl md:text-5xl text-green-600 mt-2' />
//                                 <p className="mb-3 text-center justify-center mt-3">
//                                     {successMessage}
//                                 </p>
//                                 <button
//                                     type="button"
//                                     className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 mr-2 text text-xs md:text-base"
//                                     onClick={handleModalClose}
//                                 >
//                                     OK
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//                 <section className="bg-gray-50 dark:bg-gray-900 md:mt-2 mt-5 p-8">
//                     <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
//                         <div className="w-72 md:w-1/2 p-4 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
//                             <h2 className="text-xl font-bold leading-tight tracking-tight text-orange-500 md:text-2xl dark:text-white">
//                                 Create Employee
//                             </h2>
//                             <form onSubmit={handleSubmit} className="mt-2 space-y-2 lg:mt-5 md:space-y-5">
//                                 <div>
//                                     <label htmlFor="name" className="block mb-0 text-sm font-medium text-gray-900 dark:text-white">Name
//                                         <span className="text-red-500 ml-1">*</span>
//                                     </label>
//                                     <input
//                                         type="text"
//                                         name="name"
//                                         id="name"
//                                         className="w-full px-4 py-2 text-xs md:text-sm border rounded-md"
//                                         placeholder="Enter Employee Name"
//                                         required
//                                         value={subEmployee.name}
//                                         onChange={handleChange}
//                                     />
//                                 </div>
//                                 <div>
//                                     <label htmlFor="email" className="block mb-0 text-sm font-medium text-gray-900 dark:text-white">Email
//                                         <span className="text-red-500 ml-1">*</span>
//                                     </label>
//                                     <div className="relative">
//                                         <input
//                                             type="email"
//                                             name="email"
//                                             value={subEmployee.email}
//                                             onChange={handleChange}
//                                             placeholder="Enter Email"
//                                             required
//                                             className="w-full px-4 py-2 text-xs md:text-sm border rounded-md"
//                                         />
//                                         <span className="absolute right-3 top-2 transform -translate-y-0">
//                                             <FontAwesomeIcon
//                                                 icon={faEnvelope}
//                                                 className="text-gray-500"
//                                             />{" "}
//                                             {/* Email icon */}
//                                         </span>
//                                     </div>
//                                 </div>
//                                 <div>
//                                     <label htmlFor="password" className="block mb-0 text-sm font-medium text-gray-900 dark:text-white">Password
//                                         <span className="text-red-500 ml-1">*</span>
//                                     </label>
//                                     <div className="relative">
//                                         <input
//                                             type={showPassword ? "text" : "password"}
//                                             name="password"
//                                             placeholder="Create Password"
//                                             value={subEmployee.password}
//                                             onChange={handleChange}
//                                             required
//                                             className="w-full px-4 py-2 text-xs md:text-sm border rounded-md"
//                                         />
//                                         <span
//                                             className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
//                                             onClick={togglePasswordVisibility}
//                                         >
//                                             <FontAwesomeIcon
//                                                 icon={showPassword ? faEye : faEyeSlash} // Use the imported icons
//                                                 className="text-gray-500"
//                                             />
//                                         </span>
//                                     </div>
//                                 </div>
//                                 <div>
//                                     <label htmlFor="phoneNumber" className="block mb-0 text-sm font-medium text-gray-900 dark:text-white">Phone Number  <span className="text-red-500">*</span>
//                                     </label>
//                                     <input
//                                         type="text"
//                                         name="phoneNumber"
//                                         id="phoneNumber"
//                                         className="w-full px-4 py-2 text-xs md:text-sm border rounded-md"
//                                         placeholder="Enter PhoneNumber"
//                                         value={subEmployee.phoneNumber}
//                                         onChange={handleChange}
//                                         required
//                                     />
//                                     {phoneNumberError && <p className="text-red-500 text-sm mt-1">{phoneNumberError}</p>}

//                                 </div>
//                                 <button
//                                     type="submit"
//                                     className="col-span-2 bg-blue-700 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg w-full text-sm md:text-base"                            >
//                                     Create Employee
//                                 </button>
//                             </form>
//                             {/* {/* {successMessage && <p className="mt-4 text-green-600">{successMessage}</p>} */}
//                             {error && <p className="mt-4 text-red-600">{error}</p>}
//                         </div>
//                     </div>
//                 </section>
//             </div>
//         </>
//     );
// };

// export default SubemployeeForm;






'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import NavSide from '../components/NavSide';
import { faEye, faEyeSlash, faEnvelope, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import jwtDecode from 'jwt-decode';

const SubemployeeForm = () => {
    const router = useRouter()
    const [phoneNumberError, setPhoneNumberError] = useState(null);
    const [subEmployee, setSubEmployee] = useState({
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
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('first');
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [authenticated, setAuthenticated] = useState(true);
    const [selectedRole, setSelectedRole] = useState({
        isEmployee: false,
        isSalesEmployee: false,
    });

    const handleCheckboxChange = (role) => {
        if (role === 'isEmployee') {
            console.log('Selected Role: Ordinary Employee');

            setSelectedRole({ isEmployee: true, isSalesEmployee: false });
            setSubEmployee((prevState) => ({
                ...prevState,
                type: 'Ordinary Employee',
            }));
        } else if (role === 'isSalesEmployee') {
            console.log('Selected Role: Sales Employee');
            setSelectedRole({ isEmployee: false, isSalesEmployee: true });
            setSubEmployee((prevState) => ({
                ...prevState,
                type: 'Sales Employee',
            }));
        }
    };


    const handleModalClose = () => {
        setIsSuccessModalOpen(false);
        router.push('/subList');
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
            setAuthenticated(false);
            router.push('/login');
            return;
        }

        const decodedToken = jwtDecode(token);
        const userRole = decodedToken.role || 'guest';

        if (userRole !== 'admin') {
            router.push('/forbidden');
            return;
        }

        const fetchAdminCompany = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get('http://localhost:5000/api/employee/subemployees/company', {
                    headers: {
                        Authorization: token,
                    },
                });
                setSubEmployee((prev) => ({
                    ...prev,
                    adminCompanyName: response.data.companyName,
                }));
            } catch (error) {
                console.error('Error fetching admin company:', error);
                setError('Error fetching admin company');
            }
        };
        fetchAdminCompany();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const phoneNumberPattern = /^\d{10}$/;

        // Validate phone number
        if (name === 'phoneNumber' && !phoneNumberPattern.test(value)) {
            setPhoneNumberError('Phone number should be 10 digits');
        } else {
            setPhoneNumberError(null);
        }

        setSubEmployee((prevSubEmployee) => {
            const updatedSubEmployee = {
                ...prevSubEmployee,
                [name]: value
            };

            // Calculate the Hourly Rate
            const { salary, dailyShift, totalHrs } = updatedSubEmployee;
            const totalSalary = parseFloat(salary) || 0;
            const dailyShiftValue = parseFloat(dailyShift) || 0;
            const totalHrsValue = parseFloat(totalHrs) || 0;

            if (totalHrsValue !== 0 && dailyShiftValue !== 0) {
                updatedSubEmployee.upto = (totalSalary / totalHrsValue) / dailyShiftValue;
            } else {
                updatedSubEmployee.upto = '';
            }

            return updatedSubEmployee;
        });
    };

    useEffect(() => {
        setSubEmployee((prevSubEmployee) => ({
            ...prevSubEmployee,
            secondTabEmail: prevSubEmployee.email,
        }));
    }, [subEmployee.email]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('Submitting data:', subEmployee);

        try {
            const token = localStorage.getItem('authToken');

            // Register subemployee
            const registerResponse = await axios.post('http://localhost:5000/api/employee/registersub', subEmployee, {
                headers: {
                    Authorization: token,
                },
            });

            console.log('Register response:', registerResponse);

            // Set hourly rate
            const setRateResponse = await axios.post('http://localhost:5000/api/salary/set-rate', {
                name: subEmployee.name,
                email: subEmployee.email,
                hourlyRate: subEmployee.upto,
            });

            console.log('Set rate response:', setRateResponse);

            setSuccessMessage('Employee registered Successfully !');
            setError(null);

            setSubEmployee({
                name: '',
                email: '',
                password: '',
                adminCompanyName: subEmployee.adminCompanyName,
                phoneNumber: '',
                salary: '',
                dailyShift: '',
                totalHrs: '',
                upto: '',
                secondTabEmail: '',
                type: '',
            });
            setIsSuccessModalOpen(true);
        } catch (error) {
            console.error('Error registering subemployee or setting hourly rate:', error);
            setError('Error registering subemployee or setting hourly rate');
        }
    };


    if (!authenticated) {
        return null;
    }

    return (
        <>
            <NavSide />
            <div>
                {isSuccessModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <div className="modal-container bg-white sm:w-96 sm:p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
                            <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={handleModalClose}></button>
                            <div className="p-2 text-center">
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
                <section className="bg-gray-100 dark:bg-gray-900 lg:-mt-2 mt-1 p-8 lg:ml-10 font-sans">
                    <div className="flex flex-col items-center justify-center px-8 py-8 mx-auto md:h-screen lg:py-0 ">
                        <div className="w-full max-w-4xl p-4 bg-white rounded-lg shadow-md dark:border md:mt-0 dark:bg-gray-800 dark:border-gray-700 sm:p-8 ml-24 border-gray-300 border lg:space-x-10">
                            <h2 className="text-xl font-bold leading-tight tracking-tight text-orange-500 md:text-2xl dark:text-white ml-20">
                                {activeTab === 'first' ? 'Create Employee' : 'Salary Details'}
                            </h2>
                            <form onSubmit={handleSubmit} className="mt-2 space-y-2 lg:mt-5 md:space-y-5 ">
                                <div className="w-full mx-auto mt-4 rounded lg:ml-20">
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
                                            <div className="flex flex-wrap grid-cols-3 gap-5">
                                                <div className="w-full md:w-64">
                                                    <label htmlFor="name" className="block mb-0 text-sm font-medium text-gray-900 dark:text-white">
                                                        Name <span className="text-red-500 ml-1">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        id="name"
                                                        className="w-full px-4 py-2 text-xs md:text-sm border rounded-md"
                                                        placeholder="Enter Employee Name"
                                                        required
                                                        value={subEmployee.name}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                <div className="w-full md:w-64">
                                                    <label htmlFor="email" className="block mb-0 text-sm font-medium text-gray-900 dark:text-white">
                                                        Email <span className="text-red-500 ml-1">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            id="email"
                                                            className="w-full px-4 py-2 text-xs md:text-sm border rounded-md"
                                                            placeholder="Enter Employee Email"
                                                            required
                                                            value={subEmployee.email}
                                                            onChange={handleChange}
                                                        />
                                                        <span className="absolute right-3 top-2 transform -translate-y-0">
                                                            <FontAwesomeIcon icon={faEnvelope} className="text-gray-500" />
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="w-full md:w-64">
                                                    <label htmlFor="password" className="block mb-0 text-sm font-medium text-gray-900 dark:text-white">
                                                        Password <span className="text-red-500 ml-1">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            name="password"
                                                            id="password"
                                                            className="w-full px-4 py-2 text-xs md:text-sm border rounded-md"
                                                            placeholder="Enter Password"
                                                            required
                                                            value={subEmployee.password}
                                                            onChange={handleChange}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute inset-y-0 right-0 flex items-center px-2"
                                                            onClick={togglePasswordVisibility}
                                                        >
                                                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="w-full md:w-64">
                                                    <label htmlFor="phoneNumber" className="block mb-0 text-sm font-medium text-gray-900 dark:text-white">
                                                        Phone Number <span className="text-red-500 ml-1">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="phoneNumber"
                                                        id="phoneNumber"
                                                        className="w-full px-4 py-2 text-xs md:text-sm border rounded-md"
                                                        placeholder="Enter Phone Number"
                                                        required
                                                        value={subEmployee.phoneNumber}
                                                        onChange={handleChange}
                                                    />
                                                    {phoneNumberError && <p className="text-red-500 text-xs">{phoneNumberError}</p>}
                                                </div>
                                            </div>
                                        </div>
                                        <div id="second" className={`p-4 ${activeTab === 'second' ? '' : 'hidden'}`}>
                                            <div className="flex flex-wrap grid-cols-3 gap-4">
                                                <div className="w-full md:w-64">
                                                    <label htmlFor="salary" className="block mb-0 text-sm font-medium text-gray-900 dark:text-white">
                                                        Salary <span className="text-red-500 ml-1">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="salary"
                                                        id="salary"
                                                        className="w-full px-4 py-2 text-xs md:text-sm border rounded-md"
                                                        placeholder="Enter Salary"
                                                        required
                                                        value={subEmployee.salary}
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
                                                        className="w-full px-4 py-2 text-xs md:text-sm border rounded-md"
                                                        placeholder="Enter Daily Shift"
                                                        required
                                                        value={subEmployee.dailyShift}
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
                                                        className="w-full px-4 py-2 text-xs md:text-sm border rounded-md"
                                                        placeholder="Enter Total Hours"
                                                        required
                                                        value={subEmployee.totalHrs}
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
                                                        className="w-full px-4 py-2 text-xs md:text-sm border rounded-md bg-gray-200"
                                                        placeholder="Hourly Rate"
                                                        readOnly
                                                        value={subEmployee.upto}

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
                                                        className="w-full px-4 py-2 text-xs md:text-sm border rounded-md bg-gray-200"
                                                        placeholder="Enter Email"
                                                        required
                                                        readOnly
                                                        value={subEmployee.secondTabEmail}
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
                                </div>
                                <div className="flex items-center justify-center mt-4">
                                    {activeTab === 'second' && (
                                        <button
                                            type="submit"
                                            className="col-span-2 bg-blue-700 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg w-64 text-sm md:text-base"
                                        >
                                            Save
                                        </button>
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
                                {error && (
                                    <div className="text-red-500 text-xs mt-2">{error}</div>
                                )}
                            </form>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default SubemployeeForm;