import React, { useState, useEffect } from "react";
import './App.css';
import Header from 'src/components/Layout/Header';
import Home from 'src/components/Home';
import socketIOClient from "socket.io-client";

const ENDPOINT = process.env.REACT_APP_NOTIFICATION_HOST;

function App() {

  const [response, setResponse] = useState("");
  const [notification, setNotification] = useState(null);

  const [notifications, setNotifications] = useState([]);

  const addNewNotification = (data) => {
    let _notifications = notifications;
    _notifications.push(data);
    setNotifications(_notifications);
  }

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    
    socket.on("FromAPI", data => {
      setResponse(data);
    });

    socket.on("new_notification", data => {
      setNotification(data);
      console.log('Received new notification: ', data);
      addNewNotification(data);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="App">
      <Header notifications={notifications}/>
      <main>
        <p>
          Socket server time: <time dateTime={response}>{response}</time>
        </p>
        <Home/>
      </main>
    </div>
  );
}

export default App;
