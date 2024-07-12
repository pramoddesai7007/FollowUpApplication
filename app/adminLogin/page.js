'use client'

import React, { useState } from "react";
import axios from "axios"; // Import Axios
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { faEye, faEyeSlash, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null); // State for error message


  const router = useRouter();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError(null);

  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError(null);

  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Request Data:", { username: email, password });

    try {
      const response = await axios.post("http://103.159.85.246:4000/api/auth/login", {
        username: email, // Assuming you use email as the username
        password: password,
      });

      // Handle successful login here, e.g., store the token in localStorage or state.
      console.log("Authentication successful", response.data);
      const token = response.data.token;

      localStorage.setItem("authToken", token);
      localStorage.setItem("username", email); // Save the username

      router.push("/vectorSuper");
    } catch (error) {
      // Handle login error here, e.g., display an error message.
      console.error("Authentication failed", error);
      setError('Invalid Email or Password');

    }
  };

  const backgroundImageUrl =
    "https://img.freepik.com/free-vector/simple-blue-blank-background-vector-business_53876-175738.jpg?w=1060&t=st=1697710227~exp=1697710827~hmac=2ab6a050d4771018bf7db10f8ffd2245b223c5a37195b37716e080c4a5f0cf5c";

  return (
    <>
      <section className=" bg-gray-50 dark:bg-gray-900">
        <div className="bg-no-repeat bg-cover min-h-screen flex items-center justify-center sm:px-6 lg:px-8"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        >

          <div className="sm:w-1/2 md:w-1/3 lg:w-1/3 p-8 bg-white rounded-lg shadow-md mt-5">
            <div className="flex items-center justify-center">
              <Image
                src="/images/super.jpeg"
                alt="login"
                width={70} // Set your desired width
                height={10} // Set your desired height
                className="mx-auto max-w-40 h-13"
              />
            </div>
            <h1 className="text-lg md:text-2xl text-center font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
              SuperAdmin Login
            </h1>

            <form
              className="space-y-4 md:space-y-4"
              action="#"
              onSubmit={handleSubmit}
            >
              <div className="-mb-2 md:mb-0 mt-2">
                <label
                  htmlFor="email"
                  className="block mb-2 text-xs md:text-sm font-medium text-gray-900 dark:text-white"
                >
                  Email
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
                    className="w-full px-4 py-2 text-xs md:text-sm border rounded-md focus:ring  focus:ring-indigo-400 "
                  />
                  <span className="absolute right-3 top-2 transform -translate-y-0">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="text-gray-500"
                    />{" "}
                  </span>

                </div>
              </div>
              <div className="mb-10">
                <label
                  htmlFor="password"
                  className="block mb-2 text-xs md:text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                  <span className="text-red-500 pl-1">*</span>

                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter Your Password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-4 py-2 text-xs md:text-sm border rounded-md focus:ring focus:ring-indigo-400"
                  />
                  <span
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    onClick={togglePasswordVisibility}
                  >
                    <FontAwesomeIcon
                      icon={showPassword ? faEye : faEyeSlash} // Use the imported icons
                      className="text-gray-500"
                    />
                  </span>
                </div>

              </div>
              <div className="flex items-center justify-end">
                <Link
                  href="/forgotPassword"
                  className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-500 md:text-sm"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="w-48 md:w-full">
                {error && (
                  <div className="text-center bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-md text-xs md:text-xs font-semibold md:font-bold p-5" role="alert ">
                    {error}
                  </div>

                )}
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-sm md:text-base hover:bg-blue-800 text-white font-medium w-full py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Login
              </button>
            </form>

          </div>

        </div>
        <footer className="text-center text-black-500 text-xs md:text-base -mt-10">
          &copy;AB Software Solution. All rights reserved.
        </footer>

      </section>
    </>
  );
};

export default LoginForm;