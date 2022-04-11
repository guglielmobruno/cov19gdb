# cov19gdb

construct covid pangenome graph
```
tabix data/variation.vcf.gz
vg construct -r data/reference.fasta -v data/variation.vcf.gz -a -m 25000> graph.vg
vg view graph.vg>graph.gfa
vg index -x graph.xg -G graph.gbwt -v data/variation.vcf.gz graph.vg
vg gbwt -x graph.xg -g graph.gg graph.gbwt
vg convert -b graph.gbwt -f graph.gg>graph_walks.gfa
```

