const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require('cors');
const { writeDataToCsv,endWrite,readDataFromCsv } = require('./csvFormat')
const {LearnSelf , PredictIt} = require('./logisticRegression')
const app = express();
const Controller = require('node-pid-controller');


const httpServer = createServer(app);
const io = new Server(httpServer, { 
    allowEIO3: true ,
    cors: {
        origin: '*',
      }
});

app.use(express.static('public'));
const PORT = process.env.PORT || 5000

console.log("port is ",PORT)
 
let ctr = new Controller({
  k_p: 0,
  k_i: 0,
  k_d: 5,
  dt: 2
});

let M =0 , H =0 ,T =0 ;
let motorStatus = 0; // 0 -> off , 1-> ON
let M_ref = 0, H_ref = 0, T_ref=0;
let Precision = 4;
let automaticControlMode = 0;
let refValM = 0;
let predictionMode = 0;
let learningMode = 0;
let motorSpeed = 0;


app.use(cors());

io.on("connection", (socket) => {

    console.log("connected "+socket.id);
    // send a message to the client
    //socket.emit("hello from server",{message:"Hello dost"});

    // receive a message from the client
    socket.on("getData", (...args) => {
        
        //console.log(args);
        H = Number((args[0].humidity).toPrecision(Precision));
        //M =  Number((100 - ( (args[0].moisture*100/1023) )).toPrecision(Precision));
        M =  Number(Math.abs((100 - ( ((args[0].moisture-600)/4.24) ))).toPrecision(Precision));
        T = Number((args[0].temperature).toPrecision(Precision));

        //data saturation
        H = (H<0 || H>100) ? H_ref : H
        M = (M<0 || M>100) ? M_ref : M
        T = (T<0 || T>100) ? T_ref : T

        //error calculation
        // dM = parseFloat(M - M_ref).toFixed(errorPrecision);
        // dH = parseFloat(H - H_ref).toFixed(errorPrecision);
        // dT = parseFloat(T - T_ref).toFixed(errorPrecision);

        //error saturation
        // if(dM < errorThreshold) dM=0;
        // if(dH < errorThreshold) dH=0;
        // if(dT < errorThreshold) dT=0;

        //special for new Client
        // if(newClient) dM = dH = dT = 1;

        //console.log('pM=',M_ref,'pH=',H_ref,'pT=',T_ref);
        console.log('M=',M,'H=',H,'T=',T);
        //console.log('dH=',dH,'dM=',dM,'dT=',dT);

        //if(dM !== 0 || dH !==0 || dT!==0 || newClient)
        //{
            socket.broadcast.emit("receive-message-broadcast",{M,H,T}); 
            //newClient = false;
            
            
        //store in csv file
        console.log('learningMode',learningMode , 'automaticControlMode',automaticControlMode,' predictionMode',predictionMode)
        if(((M !== M_ref) || (H !== H_ref) || (T !== T_ref)) && learningMode===1 && automaticControlMode === 0 )
        {
            console.log('wroteDataToCsv')
            writeDataToCsv(M,H,T,motorStatus);
        }
        //}
        
        //socket.emit("receive-motorstatus-broadcast",motorStatus); 
        else if(automaticControlMode === 1 && predictionMode === 0)
        {
            console.log("automaticControlMode ",automaticControlMode,M,refValM)
            if(M<refValM)
            {
                console.log("Motor On ",M,refValM)
                motorStatus = 1
                io.sockets.emit("receive-motorstatus-broadcast",motorStatus);
                let correction = ctr.update(M);
                console.log('correction ',correction)
                io.sockets.emit("receive-motorSpeed-broadcast",correction);
            }else{
                console.log("Motor Off ",M,refValM)
                motorStatus = 0
                io.sockets.emit("receive-motorstatus-broadcast",motorStatus);
            }
        }

        else if(automaticControlMode === 1 && predictionMode === 1)
        {
            
            //console.log(PredictIt([M,H,T]))
            const predictedValue = PredictIt([M,H,T])
            console.log("predictedValue ",predictedValue)
            motorStatus = predictedValue[0]
            io.sockets.emit("receive-motorstatus-broadcast",motorStatus);
        }
        

        M_ref = M, H_ref = H, T_ref=T;
    });

    socket.on("update-value-automatic", (...args) => {
            console.log('update-value-automatic ',args[0])
            automaticControlMode = args[0].automatic ? 1 : 0;
            refValM = args[0].refValM
            ctr.setTarget(refValM); 
            //motorStatus = args[0].motor ? 1 : 0;
            
            socket.broadcast.emit("receive-controlStatus-broadcast",automaticControlMode,refValM);
        //endWrite(); 
    });

    socket.on("update-value-motor", (...args) => {
        console.log('update-value-motor ',args[0])
        motorStatus = args[0].motor ? 1 : 0;
        
        socket.broadcast.emit("receive-motorstatus-broadcast",motorStatus);
    //endWrite(); 
});

    socket.on("give-me-initial-state",(...args)=>{
        console.log("give-me-initial-state ",args)
        args[0](motorStatus,automaticControlMode,refValM,predictionMode,learningMode,motorSpeed)
    })

    socket.on("update-prediction-mode",(...args)=>{
        console.log("update-prediction-mode ",args[0].predictionMode)
        //args[0](motorStatus,automaticControlMode,refValM)
        //LearnSelfAndPredictIt([])    
        predictionMode = args[0].predictionMode ? 1 : 0
        args[0].predictionMode && LearnSelf().then((flag)=>{
            console.log('LearningComplete : ',flag)
            socket.broadcast.emit("receive-predictionMode-broadcast",predictionMode);
        })
    })

    socket.on("update-learning-mode",(...args)=>{
        console.log("update-learning-mode ",args[0].learningMode)
        //args[0](motorStatus,automaticControlMode,refValM)
        //LearnSelfAndPredictIt([])    
        learningMode = args[0].learningMode ? 1 : 0
        socket.broadcast.emit("receive-learningMode-broadcast",learningMode);
    })

    socket.on("update-motor-speed",(...args)=>{
        console.log("update-motor-speed ",args[0])
        //args[0](motorStatus,automaticControlMode,refValM)
        //LearnSelfAndPredictIt([])    
        //learningMode = args[0].learningMode ? 1 : 0
        //socket.broadcast.emit("receive-learningMode-broadcast",learningMode);
        motorSpeed = args[0]
        socket.broadcast.emit("receive-motorSpeed-broadcast",motorSpeed);
    })
});



httpServer.listen(PORT);
