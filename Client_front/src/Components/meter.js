import React from 'react';
import GaugeChart from 'react-gauge-chart'
import '../meter.css';

// const chartStyle = {
//   height: 250,
 
// }

function meter({data,label}) {

  return <div className='meter'>
      <GaugeChart 
        id="gauge-chart1" 
        nrOfLevels={30} 
        //arcPadding={0.1} 
        cornerRadius={2} 
        percent={Number(data/100)}//normalizing data to [0-1]
        //style={chartStyle}
        textColor="#8093bf"
        animateDuration={5000}
        formatTextValue={(value)=>label==='Temperature' ? value+'°C' : value+'%'}
        />

        <p className='meterlabel'>{label}</p>
  </div>;
}


export default meter;