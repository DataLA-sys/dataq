import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Step } from 'src/app/classes/step';
import { EntityService } from 'src/app/services/entity.service';
import { EventsService, RedrawGraph, Refresh, StepSelect, UnSelect } from 'src/app/services/events.service'
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';

const CSV_SOURCE = '<svg><image [attr.href]="assets/csv.png" height="40" width="40" fill="#a95963"/></svg>'

@Component({
  selector: 'app-step-list',
  templateUrl: './step-list.component.html',
  styleUrls: ['./step-list.component.styl']
})
export class StepListComponent implements OnInit {
  @ViewChild('listSteps') listSteps: any = undefined;
  
  steps: Step[] = []
  selected: Step | undefined
  constructor(private eventService: EventsService, private entityService: EntityService, 
    iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    this.refresh()
    this.eventService.eventEvent$.subscribe(ev => {if (ev instanceof StepSelect) {this.selected = ev.step}})
    this.eventService.eventEvent$.subscribe(ev => {if (ev instanceof Refresh) this.refresh()})
    iconRegistry.addSvgIconLiteral('csvSource', sanitizer.bypassSecurityTrustHtml(CSV_SOURCE));
  }

  refresh() {
    this.steps = this.entityService.getEntity().steps;
    this.selected = undefined;
  }

  createOps() {

  }

  a() {
    alert(this.listSteps.selectedOptions.selected[0]?.value)
  }

  ngOnInit(): void {
  }  

  add() {
    if(this.steps.filter(s => s.name === undefined).length == 0) {
      this.steps.push(new Step(this.entityService.getStepUniqName()))
      this.eventService.emitEventEvent(new RedrawGraph())
    }
  }

  rm() {
    if(this.selected) {
      let idx = this.steps.indexOf(this.selected)
      if(idx >= 0) {
        this.steps.splice(idx, 1)
        this.steps.forEach(s => {
          if(this.selected) {
            let i = s.in.indexOf(this.selected)
            if(i >= 0) {
              s.in.splice(i, 1)
            }
          }
        })
        this.selected = undefined
        this.eventService.emitEventEvent(new UnSelect())
        this.eventService.emitEventEvent(new RedrawGraph())
      }
    }
  }

  onSelection(e: any, v: any) {
    let selected = e.option.selected
    let step: Step | undefined = e.option.value
    if(selected && step) {
      this.eventService.emitEventEvent(new StepSelect(step))
    }
  }

}
