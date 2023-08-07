// ServingCustomerPage.js
import React, { useEffect, useState } from 'react';
import DvdLogo from './FoodIcon';

const ServingCustomerPage = () => {
  // Assuming you have the customer number stored in a variable
  const customerNumber = 42;
  const [currentTicket, setCurrentTicket] = useState(null);

  useEffect(() => {
    // Fetch tickets data from the backend
    fetch('http://localhost:3000/next')
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Log the fetched data
        setTickets(data);
      })
      .catch((error) => console.error('Error fetching tickets:', error));
  }, []);

  return (
    <div>
        <DvdLogo />
    <div style={styles.container}>
        {
    console.log("T123")}
      
      <h2 style={styles.servingText}>Serving Customer Number</h2>
      <h1 style={styles.customerNumber}>{customerNumber}</h1>
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