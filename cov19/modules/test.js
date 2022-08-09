(async function foo() {
    const neo4j = require('neo4j-driver')
   
    const uri = 'neo4j+s://1628a821.databases.neo4j.io';
    const user = 'neo4j';
    const password = 'CII7eDk7eW-2m_5X0b687koeZf8NRrwHVZ_OH22tRUI';
    let finalResult=[];
    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
    const session = driver.session({ database: 'neo4j' })
   
    try {
      // To learn more about the Cypher syntax, see https://neo4j.com/docs/cypher-manual/current/
      // The Reference Card is also a good resource for keywords https://neo4j.com/docs/cypher-refcard/current/
      const readQueryNode = `MATCH (n:node)-[l:link]->(ni:node) RETURN n.ID, n.sequence`
      const readResultNode = await session.readTransaction(tx =>
        tx.run(readQueryNode)
      )
      const readQueryLink = `MATCH (n:node)-[l:link]->(ni:node) RETURN l.from, l.to`
      const readResultLink = await session.readTransaction(tx =>
        tx.run(readQueryLink)
      )
      readResultNode.records.slice(0,10).forEach(record => {
        console.log(`${record._fields}`)
        finalResult.push(record._fields[0].toNumber(),record._fields[1])

      })
      readResultLink.records.slice(0,10).forEach(record => {
        console.log(`${record._fields}`)
        finalResult.push(record._fields[0].toNumber(),record._fields[1].toNumber())
      })
    } catch (error) {
      console.error('Something went wrong: ', error)
    } finally {
      await session.close()
    }
    
    module.exports.foo=foo;
    // Don't forget to close the driver connection when you're finished with it
    await driver.close()

  })();
  