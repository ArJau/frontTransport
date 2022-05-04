export class Stop{
    result: any;
    constructor(
        public id : string="",
        public stop_id : string="",
        public stop_name : string="",
        public coord :[{
            lat: number,
            lon: number
            }],
        public stop_lat : number=0,
        public stop_lon : number=0,
        public idPosition : [],
        
        //public location_type : string="",
        //public parent_station : string=""
        ){
    }
}

export class Greeting{
    id:any;
    content:any;
}