import React, { useState, useEffect } from "react";
import { Form, Input, Checkbox, Button, Modal, Select, message } from 'antd';
import moment from 'moment';

const { Option } = Select;

const CreateTicketForm2 = () => {
    const [form] = Form.useForm();
    const [latestTicket, setLatestTicket] = useState(null);
    const [isDialogVisible, setDialogVisible] = useState(false); // State to manage dialog visibility
    const [showTimePicker, setShowTimePicker] = useState(false); // State for showing TimePicker
    const [selectedTime, setSelectedTime] = useState(getCurrentTimeSlot());
    const [isLoading, setIsLoading] = useState(false);

    // Generate the time slots
    const generateTimeSlots = () => {
        const times = [];
        for (let i = 11; i <= 19; i++) { // Loop from 11 to 19 (11AM to 7PM)
            if (i != 11)
            times.push(`${i <= 12 ? i : i - 12}:00 ${i < 12 ? 'AM' : 'PM'}`);
            times.push(`${i <= 12 ? i : i - 12}:30 ${i < 12 ? 'AM' : 'PM'}`);
        }
        return times;
    };
    const timeSlots = generateTimeSlots();

    function getCurrentTimeSlot() {
        const now = moment();
        const minutes = now.minutes();
        const isHalfHour = minutes >= 30;
        const rounded = isHalfHour ? 30 : 0;

        return now.set({ 'minute': rounded, 'second': 0 }).format('hh:mm A');
    }; 

    const fetchLatestTicket = async () => {
        try {
            const response = await fetch(
                "http://" + window.location.hostname + ":8888/tickets/latest"
            );
            if (response.ok) {
                const data = await response.json();
                setLatestTicket(data);
                console.log("latest ticket", data);

                form.setFieldsValue({
                    positionInLine: data.positionInLine + 1,
                });
            } else {
                console.error("Error fetching latest ticket:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching latest ticket:", error);
        }
    };

    useEffect(() => {
        // Fetch tickets data from the backend
        fetch("http://" + window.location.hostname + ":8888/tickets")
            .then((response) => response.json())
            .then((data) => {
                console.log(data); // Log the fetched data
            })
            .catch((error) => console.error("Error fetching tickets:", error));
        fetchLatestTicket();
    }, [form]);

    const handleDialogOk = () => {
        setDialogVisible(false);
    };

    function convertToTimeDate(inputString) {
        const parts = inputString.match(/(\d+):(\d+) (\w+)/);
        if (!parts) {
            throw new Error("Invalid time format");
        }
    
        const hour = parseInt(parts[1], 10);
        const minute = parseInt(parts[2], 10);
        const period = parts[3];
    
        // Create a new Date object with the current date
        const date = new Date();
    
        if (period === "PM" && hour !== 12) {
            date.setHours(hour + 12);
        } else if (period === "AM" && hour === 12) {
            date.setHours(0);  // Set to midnight if it's 12 AM
        } else {
            date.setHours(hour);
        }
        date.setMinutes(minute);
        date.setSeconds(0);
        date.setMilliseconds(0);
    
        return date;
    }

    const handleSubmit = (values) => {
        // Create a new ticket with the current time
        setIsLoading(true); // Set loading status to true at the start of submission

        const currentTime = new Date().toLocaleTimeString();
        
        // Get the selected time from TimePicker
        console.log("values.scheduleAppointment: ", values.scheduleAppointment);
        console.log("values.scheduleAppointment: ", selectedTime);

        var newData = {
            ...values,
            done: false, // Set "done" to false before sending to the backend
            time: currentTime,
        };
        

        if (values.scheduleAppointment) {
            const scheduleTime =convertToTimeDate(selectedTime)


            console.log("selectedTime: ", selectedTime);
            console.log(
                "currentTimeInRightTimeZone: ",
                scheduleTime.toLocaleTimeString()
            );
            console.log(
                "values.scheduleAppointmentTime: ",
                scheduleTime.scheduleAppointmentTime
            );
            newData = {
                ...values,
                done: false, // Set "done" to false before sending to the backend
                time: currentTime,
                scheduleAppointmentTime: scheduleTime,
            };
        }

        fetch("http://" + window.location.hostname + ":8888/tickets", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newData),
        })
            .then((response) => response.json())
            .then((data) => {
                setIsLoading(false);  // Set loading status to false if there's an error
                // Fetch tickets data again to get the total number of tickets (including the newly created one)
                fetch("http://" + window.location.hostname + ":8888/tickets")
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
                    .catch((error) => {
                        console.error("Error fetching tickets:", error);
                        setIsLoading(false);  // Set loading status to false if there's an error
                        message.error('Error creating ticket. Please try again later.');  // Display error message

                    });
            })
            .catch((error) => {
                console.error("Error creating ticket:", error);
                setIsLoading(false);  // Set loading status to false if there's an error
                message.error('Error creating ticket. Please try again later.');  // Display error message

            });
    };

    return (
        <div style={styles.container}>
            <h2>Please Sign In:</h2>
            <br />
            <Form form={form} onFinish={handleSubmit}>
                <Form.Item
                    label="First Name"
                    name="firstName"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Last Name"
                    name="lastName"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Position in Line"
                    initialValue={
                        latestTicket && latestTicket.positionInLine
                            ? latestTicket.positionInLine + 1
                            : "1"
                    }
                    name="positionInLine"
                >
                    <Input type="number" disabled />
                </Form.Item>

                <Form.Item
                    label="Additional Notes"
                    initialValue={""}
                    name="additionalNotes"
                    rules={[{ required: false }]}
                >
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item
                    name="firstTimeVisitor"
                    valuePropName="checked"
                    initialValue={0}
                >
                    <Checkbox>First Time Visitor</Checkbox>
                </Form.Item>

                <Form.Item
                    name="scheduleAppointment"
                    valuePropName="checked"
                    initialValue={false}
                >
                    <Checkbox
                        onChange={(e) => {
                            setShowTimePicker(e.target.checked);
                        }}
                    >
                        Has Schedule Appointment
                    </Checkbox>
                </Form.Item>


                {showTimePicker && (
                    <Form.Item
                        label="Schedule Appointment Time:"
                        name="scheduleAppointmentTime"
                        initialValue={selectedTime}
                    >
                        <Select
                            style={{ width: "140" }}
                            dropdownMatchSelectWidth={false}
                            value={selectedTime}
                            onChange={(value) => setSelectedTime(value)}
                        >
                            {timeSlots.map((time) => (
                                <Option key={time} value={time}>
                                    {time}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}

                <Form.Item>
                <Button type="primary" htmlType="submit" loading={isLoading} disabled={isLoading}>
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
                        <Button
                            key="Ok"
                            type="primary"
                            onClick={() => {
                                handleDialogOk();
                            }}
                        >
                            Ok
                        </Button>,
                    ]}
                >
                    <p>
                        {latestTicket ? latestTicket.firstName : ""}{" "}
                        {latestTicket ? latestTicket.lastName : ""}{" "}
                    </p>

                    {latestTicket != null &&
                        console.log(
                            "Original Time for:",
                            latestTicket.scheduleAppointmentTime
                        )}
                    <p>
                        {latestTicket && latestTicket.scheduleAppointment
                            ? getDateInPacTime(latestTicket.scheduleAppointmentTime.toString())
                            : ""}
                    </p>
                    <p>#{latestTicket ? latestTicket.positionInLine : ""}</p>
                </Modal>
            }
        </div>
    );
};

const getDateInPacTime = (newDate) => {
    //   let dateStr = newDate + "Z"; // Adding 'Z' to indicate it's UTC
    const dateObj = new Date(newDate);
    const pacificTime = dateObj.toLocaleTimeString("en-US", {
        timeZone: "America/Los_Angeles",
        hour12: true,
        hour: '2-digit',
        minute: '2-digit'
    });
    return <>{pacificTime}</>;
};

const styles = {
    container: {
        padding: "30px",
    },
};

export default CreateTicketForm2;
