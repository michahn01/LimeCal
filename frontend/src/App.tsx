import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from "./Home/Home.jsx"
import "./styles.css"
import Navbar from "./Navbar/Navbar.jsx"
// import Footer from "./Navbar/Footer.jsx"
import Create from "./CreateEvent/CreateEvent.jsx"
import Event from "./Event/Event.jsx"

function App() {
  return (
    <Router>
      <Navbar></Navbar>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/events/create" element={<Create />}></Route>
        <Route path="/events/:eventId" element={<Event />}></Route>
        <Route path="/help"></Route>
        <Route path="/feedback"></Route>
      </Routes>
      {/* <Footer></Footer> */}
    </Router>
  )
}

export default App
