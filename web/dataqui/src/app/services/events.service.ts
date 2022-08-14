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
export class File implements Event {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
}
export class UpdateFileList implements Event{}
export class CenterGraph implements Event{}
export class FitGraph implements Event{}
export class FileChanged implements Event{
    name: string;
    constructor(name: string) {
        this.name = name;
    }
}
export class FileSaved implements Event{
    name: string;
    constructor(name: string) {
        this.name = name;
    }
}
export class MainSave implements Event {}

@Injectable({ providedIn: 'root' })
export class EventsService {
    constructor() { }
    
    private eventSource = new Subject<Event>();
    eventEvent$ = this.eventSource.asObservable();
    emitEventEvent(data: Event) {
      this.eventSource.next(data);
    }
}