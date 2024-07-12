'use client'
import React, { useEffect, useState } from "react";
import { Chart } from "chart.js";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserCheck, faUserXmark, faBars } from '@fortawesome/free-solid-svg-icons';
import NavSideSuper from "../components/NavSideSuper";
import { useRouter } from "next/navigation";
import jwtDecode from 'jwt-decode';


const labelStyles = [
  {
    label: "Total Companies",
    icon: faBars,
    iconColor: "purple",
    iconSize: "1x",

  },
  {
    label: "Total Users",
    icon: faUsers,
    iconColor: "green",
    iconSize: "1x",
  },
  {
    label: "Active Users",
    icon: faUserCheck,
    iconColor: "blue",
    iconSize: "1x",
  },
  {
    label: "Inactive Users",
    icon: faUserXmark,
    iconColor: "red",
    iconSize: "1x",
  },
];

const VectorSuper = () => {
  const [chartData, setChartData] = useState([]);
  const [hasData, setHasData] = useState(false); // Track if data exists
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [authenticated, setAuthenticated] = useState(true); // Assuming the user is initially authenticated

  const router = useRouter();



  const handleLabelClick = (label) => {
    setSelectedLabel(label);
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
    if (userRole !== 'superAdmin') {
      // If the user is not a superadmin, redirect to the login page
      router.push('/forbidden');
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get("http://103.159.85.246:4000/api/company/companyCounts", {
          headers: {
            Authorization: token,
          },
        });

        console.log(response.data)
        if (response.data) {
          const taskCounts = response.data;
          const chartData = [
            taskCounts.totalCompanies,
            taskCounts.totalEmployees,
            taskCounts.uniqueActiveEmployeesCount,
            taskCounts.inactiveEmployeesCount,
          ];

          setChartData(chartData);
          setHasData(chartData.some(data => data > 0)); // Check if any data exists
        } else {
          setHasData(false); // No data available
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        setHasData(false); // Set hasData to false if an error occurs

      }
    };

    fetchData();
  }, [router]);

  useEffect(() => {
    if (hasData) {
      let ctx = document.getElementById("myChart").getContext("2d");
      let myChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          datasets: [
            {
              data: chartData,
              borderColor: ["white", "white", "white", "white", "white", "white"],
              backgroundColor: ["rgb(128, 0, 128)", "rgb(34, 139, 34)", "rgb(0, 71, 171)", "rgb(210, 4, 45)", "rgb(205, 127, 50)", "rgb(255, 215, 0)"],
              borderWidth: 2,
            },
          ],
        },
        options: {
          cutoutPercentage: 50,
          tooltips: {
            callbacks: {
              label: function (tooltipItem, data) {
                const labelIndex = tooltipItem.index;
                const label = labelStyles[labelIndex].label;
                const value = data.datasets[0].data[labelIndex];
                return `${label}: ${value}`;
              },
            },
          },
        },
      });
    }
  }, [chartData, hasData]);


  const TotalCompanies = () => {
    router.push('/compList');
  };

  const TotalUsers = () => {
    router.push('/userList');
  };

  const ActiveUsers = () => {
    router.push('/activeUsers');
  };

  const InactiveuserList = () => {
    router.push('/inactiveUsers');
  };

  if (!authenticated) {
    // If the user is not authenticated, render nothing (or a message) and redirect to login
    return null;
}

  return (
    <>
      <NavSideSuper />
      <div className="mt-20"></div>
      <div className="w-full h-screen flex flex-col items-center overflow-x-hidden">
        <div className="desktop-box p-4 m-4 bg-white rounded-lg text-center text-2xl font-bold text-red-800">
          <h1>Dashboard</h1>
          <div className="w-full flex justify-center items-center mt-2">
            {hasData ? (
              <canvas id="myChart" className="cursor-pointer desktop-graph"></canvas>
            ) : (
              <div className="static-circle mr-40" style={{ width: '430px', height: '430px', borderRadius: '50%', backgroundColor: 'gray', position: 'relative' }}>
                <div className="donut-chart" style={{ position: 'absolute', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(circle at center, lightgray 0%, white 0%)', top: '25%', left: '25%' }}></div>
              </div>
            )}
          </div>


          <div className="text-center text-sm desktop-labels pt-14 pl-3 text-md md:text-base">
            {labelStyles.map((item, index) => (
              <div
                key={index}
                className={`flex items-center justify-start mb-1 ${isMobileView() ? "mobile-label-box" : "desktop-label-box"}`}
                onClick={() => handleLabelClick(item.label)}
                style={{ cursor: "pointer" }}
              >
                <div
                  className={`label-box ${isMobileView() ? "label-box-mobile" : ""}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px",
                    borderRadius: "4px",
                    boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
                    marginBottom: "8px",
                    fontSize: "14px", // Set a fixed font size for all labels
                    width: isMobileView() ? "300px" : "200px", // Set width based on view
                  }}
                >
                  <div style={{ color: item.iconColor, marginRight: "8px" }}>
                    <FontAwesomeIcon icon={item.icon} size={item.iconSize} style={{ marginRight: "10px" }} />
                  </div>
                  <p style={{ color: item.iconColor, fontSize: "14px", margin: "0" }}>{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>


        {selectedLabel && (
          <div className="list-container">
            {selectedLabel === "Total Companies" && <TotalCompanies />}
            {selectedLabel === "Total Users" && <TotalUsers />}
            {selectedLabel === "Active Users" && <ActiveUsers />}
            {selectedLabel === "Inactive Users" && <InactiveuserList />}

          </div>
        )}
      </div>
      <style>{`
        @media (min-width: 768px) {
          .desktop-graph {
            width: 100%;
            margin-right: 250px;
          }
          .desktop-box {
            width: 65%;
            position: absolute;
            box-shadow: 0 3px 3px -3px gray, 0 -3px 3px -3px gray, -3px 0 3px -3px gray, 3px 0 3px -3px gray;
            right: 6%;
          }
          .desktop-labels {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            right: 70px;
          }
          .desktop-label-box {
            display: flex;
            align-items: center;
          }
        }

        @media (max-width: 767px) {
          .mobile-graph {
            width: 90%;
          }
          .mobile-box {
            width: 100%;
            right: auto;
          }
          .mobile-labels {
            text-align: center;
          }
          .mobile-label-box {
            display: flex;
            align-items: center;
          }
          .label-box-mobile {
            margin-right: 10px;
          }
        }
      `}</style>
    </>
  );
};

const isMobileView = () => {
  // Check if window is defined to prevent ReferenceError during server-side rendering
  return typeof window !== 'undefined' && window.innerWidth <= 767;
};

export default VectorSuper;
