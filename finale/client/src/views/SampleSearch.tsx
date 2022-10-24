import React, { KeyboardEvent, ChangeEvent, FC, useEffect, useState } from "react";
import { useSigma} from "react-sigma-v2";
import { Attributes } from "graphology-types";
import { BsSearch } from "react-icons/bs";
import { FiltersState } from "../types";
import { SourceMap } from "module";
import Graph from "graphology";

const SampleSearch: FC<{ filters: FiltersState }> = ({ filters }) => {
    const sigma = useSigma();
    const graph = sigma.getGraph();
    const [isOpen, setOpen] = useState<boolean>(true);
    const [color, setColor] = useState<Array<{id: string; code: string}>>([]);
    const [sample, setSample] = useState<Array<string>>([]);
    const [message, setMessage] = useState<string>('');
    const [hidden, setHidden] = useState<Array<string>>([]);
    const [isl, setIsl] = useState<string>('');

    const [search, setSearch] = useState<string>("");
    const [values, setValues] = useState<Array<{ id: string; label: string, name: string}>>([]);
    const [selected, setSelected] = useState<string | null>(null);
    const [sampList, setSampList] = useState<Array<string>>([]);

    const refreshValues = () => {
        const newValues: Array<{ id: string; label: string; name: string }> = [];
        const lcSearch = search.toLowerCase();
        if (!selected && search.length > 1) {
            sigma.getGraph().forEachNode((key: string, attributes: Attributes): void => {
                if (!attributes.hidden && attributes.sample){
                    attributes.sample.some((samp: string)=>{
                        if(samp.toLowerCase().includes(lcSearch)){
                            return newValues.push({ id: key, label: samp, name:attributes.label });
                        };
                    });
                }
            });
        }   
        const sampValues = newValues.map(a =>a.label);
        const uniqSampValues = sampValues.filter(function(item, pos) {
            return sampValues.indexOf(item) == pos;
        });
        uniqSampValues.sort((a,b)=>{
            if (a< b) return -1;
            return 1;
        });
        setValues(newValues);
        setSampList(uniqSampValues);
    };




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

    const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const searchString = e.target.value;
      const valueItem = values.find((value) => value.label === searchString);
      if (valueItem) {
        setSearch(valueItem.label);
        setValues([]);
        setSelected(valueItem.id);
        setIsl(valueItem.label);
      } else {
        setSelected(null);
        setSearch(searchString);
        setIsl('');
      }
    };

    const onKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && values.length) {
        setSearch(values[0].label);
        setSelected(values[0].id);
        setIsl(values[0].label);

        setOpen(!isOpen)
        HandleClick()
      }
    };

    const HandleClick = () => {
        if(!isOpen){
            setSample([]);      
        }
        else{
            const formerColors: Array<{ id: string; code: string }> = [];
            const found: Array<string> = [];
            sigma.getGraph().forEachNode((key: string, attributes: Attributes): void => {
                if(!attributes.hidden && attributes.sample){
                    attributes.sample.forEach((samp: string)=>{
                        if(isl && samp.includes(isl)){ 
                            found.push(key);
                            formerColors.push({id: key, code:attributes.color});
                        }
                    });
                };
            });
            setSample(found);
            setColor(formerColors)
        };
        setOpen(!isOpen)
    };

    useEffect(()=>{
        if(sample && !isOpen){
            const newHidden: Array<string>=[];
            sigma.getGraph().forEachNode((key: string, attributes: Attributes): void => {
                if (sample.includes(key)){
                    sigma.getGraph().setNodeAttribute(key, "color", '#ff0000');
                }
                //CONTROLLARE CHE NON CANCELLI QUELLI EVIDENZIATI
                // else if (attributes.tag === 'mutation'){
                //     sigma.getGraph().setNodeAttribute(key, "hidden", 'true');
                //     newHidden.push(key);
                // }
            });
            graph.forEachEdge((key, source, target) =>{
                // if (graph.getEdgeAttribute(key, 'is_ref')==='false' && !sample.includes(graph.getEdgeAttribute(key, 'source')) && !sample.includes(graph.getEdgeAttribute(key, 'target')) ) 
                // graph.setEdgeAttribute(key, 'hidden', true);
                // else{
                    if(sample.includes(graph.getEdgeAttribute(key, 'source')) && sample.includes(graph.getEdgeAttribute(key, 'target'))){
                        graph.setEdgeAttribute(key, 'color', '#ff0000');
                    }
                //}

            })
            //setHidden(newHidden);
        }
    });

    useEffect(()=>{
        if(isOpen){
            if(color){
                color.forEach((col)=>{
                    sigma.getGraph().setNodeAttribute(col.id, 'color', col.code );
                });
            }
            sigma.getGraph().forEachNode((key: string, attributes: Attributes): void => {
                // if(attributes.hidden && filters.tags[attributes.tag]){
                //     sigma.getGraph().setNodeAttribute(key, 'hidden', false);
                // }
            })
            sigma.getGraph().forEachEdge(key =>{
                // if (sigma.getGraph().getEdgeAttribute(key, 'hidden')) {
                //     sigma.getGraph().setEdgeAttribute(key, 'hidden', false);
                // }
                // else 
                if (graph.getEdgeAttribute(key, 'color') === '#ff0000'){
                    graph.setEdgeAttribute(key, 'color', '#c3c3c3')
                }
            });

        }
    });



    return (
        <div>
            <div className="search-wrapper">
                <input
                    type="search"
                    placeholder="Search in samples..."
                    list="samples"
                    value={search}
                    onChange={onInputChange}
                    onKeyPress={onKeyPress}
                />
                <BsSearch className="icon" />
                <datalist id="samples">
                    {sampList.map((samp :string) => (
                        <option key={samp} value={samp}>

                        </option>
                    ))}
                </datalist>
                <button type="button" className='btn' onClick={HandleClick}>Select</button>
            </div>
        </div>
    );
};

export default SampleSearch;