import React from 'react';
import {useState} from 'react'
import Meter from './meter'

function Humidity({socket}) {

    const [data,setData]= useState(0)
    socket.on("receive-message-broadcast", message=>{
        setData(message.H)
    })

    //console.log("Humidity rerendered")

  return <Meter data={data} label="Humidity"/>;
}


export default Humidity;