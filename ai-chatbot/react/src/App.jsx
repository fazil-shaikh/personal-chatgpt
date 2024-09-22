import { Routes, Route } from "react-router-dom"

import Login from "./views/Login/Login.jsx";
import Chat from "./views/Chat/Chat.jsx";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={ <Chat />}>
          <Route path=":sessionId" element={ <Chat />}/>
        </Route>
        <Route path="/login" element={ <Login/> }/>
      </Routes>
    </div>
  )
}

export default App