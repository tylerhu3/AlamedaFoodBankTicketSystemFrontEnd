import React, { useState, useEffect } from 'react';

const CreateTicketForm = ({ onTicketCreated }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        scheduleAppointment: false,
        firstTimeVisitor: false,
        time: '', // Add a default empty time value
        positionInLine: 0,
        additionalNotes: '',
        done: false,
      });
  const [totalTickets, setTotalTickets] = useState(0);

  useEffect(() => {
    // Fetch tickets data from the backend to get the total number of tickets
    fetch('http://localhost:3000/tickets')
      .then((response) => response.json())
      .then((data) => {
        setTotalTickets(data.length);
        // Set the positionInLine to the next position in line (totalTickets + 1)
        setFormData((prevData) => ({
          ...prevData,
          positionInLine: data.length + 1,
        }));
      })
      .catch((error) => console.error('Error fetching tickets:', error));
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const inputValue = type === 'checkbox' ? checked : value;
    setFormData((prevData) => ({
      ...prevData,
      [name]: inputValue,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  
    // Create a new ticket with the current time
    const currentTime = new Date().toISOString().slice(0, 16);
    const newData = {
      ...formData,
      time: currentTime,
    };
  
    fetch('http://localhost:3000/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newData),
    })
      .then((response) => response.json())
      .then((data) => {
        // Call the onTicketCreated callback to inform the parent component
        // that a new ticket has been created.
        onTicketCreated(data);
  
        // Fetch tickets data again to get the total number of tickets (including the newly created one)
        fetch('http://localhost:3000/tickets')
          .then((response) => response.json())
          .then((data) => {
            setTotalTickets(data.length);
            // Update the positionInLine to the next position in line
            setFormData((prevData) => ({
              ...prevData,
              positionInLine: data.length + 1,
            }));
          })
          .catch((error) => console.error('Error fetching tickets:', error));
      })
      .catch((error) => console.error('Error creating ticket:', error));
  
    // Clear the form fields after submission
    setFormData({
      firstName: '',
      lastName: '',
      scheduleAppointment: false,
      firstTimeVisitor: false,
      positionInLine: totalTickets + 1, // Update the positionInLine to the next position in line
      additionalNotes: '',
      done: false,
    });
  };

  return (
    <div>
      <h2>Create New Ticket</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Schedule Appointment:</label>
          <input
            type="checkbox"
            name="scheduleAppointment"
            checked={formData.scheduleAppointment}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>First Time Visitor:</label>
          <input
            type="checkbox"
            name="firstTimeVisitor"
            checked={formData.firstTimeVisitor}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Position in Line:</label>
          <input
            type="number"
            name="positionInLine"
            value={formData.positionInLine}
            onChange={handleChange}
            disabled // Disable the input field for positionInLine
          />
        </div>
        <div>
          <label>Additional Notes:</label>
          <input
            type="text"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Done:</label>
          <input
            type="checkbox"
            name="done"
            checked={formData.done}
            onChange={handleChange}
          />
        </div>
        <div>
          <button type="submit">Create Ticket</button>
        </div>
      </form>
    </div>
  );
};

export default CreateTicketForm;
