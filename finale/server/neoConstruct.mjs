import neo4j from 'neo4j-driver';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const uri = 'neo4j+s://1628a821.databases.neo4j.io';
const user = 'neo4j';
const password = 'CII7eDk7eW-2m_5X0b687koeZf8NRrwHVZ_OH22tRUI';

const fs = require('fs');

const queryCleanDB = "MATCH (n:node2), (m:metadata2) detach delete m, n"
const queryCreateNodes = "LOAD CSV WITH HEADERS FROM $path AS line MERGE (n: node2 {ID:toInteger(line.ID), sequence:line.seq}) SET n.length=size(n.sequence)"
const queryCreateLinks =  "LOAD CSV WITH HEADERS FROM $path AS line MATCH (n:node2), (ni:node2) WHERE n.ID=toInteger(line.from) AND ni.ID=toInteger(line.to) MERGE (n)-[l:link2]->(ni) SET l.from=n.ID, l.to=ni.ID, l.from_is_reversed=line.from_s, l.to_is_reversed=line.to_s "
const querySetLinks = "MATCH ()-[l:link2]->() WITH l, CASE l.to_is_reversed WHEN '-' THEN true ELSE false END AS to_code, CASE l.from_is_reversed WHEN '-' THEN true ELSE false END AS from_code SET l.to_is_reversed=to_code, l.from_is_reversed=from_code "
const querySetReference = "LOAD CSV WITH HEADERS FROM $ref_path AS reference MATCH (n:node2)-[l]-(ni:node2) WHERE n.ID=toInteger(reference.from) AND ni.ID=toInteger(reference.to) SET n.sample='reference', ni.sample='reference', l.sample='reference' "
const querySetSamplesOrigin ="LOAD CSV FROM $samples AS line FIELDTERMINATOR ';' CREATE (s:metadata2 {epi_id: line[0], path:last(line)})"
const querySetSamples = "LOAD CSV FROM $samples AS line FIELDTERMINATOR ';' UNWIND line AS nodi_id MATCH (n:node2)-[l:link2]-(ni:node2) WHERE n.ID=toInteger(split(nodi_id,',')[0]) AND ni.ID=toInteger(split(nodi_id,',')[1]) SET n.sample=coalesce(n.sample,'')+','+line[0], ni.sample=coalesce(ni.sample,'')+','+line[0], l.sample=coalesce(l.sample,'')+','+line[0] "
// cambiare per matchare gia esistenti metaconst querySetSamples = "LOAD CSV FROM $samples AS line FIELDTERMINATOR ';' UNWIND line AS nodi_id MATCH (n:node2)-[l:link2]-(ni:node2) WHERE n.ID=toInteger(split(nodi_id,',')[0]) AND ni.ID=toInteger(split(nodi_id,',')[1]) SET n.sample=coalesce(n.sample,'')+','+line[0], ni.sample=coalesce(ni.sample,'')+','+line[0], l.sample=coalesce(l.sample,'')+','+line[0] "
const queryCreateSamples ="LOAD CSV WITH HEADERS FROM $meta AS row FIELDTERMINATOR '\t'  MATCH (m:metadata2) WHERE row.gisaid_epi_isl = m.epi_id SET m.strain=row.strain, m.date=date(row.date), m.region=row.region, m.country=row.country, m.division=row.division, m.host=row.host, m.age=row.age, m.sex=row.sex, m.originating_lab=row.originating_lab"
// "LOAD CSV WITH HEADERS FROM $meta AS row FIELDTERMINATOR '\t'  CREATE (s:metadata2 {strain:row.strain, epi_id: row.gisaid_epi_isl, date:date(row.date), region:row.region, country:row.country, division: row.division, host: row.host, age: row.age, sex:row.sex, originating_lab:row.originating_lab})"
const driver=neo4j.driver(uri, neo4j.auth.basic(user, password))

const session = driver.session({ database: 'neo4j' })
const git_path = 'https://raw.githubusercontent.com/guglielmobruno/cov19gdb/main/finale/server/public/toupload'
try {
    await session.run(queryCleanDB)
    console.log('Set free space for graph')
    await session.run(queryCreateNodes,{ path: git_path+'/sequences.csv' })
    console.log('nodes created')
    await session.run(queryCreateLinks,{ path: git_path +'/links.csv'})
    console.log('links created')
    await session.run(querySetLinks)
    console.log('links setted')
    await session.run(querySetReference,{ ref_path: git_path +'/ref_path.csv'})
    console.log('reference setted')
    await session.run(querySetSamplesOrigin,{ samples: git_path +'/tiny_sample.csv'})
    console.log('samples id created')
    await session.run(querySetSamples,{ samples: git_path +'/tiny_sample.csv'})
    console.log('samples setted')
    await session.run(queryCreateSamples,{ meta: git_path +'/metadata.tsv'})
    console.log('samples created')
} finally {
    await session.close()
}
await driver.close()