// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Change this line

import TicketList3 from './TicketList3';
import CreateTicketForm from './CreateTicketForm';
import ServingCustomerPage from './ServingCustomerPage';
import CreateTicketForm2 from './CreateTicketForm2';
const serverIP = window.location.hostname; // This gets the current IP address of the device

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Add your existing routes */}
        <Route path="/" element={<TicketList3/>} />
        <Route path="/admin" element={<TicketList3/>} />

        <Route path="/createTicket" element={<CreateTicketForm />} />
        <Route path="/createTicket2" element={<CreateTicketForm2 />} />

        {/* New route for the "Serving Customer" page */}
        <Route path="/servingCustomer" element={<ServingCustomerPage />} />
      </Routes>
    </Router>
  );
};

export default App;