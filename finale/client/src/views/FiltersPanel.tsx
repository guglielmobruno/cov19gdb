import React, { KeyboardEvent, ChangeEvent, FC, useEffect, useState } from "react";
import { useSigma} from "react-sigma-v2";
import { Attributes } from "graphology-types";
import { BsSearch } from "react-icons/bs";
import Panel from "./Panel"
import PlacesTags from "./PlacesTags"
import { MdCategory } from "react-icons/md";
import { FiltersState, Meta, Dataset, MetaSet } from "../types";
import { SourceMap } from "module";
import Graph from "graphology";
import { GrPhone } from "react-icons/gr";
import { ArrayTypeNode } from "typescript";
import { stringify } from "querystring";

const FiltersPanel: FC<{ filters: FiltersState }> = ({ filters }) => {
    const sigma = useSigma();
    const graph = sigma.getGraph();
    const [message, setMessage] = useState<string>('ciao');
    const [message2, setMessage2] = useState<string>('');
    const [meta, setMeta] = useState<any>({});
    const [selectedMeta, setSelectedMeta] = useState<{region: string[]; country: string[]}>({region: [], country:[]});
    const [epiList, setEpiList] = useState<Array<string>>([]);
    const [isClicked, setClicked] = useState<boolean>(false);
    const [isClicked2, setClicked2] = useState<boolean>(false);
    const [age, setAge] = useState<{min: string, max: string}>({min : '0', max : '120'});
    const [isAgeSetted, setAgeSetted] = useState<boolean>(false);
    const [clear, setClear] = useState<boolean>(true);
    const [ref, setRef] = useState<boolean>(false);
    const [theColor, setTheColor] = useState<string>("#000000")

    const [search, setSearch] = useState<string>("");
    const [values, setValues] = useState<Array<string>>([]);
    const [selected, setSelected] = useState<string | null>(null);
    const [sampList, setSampList] = useState<Array<string>>([]);
    const [selectedFiled, setSelectedField] = useState<string>('');
    const [sex, setSex] = useState<{female: boolean, male: boolean, unknown: boolean}>({female: true, male: true, unknown: true});

    //const fields = ['region', 'id'];
    const buttonFilter = document.getElementById("Filter")
    
    const changeColor = () => {
        setTheColor((document.getElementById('color') as HTMLInputElement).value)
    }
    const refreshValues = () => {
        const newValues: Array<string> = [];
        const lcSearch = search.toLowerCase();
        if (!selected && search.length > 0) {
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
        //setSelected(valueItem);
        // setIsl(valueItem.label);
      } else {
        setSelected(null);
        setSearch(searchString);
      }
    };

    const onKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && values.length) {
        setClear(false)
        setSearch(values[0]);
        //setSelected(values[0]);
        // setIsl(values[0].label);
      }
    };

    const HandleFilterClick = () => {
        
        setClicked2(!isClicked2);
        const fields : {[key:string] : any[] } = {};
        fetch(`${process.env.PUBLIC_URL}/data2.json`)
            .then((res) => res.json())
            .then((data: Dataset) => {
                
                let sampleFound: string [] = [];
                data.metadata.forEach((el)=>{
                    if(sex.unknown && sex.male && sex.female){
                        let sexes = ['Male','Female','unknown'];
                        setMessage('non eccoci')
                        if (el.age && el.age!=='unknown'){
                            if(!clear){
                                if(((el.country === search || el.division === search || el.originating_lab === search ) || selectedMeta?.region?.includes(el.region)) && +el.age < +age.max && +el.age >= +age.min ){
                                    sampleFound.push(el.epi_id);
                                }      
                            } else {
                                if (isAgeSetted && +el.age < +age.max && +el.age >= +age.min){
                                    sampleFound.push(el.epi_id);
                                } 
                            }
                        } else{
                            if((el.country === search || el.division === search || el.originating_lab === search ) || selectedMeta?.region?.includes(el.region)){
                                sampleFound.push(el.epi_id);
                            }
                        }

                    }else{
                        
                        let sexes = [];
                        for (const [key, value] of Object.entries(sex)) {
                            if(value) sexes.push(key);
                        }
                        if (el.age && el.age!=='unknown'){
                            if(!clear){
                                if(((el.country === search || el.division === search || el.originating_lab === search ) || selectedMeta?.region?.includes(el.region)) && +el.age < +age.max && +el.age >= +age.min && sexes.includes(el.sex.toLowerCase()) ){
                                sampleFound.push(el.epi_id);
                                }
                                
                            } else {
                                if ( +el.age < +age.max && +el.age >= +age.min && sexes.includes(el.sex.toLowerCase())){
                                    sampleFound.push(el.epi_id);
                                }
                               
                            }
                        } else{
                            if((el.country === search || el.division === search || el.originating_lab === search ) || selectedMeta?.region?.includes(el.region) &&  sexes.includes(el.sex.toLowerCase())){
                                sampleFound.push(el.epi_id);
                            }
                            if (sexes.includes(el.sex.toLowerCase())){
                                sampleFound.push(el.epi_id);
                            }
                        }
                    }   
                })
                //setMessage(sampleFound.toString())
                setEpiList(sampleFound);
            });
    }

    // const HandleClick = () => {

    //     setClicked(!isClicked);
    //     let regions: Array<string> = [];

    //         fetch(`${process.env.PUBLIC_URL}/data2.json`)
    //             .then((res) => res.json())
    //             .then((data: Dataset) => {
    //                 let epiList: Array<string> = [];
    //                 let cont = 0;
    //                 const fields : {[key:string] : any } = {};
    //                 data.metadata.forEach((el)=>{

    //                     if (el.region  && !regions.includes(el.region)) {
    //                         regions.push(el.region);
    //                     }
    //                 });
    //                 setEpiList(epiList);
    //             });
    // };
    
    const changeAge = (e: ChangeEvent<HTMLInputElement>) => {
        const id = e.target.id;
        if(id === "minAge"){
            let years = age;
            years.min = e.target.value;
            setAge(years);
        } else{
            let years = age;
            years.max = e.target.value;
            setAge(years);
        }
        setAgeSetted(true);
        
    }

    const clearAge = () =>{
        setAge({min:'', max:''});
        (document.getElementById('minAge') as HTMLInputElement).value='';
        (document.getElementById('maxAge') as HTMLInputElement).value='';
        setAgeSetted(false);
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
                let sms = '';
                for (const [key, value] of Object.entries(fields)) {
                    sms+=key+': '+ value.length+', ';
                }
                setMeta(fields)
                //setMessage(meta.date[0])
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
                        const color = graph.getNodeAttribute(key, 'color');
                        //if (color !== theColor) graph.setNodeAttribute(key, 'formercolor', color);
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
                if (graph.getEdgeAttribute(key, 'is_ref')==='false' && (graph.getNodeAttribute((graph.getEdgeAttribute(key, 'source')),'color') !==theColor || graph.getNodeAttribute((graph.getEdgeAttribute(key, 'target')),'color') !==theColor )) 
                graph.setEdgeAttribute(key, 'hidden', true);
                else{
                    if(graph.getNodeAttribute((graph.getEdgeAttribute(key, 'source')),'color') ===theColor && graph.getNodeAttribute((graph.getEdgeAttribute(key, 'target')),'color') ===theColor ) {
                        graph.setEdgeAttribute(key, 'color', theColor);
                    }
                }
            })
            if (!isClicked2){
                if (buttonFilter){
                    buttonFilter.style.backgroundColor = 'white';
                    buttonFilter.style.color = 'black';
                } 
            }
            if(!isClicked && !isClicked2) {
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
    useEffect(()=>{
        if(!epiList && !search && !selectedMeta)
        setClear(true);
       
    })



    return (
        <Panel
        title={
          <>
             Filters
          </>
        }
      >
        <div>
            <p>This is a description</p>
            <p>{epiList.toString()!=='' ? epiList.toString() : 'no'}</p>
            <p>{message}</p>
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
                    placeholder="Search in countries..."
                    list="countries"
                    value={search}
                    onChange={onInputChange}
                    onKeyPress={onKeyPress}
                />
                <BsSearch className="icon" />
                <datalist id="countries">
                    
                    {sampList.map((samp :string) => (
                        <option key={samp} value={samp}>

                        </option>
                    ))}
                </datalist>
                
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
                                    if(r.length || c.length) setClear(false)
                                    else setClear(true);
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
            <p>choose a range of date between {}</p>
            <input className='myInp' type="date" />
            <input className='myInp' type="date" />
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
        </div>
       </Panel>
    );
};

export default FiltersPanel;

