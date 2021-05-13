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

/**
 * How it works
 *  - Case 01: User click on login and login success THEN make a connection to Socket - DONE
 *  - Case 02: Page refresh (F5) - Check user is logged in and reconnect.
*/

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

  const doLogin = (event) => {
    console.log("App - User login..");
    socket.connect();
  }

  const socket = socketIOClient(ENDPOINT, {
    autoConnect: false,
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

  socket.on("disconnect", () => {
    socket.connect();
  });

  socket.on("new_notification", data => {
    if(data.title !== undefined){
      console.log('Received new notification: ', data);
      setNotification(data);
      addNewNotification(data);
    }
  });
  
  useEffect(() => {
    // return () => socket.disconnect();
  }, []);

  return (
    <div className="App">
      <Header notifications={notifications}/>
      <main>
        {/* <p>
          Socket server time: <time dateTime={response}>{response}</time>
        </p> */}
        <Home/>
        <div className="my-5">
            <div className="col-sm-12 text-left">
              <a onClick={() => doLogin()} className="btn btn-success">Login</a>
            </div>
          </div>
      </main>
    </div>
  );
}

export default App;
