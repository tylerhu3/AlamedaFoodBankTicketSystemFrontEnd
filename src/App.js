// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Change this line

import TicketList from './TicketList';
import CreateTicketForm from './CreateTicketForm';
import ServingCustomerPage from './ServingCustomerPage';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Add your existing routes */}
        <Route path="/" element={<TicketList />} />
        <Route path="/createTicket" element={<CreateTicketForm />} />

        {/* New route for the "Serving Customer" page */}
        <Route path="/servingCustomer" element={<ServingCustomerPage />} />
      </Routes>
    </Router>
  );
};

export default App;