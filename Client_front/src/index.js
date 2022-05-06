import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';


const { io } = require("socket.io-client");
const socket = io("192.168.100.112:5000");
//const socket = io("192.168.43.18:5000");
//socket.emit("hello from client", 5, "6", { 7: Uint8Array.from([8]) });

// ReactDOM.render(
//   <React.StrictMode>
//     <App socket={socket}/>
//   </React.StrictMode>,
//   document.getElementById('root')
// );

ReactDOM.render(
    <App socket={socket}/>,
  document.getElementById('root')
);
