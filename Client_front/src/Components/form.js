import React from 'react'
import {useState,useEffect} from 'react'
import '../form.css'
import Switch from '@mui/material/Switch';

export default function Inputform({socket}) {
    const [refValM,setRefValM]= useState(0)
    // const [kp,setKp]= useState(0)
    // const [kd,setKd]= useState(0)
    // const [ki,setKi]= useState(0)
    const [automatic,setAutomatic]= useState([false,true])
    const [motor,setMotor]= useState([false,true])

    //console.log("form rendered", 'motor status: ',motor)
    //console.log("form rendered", 'control status: ',automatic, refValM)

    useEffect(() => {
        //console.log("use effect out")
        if(motor[0]===motor[1])//xnor
        {
            socket.emit("update-value-motor",{motor:motor[0]})
            //console.log("use effect in")
        }
      },[motor]);

    useEffect(()=>{
        if(automatic[0]===automatic[1])
        {
            //console.log("update-value-automatic")
            socket.emit("update-value-automatic",{automatic:automatic[0],refValM})
        }
    },[automatic])
    
    const handleRefValmChange =e=>{
        if(!isNaN(+e.target.value) && +e.target.value<100)
        {
            setRefValM(+e.target.value)
            //console.log(+e.target.value)
            //let state update
            //but update server as soon as possible
            socket.emit("update-value-automatic",{automatic:automatic[0],refValM:+e.target.value })
        }
    }

    useEffect(() => {
        const updateMotorStatus = (motorStatus) => setMotor(motorStatus===1? [true,false] : [false,true]);
        
        const updateControlStatus = (controlStatus, refValM)=>{
            //console.log(controlStatus, refValM)
            setAutomatic(controlStatus===1? [true,false] : [false,true])
            setRefValM(refValM)
        }

        socket.on("receive-motorstatus-broadcast",updateMotorStatus)
        socket.on("receive-controlStatus-broadcast",updateControlStatus)

        return() => {
              // turning of socket listner on unmount
            socket.off("receive-motorstatus-broadcast",updateMotorStatus);
            socket.off("receive-controlStatus-broadcast",updateControlStatus);
         }
    }, [])
   

    useEffect(()=>{
        socket.emit("give-me-initial-state",(motorStatus,automaticStatus,refValMStatus)=>{
            //console.log("give-me-initial-state ", motorStatus,automaticStatus,refValMStatus)
            motorStatus===1 && setMotor([true,false])
            if(automaticStatus === 1) {
                setAutomatic([true,false])
                setRefValM(refValMStatus)
            }
        })
    },[])
    
  return (
    <div className="form-container">
        <form autoComplete="off" onSubmit={e => { e.preventDefault() }}>
            <div className="row">
                <div className="col-25">
                <label >Automatic Control Mode:</label>
                </div>
                <div className="col-75">
                    <Switch
                     checked={automatic[0]}
                     onChange={()=>setAutomatic(automatic[0] ? [false,false]: [true,true])}
                     />
                </div>
            </div>

            <div className="row">
                <div className="col-25">
                <label >Motor :</label>
                </div>
                <div className="col-75">
                    <Switch
                     checked={motor[0]}
                     disabled={automatic[0]}
                     onChange={()=> setMotor(motor[0] ? [false,false]: [true,true])}
                     />
                </div>
            </div>


            {automatic[0] && <><div className="row">
                <div className="col-25">
                <label >Moisture Threshold (%):</label>
                </div>
                <div className="col-75">
                <input 
                    type="text" 
                    id="refVal" 
                    name="refVal" 
                    //placeholder="refVal"
                    value={refValM} 
                    onChange={handleRefValmChange}/>
                </div>
            </div>
            {/* <div className="row">
                <div className="col-25">
                <label >Proportional Control (Kp) :</label>
                </div>
                <div className="col-75">
                <input 
                    type="text" 
                    id="kp" 
                    name="kp" 
                    //placeholder="kp"
                    value={kp} 
                    onChange={e=>!isNaN(+e.target.value) && setKp(+e.target.value)}/>
                </div>
            </div>
                <div className="row">
                <div className="col-25">
                <label >Derivative Control (Kd) :</label>
                </div>
                <div className="col-75">
                <input 
                    type="text" 
                    id="kd" 
                    name="kd" 
                    //placeholder="kd"
                    value={kd} 
                    onChange={e=>!isNaN(+e.target.value) && setKd(+e.target.value)}/>
                </div>
            </div>
            
            <div className="row">
                    <div className="col-25">
                        <label >Integral Control (ki) :</label>
                    </div>
                    <div className="col-75">
                        <input 
                            type="text" 
                            id="ki" 
                            name="ki" 
                            //placeholder="ki"
                            value={ki} 
                            onChange={e=>!isNaN(+e.target.value) && setKi(+e.target.value)}/>
                    </div>
                </div> */}
                </>}
                

            {/* <br/>
            <div className="row">
                <input type="button" value="Set"/>
            </div> */}
    </form>
  </div>
  )
}
