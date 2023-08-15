// NextCustomerPage.js
import React, { useEffect, useRef, useState } from 'react';
import DvdLogo from './FoodIcon';
import { toast } from 'react-toastify'; // Assuming you're using react-toastify for toast notifications
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NextCustomerPage = () => {
  // Assuming you have the customer number stored in a variable
  // const [data, setData] = useState([]);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [sessionId, setSessionId] = useState(generateUniqueSessionId());
  const isToastVisibleRef = useRef(false);

  useEffect(() => {
    // Fetch data from the endpoint
    fetchNextTicket()
  }, []);

  function generateUniqueSessionId() {
    const timestamp = new Date().getTime();
    const randomPart = Math.random().toString(36).substr(2, 9);
    var x = `session-${timestamp}-${randomPart}`
    console.log("generateUniqueSessionId", x)
    return `session-${timestamp}-${randomPart}`;
  }

  const fetchNextTicket = () => {
    fetch('http://localhost:8888/tickets/not-done-from-last-12-hours')
      .then(response => response.json())
      .then(incomingData => {
        const currentISO = new Date().toISOString().slice(0, 16); // Current time
        let currentTime = new Date(currentISO);
        let currentTimeMinusThirty = new Date(currentTime.getTime() - 30 * 60 * 1000);

        // Separate data into two arrays based on scheduleAppointmentTime
        const within30Mins = [];
        const outside30Mins = [];
        incomingData.forEach(item => {

          if (
            item.scheduleAppointmentTime &&
            new Date(item.scheduleAppointmentTime) >=
            currentTimeMinusThirty &&
            new Date(item.scheduleAppointmentTime) <=
            currentTime
          ) {
            // console.log("TYLER:: Within 30")
            // console.log("TYLER:: Schedule Time", new Date(item.scheduleAppointmentTime))
            // console.log("TYLER:: Current time - 30", new Date(currentTimeMinusThirty.getTime() - 30 * 60 * 1000))  
            within30Mins.push(item);
          } else {
            //   console.log("TYLER:: Outside 30")
            //   console.log("TYLER:: new Date(item.scheduleAppointmentTime)", new Date(item.scheduleAppointmentTime))
            //   console.log("TYLER:: new Date(currentTime.getTime() - 30 * 60 * 1000)", new Date(currentTime.getTime() - 30 * 60 * 1000))  
            outside30Mins.push(item);
          }
        });

        // Sort within30Mins array based on scheduleAppointmentTime
        within30Mins.sort(
          (a, b) =>
            new Date(a.scheduleAppointmentTime) -
            new Date(b.scheduleAppointmentTime)
        );

        console.log("Within 30 mins:")

        within30Mins.map(item => (
          console.log("Tyler:", item)
        ))
        outside30Mins.sort((a, b) => a.positionInLine - b.positionInLine);
        console.log("Outsite 30 mins:")
        outside30Mins.map(item => (
          console.log("Tyler:", item)
        ))
        console.log("within30Mins[0]", within30Mins)

        if (within30Mins.length != 0) {
          console.log("within30Mins[0]", within30Mins[0])
          setCurrentTicket(within30Mins[0]);
        } else if (outside30Mins.length != 0) {
          // Sort outside30Mins array based on positionInLine

          console.log("outside30Min", outside30Mins)

          setCurrentTicket(outside30Mins[0]);
        }

      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };

  useEffect(() => {

    // Set up the SSE connection to listen for updates
    const eventSource = new EventSource('http://' + window.location.hostname + ':8888/sse/tickets');
    // Open a connection to the SSE endpoint

    eventSource.addEventListener('update', (event) => {

      try {
        const updateInfo = JSON.parse(event.data);
        // Handle updates and show the toast message
        // You can customize the toast content, appearance, and behavior
        console.log("Recevived call", updateInfo)
        // Check if the update's session ID matches the current session's ID

        console.log("updateInfo.sessionId", updateInfo.sessionId)
        console.log("sessionId", sessionId)
        console.log("isToastVisibleRef", isToastVisibleRef)

        if (isToastVisibleRef.current == false && updateInfo.sessionId !== sessionId) {
          window.location.reload()
        }

        // if (isToastVisibleRef.current == false && updateInfo.sessionId !== sessionId) {
        //     console.log("Session Id different")
        //     isToastVisibleRef.current = true; // Update the ref to true
        //     console.log("isToastVisible: ", isToastVisibleRef)
        //     const toastId = toast('Database has been updated. Click Here to reload. ', {
        //         position: "top-right",
        //         autoClose: false,
        //         closeOnClick: true,
        //         pauseOnHover: true,
        //         draggable: true,
        //         progress: undefined,
        //         onClick: () => window.location.reload() // Reload the page when the toast is clicked
        //         // You can add a button to refresh the page
        //     });

        //     // Set up a callback to be called when the toast is dismissed
        //     toast.onChange(() => {
        //         if (!toast.isActive(toastId)) {
        //             isToastVisibleRef.current = false;
        //         }
        //     });

        // }
      } catch (error) {
        console.error('Failed to parse JSON data:', error, 'Raw data:', event.data);
      }
    });

    return () => {
      eventSource.close(); // Close the SSE connection when the component unmounts
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === ' ') {
        if (currentTicket) {
          console.log("space pressed")
          const updatedTicket = { ...currentTicket, done: true };
          // Update the ticket data on the backend using the PUT request
          fetch(`http://${window.location.hostname}:8888/tickets/${currentTicket.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'X-Session-Id': sessionId // Include the session ID as a custom header
            },
            body: JSON.stringify(updatedTicket),
          })
            .then((response) => response.json())
            .then(() => {
              fetchNextTicket(); // Fetch the next ticket after updating the current one
            })
            .catch((error) => console.error('Error updating ticket:', error));
        }
      }
    };

    document.addEventListener('keypress', handleKeyPress);

    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [currentTicket]);

  return (
    <div>
      {/* <div>
        Current Time: {new Date().toISOString()}

      </div> */}
      <div style={styles.container}>
        {console.log("Serving Customers!")}
        <h2 style={styles.servingText}>Serving Customer Number</h2>
        <h1 style={styles.customerNumber}>{(currentTicket != null && currentTicket.positionInLine != null) ? currentTicket.positionInLine : "☺️"}</h1>
        {currentTicket && currentTicket.firstName != null && (
          <h2 style={styles.positionInLine}>You are up: {currentTicket.firstName} {currentTicket.lastName.charAt(0)}.</h2>
        )}
      </div>
      <ToastContainer />

    </div>
  );
};

const styles = {
  container: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#f0f0f0', // Light gray background
  },
  servingText: {
    fontSize: '24px',
    fontWeight: 'bold',
    fontFamily: 'Helvetica, Arial, sans-serif', // Apple-like font
    color: '#333', // Dark gray text color
    margin: 0, // Remove margin between elements
  },
  customerNumber: {
    fontSize: '448px', // Larger font size for the number
    fontWeight: 'bold',
    fontFamily: 'Helvetica, Arial, sans-serif', // Apple-like font
    color: '#333', // Dark gray text color
    margin: 0, // Remove margin between elements
  },
};

export default NextCustomerPage;