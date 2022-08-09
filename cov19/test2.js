import neo4j from 'neo4j-driver'
const uri = 'neo4j+s://1628a821.databases.neo4j.io';
const user = 'neo4j';
const password = 'CII7eDk7eW-2m_5X0b687koeZf8NRrwHVZ_OH22tRUI';
    
let driver=neo4j.driver(uri, neo4j.auth.basic(user, password))

const session = driver.session({ database: 'neo4j' })
async function queryer(){
    let readResultNode
    try {
        const readQueryNode = `MATCH (n:node)-[l]-() RETURN distinct n.ID, n.sequence`
        readResultNode = await session.readTransaction(tx =>
          tx.run(readQueryNode)
        )
        readResultNode.records.slice(0,10).forEach(record =>{
            console.log(record._fields[0].toNumber(),record._fields[1]);
        })
        session.close()
            
        
    } catch (error) {
        console.error('Something went wrong: ', error)
    } finally {
        await session.close()
    }
    return readResultNode
}

function readResult(pro){
    let arr=[]
    pro.then(value => {
        value.records.forEach(v =>{
            arr.push(v._fields[0].toNumber()+'',v._fields[1])
        })
    })
    return arr
}
queryer()


  