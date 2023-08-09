import React, { useState, useEffect } from 'react';
import { Form, Input, Checkbox, Button, Modal } from 'antd';

const CreateTicketForm2 = () => {
    const [form] = Form.useForm();
    const [latestTicket, setLatestTicket] = useState(null);
    const [isDialogVisible, setDialogVisible] = useState(false); // State to manage dialog visibility

    const fetchLatestTicket = async () => {
        try {
            const response = await fetch('http://localhost:3000/tickets/latest');
            if (response.ok) {
                const data = await response.json();
                setLatestTicket(data);
                console.log("latest ticket", data)

                form.setFieldsValue({
                    positionInLine: data.positionInLine + 1,
                });
            } else {
                console.error('Error fetching latest ticket:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching latest ticket:', error);
        }
    };

    useEffect(() => {
        fetchLatestTicket();
        // Fetch tickets data from the backend to get the total number of tickets
        fetch('http://localhost:3000/tickets')
            .then((response) => response.json())
            .then((data) => {
                // Set the positionInLine to the next position in line (totalTickets + 1)

            })
            .catch((error) => console.error('Error fetching tickets:', error));
    }, [form]);

    const handleDialogOk = () => {
        setDialogVisible(false);
    };

    const handleSubmit = (values) => {
        // Create a new ticket with the current time
        const currentTime = new Date().toISOString().slice(0, 16);
        const newData = {
            ...values,
            done: false, // Set "done" to false before sending to the backend
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
                // Fetch tickets data again to get the total number of tickets (including the newly created one)
                fetch('http://localhost:3000/tickets')
                    .then((response) => response.json())
                    .then((data) => {
                        // Update the positionInLine to the next position in line
                        fetchLatestTicket();
                        // Show the dialog
                        setDialogVisible(true);
                    })
                    .catch((error) => console.error('Error fetching tickets:', error));
            })
            .catch((error) => console.error('Error creating ticket:', error));

        // Reset the form fields after successful submission
        form.resetFields();
    };

    return (
        <div style={styles.container}>
            <h2>Please Sign In:</h2>
            <br />
            <Form form={form} onFinish={handleSubmit}>
                <Form.Item label="First Name" name="firstName" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Last Name" name="lastName" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Position in Line" initialValue={(latestTicket && latestTicket.positionInLine) ? latestTicket.positionInLine + 1 : "1"} name="positionInLine" >
                    <Input type="number" disabled />
                </Form.Item>
                <Form.Item label="Additional Notes" initialValue={""} name="additionalNotes" rules={[{ required: false }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="scheduleAppointment" valuePropName="checked" initialValue={0}>
                    <Checkbox>Schedule Appointment</Checkbox>
                </Form.Item>
                <Form.Item name="firstTimeVisitor" valuePropName="checked" initialValue={0}>
                    <Checkbox>First Time Visitor</Checkbox>
                </Form.Item>
                {/* No "Done" Checkbox */}
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Create Ticket
                    </Button>
                </Form.Item>
            </Form>

            {
                <Modal
                    visible={isDialogVisible}
                    title={`Please take a seat ${latestTicket ? latestTicket.firstName : ''}`}
                    //+ (latestTicket != null  && latestTicket.firstName != null) ? latestTicket.firstName : ''
                    onCancel={handleDialogOk} 
                    footer={[
                        <Button key="Ok" type="primary" onClick={()=>{handleDialogOk()}}>
                        Ok
                        </Button>,
                      ]}
                >
                    <p>Your Position in Line is {latestTicket ? latestTicket.positionInLine : ''}</p>

                </Modal>

            }

        </div>
    );
};

const styles = {
    container: {
        padding: '30px'
    },
};

export default CreateTicketForm2;
