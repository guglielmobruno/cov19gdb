export interface NodeData {
  key: string;
  label: string;
  tag: string;
  //URL: string;
  cluster: string;
  sample: string[];
  x: number;
  y: number;
}

export interface cluster {
  key: string;
  color: string;
  clusterLabel: string;
}

export interface Tag {
  key: string;
  color: string;
  image: string;
}

export interface Dataset {
  nodes: NodeData[];
  edges: [string, string, boolean, string, boolean, boolean][];
  clusters: cluster[];
  tags: Tag[];
  metadata: Meta[]
}

export interface Meta {
  division: string;
  strain: string;
  date: Date;
  country: string;
  sex: string;
  epi_id: string;
  host: string;
  originating_lab: string;
  region: string;
  age: string;
}

export interface MetaSet {
  "division": string[];
  "strain": string[];
  "date": Date[];
  "country": string[];
  "sex": string[];
  "epi_id": string[];
  "host": string[];
  "originating_lab": string[];
  "region": string[];
  "age": string[];
}

export interface FiltersState {
  clusters: Record<string, boolean>;
  tags: Record<string, boolean>;
}
