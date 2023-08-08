import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Checkbox } from 'antd';
import CreateTicketForm from './CreateTicketForm';

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [editableTicketId, setEditableTicketId] = useState(null);

  useEffect(() => {
    // Fetch tickets data from the backend
    fetch('http://localhost:3000/tickets')
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Log the fetched data
        setTickets(data);
        if (data.length > 0) {
          setEditableTicketId(data[0].id); // Set the default editable ticket ID to the first ticket
        }
      })
      .catch((error) => console.error('Error fetching tickets:', error));

    // Set up the SSE connection to listen for updates
    const eventSource = new EventSource('http://localhost:3000/sse/tickets');
    eventSource.onmessage = (event) => {
      const updatedTicket = JSON.parse(event.data);
      console.log('Ticket Updated');
      setTickets((prevTickets) =>
        prevTickets.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket))
      );
    };

    return () => {
      eventSource.close(); // Close the SSE connection when the component unmounts
    };
  }, []);

  const handleTicketCreated = (newTicket) => {
    // Add the new ticket to the existing list
    setTickets((prevTickets) => [...prevTickets, newTicket]);
  };

  const handleSaveClick = (ticketId) => {
    console.log("handleSaveClick: ", ticketId)
    // Find the ticket to be saved from the tickets array
    const ticketToSave = tickets.find((ticket) => ticket.id === ticketId);
    console.log("ticketToSave: ", ticketToSave)
    // Update the ticket data on the backend using the PUT request
    fetch(`http://localhost:3000/tickets/${ticketId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticketToSave),
    })
      .then((response) => response.json())
      .catch((error) => console.error('Error updating ticket:', error));
  };

  const handleDeleteClick = (ticketId) => {
    // Delete the ticket from the backend using the DELETE request
    fetch(`http://localhost:3000/tickets/${ticketId}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          // If the ticket was deleted successfully, remove it from the frontend state
          setTickets((prevTickets) => prevTickets.filter((ticket) => ticket.id !== ticketId));
        } else {
          console.error('Error deleting ticket:', response.statusText);
        }
      })
      .catch((error) => console.error('Error deleting ticket:', error));
  };

  const handleFieldChange = (ticketId, field, value) => {
    // Update the field value of the ticket in the state
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, [field]: value } : ticket
      )
    );
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
      render: (text, record) => (
        <Input
          value={record.firstName}
          onChange={(e) => handleFieldChange(record.id, 'firstName', e.target.value)}
        />
      ),
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
      render: (text, record) => (
        <Input
          value={record.lastName}
          onChange={(e) => handleFieldChange(record.id, 'lastName', e.target.value)}
        />
      ),
    },
    {
      title: 'Schedule Appointment',
      dataIndex: 'scheduleAppointment',
      key: 'scheduleAppointment',
      render: (text, record) => (
        <Checkbox
          checked={record.scheduleAppointment}
          onChange={(e) => handleFieldChange(record.id, 'scheduleAppointment', e.target.checked)}
        />
      ),
    },
    {
      title: 'First Time Visitor',
      dataIndex: 'firstTimeVisitor',
      key: 'firstTimeVisitor',
      render: (text, record) => (
        <Checkbox
          checked={record.firstTimeVisitor}
          onChange={(e) => handleFieldChange(record.id, 'firstTimeVisitor', e.target.checked)}
        />
      ),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Position in Line',
      dataIndex: 'positionInLine',
      key: 'positionInLine',
      render: (text, record) => (
        <Input
          type="number"
          value={record.positionInLine}
          onChange={(e) => handleFieldChange(record.id, 'positionInLine', parseInt(e.target.value))}
        />
      ),
    },
    {
      title: 'Additional Notes',
      dataIndex: 'additionalNotes',
      key: 'additionalNotes',
      render: (text, record) => (
        <Input
          value={record.additionalNotes}
          onChange={(e) => handleFieldChange(record.id, 'additionalNotes', e.target.value)}
        />
      ),
    },
    {
      title: 'Done',
      dataIndex: 'done',
      key: 'done',
      render: (text, record) => (
        <Checkbox
          checked={record.done}
          onChange={(e) => handleFieldChange(record.id, 'done', e.target.checked)}
        />
      ),
    },
    {
      title: 'Save',
      key: 'save',
      render: (text, record) => (
        <Button onClick={() => handleSaveClick(record.id)}>Save</Button>
      ),
    },
    {
      title: 'Delete',
      key: 'delete',
      render: (text, record) => (
        <Button onClick={() => handleDeleteClick(record.id)}>Delete</Button>
      ),
    },
  ];

  return (
    <div style={styles.container}>
      
      <h2 style={styles.title}>Ticketing System Admininstration Mode</h2>
      <Table dataSource={tickets} columns={columns} rowKey="id" />
    </div>
  );
};

const styles = {
  container: {
    padding: '30px'
  },
  title: {
    textAlign: 'center'
  }
};


export default TicketList;
