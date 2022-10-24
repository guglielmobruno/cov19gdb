#!/bin/bash

git pull 
git add public/toupload/sequences.csv public/toupload/links.csv public/toupload/ref_path.csv public/toupload/tiny_sample.csv public/toupload/metadata.tsv
git commit -m 'automatic commit of new graph data'
git push
