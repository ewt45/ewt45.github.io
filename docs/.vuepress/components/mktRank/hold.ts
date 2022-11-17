export class UserOwn {
    drivers= new Array<userData>();
    gliders= new Array<userData>();
    karts= new Array<userData>();
    queryData = { drivers :new queryedData(), gliders: new queryedData(), karts: new queryedData() };
    // posssessData={drivers:new Array<{Key:string,level:number}>(), gliders:new Array<{Key:string,level:number}>(),karts:new Array<{Key:string,level:number}>()}
    // constructor() {
    //     this.drivers = new Array<userData>();
    //     this.gliders = new Array<userData>();
    //     this.karts = new Array<userData>();
    // }
}

export class MKTAllData {
    balloons: {
        Id: number;
        Key: string;
        Name: string;
        Price: number;
        Rarity: number;
        SortId: number;
        Translations: Translations;
    }[];
    courses: {};

    drivers: {
        ColorVariation: object;
        CourseGoodAtDetail: {
            Key: string;
            PromotionLevel: number;
        }[];
        CourseMoreGoodAtDetail: string[];
        Id: number;
        IsMiiSuit: boolean;
        Key: string;
        Name: string;
        Price: number;
        Rarity: number;
        SortId: number;
        TagIds: number[];
        Translations: Translations;
        skill: {
            Id: number;
            Key: string;
        };
    }[];

    gliders: {
        CourseGoodAtDetail: {
            Key: string;
            PromotionLevel: number;
        }[];
        CourseMoreGoodAtDetail: string[];
        Id: number;
        Key: string;
        Name: string;
        Price: number;
        Rarity: number;
        SortId: number;
        TagIds: number[];
        Translations: Translations;
        skill: {
            Id: number;
            Key: string;
        };
    }[];

    karts: {
        BodyId: number;
        BodyName: string;
        CourseGoodAtDetail: {
            Key: string;
            PromotionLevel: number;
        }[];
        CourseMoreGoodAtDetail: string[];
        Id: number;
        Key: string;
        Price: number;
        Rarity: number;
        SortId: number;
        TagIds: number[];
        TireId: number;
        TireName: string;
        Translations: Translations;
        skill: {
            Id: number;
            Key: string;
        };
    }[];
    skills: object[];
    tour: object;

    constructor() {

    }
}

class userData{
    Key:string;
    Level:number;
}

class Translations {
    CNzh: string;
    EUde: string;
    EUes: string;
    EUfr: string;
    EUit: string;
    Jpja: string;
    Krko: string;
    Twzh: string;
    USen: string;
    USes: string;
    USpt: string;
}

export class queryedData{
    cards=new Array<queryedCardsData>();
    courses=new Set<string>();
}

class queryedCardsData{
    Key:string;
    UnCovered= new Array<string>();
    Translation:string;
}