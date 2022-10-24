import { NodeDisplayData, PartialButFor, PlainObject } from "sigma/types";
import { Settings } from "sigma/settings";
import Graph from "graphology";

const TEXT_COLOR = "#000000";
const MAX_WIDTH = 350;
const MAX_HEIGTH = 500;

/**
 * This function draw in the input canvas 2D context a rectangle.
 * It only deals with tracing the path, and does not fill or stroke.
 */
export function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Custom hover renderer
 */
export function drawHover(context: CanvasRenderingContext2D, data: PlainObject, settings: PlainObject) {
  const size = settings.labelSize;
  const font = settings.labelFont;
  const weight = settings.labelWeight;
  const subLabelSize = size - 2;

  const label = data.label;
  const subLabel = data.sequence;
  const refLabel = data.tag;
  const sampleLabel = data.sample.filter(function(item: string, pos: number) {
    return data.sample.indexOf(item) == pos;
});;

  // Then we draw the label background
  context.beginPath();
  context.fillStyle = "#fff";
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 2;
  context.shadowBlur = 8;
  context.shadowColor = "#000";
  
  let start=0;
  context.font = `${weight} ${size}px ${font}`;
  const labelWidth = context.measureText(label).width;
  context.font = `${weight} ${subLabelSize}px ${font}`;
  const subLabelWidth = context.measureText(subLabel).width;
  const refLabelWidth = refLabel ? context.measureText(refLabel).width : 0;
  if(sampleLabel[0]==='reference') start=1;
  const sampleLabelWidth = sampleLabel ? context.measureText(sampleLabel.slice(start).join(', ')).width : 0;
  let textWidth = Math.max(labelWidth, subLabelWidth, refLabelWidth, sampleLabelWidth) < MAX_WIDTH ? Math.max(labelWidth, subLabelWidth, refLabelWidth, sampleLabelWidth) : MAX_WIDTH;
  if (Math.max(labelWidth, subLabelWidth, refLabelWidth, sampleLabelWidth) === sampleLabelWidth && textWidth===MAX_WIDTH){
    let to = sampleLabel[0]==='reference' ? 1 : 0;
    let from = sampleLabel[0]==='reference' ? 1 : 0;
    while(context.measureText(sampleLabel.slice(from,to+1).join(', ')).width<MAX_WIDTH){
      to++;
    }
    textWidth=context.measureText(sampleLabel.slice(from,to).join(', ')).width;
  }
  
  //Add interline spaces
  const interline = subLabelSize/6;
  const margin = 20;
  const fieldInterline = subLabelSize/3;

  const x = Math.round(data.x) + 15;
  const y = Math.round(data.y);
  const w = Math.round(textWidth + 1.5*size);
  const hLabel = Math.round(size*1.4);
  const hRefLabel = refLabel ? fieldInterline + subLabelSize + interline : 0;
  //IL 3 è perché ci stanno 3 sample in una riga bisogna cambiare in modo si adatti
  let hSampleLabel = sampleLabel ? fieldInterline + (subLabelSize + interline)*(Math.floor(sampleLabel.length/3)+1) : 0; //(Math.floor(context.measureText(sampleLabel).width/MAX_WIDTH)+1) : 0;
  hSampleLabel = (sampleLabel.length===1 && sampleLabel[0]==='reference') ? 0 : fieldInterline + (subLabelSize + interline)*(Math.floor(sampleLabel.length/3)+1);

  let hSubLabel = fieldInterline + (subLabelSize + interline)*(Math.floor(context.measureText(subLabel).width/MAX_WIDTH)+1);

  const toShort = (Math.floor(sampleLabel.length/3)+1) > (Math.floor(context.measureText(subLabel).width/MAX_WIDTH)+1) ? 'Samp' : 'Seq';

  const maxSeqHeigth = toShort === 'Seq' ? MAX_HEIGTH - (hRefLabel + hLabel + hSampleLabel + margin/2) : hSubLabel;
  const maxSampleHeigth = toShort === 'Samp' ? MAX_HEIGTH - (hRefLabel + hLabel + hSubLabel + margin/2) : hSampleLabel;

  hSampleLabel = hSampleLabel > maxSampleHeigth ? maxSampleHeigth : hSampleLabel;
  hSubLabel = hSubLabel > maxSeqHeigth ? maxSeqHeigth : hSubLabel;

  const h = hRefLabel + hLabel + hSubLabel + hSampleLabel + margin/2 > MAX_HEIGTH ? MAX_HEIGTH : hRefLabel + hLabel + hSubLabel + hSampleLabel + margin/2;
  drawRoundRect(context, x, y - margin, w, h, 5);
  context.closePath();
  context.fill();

  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.shadowBlur = 0;

  // And finally we draw the labels

  context.fillStyle = TEXT_COLOR;
  context.font = `${weight} ${size}px ${font}`;
  context.fillText(label, x + data.size, data.y);

  if (subLabel) {
    context.fillStyle = TEXT_COLOR;
    context.font = `${weight} ${subLabelSize}px ${font}`;
    let temp='';
    let cont=1;
    for(let i=0; i<subLabel.length; i++){
      temp+=subLabel[i];
      if (context.measureText(temp).width>MAX_WIDTH){
        if (fieldInterline + (subLabelSize + interline) * (cont+1) > maxSeqHeigth && h===MAX_HEIGTH && toShort === 'Seq'){
          temp = temp.slice(0, -3) + '...';
          break;
        } 
        context.fillText(temp, x + data.size, data.y  + fieldInterline + (subLabelSize + interline) * cont);
        cont++;
        temp=''
      }
    }
    context.fillText(temp, x + data.size, data.y   + fieldInterline + (subLabelSize + interline) * cont);
  }

  context.fillStyle = data.color;
  context.font = `${weight} ${subLabelSize}px ${font}`;
  context.fillText(refLabel, x + data.size, data.y + hSubLabel + fieldInterline + subLabelSize + interline);
  
  if(hSampleLabel!==0){
    if (sampleLabel) {
      context.fillStyle = TEXT_COLOR;
      context.font = `${weight} ${subLabelSize}px ${font}`;
      let temp='';
      let cont=1;
      for(let i=0; i<sampleLabel.length; i++){
        if (sampleLabel[i]!=='reference'){
          temp+=sampleLabel[i];
          if (i!==sampleLabel.length-1) temp+=', ';
        }
        if (context.measureText(temp).width>MAX_WIDTH-context.measureText(sampleLabel[i]).width){
          if (fieldInterline + (subLabelSize + interline) * (cont+1) > maxSampleHeigth && h===MAX_HEIGTH && toShort==='Samp'){
            temp = temp.slice(0, -3) + '...';
            break;
          } 
          context.fillText(temp, x + data.size, data.y + hSubLabel + hRefLabel + fieldInterline + (subLabelSize + interline)*cont);
          cont++;
          temp=''
        }
      }
      context.fillText(temp, x + data.size, data.y + hSubLabel + hRefLabel + fieldInterline + (subLabelSize + interline)*cont);
    }
  }
}

/**
 * Custom label renderer
 */
export default function drawLabel(
  context: CanvasRenderingContext2D,
  data: PartialButFor<NodeDisplayData, "x" | "y" | "size" | "label" | "color">,
  settings: Settings,
): void {
  if (!data.label) return;

  const size = settings.labelSize,
    font = settings.labelFont,
    weight = settings.labelWeight;

  context.font = `${weight} ${size}px ${font}`;
  const width = context.measureText(data.label).width + 8;

  context.fillStyle = "#ffffffcc";
  context.fillRect(data.x + data.size, data.y + size / 3 - 15, width, 20);

  context.fillStyle = "#000";
  context.fillText(data.label, data.x + data.size + 3, data.y + size / 3);
}

export function searchSample(data: Graph, samp: string){
  data.forEachNode((node) =>{
    let sample = data.getNodeAttribute(node, 'id');
    const hid = !data.getNodeAttribute(node, 'hidden');
    if(samp.includes(sample) ){
      data.setNodeAttribute(node, 'hidden', hid);
    }
  });
}