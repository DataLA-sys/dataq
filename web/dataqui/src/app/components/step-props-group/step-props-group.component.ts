import { Component } from '@angular/core';
import { Step } from 'src/app/classes/step';
import { EventsService, Refresh, StepSelect, UnSelect } from 'src/app/services/events.service';

@Component({
  selector: 'app-step-props-group',
  templateUrl: './step-props-group.component.html',
  styleUrls: ['./step-props-group.component.styl']
})
export class StepPropsGroupComponent {
  private step_: Step | undefined = undefined
  
  get step(): Step | undefined {
    return this.step_
  }
  set step(value: Step | undefined) {
    this.step_ = value
  }

  constructor(private eventService: EventsService) { 
    this.eventService.eventEvent$.subscribe(ev => {
      if(ev instanceof StepSelect) {
        this.step = ev.step
      }
      if(ev instanceof UnSelect) {
        this.step = undefined
      }
      if(ev instanceof Refresh) {
        this.step = undefined
      }
    })
  }
}
