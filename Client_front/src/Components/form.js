import React from 'react'
import {useState,useEffect} from 'react'
import '../form.css'
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

export default function Inputform({socket}) {
    const [refValM,setRefValM]= useState(0)
    // const [kp,setKp]= useState(0)
    // const [kd,setKd]= useState(0)
    // const [ki,setKi]= useState(0)
    const [automatic,setAutomatic]= useState([false,true])
    const [motor,setMotor]= useState([false,true])
    const [predictionMode,setPredictionMode]= useState([false,true])
    const [learningMode,setLearningMode]= useState([false,true])
    const [motorSpeed,setMotorSpeed] = useState([0,false])



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

    useEffect(()=>{
        if(learningMode[0]===learningMode[1])
        {
            //console.log("update-value-automatic")
            socket.emit("update-learning-mode",{learningMode:learningMode[0]})
        }
    },[learningMode])

    useEffect(()=>{
        if(predictionMode[0]===predictionMode[1])
        {
            //console.log("update-value-automatic")
            socket.emit("update-prediction-mode",{predictionMode:predictionMode[0]})
        }
    },[predictionMode])

    
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

    useEffect(()=>{
        // if(predictionMode[0]===predictionMode[1])
        // {
        //     //console.log("update-value-automatic")
        //     socket.emit("update-prediction-mode",{predictionMode:predictionMode[0]})
        // }
        if(motorSpeed[1])
        {
            socket.emit("update-motor-speed",motorSpeed[0])
            //console.log("from inside : ",motorSpeed[0])
        }
        //else console.log("from outside : ",motorSpeed[0])
        
    },[motorSpeed[0]])

    useEffect(() => {
        const updateMotorStatus = (motorStatus) => 
                    setMotor(motorStatus===1? [true,false] : [false,true]);
        
        const updateControlStatus = (controlStatus, refValM)=>{
            //console.log(controlStatus, refValM)
            setAutomatic(controlStatus===1? [true,false] : [false,true])
            setRefValM(refValM)
        }

        const updatePredictionStatus = (predictionStatus)=> 
                    setPredictionMode(predictionStatus===1? [true,false] : [false,true])

        const updateLearningStatus = (learningStatus)=> 
                    setLearningMode(learningStatus===1? [true,false] : [false,true])

        const updateMotorSpeedStatus = (motorSpeedStatus)=>
        {

            setMotorSpeed([motorSpeedStatus,false])
        }

        socket.on("receive-motorstatus-broadcast",updateMotorStatus)
        socket.on("receive-controlStatus-broadcast",updateControlStatus)
        socket.on("receive-predictionMode-broadcast",updatePredictionStatus)
        socket.on("receive-learningMode-broadcast",updateLearningStatus)
        socket.on("receive-motorSpeed-broadcast",updateMotorSpeedStatus)

        return() => {
              // turning of socket listner on unmount
            socket.off("receive-motorstatus-broadcast",updateMotorStatus);
            socket.off("receive-controlStatus-broadcast",updateControlStatus);
            socket.off("receive-predictionMode-broadcast",updatePredictionStatus);
            socket.off("receive-learningMode-broadcast",updateLearningStatus);
            socket.off("receive-motorSpeed-broadcast",updateMotorSpeedStatus)
         }
    }, [])
   

    useEffect(()=>{
        socket.emit("give-me-initial-state",(motorStatus,automaticStatus,refValMStatus,predictionStatus,learningStatus,motorSpeedStatus)=>{
            //console.log("give-me-initial-state ", motorStatus,automaticStatus,refValMStatus)
            if(motorStatus===1) {
                setMotor([true,false])
            } 
            setMotorSpeed([motorSpeedStatus,false])
            if(automaticStatus === 1) {
                setAutomatic([true,false])
                setRefValM(refValMStatus)
            }

            predictionStatus === 1 && setPredictionMode([true,false])
            learningStatus === 1 && setLearningMode([true,false])

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

            {!automatic[0] && <div className="row">
                <div className="col-25">
                <label >Learning Mode :</label>
                </div>
                <div className="col-75">
                    <Switch
                     checked={learningMode[0]}
                     //disabled={automatic[0]}
                     onChange={()=> setLearningMode(learningMode[0] ? [false,false]: [true,true])}
                     />
                </div>
            </div>}

            {automatic[0] && <div className="row">
                <div className="col-25">
                <label >Prediction Mode :</label>
                </div>
                <div className="col-75">
                    <Switch
                     checked={predictionMode[0]}
                     //disabled={automatic[0]}
                     onChange={()=> setPredictionMode(predictionMode[0] ? [false,false]: [true,true])}
                     />
                </div>
            </div>}

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

            {motor[0] && <><Box width={300}>
                <Slider 
                    //defaultValue={motorSpeed} 
                    aria-label="Default" 
                    valueLabelDisplay="auto" 
                    onChange={(e)=>{setMotorSpeed([e.target.value,true])}}
                    //value={1}
                    //getAriaLabel={()=>'subash'}
                    //value={20}
                    min={0}
                    max={255}
                    value={motorSpeed[0]}
                    disabled={automatic[0]}
                    />
            </Box></>}



            {automatic[0] && !predictionMode[0] && <div className="row">
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
            </div>}
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
                
                

            {/* <br/>
            <div className="row">
                <input type="button" value="Set"/>
            </div> */}
    </form>
  </div>
  )
}
