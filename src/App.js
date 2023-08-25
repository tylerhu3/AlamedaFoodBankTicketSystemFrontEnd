// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Change this line

import TicketList3 from './TicketList3';
import NextCustomerPage from './NextCustomerPage';
import CreateTicketForm2 from './CreateTicketForm2';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Add your existing routes */}
        <Route path="/admin22" element={<TicketList3/>} />

        {/* <Route path="/createTicket" element={<CreateTicketForm />} /> */}
        <Route path="/ticket" element={<CreateTicketForm2 />} />

        {/* New route for the "Serving Customer" page */}
        <Route path="/" element={<NextCustomerPage />} />
      </Routes>
    </Router>
  );
};

export default App;