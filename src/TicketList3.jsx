import React, { useEffect, useRef, useState } from 'react';
import { Table, Button, Input, Checkbox, message } from 'antd';
import { saveAs } from 'file-saver'; // Import the file-saver library
import { toast } from 'react-toastify'; // Assuming you're using react-toastify for toast notifications
import { ToastContainer } from 'react-toastify';
import { ReloadOutlined } from '@ant-design/icons';
import 'react-toastify/dist/ReactToastify.css';

const TicketList3 = () => {
    const [tickets, setTickets] = useState([]);
    const [sorting, setSorting] = useState({});
    const [sessionId, setSessionId] = useState(generateUniqueSessionId());
    // State to track whether the toast is visible
    const isToastVisibleRef = useRef(false);


    useEffect(() => {

        // Fetch tickets data from the backend
        fetch('http://' + window.location.hostname + ':3000/tickets')
            .then((response) => response.json())
            .then((data) => {
                console.log(data); // Log the fetched data
                setTickets(data);

            })
            .catch((error) => console.error('Error fetching tickets:', error));

        // Set up the SSE connection to listen for updates
        const eventSource = new EventSource('http://' + window.location.hostname + ':3000/sse/tickets');
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
                console.log("Session Id different")
                isToastVisibleRef.current = true; // Update the ref to true
                console.log("isToastVisible: ", isToastVisibleRef)
                const toastId = toast('Database has been updated. Click Here to reload. ', {
                    position: "top-right",
                    autoClose: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    onClick: () => window.location.reload() // Reload the page when the toast is clicked
                    // You can add a button to refresh the page
                });

                    // Set up a callback to be called when the toast is dismissed
             toast.onChange(() => {
            if (!toast.isActive(toastId)) {
                isToastVisibleRef.current = false; 
            }
          });

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
        var x =  `session-${timestamp}-${randomPart}`
        console.log("generateUniqueSessionId", x)
        return `session-${timestamp}-${randomPart}`;
    }

    const refreshPage = () => {
        window.location.reload(); // Or call your method to reload the data
    };

    const handleSaveClick = (ticketId) => {
        // Find the ticket to be saved from the tickets array
        const ticketToSave = tickets.find((ticket) => ticket.id === ticketId);

        // Update the ticket data on the backend using the PUT request
        fetch(`http://${window.location.hostname}:3000/tickets/${ticketId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Id': sessionId // Include the session ID as a custom header
            },
            body: JSON.stringify(ticketToSave),
        })
            .then((response) => {
                if (response.ok) {
                    message.success('Ticket saved successfully!'); // Show success toast message
                } else {
                    message.error('Failed to save ticket. Please try again.'); // Show error toast message
                }
            })
            .catch((error) => {
                console.error('Error updating ticket:', error);
                message.error('An error occurred while saving the ticket. Please try again.'); // Show error toast message
            });
    };

    const handleDeleteClick = (ticketId) => {
        // Delete the ticket from the backend using the DELETE request
        fetch(`http://${window.location.hostname}:3000/tickets/${ticketId}`, {
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

    const handleSaveAllClick = () => {
        // Keep track of the number of successful and failed saves
        let successCount = 0;
        let errorCount = 0;

        // Function to handle individual save response
        const handleSaveResponse = (success) => {
            if (success) {
                successCount += 1;
            } else {
                errorCount += 1;
            }

            // If we have handled all tickets, display the success or error message
            if (successCount + errorCount === tickets.length) {
                if (errorCount === 0) {
                    message.success('All changes were saved successfully!');
                } else {
                    message.error(`${errorCount} tickets failed to save. Please try again.`);
                }
            }
        };

        tickets.forEach((ticket) => {
            // Find the ticket to be saved from the tickets array
            const ticketToSave = tickets.find((t) => t.id === ticket.id);

            // Update the ticket data on the backend using the PUT request
            fetch(`http://${window.location.hostname}:3000/tickets/${ticket.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Id': sessionId // Include the session ID as a custom header
                },
                body: JSON.stringify(ticketToSave),
            })
                .then((response) => {
                    if (response.ok) {
                        handleSaveResponse(true);
                    } else {
                        handleSaveResponse(false);
                    }
                })
                .catch((error) => {
                    console.error('Error updating ticket:', error);
                    handleSaveResponse(false);
                });
        });
    };

    const options = {
        timeZone: 'America/Los_Angeles',
        timeZoneName: 'short'
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
            render: (text, record) => (
                <span>{new Date(record.time).toLocaleString('en-US', options)}</span>
            ),
            onHeaderCell: () => ({
                onClick: () => sortTickets('time'),
            }),
        },
        {
            title: 'Schedule Appointment Time',
            dataIndex: 'scheduleAppointmentTime',
            key: 'scheduleAppointmentTime',
            render: (text, record) => (
                <span>
                    {record.scheduleAppointmentTime
                        ? new Date(record.scheduleAppointmentTime).toLocaleString('en-US', options)
                        : 'N/A'}
                </span>
            ),
            onHeaderCell: () => ({
                onClick: () => sortTickets('scheduleAppointmentTime'),
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
            <Table dataSource={tickets} columns={columns} rowKey="id" pagination={{ pageSize: 50 }} />
            <Button style={{ marginLeft: '15px' }} type="primary" onClick={handleExportCsv}>Export CSV</Button>
            <div style={styles.saveAllButton}>
                <Button type="primary" onClick={handleSaveAllClick}>Save All</Button>
            </div>
            <ToastContainer />

        </div>
    );
};

const styles = {
    container: {
        padding: '30px'
    },
    title: {
        textAlign: 'center'
    },
    saveAllButton: {
        position: 'absolute',
        right: '30px',
        bottom: '30px'
    }
};

export default TicketList3;
