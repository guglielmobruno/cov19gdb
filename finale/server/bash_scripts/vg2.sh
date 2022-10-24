#!/bin/bash

path_data=../finale/server/public/data
path_mid=../finale/server/public/middle
path_res=../finale/server/public/result

cd ../../vg
vg gbwt -x $path_mid/graph.xg -g $path_mid/graph.gg $path_mid/graph.gbwt
echo 'variations added'
vg convert -b $path_mid/graph.gbwt -f $path_mid/graph.gg>$path_res/graph_walks.gfa
echo 'termined'