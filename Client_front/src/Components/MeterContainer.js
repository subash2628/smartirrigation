import React from 'react'
import Moisture from './Moisture'
import Humidity from './Humidity'
import Temperature from './Temperature'

export default function MeterContainer({socket}) {
    //console.log("metercontainer rerendered")

  return (
    <>
        <Moisture socket={socket}/>
        <Humidity socket={socket}/>
        <Temperature socket={socket}/>
    </>
  )
}
