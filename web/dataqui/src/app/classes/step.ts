export class Options {
    name!: string;
    opts?: {option: string, value: any}[]
}

export class Step { 
    name!: string;
    in: Step[] = [];
    opt: Options = new Options();
    constructor(name: string) {
        this.name = name
    }
}