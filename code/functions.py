from neo4j import GraphDatabase
import logging
from neo4j.exceptions import ServiceUnavailable
class App:

    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()
    
    #creazione nodi  

    def create_node(self, path):
        with self.driver.session() as session:
            result = session.read_transaction(self._create_node, path)
            
    @staticmethod
    def _create_node(tx, path):
        path=path+'/sequences.csv'
        query = (
            "LOAD CSV WITH HEADERS FROM $path AS line "
            "MERGE (n: node {ID:toInteger(line.ID), sequence:line.seq}) "
            "SET n.length=size(n.sequence)"
        )
        result = tx.run(query, path=path)
        return [row["ID"] for row in result]
    
    #creazione links

    def create_links(self, path):
        with self.driver.session() as session:
            result = session.read_transaction(self._create_links, path)
            
    @staticmethod
    def _create_links(tx, path):
        path=path+'/links.csv'
        query = (
            "LOAD CSV WITH HEADERS FROM $path AS line "
            "MATCH (n:node), (ni:node) "
            "WHERE n.ID=toInteger(line.from) AND ni.ID=toInteger(line.to) "
            "MERGE (n)-[l:link]->(ni) "
            "SET l.from=n.ID, l.to=ni.ID, l.from_is_reversed=line.from_s, l.to_is_reversed=line.to_s "
        )
        result = tx.run(query, path=path)
        return [row["ID"] for row in result]
  
    #aggiustare proprieta links
    
    def set_links(self):
        with self.driver.session() as session:
            result = session.read_transaction(self._set_links)
       

    @staticmethod
    def _set_links(tx):
        query = (
            "MATCH ()-[l:link]->() "
            "WITH l, "
            "CASE l.to_is_reversed "
            " WHEN '-' THEN true "
            " ELSE false "
            "END AS to_code, "
            "CASE l.from_is_reversed "
            " WHEN '-' THEN true "
            " ELSE false "
            "END AS from_code "
            "SET l.to_is_reversed=to_code, l.from_is_reversed=from_code "
            )
        result = tx.run(query)
        return [row["ID"] for row in result]

    #setting del reference path
    def set_reference_path(self, reference):
        with self.driver.session() as session:
            result = session.read_transaction(self._set_reference_path, reference)
            for row in result:
              print(row)
       

    @staticmethod
    def _set_reference_path(tx, ref_path):
        ref_path=ref_path+'/ref_path.csv'
        query = (
            "LOAD CSV WITH HEADERS FROM $ref_path AS reference "
            "MATCH (n:node)-[l]-(ni:node) "
            "WHERE n.ID=toInteger(reference.from) AND ni.ID=toInteger(reference.to) "
            "SET n.sample='reference', ni.sample='reference', l.sample='reference' "
        )
        result = tx.run(query, ref_path=ref_path)
        return [row for row in result]
    
    #aggiungere le proprita 'sample' delle variazioni 

    def set_sample_property(self, samples):
        with self.driver.session() as session:
            result = session.read_transaction(self._set_sample_property, samples)
            print(row for row in result)

    @staticmethod
    def _set_sample_property(tx, samples):
        samples=samples+'/tiny_sample.csv'
        query = (
            "LOAD CSV FROM $samples AS line FIELDTERMINATOR ';' UNWIND line AS nodi_id MATCH (n:node)-[l:link]-(ni:node) WHERE n.ID=toInteger(split(nodi_id,',')[0]) AND ni.ID=toInteger(split(nodi_id,',')[1]) SET n.sample=coalesce(n.sample,'')+','+line[0], ni.sample=coalesce(ni.sample,'')+','+line[0], l.sample=coalesce(l.sample,'')+','+line[0] "
        )
        result = tx.run(query, samples=samples)
        return [row for row in result]
     
    #creare nodi di sample IL FILE METADATA e PRESO DA GISAID 

    def create_samples(self, meta):
        with self.driver.session() as session:
            result = session.read_transaction(self._create_samples, meta)
            
    @staticmethod
    def _create_samples(tx, meta):
        meta=meta+'/metadata.tsv'
        query = (
            "LOAD CSV WITH HEADERS FROM $meta AS row FIELDTERMINATOR '\t'  CREATE (s:metadata {strain:row.strain, epi_id: row.gisaid_epi_isl, date:date(row.date), region:row.region, country:row.country, division: row.division, host: row.host, age: row.age, sex:row.sex, originating_lab:row.originating_lab})"
        )
        result = tx.run(query, meta=meta)
        return [row["ID"] for row in result]

def construct_db(path, app):
    app.create_node(path)
    app.create_links(path)
    app.set_links()
    app.set_reference_path(path)
    app.set_sample_property(path)
    app.create_samples(path)
    app.close()


def parse_graph(path_read, path_write):

    graph=open(path_read+'graph_walks.gfa', 'r')
    reference=open(path_read+'graph.gfa', 'r')
    sequences=open(path_write+'sequences.csv', 'w')
    links=open(path_write+'links.csv', 'w')
    walks=open(path_read+'walks.csv', 'w')
    sample=open(path_write+'sample.csv','w')
    tiny_sample=open(path_write+'tiny_sample.csv','w')
    epi_list=open(path_write+'epi_list.csv','w')
    tiny_epi_list=open(path_write+'tiny_epi_list.csv','w')
    ref_path=open(path_write+'ref_path.csv','w')

    sequences.write("ID,seq\n")
    links.write("from,from_s,to,to_s,overlap\n")
    

    for line in graph:
      line=line.split('\t')
      if line[0]=='S':
        doc=sequences
      elif line[0]=='L':
        doc=links
      elif line[0]=='W':
        doc=walks
      else:
        continue
      line.pop(0)
      for el in line:
        doc.write(el)
        if '\n' not in el:
          doc.write(',')
    graph.close()
    sequences.close()
    links.close()
    walks.close()

    walks=open(path_read+'walks.csv', 'r')
    
    for line in reference:
      line=line.split('\t')
      if line[0]=='P':
        reference_path=line[2]
        reference_path=reference_path.replace("+","")
        reference_path=reference_path.replace("\n","")
        reference_path=reference_path.split(',')
        break
    reference.close()
    ref_path_l=[]
    
    ref_path.write('from,to\n')
    cont=0
    for cont in range(len(reference_path)-1):
      line=reference_path[cont]+','+reference_path[cont+1]
      ref_path_l.append(line)
      ref_path.write(line+'\n')
      cont+=1
    ref_path.close()
    
    contatore_sample=0
    numero=1
    for line in walks:
      tmp=[]
      line=line.split(',')
      epi=line[0]
      line=line[5]
      line=line.replace("\n","")
      line=line[1:].split('>')

      cont=0
      for cont in range(len(line)-1):
        tmp.append(line[cont]+','+line[cont+1])
        cont+=1
      rest=list(set(tmp)-set(ref_path_l))
      
      if rest:
        epi_list.write(epi+',')
        sample.write(epi+';')
        for el in rest:
          sample.write(el+';')
        sample.write('\n')

        if contatore_sample<5000: 
            tiny_epi_list.write(epi+',')
            tiny_sample.write(epi+';')
            for el2 in rest:
              tiny_sample.write(el2+';')
            tiny_sample.write('\n')
        else:
            tiny_sample.close()
            tiny_sample=open(path_write+'tiny_sample'+str(numero)+'.csv','w')
            tiny_epi_list.close()
            tiny_epi_list=open(path_write+'tiny_epi_list'+str(numero)+'.csv','w')
            numero+=1
            contatore_sample=0
        contatore_sample+=1
        
      
    sample.close()
    epi_list.close()
    walks.close()
