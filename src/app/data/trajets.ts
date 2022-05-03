export class Trajet {
    result: any;
    constructor(
        public id: string = "",
        public route_id: string = "",
        public route_text_color: string = "",
        public route_color: string = "",
        public route_long_name: string = "",
        public idPosition: [],
        public stops: [{
            id: string,
            stop_name: string,
            stop_id: string,
            stop_lat: number,
            stop_lon: number,
            idPosition: string
        }],
        public shapes: []
    ) {
    }
}

export class Coord {
    constructor(
        public lat: number = 0,
        public lon: number = 0
    ) { }
}

export class DescReseau {
    constructor(
        public title: string = "",
        public name: string = "",
        public id: string = "",
        public url: string = "",
        public rt: boolean = false,
        public nbRoutes: number = 0,
        public center: number[],
        public idPosition: number[],
        public coord: number[],
        public display: boolean=true
    ) { }
};


export class realTimesVehicles {
    constructor(
        public routeId: string = "",
        public coord: number[],
        public bearing: number,
        public tripId: string = "",
        public id:string=""
    ) { }
}

export class realTimesAlerts {
    constructor(
        public idReseau: string = "",
        public alert: {
            activePeriod: {
                start: number,
                end: number
            },
            informedEntity: {
                routeId: string
            },
            cause: string,
            effect: string,
            url: {
                translation: [{
                    text: string,
                    language: string
                }]
            },
            headerText: {
                translation: [{
                    text: string,
                    language: string
                }]
            },
            descriptionText: {
                translation: [{
                    text: string,
                    language: string
                }]
            },
            severityLevel : string
        }
    ) {}
}

