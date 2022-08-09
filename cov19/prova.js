import Sigma from "sigma";
import Papa from "papaparse";
import Graph from "graphology";
import neo4j from 'neo4j-driver'
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const uri = 'neo4j+s://1628a821.databases.neo4j.io';
const user = 'neo4j';
const password = 'CII7eDk7eW-2m_5X0b687koeZf8NRrwHVZ_OH22tRUI';

const fs = require('fs');



let driver=neo4j.driver(uri, neo4j.auth.basic(user, password))

const session1 = driver.session({ database: 'neo4j' })
const session2 = driver.session({ database: 'neo4j' })

var queryNode = 'MATCH (n:node)-[l]-() RETURN distinct n.ID, n.sequence , n.sample';
var queryEdge = 'MATCH (n:node)-[l]->() RETURN l.from, l.to, l.from_is_reversed, l.to_is_reversed, l.sample';


var a = session1.run(queryNode).then(result=> {
    let contentNode='"~id";"~labels";"sequence";"length";"ID";"sample"\n'
    let i=0
    let sample=''
    result.records.forEach(record=>{
        sample=(record.toObject()['n.sample']) ? '"'+record.toObject()['n.sample']+'"' : ''
        contentNode+=`"${i}";"node";"${record.toObject()['n.sequence']}";"1";"${record.toObject()['n.ID']}";${sample}\n`
        i++
    })
    fs.writeFile('./provaaaa/public/data2.csv', contentNode, err => {
        if (err) {
          console.error(err)
          return
        }
    });
    session1.close()
});

var g = session2.run(queryEdge).then(result => {
    let contentEdge ='"from_is_reversed";"to_is_reversed";"from";"to";"sample"\n'
    let edgeSample 
    result.records.forEach(record=>{
        edgeSample=(record.toObject()['l.sample'])?'"'+(record.toObject()['l.sample'])+'"':''
        contentEdge+=`"${record.toObject()['l.from_is_reversed']}";"${record.toObject()['l.to_is_reversed']}";"${record.toObject()['l.from']}";"${record.toObject()['l.to']}";${edgeSample}\n`
    })
    fs.writeFile('./provaaaa/public/edge2.csv', contentEdge, err => {
        if (err) {
          console.error(err)
          return
        }
    });
    session2.close()
}); 

   
