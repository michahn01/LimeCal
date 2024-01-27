import "./styles.css"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from "./Home/Home.tsx"
import Navbar from "./Navbar/Navbar.tsx"
import Create from "./CreateEvent/CreateEvent.tsx"
import Event from "./Event/Event.tsx"
import NotFound from "./NotFound.tsx"
import Help from "./Help/Help.tsx"
import Feedback from "./Feedback/Feedback.tsx"


function App() {
  return (
    <Router>
      <Navbar></Navbar>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/events/create" element={<Create />}></Route>
        <Route path="/events/:eventId" element={<Event />}></Route>
        <Route path="/help" element={<Help />}></Route>
        <Route path="/feedback" element={<Feedback />}></Route>
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </Router>
  )
}

export default App
