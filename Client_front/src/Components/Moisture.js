import React from 'react';
import {useState} from 'react'
import Meter from './meter'

function Moisture({socket}) {

    const [data,setData]= useState(0)
    socket.on("receive-message-broadcast", message=>{
        //console.log("moisture: ",message)
        setData(message.M)
    })

    //console.log("moisture rerendered")

  return <Meter data={data} label="Moisture"/>;
}


export default Moisture;