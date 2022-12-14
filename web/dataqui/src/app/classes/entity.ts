import { Step } from "./step";

export class OptionValue {
    env: string = "";
    value?: string;
    constructor(env: string, value: string) {
        this.env = env
        this.value = value
    }
}

export class Option {
    name: string;
    value: OptionValue[]
    
    constructor(name: string, value: OptionValue[]) {
        this.name = name
        this.value = value
    }
}

export class Entity {
    name!: string;
    steps: Step[] = []
    options: Option[] = []
    getEnvList(): string[] {
        let a = new Set(this.options.flatMap(o => o.value.map(v => v.env)))
        a.add("")
        return [...a].sort()
    }
}