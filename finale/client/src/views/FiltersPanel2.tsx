import React, { KeyboardEvent, ChangeEvent, FC, useEffect, useState } from "react";
import { useSigma} from "react-sigma-v2";
import { Attributes } from "graphology-types";
import { BsSearch } from "react-icons/bs";
import {sendVision, getVision} from "../my-utils.js";
import Panel from "./Panel"
import axios from 'axios';
import { FiltersState, Meta, Dataset, MetaSet } from "../types";
import FileDownload from 'js-file-download';
import { LocalDateTime } from "neo4j-driver";

const FiltersPanel2: FC<{ filters: FiltersState }> = ({ filters }) => {
    const sigma = useSigma();
    const graph = sigma.getGraph();
    const [message, setMessage] = useState<string>('ciao');
    const [meta, setMeta] = useState<any>({});
    const [selectedMeta, setSelectedMeta] = useState<{region: string[]; country: string[]}>({region: [], country:[]});
    const [selectedMeta2, setSelectedMeta2] = useState<{region: {set: boolean, list: string[]}; country: {set: boolean, list: string[]}; age: {set: boolean, list: string[]}; sex: {set: boolean, list: string[]}; date: {set: boolean, list: string[]}}>({region: {set: false, list: []}, country: {set: false, list: []}, age: {set: false, list: ['', '']}, sex: {set: true, list: ['male', 'female', 'unknown']}, date: {set: false, list: []} });
    const [epiList, setEpiList] = useState<Array<string>>([]);
    const [isClicked2, setClicked2] = useState<boolean>(false);
    const [ref, setRef] = useState<boolean>(false);
    const [theColor, setTheColor] = useState<string>("#000000")
    const [search, setSearch] = useState<string>("");
    const [values, setValues] = useState<Array<string>>([]);
    const [selected, setSelected] = useState<string | null>(null);
    const [sampList, setSampList] = useState<Array<string>>([]);
    const [sex, setSex] = useState<{female: boolean, male: boolean, unknown: boolean}>({female: true, male: true, unknown: true});

  
    const buttonFilter = document.getElementById("Filter")
    
    const changeColor = () => {
        setTheColor((document.getElementById('color') as HTMLInputElement).value)
    }
    
    const refreshValues = () => {
        const newValues: Array<string> = [];
        const lcSearch = search.toLowerCase();
        //if (!selected && search.length > 0) {
        if (search.length > 0) {
            meta.country.forEach((ele: any) => {
                if (ele.toLowerCase().indexOf(lcSearch) === 0)
                return newValues.push(ele);
            })
            meta.division.forEach((ele: any) => {
                if (ele.toLowerCase().indexOf(lcSearch) === 0)
                return newValues.push(ele);
            })
            meta.originating_lab.forEach((ele: any) => {
                if (ele.toLowerCase().indexOf(lcSearch) === 0)
                return newValues.push(ele);
            })

        }   
        const sampValues = newValues;
        const uniqSampValues = sampValues.filter(function(item, pos) {
            return sampValues.indexOf(item) == pos;
        });
        uniqSampValues.sort((a,b)=>{
            if (a < b) return -1;
            return 1;
        });
        setValues(newValues);
        setSampList(uniqSampValues);
    };

    const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const searchString = e.target.value;
      const valueItem = values.find((value) => value === searchString);
      if (valueItem) {
        setSearch(valueItem);
        setValues([]);
        let obj = selectedMeta2;
        obj.country.set = true;
        obj.country.list.push(valueItem);
        setSelectedMeta2(obj);
        //setSelected(valueItem);
      } else {
        setSelected(null);
        setSearch(searchString);

        let obj = selectedMeta2;
        obj.country.set = false;
        //obj.country.list = [];
        setSelectedMeta2(obj);
      }
    };

    const onKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && values.length) {
        setSearch(values[0]);
        
        let obj = selectedMeta2;
        obj.country.set = true;
        obj.country.list.push(values[0]);
        setSelectedMeta2(obj);
      }
    };
    const clearCountry = () =>{
        let obj2 = selectedMeta2;
        obj2.country.set = false;
        obj2.country.list = [];
        setSelectedMeta2(obj2);
        setSearch('');
    }

    const HandleFilterClick = () => {
        
        setClicked2(!isClicked2);
        const fields : {[key:string] : any[] } = {};
        fetch(`${process.env.PUBLIC_URL}/data2.json`)
            .then((res) => res.json())
            .then((data: Dataset) => {
                
            let sampleFound: string [] = [];
                data.metadata.forEach((el : any)=>{
                    const sm2 = selectedMeta2;
                    //vengono cercate solo le mutation dei paesi se i paesi sono settati
                    if(sm2.country.set || sm2.region.set){
                        if(sm2.country.list.includes(el.country) || sm2.country.list.includes(el.division) || sm2.country.list.includes(el.originating_lab) || sm2.region.list.includes(el.region)){
                            sampleFound.push(el.epi_id);
                        }
                    //altrimenti vengono cercate tutte
                    }else sampleFound.push(el.epi_id);
                    //vengono eliminate le mutation che non contengono i giusti sex o age
                    if(sm2.sex.set){
                        if (!sm2.sex.list.includes(el.sex.toLowerCase())){
                            const index = sampleFound.indexOf(el.epi_id);
                            if(index>-1) sampleFound.splice(index,1);
                        }
                    }
                    if(sm2.age.set){
                        if (el.age === 'unknown' || +el.age < +sm2.age.list[0] || +el.age > +sm2.age.list[1]){
                            const index = sampleFound.indexOf(el.epi_id);
                            if(index>-1) sampleFound.splice(index,1);
                        }
                    }
                    if (sm2.date.set){
                        const date = el.date.year.low + '-' + el.date.month.low + '-' + el.date.day.low;
                        if ( Date.parse(date) <= Date.parse(sm2.date.list[0]) ||  Date.parse(date) >= Date.parse(sm2.date.list[1])){
                            const index = sampleFound.indexOf(el.epi_id);
                            if(index>-1) sampleFound.splice(index,1);
                        }
                    }
                });
                setEpiList(sampleFound);
        });
    }
    
    const changeAge = (e: ChangeEvent<HTMLInputElement>) => {
        const id = e.target.id;
        if(id === "minAge"){
            let obj = selectedMeta2;
            obj.age.list[0] = e.target.value;
            setSelectedMeta2(obj);
        } else{
            let obj = selectedMeta2;
            obj.age.list[1] = e.target.value;
            setSelectedMeta2(obj);
        }
        let obj2 = selectedMeta2;
        obj2.age.set = true;
        setSelectedMeta2(obj2);
        
    }

    const clearAge = () =>{
        (document.getElementById('minAge') as HTMLInputElement).value='';
        (document.getElementById('maxAge') as HTMLInputElement).value='';

        let obj2 = selectedMeta2;
        obj2.age.set = false;
        obj2.age.list = [];
        setSelectedMeta2(obj2);
    }

    const changeDate = (e: ChangeEvent<HTMLInputElement>) => {
        const id = e.target.id;
        if(id === "start"){
            let obj = selectedMeta2;
            obj.date.list[0] = e.target.value;
            setSelectedMeta2(obj);
        } else{
            let obj = selectedMeta2;
            obj.date.list[1] = e.target.value;
            setSelectedMeta2(obj);
        }
        let obj2 = selectedMeta2;
        obj2.date.set = true;
        setSelectedMeta2(obj2);
        
    }

    const clearDate = () =>{
        (document.getElementById('start') as HTMLInputElement).value='';
        (document.getElementById('end') as HTMLInputElement).value='';

        let obj2 = selectedMeta2;
        obj2.date.set = false;
        obj2.date.list = [];
        setSelectedMeta2(obj2);
    }
    
    const refClick = () =>{
        setRef(!ref);
        if(!ref){
            graph.forEachNode((key: string, attributes: Attributes)=>{
                if(attributes.tag === 'mutation'){
                    graph.setNodeAttribute(key,'hidden', true);
                }
            });
            graph.forEachEdge((key) =>{
                if (graph.getEdgeAttribute(key, 'is_ref')==='false')// && (graph.getNodeAttribute((graph.getEdgeAttribute(key, 'source')),'color') !=='#ff0000' || graph.getNodeAttribute((graph.getEdgeAttribute(key, 'target')),'color') !=='#ff0000' )) 
                graph.setEdgeAttribute(key, 'hidden', true);
            })
        }else{
            graph.forEachNode((key: string, attributes: Attributes)=>{
                if(attributes.hidden === true){
                    graph.setNodeAttribute(key,'hidden', false);
                }
            });
            graph.forEachEdge((key) =>{
                if (graph.getEdgeAttribute(key, 'hidden'))// && (graph.getNodeAttribute((graph.getEdgeAttribute(key, 'source')),'color') !=='#ff0000' || graph.getNodeAttribute((graph.getEdgeAttribute(key, 'target')),'color') !=='#ff0000' )) 
                graph.setEdgeAttribute(key, 'hidden', false);
            })
        }
    }

    async function downloadVision() {
        let content = ''
        graph.forEachNode((key, attributes) => {
            if(graph.getNodeAttribute(key,'hidden') === false) {
                content+=`S\t${key}\t${attributes['sequence']}\n`
            }
        })
        graph.forEachEdge((key, attributes) => {
            if(graph.getEdgeAttribute(key,'hidden') === false) {
                content+=`L\t${attributes['source']}\t${attributes['from_sign']==='true'?'-':'+'}\t${attributes['target']}\t${attributes['to_sign']==='true'?'-':'+'}\t*\n`
            }
        })
        fetch(`${process.env.PUBLIC_URL}/datafinale.json`)
            .then((res) => {return res.text()})
            .then((data) => {
                const metadata = JSON.parse(data).metadata
                let i = 0;
                let cont = 0
                metadata.forEach((meta: any) => {
                    if (epiList.length){
                        if (epiList.includes(meta.epi_id)){
                            content+=`W\t${meta.epi_id}\t0\tNC_045512.2\t0\t29903\t${meta.path}\n`
                            cont++;
                        }
                    }else if (ref===false) content+=`W\t${meta.epi_id}\t0\tNC_045512.2\t0\t29903\t${meta.path}\n`
                })
                console.log(content)
                sendVision(content)
            })
    }
    // Refresh values when search is updated:
    useEffect(() => refreshValues(), [search]);

    // Refresh values when filters are updated (but wait a frame first):
    useEffect(() => {
      requestAnimationFrame(refreshValues);
    }, [filters]);

    useEffect(() => {
      if (!selected){
        return;
      }
      const nodeDisplayData = sigma.getNodeDisplayData(selected);

      return () => {
        sigma.getGraph().setNodeAttribute(selected, "highlighted", false);
      };
    }, [selected]);

    useEffect(() => {
        const fields : {[key:string] : any[] } = {};
        fetch(`${process.env.PUBLIC_URL}/data2.json`)
            .then((res) => res.json())
            .then((data: Dataset) => {
                
                data.metadata.forEach((el)=>{
                    for (const [key, value] of Object.entries(el)) {
                        if(fields[key]){
                            if (!fields[key].includes(value)){
                                fields[key].push(value)
                            }
                        } 
                        else Object.assign(fields, {[key]: [value]});
                    }
                });
                setMeta(fields)
            });

    }, []);
    
    useEffect(()=>{
        if(isClicked2){
            if (buttonFilter) {
                buttonFilter.style.backgroundColor = theColor;
                if (theColor === '#000000') buttonFilter.style.color='white'
            } 
        }
        if(epiList.length){
            graph.forEachNode((key: string, attributes: Attributes)=>{
                let mod=[]
                for (let i=0; i < epiList.length; i++) { 
                    if(attributes.sample.includes(epiList[i]) && !graph.getNodeAttribute(key, 'hidden')) {
                        graph.setNodeAttribute(key, 'color', theColor);
                        mod.push(key);
                        {break;}
                    }
                };
                if(!mod.includes(key) && attributes.tag === 'mutation'){
                    graph.setNodeAttribute(key,'hidden', true);
                }
                
            });
            graph.forEachEdge((key) =>{
                // if (graph.getEdgeAttribute(key, 'is_ref')==='false' && (graph.getNodeAttribute((graph.getEdgeAttribute(key, 'source')),'color') !==theColor || graph.getNodeAttribute((graph.getEdgeAttribute(key, 'target')),'color') !==theColor )) 
                // graph.setEdgeAttribute(key, 'hidden', true);
                // else{
                //     if(graph.getNodeAttribute((graph.getEdgeAttribute(key, 'source')),'color') ===theColor && graph.getNodeAttribute((graph.getEdgeAttribute(key, 'target')),'color') ===theColor ) {
                //         graph.setEdgeAttribute(key, 'color', theColor);
                //     }
                // }
                if (graph.getEdgeAttribute(key, 'is_ref') === 'false'){
                    if( graph.getEdgeAttribute(key, 'sample') === '') {
                        graph.setEdgeAttribute(key, 'hidden', true);
                    }else{
                        for (let i=0; i < epiList.length; i++) { 
                            if(graph.getEdgeAttribute(key, 'sample').includes(epiList[i])){
                                graph.setEdgeAttribute(key, 'color', theColor);
                                break;
                            }
                        }
                        if (graph.getEdgeAttribute(key, 'color') !== theColor) graph.setEdgeAttribute(key, 'hidden', true);
                    //graph.setEdgeAttribute(key, 'hidden', true);
                    }
                }
            })
            if (!isClicked2){
                if (buttonFilter){
                    buttonFilter.style.backgroundColor = 'white';
                    buttonFilter.style.color = 'black';
                } 
            }
            if(!isClicked2) {
                graph.forEachNode((key: string, attributes: Attributes)=>{
                    if (attributes.hidden && filters.tags[attributes.tag] && !ref) graph.setNodeAttribute(key, 'hidden', false);
                    if (graph.getNodeAttribute(key,'originalcolor')) {
                        graph.setNodeAttribute(key, 'color', graph.getNodeAttribute(key,'originalcolor')) ;
                    }
                });
                graph.forEachEdge((key)=>{
                    if (sigma.getGraph().getEdgeAttribute(key, 'hidden') && !ref) {
                        sigma.getGraph().setEdgeAttribute(key, 'hidden', false);
                    }
                    else if (graph.getEdgeAttribute(key, 'color') === theColor){
                        graph.setEdgeAttribute(key, 'color', graph.getEdgeAttribute(key, 'originalcolor'))
                    }
                });
                setEpiList([])
            }
        }

    });



    return (
        <Panel
        title={
          <>
             Filters
          </>
        }
      >
        <div>
            <p>Here you can apply the filters</p>
            {/* <p>{message}</p> */}
            {/* <p>{JSON.stringify(selectedMeta2)}</p>  */}
            <ul>
            <li className="caption-row" key='reference'  title='reference' value='reference'>  
                <input type="checkbox" id={`reference`} checked={ref}/>
                <label htmlFor='reference'>
                    <span className="circle"  onClick={refClick} />
                     <div className="node-label">
                        <span >Reference</span>
                    </div>
                </label>                
            </li>  
            </ul>    
            <h3>Where?</h3> 
            <div className="search-wrapper">
                <input
                    type="search"
                    placeholder="Search in countries, divisions labs..."
                    list="countries"
                    value={search}
                    onChange={onInputChange}
                    onKeyPress={onKeyPress}
                />
                <BsSearch className="icon" />
                <datalist id="countries">
                    { sampList.map((samp :string) => (
                        <option key={samp} value={samp}>

                        </option>
                    ))}
                </datalist>
                <p>Selected countries/divisions/laboratories: {selectedMeta2.country.list.toString()}</p>
                <button className='btn' id='clearCountry'  onClick={clearCountry}>Clear</button>
                
            </div>
        
            <ul>
                {meta?.region?.map((reg: any) => {
                    return(
                        <li className="caption-row" key={reg}  title={reg} value={reg}>  
                            <input type="checkbox" id={`reg-${reg}`} checked={selectedMeta?.region?.includes(reg)}/>
                            <label htmlFor={reg}>
                                <span className="circle" onClick={()=>{
                                    let r = selectedMeta?.region ? selectedMeta.region : [];
                                    let c = selectedMeta?.country ? selectedMeta.country : [];
                                    if (!r.includes(reg)) r.push(reg);
                                    else r.splice(r.indexOf(reg), 1);
                                    setSelectedMeta({region: r, country: c});

                                    let obj = selectedMeta2;
                                    obj.region.list=r
                                    obj.region.set=obj.region.list.length ? true : false;
                                    setSelectedMeta2(obj);
                                    }
                                }
                                    
                                />
                                <div className="node-label">
                                    <span >{reg}</span>
                                </div>
                            </label>  
                        </li>  
                    );
                })}
            </ul> 
            <h3>When?</h3>
            <p>choose a range of date between 2020-01-01 and 2020-10-26</p>
            <input className='myInp' id='start' type="date" onChange={changeDate}/>
            <input className='myInp' type="date" id='end' onChange={changeDate}/>
            <button className='btn' id='clearDate'  onClick={clearDate}>Clear</button>
            <h3>Host's characteristics</h3>
            <h4>Age</h4>
            <p>choose a range of age between 0-120</p>
            <div className= 'my'>
            <input className='myInp' id="minAge" type="number" min="0" max="120" onChange={changeAge}/>
            <input className='myInp' id="maxAge" type="number" min="0" max="120" onChange={changeAge}/>
            <button className='btn' id='clearAge'  onClick={clearAge}>Clear</button>
            <h4>Gender</h4>
            <ul>
                <li className="caption-row" key={'female'}  title={'female'} value={sex.female.toString()}>  
                    <input type="checkbox" id={`female`} checked={sex.female}/>
                    <label htmlFor={'female'}>
                        <span className="circle" onClick={ ()=>{
                            setSex({male: sex.male, female: !sex.female, unknown: sex.unknown})
                            const obj = selectedMeta2;
                            if (!sex.female){
                                obj.sex.list.push('female');
                            }else{
                                const index = obj.sex.list.indexOf('female');
                                if ( index>-1) obj.sex.list.splice(index,1);
                            }
                            obj.sex.set = obj.sex.list.length ? true : false;

                        } } ></span>
                        <div className="node-label">
                            <span >{'Female'}</span>
                        </div>
                    </label>  
                </li>    
             
                <li className="caption-row" key={'male'}  title={'male'} value={sex.male.toString()}>  
                    <input type="checkbox" id={`male`} checked={sex.male}/>
                    <label htmlFor={'male'}>
                        <span className="circle" onClick={ ()=>{
                            setSex({male: !sex.male, female: sex.female, unknown: sex.unknown})
                            const obj = selectedMeta2;
                            if (!sex.male){
                                obj.sex.list.push('male');
                            }else{
                                const index = obj.sex.list.indexOf('male');
                                if ( index>-1) obj.sex.list.splice(index,1);
                            }
                            obj.sex.set = obj.sex.list.length ? true : false;
                        } } ></span>
                        <div className="node-label">
                            <span >{'Male'}</span>
                        </div>
                    </label>  
                </li>

                <li className="caption-row" key={'unknown'}  title={'unknown'} value={sex.unknown.toString()}>  
                    <input type="checkbox" id={`unknwon`} checked={sex.unknown}/>
                    <label htmlFor={'unknown'}>
                        <span className="circle" onClick={ ()=>{
                            setSex({male: sex.male, female: sex.female, unknown: !sex.unknown})
                            const obj = selectedMeta2;
                            if (!sex.unknown){
                                obj.sex.list.push('unknown');
                            }else{
                                const index = obj.sex.list.indexOf('unknown');
                                if ( index>-1) obj.sex.list.splice(index,1);
                            }
                            obj.sex.set = obj.sex.list.length ? true : false;
                        } } ></span>
                        <div className="node-label">
                            <span >{'Unknown'}</span>
                        </div>
                    </label>  
                </li>
            </ul> 
            </div>
            <h3>Color?</h3>
            <input id = 'color' className='color' type="color" onChange={changeColor}/>
            <br />
            <button id='Filter' className='btn' onClick={HandleFilterClick}>Filters</button>
            {/* <VisionDownloader epiList={epiList}/> */}
            <button onClick={downloadVision}>Download GFA</button> 
            <button onClick={getVision}>Get Vision</button>
        </div>
       </Panel>
    );
};

export default FiltersPanel2;

