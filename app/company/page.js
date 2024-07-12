'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import NavSideSuper from '../components/NavSideSuper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import jwtDecode from 'jwt-decode';
import NavSide from '../components/NavSide';

const CompanyCreationForm = () => {
  const [companyName, setCompanyName] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [authenticated, setAuthenticated] = useState(true); // Assuming the user is initially authenticated
  const router = useRouter();
  const [userRole, setUserRole] = useState('');

  

  // const handleModalClose = () => {
  //   setIsSuccessModalOpen(false)
  //   router.push('/compList')
  // }


  const handleModalClose = () => {
    setIsSuccessModalOpen(false);
    if (userRole === 'superAdmin') {
      router.push('/compList');
    } else if (userRole === 'admin') {
      router.push('/company');
    } else {
      router.push('/forbidden'); // Optional: handle unexpected roles
    }
  };

  const handleCompanyNameChange = (e) => {
    setCompanyName(e.target.value);
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
    console.log(decodedToken);
    const role = decodedToken.role || 'guest';
    setUserRole(role);

    // Check if the user has the admin or superAdmin role
    if (role !== 'admin' && role !== 'superAdmin') {
      // If the user is not an admin or superAdmin, redirect to the forbidden page
      router.push('/forbidden');
    }
  }, [router]);

  


  const handleSubmit = async (e) => {
    const token = localStorage.getItem('authToken');

    e.preventDefault();

    try {
      const response = await axios.post('http://103.159.85.246:4000/api/company/createCompany', {
        companyName,
      },
        {
          headers: {
            Authorization: token,
          },
        });

      // Handle success
      setCompanyName(''); // Clear the input field
      setSuccessMessage('Company created successfully');
      setIsSuccessModalOpen(true)
      setError(null);

      console.log(response.data);
    } catch (err) {
      // Handle errors
      console.log(err)
      setError(err.response?.data?.errors[0]?.msg || 'An error occurred');
      setSuccessMessage('');
    }
  };
 
  return (
    <>
      {/* <NavSideSuper /> */}
      {userRole === 'admin' && <NavSide />}
      {userRole === 'superAdmin' && <NavSideSuper />}


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
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md mt-4 mr-2 text text-xs md:text-base"
                onClick={handleModalClose}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900">
        <div className=" flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0 mt-20 md:-mt-10 ">
          <div className="w-full p-6 bg-white rounded-lg shadow dark:border sm:max-w-lg dark:bg-gray-800 dark:border-gray-700 sm:p-8 mt-20 border border-gray-300">
            <h2 className="mb-4 text-xl font-bold leading-tight tracking-tight text-orange-600 dark:text-white">
              Create a Company  
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4 md:space-y-5">
              <div>
                <label htmlFor="companyName" className="block mb-2 text-sm text-gray-900 dark:text-white font-semibold">
                  Company Name <span className="text-red-500 text-lg">*</span>

                </label>
                <input
                  type="text"
                  name="companyName"
                  id="companyName"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 text-xs md:text-base"
                  placeholder="Enter Company Name"
                  required
                  value={companyName}
                  onChange={handleCompanyNameChange}
                />
              </div>
              {error && <p className="text-red-600">{error}</p>}
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg w-full"
              >
                Create
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyCreationForm;