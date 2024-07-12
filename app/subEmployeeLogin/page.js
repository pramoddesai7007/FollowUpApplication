'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons';


const SubEmployeeLoginForm = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false)

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setError(null)
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setError(null)
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://103.159.85.246:4000/api/subemployee/login', {
                email,
                password,
            });

            console.log('Authentication successful', response.data);
            const token = response.data.token;

            localStorage.setItem('authToken', token);
            localStorage.setItem('subUsername', email);

            router.push('/');

        } catch (error) {
            console.error('Error logging in sub-employee:', error);
            setError('Invalid credentials. Please check your email and password.');
        }
    };


    const backgroundImageUrl = "https://img.freepik.com/free-vector/simple-blue-blank-background-vector-business_53876-175738.jpg?w=1060&t=st=1697710227~exp=1697710827~hmac=2ab6a050d4771018bf7db10f8ffd2245b223c5a37195b37716e080c4a5f0cf5c";

    return (
        <section className=" bg-gray-50 dark:bg-gray-900">

            <div className="bg-no-repeat bg-cover min-h-screen flex items-center justify-center sm:px-6 lg:px-8"
                style={{ backgroundImage: `url(${backgroundImageUrl})` }}>
                <div className="sm:w-1/2 md:w-1/3 lg:w-1/3 p-6 bg-white rounded-lg shadow-md mt-5">
                    <div className="flex items-center justify-center">
                        <Image
                            src="/images/teamwork.png"
                            alt="img"
                            width={80}
                            height={80}
                        />
                    </div>
                    <h1 className="text-xl md:text-2xl font-semibold text-center mb-5 mt-5">Employee Login</h1>

                    <form onSubmit={handleSubmit} className="mt-2 space-y-4">
                        <div>
                            <label className="block text-xs md:text-sm font-medium">Email
                            <span className="text-red-500 pl-1">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    placeholder="Enter Your Email"
                                    required
                                    className="w-full text-xs md:text-base px-4 py-2 border rounded-md focus:ring focus:ring-indigo-400"
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <FontAwesomeIcon icon={faEnvelope} className="text-gray-500" />
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs md:text-sm font-medium">Password
                            <span className="text-red-500 pl-1">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="*******"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-indigo-400"
                                />
                                <span
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                    onClick={togglePasswordVisibility}
                                >
                                    <FontAwesomeIcon
                                        icon={showPassword ? faEyeSlash : faEye} // Use the imported icons
                                        className="text-gray-500"
                                    />
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-end">
                            <Link href="/forgotPasswordSub" className="text-xs md:text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</Link>
                        </div>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md mb-3">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-2 px-4 text-xs md:text-lg text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-400"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
            <footer className="text-center text-black-500 text-xs md:text-base md:-mt-10 -mt-5">
                    &copy;AB Software Solution. All rights reserved.
                </footer>
        </section>

    );
};

export default SubEmployeeLoginForm;


// 'use client'
// import React, { useState } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import Image from 'next/image';
// import Link from 'next/link';


// const SubEmployeeLoginForm = () => {
//     const router = useRouter();
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState(null);

//     const handleEmailChange = (e) => {
//         setEmail(e.target.value)
//     };


//     const handlePasswordChange = (e) => {
//         setPassword(e.target.value)
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         try {
//             // Send a POST request to the /login endpoint for sub-employees
//             const response = await axios.post('http://103.159.85.246:4000/api/subemployee/login', {
//                 email,
//                 password,
//             });

//             console.log('Authentication successful', response.data);
//             const token = response.data.token;

//             localStorage.setItem('authToken', token);
//             localStorage.setItem('subUsername', email); // Save the email or any other user information

//             router.push('/'); // Redirect to the employee dashboard or any other route

//         } catch (error) {
//             // Handle any errors that occur during the request
//             console.error('Error logging in sub-employee:', error);
//             setError('An error occurred. Please try again later.');
//         }
//     };

//     const backgroundImageUrl = 'https://exergic.in/wp-content/uploads/2018/04/Orange-Background-Vector-Wallpaper.jpg';


//     return (
//         <>
//             <div className="min-h-screen flex items-center justify-center sm:px-6 lg:px-8"
//                 style={{ backgroundImage: `url(${backgroundImageUrl})` }}>
//                 <div className="w-1/3 p-6 bg-white rounded-lg shadow-md mt-5">
//                     <div className="flex items-center justify-center">
//                         <Image
//                             src="/images/log.png"
//                             alt="img"
//                             width={100}
//                             height={100} // You can adjust the height as needed
//                         />
//                     </div>
//                     <h2 className="text-2xl font-semibold text-center mb-5 mt-5">Employee Login</h2>
//                     <form onSubmit={handleSubmit} className="mt-2 space-y-4">
//                         <div>
//                             <label className="block text-sm font-medium">Email:</label>
//                             <input
//                                 type="email"
//                                 name="email"
//                                 value={email}
//                                 onChange={handleEmailChange}
//                                 placeholder='example@gmail.com'
//                                 required
//                                 className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-indigo-400 "
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium">Password:</label>
//                             <input
//                                 type="password"
//                                 name="password"
//                                 placeholder='******'
//                                 value={password}
//                                 onChange={handlePasswordChange}
//                                 required
//                                 className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-indigo-400"
//                             />
//                         </div>
//                         <div className="flex items-center justify-end">
//                             <Link href="/forgotPasswordSub" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</Link>
//                         </div>


//                         <button
//                             type="submit"
//                             className="w-full py-2 px-4 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-400"
//                         >
//                             Login
//                         </button>
//                     </form>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default SubEmployeeLoginForm;
