#!/bin/bash

path_data=../finale/server/public/data
path_mid=../finale/server/public/middle
path_res=../finale/server/public/result
size=25000

cd ../../vg
echo 'directory reached'
tabix $path_data/variation.vcf.gz