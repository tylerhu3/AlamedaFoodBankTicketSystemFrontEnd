import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Checkbox } from 'antd';
import { saveAs } from 'file-saver'; // Import the file-saver library

const TicketList3 = () => {
  const [tickets, setTickets] = useState([]);
  const [sorting, setSorting] = useState({});

  useEffect(() => {
    // Fetch tickets data from the backend
    fetch('http://'+ window.location.hostname +':3000/tickets')
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Log the fetched data
        setTickets(data);

      })
      .catch((error) => console.error('Error fetching tickets:', error));

    // Set up the SSE connection to listen for updates
    const eventSource = new EventSource('http://'+ window.location.hostname +':3000/sse/tickets');
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

  const handleSaveClick = (ticketId) => {
    console.log("handleSaveClick: ", ticketId)
    // Find the ticket to be saved from the tickets array
    const ticketToSave = tickets.find((ticket) => ticket.id === ticketId);
    console.log("ticketToSave: ", ticketToSave)
    // Update the ticket data on the backend using the PUT request
    fetch(`http://'+ window.location.hostname +':3000/tickets/${ticketId}`, {
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
    fetch(`http://'+ window.location.hostname +':3000/tickets/${ticketId}`, {
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

  const sortTickets = (columnKey) => {
    const order = sorting[columnKey] === 'asc' ? 'desc' : 'asc';
    setSorting({ [columnKey]: order });
  
    const sortedTickets = [...tickets].sort((a, b) => {
      const aValue = a[columnKey];
      const bValue = b[columnKey];
  
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        // Handle numeric sorting for other data types
        return order === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });
  
    setTickets(sortedTickets);
  };
  
  const handleExportCsv = () => {
    const csvData = tickets.map((ticket) => {
      return [
        ticket.id,
        ticket.firstName,
        ticket.lastName,
        ticket.scheduleAppointment,
        ticket.firstTimeVisitor,
        ticket.time,
        ticket.positionInLine,
        ticket.additionalNotes,
        ticket.done,
      ].join(',');
    });

    const csvContent = ['ID,First Name,Last Name,Schedule Appointment,First Time Visitor,Time,Position in Line,Additional Notes,Done'].concat(csvData).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'tickets.csv');
  };

  const sortTicketsByPosition = (columnKey) => {
    const order = sorting[columnKey] === 'asc' ? 'desc' : 'asc';
    setSorting({ [columnKey]: order });
  
    const sortedTickets = [...tickets].sort((a, b) => {
      const aValue = a[columnKey];
      const bValue = b[columnKey];
      // Compare numeric values directly
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    });
  
    setTickets(sortedTickets);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      onHeaderCell: () => ({
        onClick: () => sortTickets('id'),
      }),
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
      onHeaderCell: () => ({
        onClick: () => sortTickets('firstName'),
      }),
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
      onHeaderCell: () => ({
        onClick: () => sortTickets('lastName'),
      }),
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
      onHeaderCell: () => ({
        onClick: () => sortTickets('scheduleAppointment'),
      }),
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
      onHeaderCell: () => ({
        onClick: () => sortTickets('firstTimeVisitor'),
      }),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      onHeaderCell: () => ({
        onClick: () => sortTickets('time'),
      }),
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
      onHeaderCell: () => ({
        onClick: () => sortTicketsByPosition('positionInLine'),
      }),
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
      onHeaderCell: () => ({
        onClick: () => sortTickets('additionalNotes'),
      }),
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
      onHeaderCell: () => ({
        onClick: () => sortTickets('done'),
      }),
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
      <h2 style={styles.title}>Ticketing System Administrator Mode</h2>
      <Table dataSource={tickets} columns={columns} rowKey="id" />
      <Button style={{marginLeft: '15px'}} type="primary" onClick={handleExportCsv}>Export CSV</Button>
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

export default TicketList3;
