import './App.css';
import {useState} from 'react'
import MeterContainer from './Components/MeterContainer'
import Inputform from './Components/form'

function App({socket}) {
  const [socketId,setId]= useState(null)

  socket.on("connect",()=>{
      //console.log(`You connected with id : ${socket.id}`);
      setId(socket.id)
  })

  // socket.emit("give-me-motor-status",(flag)=>{
  //   console.log("setting motor status initially")
  //   setMotorInitialState(flag)
  // })

  //console.log("app rendered",socket.id)

  return (
    socketId ?
    <div className='app-body'>
      <header className='header'>
        <h2 style={{opacity:0.1}}> ID : {socketId}</h2>
      </header>
      <div className='message-container'>
          <MeterContainer socket={socket}/>
      </div>
      <div className='input-container'>
        <Inputform socket={socket} />
      </div>
    </div>:<></>
  );
}

export default App;
