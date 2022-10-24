import React, {useEffect, useState} from "react";
import axios from 'axios';
import FileDownload from 'js-file-download';
import { convertCompilerOptionsFromJson, textChangeRangeIsUnchanged } from "typescript";

function FileUploader() {

    const [fileRef, setFileRef] = useState(null);
    const [fileMut, setFileMut] = useState(null);
    const [fileMeta, setFileMeta] = useState(null);
    const [hidden, setHidden] = useState('hidden');
    const [downHidden, setDownHidden] = useState('hidden');
    const [loading, setLoading] = useState('none');
    const [color, setColor] = useState(['','']);
    const [colorMeta, setColorMeta] = useState('');
    const [compatibleR, setCompatibleR] = useState(true)
    const [compatibleM, setCompatibleM] = useState(true)
    const [compatibleMeta, setCompatibleMeta] = useState(true)
    const [alert, setAlert] = useState('')
    const [mess, setMess] = useState('')
    const [done, setDone] = useState(null);

    const colorOk='#90EE90';
    const colorNonOk='#FF5733'
    const errAlert = 'Make sure to choose a .fasta file for the reference field and a gzipped .vcf file for the variation field'
    const metaDisclaimer = 'The submission of a metainformation file is not mandatory and it will succeed only if the file is in csv format'

    const onInputChange = (e) => {
        if(e.target.id==='formFileReference'){
            setFileRef(e.target.files[0]);
            if(e.target.files[0]?.name && e.target.files[0]?.name.slice(-6)!=='.fasta') setCompatibleR(false)
            else setCompatibleR(true)
            // setColor(['#ccc',''])
        }
        else if (e.target.id==='formFileMutation'){
            setFileMut(e.target.files[0]);
            if(e.target.files[0]?.name && e.target.files[0]?.name.slice(-7)!=='.vcf.gz') setCompatibleM(false)
            else setCompatibleM(true)
        }
        else{
            setFileMeta(e.target.files[0]);
            if (e.target.files[0]?.name && e.target.files[0]?.name.slice(-4)!=='.csv') setCompatibleMeta(false)
            else setCompatibleMeta(true)
        }
    }

    async function prova (e) {
        e.preventDefault()
        fetch('//localhost:5001/demo/demo').then(
            res => res.json()
        ).then(
            data => {
                console.log(data)
                setDone(data)
                setLoading('none')
                setAlert('')
            }
        )
    }

    async function constructGraph (e) {
        e.preventDefault();
        const dataR = new FormData();
        dataR.append('file', fileRef)
        const dataM = new FormData();
        dataM.append('file', fileMut)
        await axios.post('//localhost:5001/demo/upload', dataR)
            .then((e) => {
                console.log('success')
            })
            .catch( (err) => {
                console.error('Error', err)
            })
        await axios.post('//localhost:5001/demo/upload', dataM)
            .then((e) => {
                console.log('success')
            })
            .catch( (err) => {
                console.error('Error', err)
            })
        await fetch('//localhost:5001/demo/construct').then(
            res => res.json(),
            console.log('success'),
            setFileRef(null),
            setFileMut(null),
            setHidden('hidden'),
            setLoading(''),
            setAlert('Graph is loading') 
        ).then(
            data => {
                console.log(data.message)
                if(data.message === 'done'){
                    setLoading('none') 
                    setAlert('')
                    setDownHidden('')
                }
                
            }
        ) 
    }

    const download = (e) => {
        e.preventDefault()
        axios({
            url: "http://localhost:5001/demo/down",
            method: "GET",
            responsType: "blob"
        }).then(
            res => {
                FileDownload(res.data, "GraphDownloaded.gfa")
                console.log(res)
                setDownHidden('hidden')
            }
        )
    }

    useEffect(()=>{
        if (fileMeta?.name){
            if (compatibleMeta) {
                setColorMeta(colorOk)
            }else setColorMeta(colorNonOk)
        }else setColorMeta('')

        if (fileRef?.name && fileMut?.name) {
            if (compatibleR && compatibleM) {
                setHidden('');
                setColor([colorOk,colorOk])
                setAlert('Ready to start the construction')
            }
            else {
                setHidden('hidden');
                setColor([colorNonOk,colorNonOk])
                setAlert(errAlert)
            }
        }
        else {
            setHidden('hidden')
            if (fileRef?.name){
                if(compatibleR){ 
                    setColor(['#ccc',''])
                    setAlert('')
                }
                else {
                    setColor([colorNonOk,''])
                    setAlert(errAlert)
                }
            }
            else if  (fileMut?.name) {
                if(compatibleM) {
                    setColor(['','#ccc'])
                    setAlert('')
                }
                else {
                    setColor(['',colorNonOk])
                    setAlert(errAlert)
                }
            }
            else {
                setColor(['',''])
                
            }
        }
    },[fileRef,fileMut,fileMeta])

    
    return (
        <div style={{with:'100%', height:'220px', display:'block'}}>
            <div style={{with:'100%', height:'80%'}} id='formcontainer'>
                {/* <p>{'Data ora: '+JSON.stringify(done)}</p> */}
                <div  className='formdiv' style={{backgroundColor: color[0]}}>
                    <label  className="form-label">
                        <h3>Referece fasta file</h3>
                        <input className="form-control" onChange= {onInputChange} type="file" id="formFileReference" />
                        <p>{fileRef?.name}</p>
                    </label>
                </div>
                <div  className='formdiv' style={{backgroundColor: color[1]}}>
                    <label for="formFileMutation" className="form-label">
                        <h3>Mutation vcf file</h3>
                        <input className="form-control" onChange= {onInputChange} type="file" id="formFileMutation"  /> 
                        <p>{fileMut?.name}</p>
                    </label>
                </div>
                <div  className='formdiv' style={{backgroundColor: colorMeta}}>
                    <label className="form-label">
                        <h3>Metainformation csv file</h3>
                        <input className="form-control" onChange= {onInputChange} type="file" id="formFileMeta"  /> 
                        <p>{fileMeta?.name}</p>
                    </label>
                </div>
            </div>

            <div style={{with:'100%', height:'100%', textAlign:'center'}}>
                <p className='err' style={{color:((compatibleR && compatibleM)? colorOk : colorNonOk), fontSize:'18px'}}>{alert}</p>
                <button onClick={constructGraph} hidden={hidden} className='constbtn' >Construct Graph</button>
                <div className="lds-roller" style={{display:loading}}><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                <p style={{display:loading}}>This process could take a few minutes...</p>
                <button className='constbtn' hidden={downHidden} onClick={download}>Download Graph</button>
                <p style={{color:'#ccc'}}>{metaDisclaimer}</p>
            </div>
            
        </div>
    ) 
}
export default FileUploader;