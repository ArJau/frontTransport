export class Stop{
    result: any;
    constructor(
        public id : string="",
        //public stop_id : string="",
        //public level_id : string="",
        public name : string="",//stop_name
        public coord :[{
            lat: number,
            lon: number
            }]
        //public stop_lat : number=0,
        //public stop_lon : number=0
        //public location_type : string="",
        //public parent_station : string=""
        ){

        }


        
}