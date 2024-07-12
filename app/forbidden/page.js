// pages/index.js
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Forbidden = () => {
    return (
        <div className="min-h-screen flex items-center justify-center -mt-5 pl-14">
            <div className="text-center w-1/2 mb-5">
                {/* <h1 className="text-4xl font-bold text-blue-500 mb-4">Welcome to the Home Page</h1> */}
                <Image
                 src={'/images/unauth.jpg'}
                 height={600}
                 width={600}
                 alt='403_Forbidden'/>
                <Link href="/" className="font-semibold bg-red-500 rounded-md text-white py-2 px-4">Go to Home
                </Link>
            </div>
        </div>
    );
};

export default Forbidden;
