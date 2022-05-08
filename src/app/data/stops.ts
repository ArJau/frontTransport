export class Stop{
    result: any;
    constructor(
        public id : string="",
        public stop_id : string="",
        public stop_name : string="",
        public coord : Coord=new Coord(0,0),
        public stop_lat : number=0,
        public stop_lon : number=0,
        public idPosition : [] = []
        ){
    }
}

export class Coord{
    constructor(
        public lat: number=0,
        public lon: number=0
    ){}
}