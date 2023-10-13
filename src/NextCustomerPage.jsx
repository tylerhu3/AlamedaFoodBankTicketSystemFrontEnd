// NextCustomerPage.js
import React, { useEffect, useRef, useState } from 'react';
import DvdLogo from './FoodIcon';
import {Divider, Button } from 'antd';

import 'react-toastify/dist/ReactToastify.css';
import wavFile from './next.mp3';
import './nextCustomerPage.css';  // Import the CSS

const NextCustomerPage = () => {
  // Assuming you have the customer number stored in a variable
  // const [data, setData] = useState([]);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [sessionId, setSessionId] = useState(generateUniqueSessionId());
  const [servedCustomers, setServedCustomers] = useState([]);
  const [loading, setLoading] = useState(false); // Initialize loading state
  const [waitingCustomers, setWaitingCustomers] = useState([]);

  // Define the start and end times for the range (11:00 AM to 11:30 AM)
  var startTimeHours = 10;
  var startTimeMinutes = 30;
  var endTimeHours = 11;
  var endTimeMinutes = 30;

  useEffect(() => {
    // Fetch data from the endpoint
    fetchNextTicket()
  }, []);

  useEffect(() => {
    // Fetch data from the endpoint
    console.log("creating SSE")
    // Set up the SSE connection to listen for updates
    const eventSource = new EventSource('http://' + window.location.hostname + ':8888/sse/tickets');
    // Open a connection to the SSE endpoint

    eventSource.addEventListener('refresh', (event) => {
      try {
        const incomingData = JSON.parse(event.data);
        console.log("Refresh Heard", incomingData);
        console.log(" incomingData.refreshToken", incomingData.refreshtoken);
        console.log(" incomingData.refreshToken == 'refreshToken'", incomingData.refreshtoken == 'refreshToken');

        if (incomingData && incomingData.refreshtoken == 'refreshToken') {
          console.log("should refresh bc ncomingData.refreshToken: ", incomingData.refreshToken);
          fetchNextTicket()
        }
      } catch (error) {
        console.error('Failed to parse JSON data:', error, 'Raw data:', event.data);
      }
    });

    return () => {
      eventSource.close(); // Close the SSE connection when the component unmounts
    };
  }, []);

  function generateUniqueSessionId() {
    const timestamp = new Date().getTime();
    const randomPart = Math.random().toString(36).substr(2, 9);
    var x = `session-${timestamp}-${randomPart}`
    console.log("generateUniqueSessionId", x)
    return `session-${timestamp}-${randomPart}`;
  }

  const fetchNextTicket = () => {
    fetch('http://' + window.location.hostname + ':8888/tickets/not-done-from-last-12-hours')
      .then(response => response.json())
      .then(incomingData => {
        console.log("incomingData: ", incomingData)
        console.log("incomingData.length: ", incomingData.length)

        if (incomingData.length == null) {
          console.log("incomingData is null")
          setCurrentTicket(null)
          return;
        }

        let currentTime = new Date();
        let currentTimeMinusThirty = new Date(currentTime.getTime() - 30 * 60 * 1000);

        let currentTimePlus45Mins = new Date(currentTime.getTime() + 45 * 60 * 1000);

        // Separate data into two arrays based on scheduleAppointmentTime
        const within30Mins = [];
        const outside30Mins = [];
        incomingData.forEach(item => {
          // Insert code to also check if time is 11 to 1130 
          // and then check if we have appointments from within the next 30 minutes ? 
          const isBetween11And1130 = isCurrentTimeBetweenXandY();
          console.log(`TYLER:: DEBUG
          new Date(): ${new Date().toLocaleDateString()}
          isBetween11And1130: ${isBetween11And1130}
          item.scheduleAppointmentTime: ${item.scheduleAppointmentTime} 
          new Date(item.scheduleAppointmentTime): ${new Date(item.scheduleAppointmentTime)} 
          currentTimePlusThirty: ${currentTimePlus45Mins}
          currentTimePlusOneHour: ${currentTimePlus45Mins}
          `)

          if (
            isBetween11And1130 && item.scheduleAppointmentTime &&
            IsTheTime1130(item.scheduleAppointmentTime)
          ) {
            console.log("TYLER :: SPECIAL CASE isBetween11And1130", item)
            within30Mins.push(item);
          }
          else if (
            item.scheduleAppointmentTime &&
            new Date(item.scheduleAppointmentTime) >=
            currentTimeMinusThirty &&
            new Date(item.scheduleAppointmentTime) <=
            currentTime
          ) {
            console.log("TYLER:: Within 30")
            console.log("TYLER:: Schedule Time", new Date(item.scheduleAppointmentTime))
            console.log("TYLER:: Current time - 30", new Date(currentTimeMinusThirty.getTime() - 30 * 60 * 1000))
            within30Mins.push(item);
          } else {
            console.log("TYLER:: Outside 30")
            console.log("TYLER:: new Date(item.scheduleAppointmentTime)", new Date(item.scheduleAppointmentTime))
            console.log("TYLER:: new Date(currentTime.getTime() - 30 * 60 * 1000)", new Date(currentTime.getTime() - 30 * 60 * 1000))
            console.log("TYLER:: new Date(new Date().getTime() - 30 * 60 * 10000)", new Date(new Date().getTime() - 30 * 60 * 1000))
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

        if (within30Mins.length !== 0) {
          console.log("within30Mins[0]", within30Mins[0])
          setCurrentTicket(within30Mins[0]);
        } else if (outside30Mins.length !== 0) {
          console.log("outside30Min", outside30Mins)
          setCurrentTicket(outside30Mins[0]);
        } else {
          setCurrentTicket(null)
        }
        // Merge the arrays
        const mergedArray = [...within30Mins, ...outside30Mins];

        // Check the length and remove the first element if necessary
        if (mergedArray.length > 0) {
          mergedArray.shift();
          setWaitingCustomers(mergedArray);

        }


      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };



  const isCurrentTimeBetweenXandY = () => {
    // Create a Date object for the current time
    var currentTime = new Date();

    console.log("currentTime", currentTime.toTimeString())

    // Get the current hours and minutes
    var currentHours = currentTime.getHours();
    var currentMinutes = currentTime.getMinutes();

    // Compare the current time with the desired range
    if (
      (currentHours > startTimeHours || (currentHours === startTimeHours && currentMinutes >= startTimeMinutes)) &&
      (currentHours < endTimeHours || (currentHours === endTimeHours && currentMinutes <= endTimeMinutes))
    ) {
      console.log("currentTime is between 11 and 1130")
      return true;
    } else {
      console.log("currentTime is NOT between 11 and 1130")
      return false
    }
  }

  const handleNumberTap = (e) => {
    e.preventDefault();
    if (loading != false)
      return;
    if (currentTicket) {
      setLoading(true);
      console.log("number tapped pressed")
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
          setServedCustomers(prevDoneTickets => [...prevDoneTickets, currentTicket]);
          fetchNextTicket(); // Fetch the next ticket after updating the current one
          const audio = new Audio(wavFile);
          audio.play();
        })
        .catch((error) => {
          console.error('Error updating ticket:', error);
        }).finally(() => {
          setLoading(false);  // Stop loading after API call completes
        });
    }
  };

  useEffect(() => {
    const handleKeyPress = (event) => {

      console.log("111 event.keyCode: ", event.keyCode);
      if (loading != false)
        return;
      if (event.key === ' ') {
        if (currentTicket) {
          setLoading(true);
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
              setServedCustomers(prevDoneTickets => [...prevDoneTickets, currentTicket]);
              fetchNextTicket(); // Fetch the next ticket after updating the current one
              const audio = new Audio(wavFile);
              audio.play();
            })
            .catch((error) => console.error('Error updating ticket:', error))
            .finally(() => {
              setLoading(false);  // Stop loading after API call completes
            });
        } else {
          fetchNextTicket();
        }
      } else if (event.keyCode === 120) {
        undoTicketChange()
      }
    };

    document.addEventListener('keypress', handleKeyPress);

    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [currentTicket]);

  const undoTicketChange = () => {
    if (servedCustomers.length === 0) {
      console.log("no doneTickets")
      return;  // No ticket to revert
    }
    console.log("doneTickets", servedCustomers)
    const lastDoneTicket = servedCustomers[servedCustomers.length - 1];
    console.log("last done ticket:", lastDoneTicket)
    const updatedTicket = { ...lastDoneTicket, done: false };
    setLoading(true);
    fetch(`http://${window.location.hostname}:8888/tickets/${lastDoneTicket.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId // Include the session ID as a custom header
      },
      body: JSON.stringify(updatedTicket),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Error reverting ticket update. Please try again.");
        }
        return response.json();
      })
      .then(data => {
        // Handle success logic if any
        // Remove the last ticket from the doneTickets state
        setServedCustomers(prevDoneTickets => prevDoneTickets.slice(0, -1));
        fetchNextTicket();
      })
      .catch(error => {
        console.error('Error reverting ticket update:', error);
      })
      .finally(() => {
        setLoading(false);  // Stop loading after undo action completes
      });
  };

  useEffect(() => {
    // Update the document title using the browser API
    { console.log("doneTickets: ", servedCustomers) }
  });

  const getDateInPacTime = (newDate) => {
    console.log("TYLER::getDateInPacTime", getDateInPacTime)
    const dateObj = new Date(newDate);
    const pacificDateTime = dateObj.toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles', hour12: true, hour: '2-digit',
      minute: '2-digit'
    });

    return <>{pacificDateTime}</>;
  };

  const IsTheTime1130 = (newDate) => {
    console.log("TYLER::getDateInPacTime", getDateInPacTime)
    const dateObj = new Date(newDate);
    const pacificDateTime = dateObj.toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles', hour: '2-digit',
      minute: '2-digit'
    });

    console.log("TYLER::1130 Check 2:", pacificDateTime.toString())
    console.log("TYLER::1130 Check:  ", pacificDateTime.hour, " ", pacificDateTime.minute, " ", pacificDateTime.toString() == "11:30 AM")


    return pacificDateTime.toString() == "11:30 AM"
  };

  const showAdditionalNotes = (additionalNotes) => {
    if (additionalNotes == null || additionalNotes == ""){
      return <></>
    }

    return <div>
      <p style={{fontSize: "10px"}}>
        <div >
        Additional Notes:
        </div>
      {additionalNotes}
        </p>
       </div>
  }


  const showAdditionalNotesBigger = (additionalNotes) => {
    if (additionalNotes == null || additionalNotes == ""){
      return <></>
    }

    return <div>
      <p style={{fontSize: "13px"}}>
        <div >
        Additional Notes:
        </div>
      {additionalNotes}
        </p>
      
       </div>
  }

  return (

    <div>
      {/* Floating Div */}
      <div style={styles.floatingDivLeft}>

        <h5>Unserved Clients:</h5>
        <div style={styles.scrollableContainer}>
          {waitingCustomers.map((customer, index) => (
            <div key={index}>
              {customer.positionInLine} {customer.firstName} {customer.lastName.charAt(0)} {customer.scheduleAppointmentTime != null ? getDateInPacTime(customer.scheduleAppointmentTime) : ""}
              {showAdditionalNotes(customer.additionalNotes)}
              
            <Divider
              style={{
                marginTop:'4px',
                'backgroundColor':'black'}}
            ></Divider>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.floatingDivRight}>
        <h5>Served Clients:</h5>
        <div style={styles.scrollableContainer}>
          {servedCustomers.map((customer, index) => (
            <div key={index}>
               {customer.positionInLine} {customer.firstName} {customer.lastName.charAt(0)} {customer.scheduleAppointmentTime != null ? getDateInPacTime(customer.scheduleAppointmentTime) : ""}
              {showAdditionalNotes(customer.additionalNotes)}
            <Divider
              style={{'backgroundColor':'black'}}
            ></Divider>
              </div>
          ))}
        </div>

      </div>
      <div onClick={undoTicketChange}>
        <DvdLogo />
      </div>
      <div style={styles.container}>
        {console.log("Serving Customers!")}
        <div style={styles.buttonTextContainer}>
          <Button
            onClick={() => { undoTicketChange() }}
            style={{
              margin:'10px',
              display: 'inline-flex',
              alignItems: 'center',
              padding:'20px',
              fontSize: '20px',
              backgroundColor: 'red',
              color: 'white',
            }}
          >Previous</Button>
          <h2 style={styles.servingText}>Serving Client Number</h2>

          <Button
            onClick={handleNumberTap}
            style={{
              margin:'10px',
              display: 'inline-flex',
              alignItems: 'center',
              padding:'20px',
              fontSize: '20px',
              backgroundColor: 'green',
              color: 'white',
            }}
          >Next</Button>
        </div>
        <h1 onClick={handleNumberTap} style={styles.customerNumber}>{(currentTicket != null && currentTicket.positionInLine != null) ? currentTicket.positionInLine : "☺️"}</h1>
        {currentTicket && currentTicket.firstName != null && (
          <div>


          
          <h2 style={styles.positionInLine}>You are up: {currentTicket.firstName} {currentTicket.lastName.charAt(0)}.</h2>
          {showAdditionalNotesBigger(currentTicket.additionalNotes)}
          </div>
        )}
      </div>

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

  buttonTextContainer: {
    display: 'flex',
    alignItems: 'center'
  },

  floatingDivRight: {
    position: 'fixed',
    top: 0,
    right: 0, // Place the div on the right side
    width: '20%', // Adjust the width as needed
    height: '100%', // Adjust the height as needed
    background: '#fff', // White background
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)', // Shadow for the div
    padding: '10px', // Add some padding for content
    zIndex: 1, // Set to a lower value to place it behind the other content
  },

  floatingDivLeft: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '20%', // Adjust the width as needed
    height: '100%', // Adjust the height as needed
    background: '#fff', // White background
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)', // Shadow for the div
    padding: '10px', // Add some padding for content
    zIndex: 1, // Make sure it's above other content
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
  // Add a new style for the scrollable container
  scrollableContainer: {
    height: '100%', // Set a fixed height
    overflowY: 'auto', // Add vertical scroll when content overflows
  },
};

export default NextCustomerPage;