const express = require('express');
const multer = require('multer');
const cors = require('cors');
const compression = require('compression');
var bodyParser = require("body-parser");

const app = express();
require('events').EventEmitter.defaultMaxListeners = 15;
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

const fs = require("fs");
const path = "./public/";

app.use(cors())
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true ,limit: '50mb'}));
// app.use(bodyParser.json({limit: '50mb'}));

function deleteFile (name) {
    try {
        fs.unlinkSync(path+name);
        console.log("File removed:", path);
    } catch (err) {
        console.error(err);
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/data')
    },
    filename: (req, file, cb) => {
        if(file.originalname?.slice(-6)==='.fasta') cb(null, 'reference.fasta')
        else if(file.originalname?.slice(-7)==='.vcf.gz') cb(null, 'variation.vcf.gz')
        else cb(null, 'metadata.tsv')
    }
});

const upload = multer({storage}).single('file');

async function lsExample() {
    const { stdout, stderr } = await exec('ls');
    console.log('stdout:', stdout);
    console.error('stderr:', stderr);
    return stdout;
}

async function construct() {
    await exec('bash bash_scripts/vg.sh')
    console.log('vcf tabixato');
    await exec('bash bash_scripts/vg1.sh');
    console.log('first part done');
    await exec('bash bash_scripts/vg2.sh');
    console.log('terminated')
    deleteFile('middle/graph.vg')
    deleteFile('middle/graph.xg')
    deleteFile('middle/graph.gg')
    deleteFile('middle/graph.gbwt')
    deleteFile('data/reference.fasta')
    deleteFile('data/reference.fasta.fai')
    deleteFile('data/variation.vcf.gz')
    deleteFile('data/variation.vcf.gz.tbi')
}
async function parseAndUpload() {
    var proc = await exec('bash bash_scripts/parse_upload.sh')
    console.log('final doc created');
}
function checkFileExist(urlToFile) {
    var risp = fs.existsSync(urlToFile)
    if ( risp === true) console.log('si')
    else console.log('no')
    return risp;
}

async function count() {
    for (let i = 0; i< 100; i++){
        console.log(i)
    }
}
const constructAndSend = async (res) => {
    const result = await construct()
    await parseAndUpload()
    return res.json({message: 'done', name: 'new-sars'})
}

app.post('/demo/visionup', (req,res) => {
    fs.writeFile('./public/vision/vision.gfa', req.body.dati, (err) => {
        if (err) {
            return res.status(500).json(err)
        }else return res.status(200)
    })
})

app.get('/demo/visiondown', (req, res, next) => {
    if (req) try {
        const file = `./public/vision/vision.gfa`;
        res.download(file);
        console.log('here');
    }catch (err) {
        console.log(err);
    }
});

app.get('/demo/down', (req, res, next) => {
    if (req) try {
        const file = `./public/result/graph_walks.gfa`;
        res.download(file);
        console.log('here');
    }catch (err) {
        console.log(err);
    }
});

app.get('/demo/demo', (req,res) => {
    if (req){
        date = new Date(),
        res.json({message: date}), 
        console.log(date)        
    }
})

app.get("/demo/construct",  (req, res) => {
    console.log('Arrivato!')
    console.log(req.body)
    // console.log(req)
    // console.log(req.toString())
    if (req) {
        console.log('construct')
        constructAndSend(res)
    }
})

app.post('/demo/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(500).json(err)
        }
        console.log('si')
        return res.status(200).send(req.file)
    })
});

app.listen(5001, () => {
    console.log(`Server listening on port 5001`);
});

