import { Agence, DescReseau } from "./descReseau";
import { Stop } from "./stops";
import { Trajet } from "./trajets";


export class StopDto{

    static stopCompletStop(descReseau: DescReseau, trajet: Trajet, stop: Stop):StopDto{
        let stopDto = new StopDto();
        stopDto.id = descReseau.id;
        stopDto.title = descReseau.title;
        stopDto.name = descReseau.name;
        stopDto.agence = descReseau.agence;

        stopDto.route_id = trajet.route_id;
        stopDto.route_text_color = trajet.route_text_color;
        stopDto.route_color = trajet.route_color;
        stopDto.route_long_name = trajet.route_long_name;
        stopDto.route_short_name = trajet.route_short_name;

        stopDto.stop_id = stop.stop_id;
        stopDto.stop_name = stop.stop_name;
        return stopDto;
    }

    static stopCompletTrajet(descReseau: DescReseau, trajet: Trajet):StopDto{
        let stopDto = new StopDto();
        stopDto.id = descReseau.id;
        stopDto.title = descReseau.title;
        stopDto.name = descReseau.name;
        stopDto.agence = descReseau.agence;

        stopDto.route_id = trajet.route_id;
        stopDto.route_text_color = trajet.route_text_color;
        stopDto.route_color = trajet.route_color;
        stopDto.route_long_name = trajet.route_long_name;
        stopDto.route_short_name = trajet.route_short_name;
        return stopDto;
    }

    static stopCompletReseau(descReseau: DescReseau):StopDto{
        let stopDto = new StopDto();
        stopDto.id = descReseau.id;
        stopDto.title = descReseau.title;
        stopDto.name = descReseau.name;
        stopDto.agence = descReseau.agence;
        return stopDto;
    }

    
    constructor(
        public id : string="",

        public title: string = "",
        public name: string = "",
        public agence: Agence[] = [],
        
        public route_id: string = "",
        public route_text_color: string = "",
        public route_color: string = "",
        public route_long_name: string = "",
        public route_short_name: string = "",
        
        public stop_id : string="",
        public stop_name : string="",
        
        ){
    }
}