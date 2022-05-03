import React from 'react';
import {useState} from 'react'
import Meter from './meter'


function Temperature({socket}) {

    const [data,setData]= useState(0)
    socket.on("receive-message-broadcast", message=>{
        //console.log("Temperature: ",message)
        setData(message.T)
    })

    //console.log("moisture rerendered")

  return <Meter data={data} label="Temperature"/>;
}


export default Temperature;