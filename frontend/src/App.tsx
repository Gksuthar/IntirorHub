import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './Layout/main';
import Home from './pages/Home';
import Payments from './pages/Payments';
import BOQ from './pages/BOQ';
import Expenses from './pages/Expenses';
import Feed from './pages/Feed';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Main App Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="payments" element={<Payments />} />
          <Route path="boq" element={<BOQ />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="feed" element={<Feed />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
