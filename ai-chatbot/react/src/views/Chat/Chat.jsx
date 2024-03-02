import {useState, useEffect} from 'react';
import {useParams, useNavigate, NavLink} from 'react-router-dom';
import {ChatBubbleBottomCenterIcon, PlusIcon} from "@heroicons/react/24/outline/index.js";
import parse from 'html-react-parser';

import {getCSRFToken} from "../../utils/csrf.js"

const Chat = () => {
  const {sessionId} = useParams();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [chatOutput, setChatOutput] = useState([]);
  const [message, setMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    // Fetch historical chat sessions
    fetch('/api/sessions', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'X-CSRFToken': getCSRFToken()
      },
    })
      .then(response => response.json())
      .then(data => setSessions(data))
      .catch(error => console.error('Error fetching sessions:', error));
  }, []);

  useEffect(() => {
    // fetch sessionId if it exists
    if (sessionId) {
      fetch(`/api/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-CSRFToken': getCSRFToken()
        },
      })
        .then(response => response.json())
        .then(data => {
          setChatOutput(data.messages)
        })
        .catch(error => console.error('Error fetching sessions:', error));
    }
  }, [sessionId]);

  const handleNewChat = () => {
    setChatOutput([]);
    navigate('/');
  }

  const handleChat = () => {
    setChatLoading(true);
    setChatOutput(prevChatOutput => [
      ...prevChatOutput,
      {content: message, role: 'user'}
    ]);

    const payload = {
      message: message,
      ...(sessionId && {session_id: sessionId})
    }

    // Make an API call to chat
    fetch('/api/chat', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'X-CSRFToken': getCSRFToken(),
      },
      body: JSON.stringify(payload),
    })
      .then(response => response.json())
      .then(data => {
        setChatOutput(prevChatOutput => [
          ...prevChatOutput,
          {content: data.message, role: data.role}
        ]);
        setMessage('');
        navigate(`/${data.session_id}`);
        setChatLoading(false);
      })
      .catch(error => console.error('Error sending message:', error));
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-1/6 bg-gray-800 h-screen overflow-y-auto px-5 pt-3">
        <button
          onClick={handleNewChat}
          className="flex items-center space-x-1 text-gray-100 border border-gray-500 w-full text-left py-2 px-2 rounded text-sm hover:text-gray-500"
        >
          <PlusIcon className="w-4 h-4"/>
          <span>New Chat</span>
        </button>
        <h1 className="text-sm text-gray-400 mt-6 mb-3">Historical Sessions</h1>
        <ul className="space-y-4">
          {sessions.map((session, index) => (
            <li key={index} className="text-gray-100">
              <NavLink
                to={`/${session.id}`}
                className="flex font-light items-center space-x-3 hover:text-gray-500"
              >
                <ChatBubbleBottomCenterIcon className="w-4 h-4"/>
                <span className="truncate">{session.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative w-5/6 h-screen flex flex-col">
        {/* Chat Output */}
        <div className="flex-1 overflow-y-auto mt-3 mb-24">
          {chatOutput.map((output, index) => (
            <div key={index} className="even:bg-gray-100">
              <div className="max-w-4xl mx-auto p-4 flex my-3">
                <div className="w-1/12 flex justify-end">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${output.role === 'assistant' ? 'bg-blue-500' : 'bg-green-500'}`}
                  >
                    <span className="text-white">
                      {output.role === 'assistant' ? 'A' : 'U'}
                      </span>
                  </div>
                </div>
                <div className="ml-4 px-2 rounded w-11/12 text-gray-800 font-light content leading-6 chat-content">
                  {parse(output.content)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Section */}
        <div className="absolute bottom-0 left-0 w-full bg-white z-10">
          <div className="max-w-4xl mx-auto mb-12 pt-3">
            <div
              className="flex items-center w-full border rounded shadow">
              <input
                type='text'
                className='flex-1 p-3 rounded-l outline-none'
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
              <button
                className='ml-0 px-4 py-3 bg-blue-500 text-white rounded-r'
                onClick={handleChat}
                disabled={chatLoading}
              >
                {chatLoading ? <div className='spinner'></div> : 'Chat'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat