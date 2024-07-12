'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import NavSide from '@/app/components/NavSide';
import Image from 'next/image'; // Import the Image component from 'next/image'


const EditForm = ({ params }) => {
    const router = useRouter();
    const { taskId } = params;
    const [taskData, setTaskData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [assignees, setAssignees] = useState([]); // Define the assignees state variable
    const [successMessage, setSuccessMessage] = useState(''); // Initialize success message state
    const [subemployees, setSubemployees] = useState([]);
    const [pictureFile, setPictureFile] = useState(null); // State for the new picture file
    const [audioFile, setAudioFile] = useState(null); // State for the new audio file
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [completeImageUrl, setPreviewImageUrl] = useState('');
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false); // Add state for error modal
    const [error, setError] = useState(''); // Add state for error message
    

    useEffect(() => {
        // Fetch task data by taskId when the component mounts
        const fetchTaskData = async () => {
            try {
                const authToken = localStorage.getItem('authToken'); // Retrieve the authToken from localStorage

                const response = await axios.get(`http://103.159.85.246:4000/api/task/${taskId}`, {
                    headers: {
                        Authorization: authToken, // Include the authToken in the headers
                    },
                });
                if (response.status === 200) {
                    const retrievedTaskData = response.data;
                    if (retrievedTaskData.audio && typeof retrievedTaskData.audio === 'object') {
                        retrievedTaskData.audio = retrievedTaskData.audio.name; // Or another property name that holds the audio file name
                    }
                    setTaskData(retrievedTaskData);
                } else {
                    console.error('Failed to fetch task data');
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Error:', error);
                setIsLoading(false);
            }
        };

        const fetchAssignees = async () => {
            axios
                .get('http://103.159.85.246:4000/api/employee/subemployees/list', {
                    headers: {
                        Authorization: localStorage.getItem('authToken'), // Include your JWT token here
                    },
                })
                .then((response) => {
                    // Extract subemployee names and IDs from the response
                    const subemployeeList = response.data.map((subemployee) => ({
                        id: subemployee._id,
                        name: subemployee.name,
                    }));
                    setSubemployees(subemployeeList);
                })
                .catch((error) => {
                    console.error('Error fetching subemployees:', error);
                })
        };

        if (taskId) {
            fetchTaskData();
        }

        // Fetch assignees when the component mounts
        fetchAssignees();
    }, [taskId]);
    console.log(taskId)

    // const handleFormSubmit = async (e) => {
    //     e.preventDefault();

    //     const formData = new FormData();
    //     formData.append('taskData', JSON.stringify(taskData));
    //     formData.append('picture', pictureFile); // Assuming pictureFile holds the file object
    //     if (audioFile) {
    //         formData.append('audio', audioFile); // Assuming 'audio' is the key name on the server for audio files
    //     }
    //     console.log(pictureFile)

    //     try {
    //         const authToken = localStorage.getItem('authToken');

    //         const response = await fetch(`http://103.159.85.246:4000/api/task/edit/${taskId}`, {
    //             method: 'PUT',
    //             headers: {
    //                 Authorization: authToken,
    //             },
    //             body: formData, // Set the form data here
    //         });

    //         if (response.ok) {
    //             const data = await response.json();
    //             console.log('Task updated successfully:', data);
    //             router.push(`/taskList`);
    //         } else {
    //             console.error('Failed to update task');
    //         }
    //     } catch (error) {
    //         console.error('Error:', error);
    //     }
    // };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('taskData', JSON.stringify(taskData));
        formData.append('picture', pictureFile);
        if (audioFile) {
            formData.append('audio', audioFile);
        }

        try {
            const authToken = localStorage.getItem('authToken');

            const response = await fetch(`http://103.159.85.246:4000/api/task/edit/${taskId}`, {
                method: 'PUT',
                headers: {
                    Authorization: authToken,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Task updated successfully:', data);
                router.push(`/taskList`);
            } else {
                if (response.status === 401) {
                    // Unauthorized user error
                    setError('You are not authorized to update this task.');
                    setIsErrorModalOpen(true);
                } else {
                    // Other errors
                    console.error('Failed to update task');
                    setError('Not Authorised to Update Task !'); // Update error state with a general message
                    setIsErrorModalOpen(true);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            setError('An error occurred'); // Update error state with a general message
            setIsErrorModalOpen(true);
        }
    };

    const handlePicturePreview = (imageUrl) => {
        const completeImageUrl = `http://103.159.85.246:4000/${imageUrl}`; // Generate the complete image URL
        console.log(completeImageUrl)
        setPreviewImageUrl(completeImageUrl);
        setIsPreviewModalOpen(true);
    };

    const handlePictureChange = (e) => {
        // Set the selected picture file in the state
        setPictureFile(e.target.files[0]);
    };

    const handleAudioChange = (e) => {
        // Set the selected audio file in the state
        const newAudioFile = e.target.files[0];
        setAudioFile(newAudioFile);
        // Update taskData with the new audio file
        setTaskData({ ...taskData, audio: newAudioFile.name });
    };

    const handleErrorModalClose = () => {
        setIsErrorModalOpen(false);
    };


    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <NavSide />

            {isErrorModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-container bg-white sm:w-96 sm:p-6 rounded shadow-lg">
                        <button
                            type="button"
                            className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            onClick={handleErrorModalClose}
                        ></button>
                        <div className="p-2 text-center">
                            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">Error</h3>
                            <p className="mb-3 text-center justify-center mt-3">{error}</p>
                            <button
                                type="button"
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4 mr-2 text-xs md:text-base"
                                onClick={handleErrorModalClose}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="w-full md:flex justify-center items-center min-h-screen md:mt-5 md:pl-28 bg-slate-50">
                <div className="w-full md:max-w-2xl overflow-x-auto border border-gray-200 rounded-lg p-5 bg-white mt-16">
                    {successMessage && (<div className="mb-4 text-green-500">{successMessage}</div>)}
                    <div className=" col-span-2 mb-3 md:text-2xl font-bold text-orange-500 text-left">Edit Task</div>
                    <div className="mb-1">
                        <label htmlFor="title" className="block font-semibold text-xs lg:text-sm">Title</label>
                        <input
                            type="text"
                            id="title"
                            className="border-2 border-gray-200 rounded-md px-3 py-2 w-full "
                            placeholder="Title"
                            value={taskData.title || ''}
                            onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-1">
                        <label htmlFor="description" className="block font-semibold text-xs lg:text-sm">Description</label>
                        <textarea
                            id="description"
                            className="border-2 border-gray-200 rounded-md px-3 py-2 w-full"
                            placeholder="Description"
                            value={taskData.description || ''}
                            onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                            rows="4"
                        />
                    </div>

                    <div className="mb-2">
                        <label htmlFor="assignTo" className="block font-semibold text-xs lg:text-sm">Assign To</label>
                        <select
                            id="assignTo"
                            className="border-2 border-gray-200 rounded-md px-3 py-1 w-full"
                            value={taskData.assignTo || ''}
                            onChange={(e) => {
                                // Find the subemployee object corresponding to the selected _id
                                const selectedSubemployee = subemployees.find(
                                    (subemployee) => subemployee.id === e.target.value
                                );
                                setTaskData({ ...taskData, assignTo: selectedSubemployee.id });

                            }}
                        >

                            <option value="">Select an Assign To</option>
                            {subemployees.map((subemployee) => (
                                <option key={subemployee.id} value={subemployee.id}>
                                    {subemployee.name}
                                </option>
                            ))}
                        </select>
                    </div>


                    <form onSubmit={handleFormSubmit} className="grid grid-cols-2 gap-4">
                        <div className="mb-1">
                            <label htmlFor="startDate" className="block font-semibold text-xs lg:text-sm">Start Date</label>
                            <input
                                type="date"
                                id="startDate"
                                className="border-2 border-gray-200 rounded-md px-2 py-1 w-32 md:w-full" // Adjust the width for mobile and larger screens
                                value={taskData.startDate ? taskData.startDate.slice(0, 10) : ''}
                                onChange={(e) => setTaskData({ ...taskData, startDate: e.target.value })}
                            />
                        </div>


                        <div className="mb-1">
                            <label htmlFor="startTime" className="block font-semibold text-xs lg:text-sm md:pl-7">Start Time</label>
                            <div className="flex items-center md:pl-6">
                                <select
                                    name="startHour"
                                    value={taskData.startTime.split(':')[0]}
                                    onChange={(e) => {
                                        const newHour = e.target.value;
                                        const newStartTime = `${newHour}:${taskData.startTime.split(':')[1].split(' ')[0]} ${taskData.startTime.split(' ')[1]}`;
                                        setTaskData({ ...taskData, startTime: newStartTime });
                                    }}
                                    className="border border-gray-200 rounded-md md:px-2 py-1.5 mr-1"
                                    required
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i} value={i === 0 ? '12' : i.toString().padStart(2, '0')}>
                                            {i === 0 ? '12' : i.toString().padStart(2, '0')}
                                        </option>
                                    ))}
                                </select>

                                <span><strong>: </strong></span>

                                <select
                                    name="startMinute"
                                    value={taskData.startTime.split(':')[1].split(' ')[0]}
                                    onChange={(e) => {
                                        const newMinute = e.target.value;
                                        const newStartTime = `${taskData.startTime.split(':')[0]}:${newMinute} ${taskData.startTime.split(' ')[1]}`;
                                        setTaskData({ ...taskData, startTime: newStartTime });
                                    }}
                                    className="border border-gray-200 rounded-md md:px-2 py-1.5 mr-2"
                                    required
                                >
                                    {Array.from({ length: 60 }, (_, i) => (
                                        <option key={i} value={i.toString().padStart(2, '0')}>
                                            {i.toString().padStart(2, '0')}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    name="startAmPm"
                                    value={taskData.startTime.split(' ')[1]}
                                    onChange={(e) => {
                                        const newAmPm = e.target.value;
                                        const newStartTime = `${taskData.startTime.split(':')[0]}:${taskData.startTime.split(':')[1].split(' ')[0]} ${newAmPm}`;
                                        setTaskData({ ...taskData, startTime: newStartTime });
                                    }}
                                    className="border border-gray-200 rounded-md md:px-2 py-1.5"
                                    required
                                >
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                </select>
                            </div>
                        </div>


                        <div className="mb-1">
                            <label htmlFor="deadlineDate" className="block font-semibold text-xs lg:text-sm">Deadline Date</label>
                            <input
                                type="date"
                                id="deadlineDate"
                                className="border-2 border-gray-200 rounded-md px-2 py-1 w-32 md:w-full" // Adjust the width for mobile and larger screens
                                value={taskData.deadlineDate ? taskData.deadlineDate.slice(0, 10) : ''}
                                onChange={(e) => setTaskData({ ...taskData, deadlineDate: e.target.value })}
                            />
                        </div>


                        <div className="mb-1">
                            <label htmlFor="endTime" className="block font-semibold md:pl-7 text-xs lg:text-sm ">
                                End Time
                            </label>
                            <div className="flex items-center md:pl-6">
                                <select
                                    name="endHour"
                                    value={taskData.endTime.split(':')[0]}
                                    onChange={(e) => {
                                        const newHour = e.target.value;
                                        const newEndTime = `${newHour}:${taskData.endTime.split(':')[1]} ${taskData.endTime.split(' ')[1]}`;
                                        setTaskData({ ...taskData, endTime: newEndTime });
                                    }}
                                    className="border border-gray-200 rounded-md md:px-2 py-1.5 mr-1"
                                    required
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i} value={i === 0 ? '12' : i.toString().padStart(2, '0')}>
                                            {i === 0 ? '12' : i.toString().padStart(2, '0')}
                                        </option>
                                    ))}
                                </select>

                                <span><strong>:</strong></span>
                                <select
                                    name="endMinute"
                                    value={taskData.endTime.split(':')[1].split(' ')[0]}
                                    onChange={(e) => {
                                        const newMinute = e.target.value;
                                        const newEndTime = `${taskData.endTime.split(':')[0]}:${newMinute} ${taskData.endTime.split(' ')[1]}`;
                                        setTaskData({ ...taskData, endTime: newEndTime });
                                    }}
                                    className="border border-gray-200 rounded-md md:px-2 py-1.5 mr-2"
                                    required
                                >
                                    {Array.from({ length: 60 }, (_, i) => (
                                        <option key={i} value={i.toString().padStart(2, '0')}>
                                            {i.toString().padStart(2, '0')}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    name="endAmPm"
                                    value={taskData.endTime.split(' ')[1]}
                                    onChange={(e) => {
                                        const newAmPm = e.target.value;
                                        const newEndTime = `${taskData.endTime.split(':')[0]}:${taskData.endTime.split(':')[1].split(' ')[0]} ${newAmPm}`;
                                        setTaskData({ ...taskData, endTime: newEndTime });
                                    }}
                                    className="border border-gray-200 rounded-md md:px-2 py-1.5 mr-2"
                                    required
                                >
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                </select>

                            </div>
                        </div>




                        {/* <div className="mb-2">
                            <label htmlFor="picture" className="block font-semibold text-xs lg:text-sm">
                                Picture
                            </label>
                            {taskData.picture && ( // Check if the picture exists in taskData
                                <div className="mb-1">Current Picture: {taskData.picture}</div>
                            )}
                            <input
                                type="file"
                                id="picture"
                                accept="image/*"
                                className="w-full px-4 py-1 border rounded-lg focus:outline-none focus:border-blue-400"
                                onChange={handlePictureChange}
                            />

                        </div> */}
                        <div className="mb-2">
                            {/* <label htmlFor="picture" className="block font-semibold text-xs lg:text-sm">
                                Picture
                            </label>
                            {taskData.picture && (
                                <div className="mb-1">
                                    Current Picture: {taskData.picture}
                                    <button
                                        onClick={() => window.open(`http://103.159.85.246:4000/${taskData.picture}`)}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg ml-4"
                                    >
                                        Preview
                                    </button>
                                </div>
                            )} */}
                            <p className="mb-2 text-left justify-center">
                                <strong>Picture:</strong>{" "}
                                {taskData.picture ? (
                                    <button
                                        type="button"
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-1 ml-2"
                                        onClick={() => handlePicturePreview(taskData.picture)}
                                    >
                                        Preview
                                    </button>
                                ) : (
                                    "Not Added"
                                )}
                            </p>
                            <input
                                type="file"
                                id="picture"
                                accept="image/*"
                                className="w-full px-4 py-1 border rounded-lg focus:outline-none focus:border-blue-400"
                                onChange={handlePictureChange}
                            />
                        </div>



                        {/* <div className="mb-2">
                            <label htmlFor="audio" className="block font-semibold text-xs lg:text-sm">
                                Audio
                            </label>
                            {taskData.audio && (
                                <div className="mb-1">Current Audio: {taskData.audio}</div>
                            )}
                            <input
                                type="file"
                                id="audio"
                                accept="audio/*"
                                className="w-full px-4 py-1 border rounded-lg focus:outline-none focus:border-blue-400"
                                onChange={handleAudioChange}
                            />
                        </div> */}

                        {isPreviewModalOpen && (
                            <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                                <div className="modal-container bg-white w-96 p-6 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
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

                        <div className="mb-2">
                            <label htmlFor="audio" className="block font-semibold text-xs lg:text-sm">
                                Audio
                            </label>
                            <p className="mb-2 text-left flex item-center">
                                {taskData.audio ? (
                                    <audio controls className='w-64 h-8 md:w-96 md-h-10 text-lg'>
                                        <source src={`http://103.159.85.246:4000/${taskData.audio}`} type="audio/mp3" />
                                        Your browser does not support the audio element.
                                    </audio>

                                ) : (
                                    "Not Added"
                                )}
                            </p>
                            <input
                                type="file"
                                id="audio"
                                accept="audio/*"
                                className="w-full px-4 py-1 border rounded-lg focus:outline-none focus:border-blue-400"
                                onChange={handleAudioChange}
                            />
                        </div>


                        <button
                            type="submit"
                            className="col-span-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mb-4"
                        >
                            Update Task
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default EditForm;