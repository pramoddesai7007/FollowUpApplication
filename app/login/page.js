

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons';


const LoginForm = () => {
    const router = useRouter();

    // const handleAdminLogin = () => {
    //     // Redirect to the admin login page
    //     router.push('/adminLogin');
    // };

    const handleEmployeeLogin = () => {
        // Redirect to the employee login page
        router.push('/employeeLogin');
    };

    const handleSubEmployeeLogin = () => {
        // Redirect to the subemployee login page
        router.push('/subEmployeeLogin'); // Replace with your subemployee login route
    };

    // const backgroundImageUrl = 'https://img.freepik.com/free-vector/simple-blue-blank-background-vector-business_53876-175738.jpg?w=1060&t=st=1697710227~exp=1697710827~hmac=2ab6a050d4771018bf7db10f8ffd2245b223c5a37195b37716e080c4a5f0cf5c';
    
    const backgroundImageUrl = 'https://c4.wallpaperflare.com/wallpaper/253/638/452/light-background-hd-wallpaper-preview.jpg';

    return (
        <div className="bg-no-repeat bg-cover min-h-screen flex items-center justify-center sm:px-6 lg:px-8 bg-red-900" style={{ backgroundImage: `url(${backgroundImageUrl})` }}>
            <div className="border border-gray-500 rounded-md max-w-md w-3/4 md:w-1/2 space-y-8 p-10 bg-white ">
                <div className="text-center">
                    <Image
                        src="/images/main_login1.png"
                        alt="login"
                        width={150}
                        height={150}
                        className="mx-auto max-w-32"
                    />
                    <h2 className="mt-1 text-xl md:text-4xl font-extrabold text-indigo-900 pl-10">I am<span className='text-gray-400 pl-5 text-3xl'><FontAwesomeIcon icon={faRightToBracket} /> </span></h2>
         
                </div>
                <div className="flex justify-center space-x-2 md:space-x-8">
                    {/* <button
                        onClick={handleAdminLogin}
                        className="bg-indigo-500 hover:bg-blue-600 text-white font-semibold px-2 md:px-2 py-2 md:py-2 rounded-lg md:rounded-md text-xs md:text-base"
                    >
                        SuperAdmin
                    </button> */}

                    <button
                        onClick={handleEmployeeLogin}
                        className="bg-indigo-500 hover:bg-blue-600 text-white font-semibold px-2 md:px-6 py-2 md:py-2 rounded-lg md:rounded-md text-xs md:text-base"
                    >
                        Admin
                    </button>

                    <button
                        onClick={handleSubEmployeeLogin}
                        className="bg-indigo-500 hover:bg-blue-600 text-white font-semibold px-2 md:px-4 py-2 md:py-2 rounded-lg md:rounded-md text-xs md:text-base"
                    >
                        Employee
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
