// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Change this line

import TicketList from './TicketList';
import TicketList2 from './TicketList2';
import TicketList3 from './TicketList3';
import CreateTicketForm from './CreateTicketForm';
import ServingCustomerPage from './ServingCustomerPage';
import CreateTicketForm2 from './CreateTicketForm2';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Add your existing routes */}
        <Route path="/" element={<TicketList/>} />
        <Route path="/tickets" element={<TicketList/>} />
        <Route path="/tickets2" element={<TicketList2/>} />
        <Route path="/tickets3" element={<TicketList3/>} />

        <Route path="/createTicket" element={<CreateTicketForm />} />
        <Route path="/createTicket2" element={<CreateTicketForm2 />} />

        {/* New route for the "Serving Customer" page */}
        <Route path="/servingCustomer" element={<ServingCustomerPage />} />
      </Routes>
    </Router>
  );
};

export default App;