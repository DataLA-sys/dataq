import { Step } from "./step";

export class Option {
    name: string;
    value: string;
    constructor(name: string, value: string) {
        this.name = name
        this.value = value
    }
}
export class Entity {
    name!: string;
    steps: Step[] = []
    options: Option[] = []
}