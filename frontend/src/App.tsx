import "./styles.css"

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from "./Home/Home.jsx"
import Navbar from "./Navbar/Navbar.jsx"
import Create from "./CreateEvent/CreateEvent.jsx"
import Event from "./Event/Event.jsx"
import NotFound from './NotFound.js'

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
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
      {/* <Footer></Footer> */}
    </Router>
  )
}

export default App
