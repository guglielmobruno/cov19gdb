# cov19gdb

reference sequence can be found here: https://www.ncbi.nlm.nih.gov/nuccore/1798174254
variations vcf file can be found here: https://usegalaxy.org/u/carlosfarkas/h/snpeffsars-cov-2

## construct Covid-19 pangenome graph:
```
tabix data/variation.vcf.gz
vg construct -r data/reference.fasta -v data/variation.vcf.gz -a -m 25000> graph.vg
vg view graph.vg>graph.gfa
vg index -x graph.xg -G graph.gbwt -v data/variation.vcf.gz graph.vg
vg gbwt -x graph.xg -g graph.gg graph.gbwt
vg convert -b graph.gbwt -f graph.gg>graph_walks.gfa
```

## Visualize Graph with Sigma.js
  - install graphology and sigma by:
```
npm install graphology sigma
```
  - clone Sigma folder:
```
git clone git@github.com:jacomyal/sigma.js.git
cd sigma.js
npm install
```
  - put cov19 folder inside your/path/to/sigma/sigma.js/examples
  - start the example:
```
npm start --example=cov19
```

## Launch the web app
  - install Express.js:
```
npm install express
```
  - inside myapp:
```
DEBUG=myapp:* npm start
```
  - connect to localhost:3000
