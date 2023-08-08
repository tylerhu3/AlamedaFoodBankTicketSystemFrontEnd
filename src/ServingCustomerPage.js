// ServingCustomerPage.js
import React, { useEffect, useState } from 'react';
import DvdLogo from './FoodIcon';

const ServingCustomerPage = () => {
  // Assuming you have the customer number stored in a variable
  const [currentTicket, setCurrentTicket] = useState(null);
  useEffect(() => {
    // Initial fetch of the next ticket
    fetchNextTicket();

    // Set up interval to fetch new ticket every 1 second
    const interval = setInterval(fetchNextTicket, 1000);

    // Clean up interval on unmount
    return () => {
      clearInterval(interval);
    };
  }, []);


  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === ' ') {
        if (currentTicket) {
          console.log("space pressed")
          const updatedTicket = { ...currentTicket, done: true };
          // Update the ticket data on the backend using the PUT request
          fetch(`http://localhost:3000/tickets/${currentTicket.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTicket),
          })
            .then((response) => response.json())
            .then(() => {
              fetchNextTicket(); // Fetch the next ticket after updating the current one
              setCurrentTicket(updatedTicket);
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

  const fetchNextTicket = () => {
    fetch('http://localhost:3000/tickets/nextInLine')
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setCurrentTicket(data);
      })
      .catch((error) => console.error('Error fetching next ticket:', error));
  };

  return (
    <div>
      <DvdLogo />
      <div style={styles.container}>
        {console.log("Serving Customers!")}
        <h2 style={styles.servingText}>Serving Customer Number</h2>
        <h1 style={styles.customerNumber}>{(currentTicket != null && currentTicket.positionInLine !=null) ? currentTicket.positionInLine : "☺️"}</h1>
        {currentTicket && currentTicket.firstName != null && (
          <h2 style={styles.positionInLine}>You are up: {currentTicket.firstName}</h2>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
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

export default ServingCustomerPage;