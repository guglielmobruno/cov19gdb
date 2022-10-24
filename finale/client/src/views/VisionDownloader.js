import React, {useEffect, useState} from "react";
import { useSigma} from "react-sigma-v2";
import axios from 'axios';
import FileDownload from 'js-file-download';
import { convertCompilerOptionsFromJson, textChangeRangeIsUnchanged } from "typescript";

function VisionDownloader(epiList, ref) {
    const sigma = useSigma();
    const graph = sigma.getGraph();

    async function sendVision(data) {
        await axios.post('//localhost:5001/demo/visionup', {dati: data})
        .then(() => {
            console.log('success')
        })
        .catch( (err) => {
            console.error('Error', err)
        })
        await axios({
            url: "http://localhost:5001/demo/visiondown",
            method: "GET",
            responsType: "blob"
        }).then(
            res => {
                FileDownload(res.data, "GraphDownloaded.gfa")
                console.log(res)
            }
        )
    }
    async function downloadVision() {
        let content = ''
        graph.forEachNode((key, attributes) => {
            if(graph.getNodeAttribute(key,'hidden') === false) {
                content+=`S\t${key}\t${attributes['sequence']}\n`
            }
        })
        graph.forEachEdge((key, attributes) => {
            if(graph.getEdgeAttribute(key,'hidden') === false) {
                content+=`L\t${attributes['source']}\t${attributes['from_sign']==='true'?'-':'+'}\t${attributes['target']}\t${attributes['to_sign']==='true'?'-':'+'}\t*\n`
            }
        })
        fetch(`${process.env.PUBLIC_URL}/datafinale.json`)
            .then((res) => {return res.text()})
            .then((data) => {
                const metadata = JSON.parse(data).metadata
                let i = 0;
                let cont = 0
                metadata.forEach((meta) => {
                    if (epiList.length){
                        if (epiList.includes(meta.epi_id)){
                            content+=`W\t${meta.epi_id}\t0\tNC_045512.2\t0\t29903\t${meta.path}\n`
                            cont++;
                        }
                    }else if (ref===false) content+=`W\t${meta.epi_id}\t0\tNC_045512.2\t0\t29903\t${meta.path}\n`
                })
                console.log(content)
                sendVision(content)
            })
    }
    return(
        <div>
            <button onClick={downloadVision}></button>
        </div>
    )
}
export default VisionDownloader;
