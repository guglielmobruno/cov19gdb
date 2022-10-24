import json
def read_al(path):
    alignment=open(path + 'alignment_exp.json','r')
    al_path_csv=open(path + 'alignment_path.csv','w')
    for line in alignment:
        line=json.loads(line)
#print(json.dumps(line,indent=6))
    edit=[]
    line=line["path"]
    for el in line["mapping"]:
        #print(el)
        el2=el["position"].get("node_id")
        edit.append(el2)
    l_al=[]
    i=0
    if len(edit)>1:
        for i in range(len(edit)-1):
            l_al.append(str(edit[i])+','+str(edit[i+1]))
    else:    
        l_al.append(str(edit[i]))
    
    for el in l_al:
            al_path_csv.write(el)
            al_path_csv.write('\n')
            i+=1
    
    return l_al

