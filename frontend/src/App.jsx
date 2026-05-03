import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/authContext'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import Navbar from './components/Navbar/Navbar'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Dashboard from './pages/Dashboard/Dashboard'
import TripDetail from './pages/TripDetail/TripDetail'
import Profile from './pages/Profile/Profile'
import PublicProfile from './pages/PublicProfile/PublicProfile'
import Explore from './pages/Explore/Explore'
import PublicTrip from './pages/PublicTrip/PublicTrip'

const App = () => {
  const { user } = useAuth()

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/trips/:id" element={<ProtectedRoute><TripDetail /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<PublicProfile />} />
        <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="/trips/public/:id" element={<PublicTrip />} />
      </Routes>
    </>
  )
}

export default App