import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { Node } from '@swimlane/ngx-graph';
import { EntityService } from 'src/app/services/entity.service';
import { Entity } from 'src/app/classes/entity';
import { CenterGraph, EventsService, FitGraph, GraphSize, RedrawGraph, Refresh, StepSelect } from 'src/app/services/events.service';
import { Step } from 'src/app/classes/step';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.styl']
})
export class GraphComponent implements OnInit, OnChanges {
  x: number = 140;
  y: number = 100;
  zoomToFit$: Subject<boolean> = new Subject();
  panToNode$: Subject<any> = new Subject();
  center$: Subject<boolean> = new Subject();
  clusters: any[] = []
  nodes: any[] = []
  links: any[] = []
  showMiniMap: boolean = false;
  showClusters: boolean = true;

  selected: Step | undefined;
  entity: Entity | undefined;

  checkIfSelected(node: Node) {
    return node.data.step == this.selected
  }

  fit() {
    this.zoomToFit$.next(true)
  }

  center() {
    this.center$.next(true)
  }

  constructor(private entityService: EntityService, private eventService: EventsService) { 
    this.fillGraphData()
    this.eventService.eventEvent$.subscribe(ev => {if(ev instanceof StepSelect) {this.selected = ev.step}})
    this.eventService.eventEvent$.subscribe(ev => {if(ev instanceof RedrawGraph) {this.fillGraphData()}})
    this.eventService.eventEvent$.subscribe(ev => {
      if(ev instanceof GraphSize) {
        setTimeout(() => {
          this.y = ev.h - 5;
          this.x = ev.w;
        }, 100)
      }
      if(ev instanceof CenterGraph) { this.center() }
      if(ev instanceof FitGraph) { this.fit() }
    })
    this.eventService.eventEvent$.subscribe(ev => {if(ev instanceof Refresh) {this.fillGraphData()}})
  }

  fillGraphData() {
    this.entity = this.entityService.getEntity()
    if(this.selected && !this.entity.steps.includes(this.selected)){
      this.selected = undefined
    }
    this.nodes = this.entity?.steps.map(step => {return {id: step.name, label: step.name, data: {image: "assets/dataset.ico", step: step}}}) || []
    let i = 0
    this.links = this.entity?.steps.filter(s => s.in.length > 0).flatMap(s => s.in.map(in_ => {return {id: i++, source: in_.name, target: s.name} })) || []
  }

  ngOnChanges(changes: SimpleChanges) {
    this.fillGraphData()
  }

  ngOnInit(): void {
   
  }

  nodeClick(node: Node) {
    this.selected = node.data.step
    this.eventService.emitEventEvent(new StepSelect(node.data.step))
  }

}
