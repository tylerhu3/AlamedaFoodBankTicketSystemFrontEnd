import React, { useEffect, useState } from 'react';
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
      })
      .catch((error) => console.error('Error fetching tickets:', error));
  }, []);
  

  const handleTicketCreated = (newTicket) => {
    // Add the new ticket to the existing list
    setTickets((prevTickets) => [...prevTickets, newTicket]);
  };

  const handleEditClick = (ticketId) => {
    // Set the editableTicketId to the ID of the ticket to be edited
    setEditableTicketId(ticketId);
  };

  const handleSaveClick = (ticketId) => {
    // Find the ticket to be saved from the tickets array
    const ticketToSave = tickets.find((ticket) => ticket.id === ticketId);

    // Update the ticket data on the backend using the PUT request
    fetch(`http://localhost:3000/tickets/${ticketId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticketToSave),
    })
      .then((response) => response.json())
      .then(() => {
        // Remove the editable state by setting editableTicketId to null
        setEditableTicketId(null);
      })
      .catch((error) => console.error('Error updating ticket:', error));
  };

  return (
    <div>
      <h2>All Tickets</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Schedule Appointment</th>
            <th>First Time Visitor</th>
            <th>Time</th>
            <th>Position in Line</th>
            <th>Additional Notes</th>
            <th>Done</th>
            <th>Edit/Save</th> {/* New column for Edit/Save buttons */}
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>{ticket.id}</td>
              <td>
                {editableTicketId === ticket.id ? (
                  <input
                    type="text"
                    name="firstName"
                    value={ticket.firstName}
                    onChange={(e) =>
                      setTickets((prevTickets) =>
                        prevTickets.map((prevTicket) =>
                          prevTicket.id === ticket.id
                            ? { ...prevTicket, firstName: e.target.value }
                            : prevTicket
                        )
                      )
                    }
                  />
                ) : (
                  ticket.firstName
                )}
              </td>
              <td>
                {editableTicketId === ticket.id ? (
                  <input
                    type="text"
                    name="lastName"
                    value={ticket.lastName}
                    onChange={(e) =>
                      setTickets((prevTickets) =>
                        prevTickets.map((prevTicket) =>
                          prevTicket.id === ticket.id
                            ? { ...prevTicket, lastName: e.target.value }
                            : prevTicket
                        )
                      )
                    }
                  />
                ) : (
                  ticket.lastName
                )}
              </td>
              <td>
                {editableTicketId === ticket.id ? (
                  <input
                    type="checkbox"
                    name="scheduleAppointment"
                    checked={ticket.scheduleAppointment}
                    onChange={(e) =>
                      setTickets((prevTickets) =>
                        prevTickets.map((prevTicket) =>
                          prevTicket.id === ticket.id
                            ? { ...prevTicket, scheduleAppointment: e.target.checked }
                            : prevTicket
                        )
                      )
                    }
                  />
                ) : (
                  ticket.scheduleAppointment ? 'Yes' : 'No'
                )}
              </td>
              <td>
                {editableTicketId === ticket.id ? (
                  <input
                    type="checkbox"
                    name="firstTimeVisitor"
                    checked={ticket.firstTimeVisitor}
                    onChange={(e) =>
                      setTickets((prevTickets) =>
                        prevTickets.map((prevTicket) =>
                          prevTicket.id === ticket.id
                            ? { ...prevTicket, firstTimeVisitor: e.target.checked }
                            : prevTicket
                        )
                      )
                    }
                  />
                ) : (
                  ticket.firstTimeVisitor ? 'Yes' : 'No'
                )}
              </td>
              <td>{ticket.time}</td>
              <td>
                {editableTicketId === ticket.id ? (
                  <input
                    type="number"
                    name="positionInLine"
                    value={ticket.positionInLine}
                    onChange={(e) =>
                      setTickets((prevTickets) =>
                        prevTickets.map((prevTicket) =>
                          prevTicket.id === ticket.id
                            ? { ...prevTicket, positionInLine: parseInt(e.target.value) }
                            : prevTicket
                        )
                      )
                    }
                  />
                ) : (
                  ticket.positionInLine
                )}
              </td>
              <td>
                {editableTicketId === ticket.id ? (
                  <input
                    type="text"
                    name="additionalNotes"
                    value={ticket.additionalNotes}
                    onChange={(e) =>
                      setTickets((prevTickets) =>
                        prevTickets.map((prevTicket) =>
                          prevTicket.id === ticket.id
                            ? { ...prevTicket, additionalNotes: e.target.value }
                            : prevTicket
                        )
                      )
                    }
                  />
                ) : (
                  ticket.additionalNotes
                )}
              </td>
              <td>
                {editableTicketId === ticket.id ? (
                  <input
                    type="checkbox"
                    name="done"
                    checked={ticket.done}
                    onChange={(e) =>
                      setTickets((prevTickets) =>
                        prevTickets.map((prevTicket) =>
                          prevTicket.id === ticket.id
                            ? { ...prevTicket, done: e.target.checked }
                            : prevTicket
                        )
                      )
                    }
                  />
                ) : (
                  ticket.done ? 'Yes' : 'No'
                )}
              </td>
              <td>
                {editableTicketId === ticket.id ? (
                  <button onClick={() => handleSaveClick(ticket.id)}>Save</button>
                ) : (
                  <button onClick={() => handleEditClick(ticket.id)}>Edit</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <CreateTicketForm onTicketCreated={handleTicketCreated} />
    </div>
  );
};

export default TicketList;
