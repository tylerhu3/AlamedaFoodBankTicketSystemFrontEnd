import React, { useState, useEffect } from 'react';
import { Form, Input, Checkbox, Button, Modal, TimePicker } from 'antd'; // Import TimePicker
import dayjs from "dayjs";
import locale from "dayjs/locale/en";

const CreateTicketForm2 = () => {
    const [form] = Form.useForm();
    const [latestTicket, setLatestTicket] = useState(null);
    const [isDialogVisible, setDialogVisible] = useState(false); // State to manage dialog visibility
    const [showTimePicker, setShowTimePicker] = useState(false); // State for showing TimePicker
    const [defaultTime, setDefaultTime] = useState(new Date());

    const fetchLatestTicket = async () => {
        try {
            const response = await fetch('http://' + window.location.hostname + ':8888/tickets/latest');
            // const response = await fetch('http://localhost:8888/tickets/latest');
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
    // Fetch tickets data from the backend
    fetch('http://'+ window.location.hostname +':8888/tickets')
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Log the fetched data

      })
      .catch((error) => console.error('Error fetching tickets:', error));
fetchLatestTicket();
    }, [form]);

    const handleDialogOk = () => {
        setDialogVisible(false);
    };

    const handleSubmit = (values) => {
        // Create a new ticket with the current time
        const currentTime = new Date().toLocaleTimeString

// Get the selected time from TimePicker
        console.log("values.scheduleAppointment: ", values.scheduleAppointment)

        var newData = {
            ...values,
            done: false, // Set "done" to false before sending to the backend
            time: currentTime,
        };

        if(values.scheduleAppointment){
            const selectedTime = values.scheduleAppointmentTime.toDate().toISOString().slice(0, 16);
            const currentTimeInRightTimeZone = new Date(selectedTime);

            console.log("selectedTime: ", selectedTime);
            console.log("currentTimeInRightTimeZone: ", currentTimeInRightTimeZone.toLocaleTimeString());
            console.log("values.scheduleAppointmentTime: ", values.scheduleAppointmentTime);
            newData = {
                ...values,
                done: false, // Set "done" to false before sending to the backend
                time: currentTime,
                scheduleAppointmentTime: selectedTime
            };
        }

        fetch('http://' + window.location.hostname + ':8888/tickets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newData),
        })
            .then((response) => response.json())
            .then((data) => {
                // Fetch tickets data again to get the total number of tickets (including the newly created one)
                fetch('http://' + window.location.hostname + ':8888/tickets')
                    .then((response) => response.json())
                    .then((data) => {
                        // Update the positionInLine to the next position in line
                        fetchLatestTicket();
                        // Show the dialog
                        setDialogVisible(true);
                          //Reset the form fields after successful submission
                        form.resetFields();
                        // Hide Appointment time picker
                        setShowTimePicker(false);
                    })
                    .catch((error) => console.error('Error fetching tickets:', error));
            })
            .catch((error) => console.error('Error creating ticket:', error));

      
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
                <Input.TextArea rows={4} />

                </Form.Item>
        
                <Form.Item name="firstTimeVisitor" valuePropName="checked" initialValue={0}>
                    <Checkbox>First Time Visitor</Checkbox>
                </Form.Item>
                
                <Form.Item name="scheduleAppointment" valuePropName="checked" initialValue={false}>
                <Checkbox
                    onChange={(e) => {
                        setShowTimePicker(e.target.checked);
                    }}
                >
                    Schedule Appointment
                </Checkbox>
            </Form.Item>

            {showTimePicker && (
                <Form.Item
                    label="Schedule Appointment Time:"
                    name="scheduleAppointmentTime"
                    rules={[
                        {
                            required: true,
                            message: 'Please select a schedule appointment time',
                        },
                    ]}
                >
                    <TimePicker
                    
                    // defaultValue={dayjs(`${defaultTime.getHours()}:00:00`, "HH:mm:ss")}
                    changeOnBlur={true}
                    format="hh:mm A" use12Hours minuteStep={30} />
                </Form.Item>
            )}

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Create Ticket
                    </Button>
                </Form.Item>
            </Form>

            {
                <Modal
                    visible={isDialogVisible}
                    title={`Please take a seat`}
                    //+ (latestTicket != null  && latestTicket.firstName != null) ? latestTicket.firstName : ''
                    onCancel={handleDialogOk}
                    footer={[
                        <Button key="Ok" type="primary" onClick={() => { handleDialogOk() }}>
                            Ok
                        </Button>,
                    ]}
                >   

                    <p>{latestTicket ? latestTicket.firstName : ''} {latestTicket ? latestTicket.lastName : ''} </p>
                    <p>{(latestTicket && latestTicket.scheduleAppointment) ? new Date(latestTicket.scheduleAppointmentTime).toLocaleTimeString()  : ""} </p>
                    <p>#{latestTicket ? latestTicket.positionInLine : ''}</p>

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
