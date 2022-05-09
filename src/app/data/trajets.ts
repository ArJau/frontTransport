import { Stop } from "./stops";

export class Trajet {
    result: any;
    constructor(
        public id: string = "",
        public route_id: string = "",
        public route_text_color: string = "",
        public route_color: string = "",
        public route_long_name: string = "",
        public route_short_name: string = "",
        public idPosition: []= [],
        public stops: Stop[] = [],
        public shapes: [] = []
    ) {
    }
}

export class Favori {
    constructor(
        public noReseauId: string = "",
        public reseauId: string = "",
        public agenceId : string = "",
        public routeId: string = "",
        public stopId: string = "",
        public user: User = new User,
    ) { }
};

export class User {
    constructor(
        public id: string = ""
    ) {}
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
            informedEntity: [{
                routeId: string,
                agencyId: string,
                routeType: number,
                stopId: string,
                trip:string
            }],
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

