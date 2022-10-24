import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import FileUploader from "./FileUploader";
const Home = () => {

    const [available, setAvailable] = useState(['sars_cov2','sars_cov3']);

    //useEffect(() => { fetch('//localhost:5001/demo/construct').then(
    //     res => res.json({source: 'home'}),
    //     ).then(
    //         data => {
    //             console.log(data.message)
    //             if(data.message === 'done'){
    //                 let newAvailable = available;
    //                 newAvailable.append(data.name)
    //                 setAvailable(newAvailable)
    //             }
                
    //         }
    //     ) 
    //})

    return (
        <div className='home'>
            <h1 style={{fontSize:'35px'}}>
                GenoGra
            </h1>
            <div className='construct'>
                <h2>Graph Construction</h2>
                
                <FileUploader />
            </div>
            <div className='construct'>
                <h2>Available Graphs</h2>
                <Link to="/graph" >Sars-COV2</Link>
                <li>{available.map((gr) =>
                    <Link to={'/'+gr}>{gr}</Link>
                )}</li>
            </div>
        </div>
    )
}
export default Home;