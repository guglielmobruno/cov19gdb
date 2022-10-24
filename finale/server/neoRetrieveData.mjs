import neo4j from 'neo4j-driver';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const uri = 'neo4j+s://1628a821.databases.neo4j.io';
const user = 'neo4j';
const password = 'CII7eDk7eW-2m_5X0b687koeZf8NRrwHVZ_OH22tRUI';

const fs = require('fs');


const path_write = '../client/public'
let driver=neo4j.driver(uri, neo4j.auth.basic(user, password))

const session1 = driver.session({ database: 'neo4j' })
const session2 = driver.session({ database: 'neo4j' })
const session3 = driver.session({ database: 'neo4j' })

var queryNode = 'MATCH (n:node2)-[l]-() RETURN distinct n.ID, n.sequence , n.sample';
var queryEdge = 'MATCH (n:node2)-[l]->() RETURN l.from, l.to, l.from_is_reversed, l.to_is_reversed, l.sample';
var queryMeta = 'MATCH (m:metadata2) RETURN *';


await session1.run(queryNode).then(result=> {
    let content = '{\n\t"nodes": [\n'
    let i=0
    let sample=''
    let tag = 'mutation'
    let end = `,\n`
    console.log('ecco')
    result.records.forEach(record=>{
        console.log(record)
        if(i === result.records.length-1) end = `\n\t],\n`
        if (record.toObject()['n.sample']){
            sample=record.toObject()['n.sample']
            if(sample[0] === ',') sample = sample.slice(1)
            sample = `"${sample}"`
            sample = sample.replace(/,/g, '","')
            if (sample.includes('reference')) tag = 'reference'
            else tag = 'mutation'
        }else{
            sample = ''
            tag = 'mutation'
        }
        content+=`\t\t{\n\t\t\t"key": "${record.toObject()['n.ID']}",\n\t\t\t"label": "${record.toObject()['n.ID']}",\n\t\t\t"tag": "${tag}",\n\t\t\t"URL": "https://",\n\t\t\t"cluster": "0",\n\t\t\t"x": "${Math.random()}",\n\t\t\t"y": "${Math.random()}",\n\t\t\t"score": 0.1,\n\t\t\t"sequence": "${record.toObject()['n.sequence']}",\n\t\t\t"sample": [${sample}]\n\t\t}${end}`
        i++
    })
    fs.writeFile('../client/public/available/datafinale.json', content, err => {
        if (err) {
          console.error(err)
          return
        }
    });
    session1.close()
});

await session2.run(queryEdge).then(result => {
    let sample = ''
    let end = ',\n'
    let i = 0
    let content = '\t"edges": [\n'
    console.log('ecco')
    result.records.forEach(record=>{
        if(i === result.records.length-1) end = `\n\t],\n\t"clusters": [\n\t\t{ "key": "0", "clusterLabel": "" }\n\t],\n\t"tags": [\n\t\t{ "key": "reference", "color": "#7cb9e8"},\n\t\t{ "key": "mutation", "color": "#fbceb1"}\n\t],\n`
        if (record.toObject()['l.sample']){
            sample=record.toObject()['l.sample']
            if(sample[0] === ',') sample = sample.slice(1)
            sample = sample.replace(/,/g, ';')
        }else{
            sample = ''
        }
        content+=`\t\t["${record.toObject()['l.from']}","${record.toObject()['l.to']}","${sample.includes('reference')}","${sample}","${record.toObject()['l.from_is_reversed']}","${record.toObject()['l.to_is_reversed']}"]${end}`
        i++;
    })
    fs.appendFile('../client/public/available/datafinale.json', content, err => {
        if (err) {
          console.error(err)
          return
        }
    });
    session2.close()
});
await session3.run(queryMeta).then( result => {
    let end=',\n'
    let content = '\t"metadata": [\n'
    let i = 0
    result.records.forEach( record => {
        if (i === result.records.length-1) end = '\n\t]\n}'
        content+=`\t\t${JSON.stringify(record.toObject().m.properties)}${end}`
        i++;
    })
    fs.appendFile('../client/public/available/datafinale.json', content, err => {
        if (err) {
          console.error(err)
          return
        }
    });
    session3.close()
})

   
