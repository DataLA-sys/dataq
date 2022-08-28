import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Step } from '../classes/step';

interface Event {}

export class StepSelect implements Event {
    step!: Step;
    constructor(step: Step) {
        this.step = step
    }
}

export class RedrawGraph implements Event {}
export class UnSelect implements Event {}

export class GraphSize implements Event {
    h!: number;
    w!: number;
    constructor(h: number, w: number) {
        this.h = h
        this.w = w
    }
}
export class Refresh implements Event{}
export class RefreshProjects implements Event{}
export class StepFile implements Event {
    name: string;
    step: string;
    constructor(name: string, step: string) {
        this.name = name;
        this.step = step;
    }
}
export class UpdateFileList implements Event{}
export class CenterGraph implements Event{}
export class FitGraph implements Event{}
export class StepFileChanged extends StepFile implements Event {}
export class StepFileSaved extends StepFile implements Event {}
export class MainSave implements Event {}
export class Run implements Event {
    sh: string;
    step: string;
    constructor(sh: string, step: string) {
        this.sh = sh
        this.step = step
    }
}
export class Schema implements Event {
    step: string
    schema: any
    constructor(step: string, schema: any) {
        this.step = step
        this.schema = schema
    } 
}

@Injectable({ providedIn: 'root' })
export class EventsService {
    constructor() { }
    
    private eventSource = new Subject<Event>();
    eventEvent$ = this.eventSource.asObservable();
    emitEventEvent(data: Event) {
      this.eventSource.next(data);
    }
}