// "use client"

// // IPManagement.js
// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import NavSide from '../components/NavSide';
// import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// const IPManagement = () => {
//     const [ipAddress, setIpAddress] = useState('');
//     const [ipList, setIpList] = useState([]);
//     const [errorMessage, setErrorMessage] = useState('');

//     useEffect(() => {
//         fetchIPAddresses();
//     }, []);

//     const fetchIPAddresses = async () => {
//         try {
//             const response = await axios.get('http://103.159.85.246:4000/api/salary/ip');
//             setIpList(response.data);
//         } catch (error) {
//             console.error('Error fetching IP addresses:', error);
//             showError('Failed to fetch IP addresses');
//         }
//     };

//     const fetchUserIPAddress = async () => {
//         try {
//             const response = await axios.get('https://api.ipify.org?format=json');
//             setIpAddress(response.data.ip);
//         } catch (error) {
//             console.error('Error fetching user IP address:', error);
//             showError('Failed to fetch user IP address');
//         }
//     };

//     const handleAddIP = async () => {
//         try {
//             if (!ipAddress) {
//                 showError('IP address cannot be empty');
//                 return;
//             }
//             await axios.post('http://103.159.85.246:4000/api/salary/ip', { ip: ipAddress });
//             setIpAddress('');
//             fetchIPAddresses();
//             setErrorMessage('');
//         } catch (error) {
//             console.error('Error adding IP address:', error);
//             showError('IP address already added');
//         }
//     };

//     const showError = (message) => {
//         setErrorMessage(message);
//         setTimeout(() => {
//             setErrorMessage('');
//         }, 2000);
//     };

//     return (
//         <>
//             <NavSide />
//             <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg space-y-4 mt-20 border-gray-300 border">
//                 <div>
//                     <label htmlFor="ipAddress" className="block text-sm font-medium text-gray-700">IP Address:</label>
//                     <input
//                         id="ipAddress"
//                         type="text"
//                         className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                         value={ipAddress}
//                         onChange={(e) => setIpAddress(e.target.value)}
//                     />
//                 </div>

//                 <div className='justify-between'>
//                 <button
//                     className="inline-flex items-center px-10 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mx-5"
//                     onClick={handleAddIP}
//                 >
//                     Add IP
//                 </button>
//                 <button
//                     className="inline-flex items-center px-8 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-500 hover:bg-gray-600 mt-2"
//                     onClick={fetchUserIPAddress}
//                 >
//                     <FontAwesomeIcon icon={faArrowsRotate} className="mr-2" />
//                     Fetch IP
//                 </button>
//                 </div>
//                 {errorMessage && <p className="text-red-500 font-bold">{errorMessage}</p>}
//                 <h3 className="text-base font-medium">Stored IP Addresses:</h3>
//                 <div className="mt-4 overflow-y-auto max-h-80">
//                     <ul className="mt-2 border border-gray-200 divide-y divide-gray-200 rounded-md font-semibold">
//                         {ipList.map((ip, index) => (
//                             <li key={index} className="px-4 py-3 text-sm">
//                                 {ip}
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default IPManagement;



'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import NavSide from '../components/NavSide';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import jwt_decode from 'jwt-decode'; // Import JWT decode library

const IPManagement = () => {
    const [ipAddress, setIpAddress] = useState('');
    const [ipList, setIpList] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [adminCompanyName, setAdminCompanyName] = useState('');

    useEffect(() => {
        fetchIPAddresses();
        decodeAuthToken(); // Decode auth token on component mount
    }, []);

    const fetchIPAddresses = async () => {
        try {
            const response = await axios.get('http://103.159.85.246:4000/api/salary/ip', {
                headers: {
                    'Authorization': `${localStorage.getItem('authToken')}`
                }
            });
            setIpList(response.data);
        } catch (error) {
            console.error('Error fetching IP addresses:', error);
            showError('Failed to fetch IP addresses');
        }
    };

    const fetchUserIPAddress = async () => {
        try {
            const response = await axios.get('https://api.ipify.org?format=json');
            setIpAddress(response.data.ip);
        } catch (error) {
            console.error('Error fetching user IP address:', error);
            showError('Failed to fetch user IP address');
        }
    };

    const handleAddIP = async () => {
        try {
            if (!ipAddress) {
                showError('IP address cannot be empty');
                return;
            }
            await axios.post('http://103.159.85.246:4000/api/salary/ip', { ip: ipAddress }, {
                headers: {
                    'Authorization': `${localStorage.getItem('authToken')}`
                }
            });
            setIpAddress('');
            fetchIPAddresses();
            setErrorMessage('');
        } catch (error) {
            console.error('Error adding IP address:', error);
            showError('IP address already added');
        }
    };

    const decodeAuthToken = () => {
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
            const decodedToken = jwt_decode(authToken);
            setAdminCompanyName(decodedToken.adminCompanyName);
        }
    };

    const showError = (message) => {
        setErrorMessage(message);
        setTimeout(() => {
            setErrorMessage('');
        }, 2000);
    };

    return (
        <>
            <NavSide />
            <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg space-y-4 mt-20 border-gray-300 border">
                <div>
                    <label htmlFor="ipAddress" className="block text-sm font-medium text-gray-700">IP Address:</label>
                    <input
                        id="ipAddress"
                        type="text"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={ipAddress}
                        onChange={(e) => setIpAddress(e.target.value)}
                    />
                </div>

                <div className='justify-between'>
                <button
                    className="inline-flex items-center px-10 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mx-5"
                    onClick={handleAddIP}
                >
                    Add IP
                </button>
                <button
                    className="inline-flex items-center px-8 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-500 hover:bg-gray-600 mt-2"
                    onClick={fetchUserIPAddress}
                >
                    <FontAwesomeIcon icon={faArrowsRotate} className="mr-2" />
                    Fetch IP
                </button>
                </div>
                {errorMessage && <p className="text-red-500 font-bold">{errorMessage}</p>}
                <h3 className="text-base font-medium">Stored IP Addresses:</h3>
                <div className="mt-4 overflow-y-auto max-h-80">
                    <ul className="mt-2 border border-gray-200 divide-y divide-gray-200 rounded-md font-semibold">
                        {ipList.map((ip, index) => (
                            <li key={index} className="px-4 py-3 text-sm">
                                {ip}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default IPManagement;
