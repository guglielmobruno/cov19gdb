import axios from 'axios';
import FileDownload from 'js-file-download';

export async function sendVision(data) {
    await axios.post('//localhost:5001/demo/visionup', {dati: data})
    .then((e) => {
        console.log('success')
    })
    .catch( (err) => {
        console.error('Error', err)
    })
}
export async function getVision() {
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