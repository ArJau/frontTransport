export class Trajet{
    result: any;
    constructor(
        public id : string="",
        public route_text_color : string="",
        public route_color : string="",
        public name : string="",
        public idPosition : [], 
        public stops :[{
            id: string,
            stop_name: string,
            stop_id: string,
            stop_lat: number,
            stop_lon: number,
            idPosition: string
            }]
        ){
    }
}
