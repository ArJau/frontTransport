export class DescReseau {
    constructor(
        public title: string = "",
        public name: string = "",
        public agency_name: string = "",
        public id: string = "",
        public url: string = "",
        public rt: boolean = false,
        public nbRoutes: number = 0,
        public center: number[] = [],
        public idPosition: number[]= [],
        public coord: number[]= [],
        public display: boolean=true,
        public zoom: number = 10,
        public agence: Agence[] = [],
    ) { }
};

export class Agence {
    constructor(
        public url: string = "",
        public tel: string = "",
        public name: string = ""
    ) { }
};

