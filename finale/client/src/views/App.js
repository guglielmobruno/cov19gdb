import React, {useEffect, useState} from "react";
import axios from 'axios';

function App() {

    const [data, setData] = useState([{}]);
    const [inputData, setInputData] = useState("");

    useEffect(() =>{
        fetch("/demo/api").then(
            res => res.json()
        ).then(
            data => {
                setData(data)
            }
        )
    }, []);

    const handleClick = () => {
        axios
            .post('http://localhost:5001/demo/pip', inputData)
            .then(() => console.log('data sent'))
            .catch(err => {
                console.error(err);
            });
        setInputData('')
    }

    const handleChange = (e) => {
        setInputData(e.target.value.toString())
    }

    return (
        <div>
            <p>{data.message}</p>
            <form>
                <input type='text' onChange={handleChange} value={inputData}></input>
                <button type="button" onClick={handleClick}>Click</button>
            </form>
        </div>
    ) 
}
export default App;