import React, { useState, useEffect } from "react";
import './App.css';
import Header from 'src/components/Layout/Header';
import Home from 'src/components/Home';
import socketIOClient from "socket.io-client";
import {
  Switch,
  useLocation
} from "react-router-dom";

const ENDPOINT = process.env.REACT_APP_NOTIFICATION_HOST;


function App() {

  let location = useLocation();
  let query = new URLSearchParams(location.search);
  const uid = query.get("uid") || 1;

  // const [response, setResponse] = useState("");
  const [notification, setNotification] = useState(null);

  const [notifications, setNotifications] = useState([]);

  const addNewNotification = (data) => {
    let _notifications = notifications;
    _notifications.push(data);
    setNotifications(_notifications);
  }

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT, {
      withCredentials: true,
      extraHeaders: {
        "x-authorization-id": uid
      }
    });
    
    // socket.on("FromAPI", data => {
    //   setResponse(data);
    // });

    socket.on("connecttion", data => {
      
    });

    socket.on("new_notification", data => {
      if(data.title !== undefined){
        console.log('Received new notification: ', data);
        setNotification(data);
        addNewNotification(data);
      }
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="App">
      <Header notifications={notifications}/>
      <main>
        {/* <p>
          Socket server time: <time dateTime={response}>{response}</time>
        </p> */}
        <Home/>
      </main>
    </div>
  );
}

export default App;
