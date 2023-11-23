import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from "./Home.jsx"
import "./css/basic.css"
import Navbar from "./Navbar.jsx"
import Footer from "./Footer.jsx"

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Navbar></Navbar>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/events/create"></Route>
        <Route path="/events/:eventId"></Route>
        <Route path="/help"></Route>
        <Route path="/feedback"></Route>
      </Routes>
      <Footer></Footer>
    </Router>
  )
}

export default App
