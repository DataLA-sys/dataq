import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Entity, Option } from 'src/app/classes/entity';
import { EntityService } from 'src/app/services/entity.service';
import { EventsService, Refresh } from 'src/app/services/events.service';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.styl']
})
export class OptionsComponent implements OnInit {
  private entity_!: Entity;
  @Input()
  set entity(entity: Entity) {
    this.entity_ = entity
    this.setOpts()
  }
  get entity(): Entity { return this.entity_ }

  optionsArray = new FormArray([])

  private setOpts() {
    this.optionsArray = this.fb.array(this.entity_.options.map(o => this.fb.group({
      name: this.fb.control(o.name),
      value: this.fb.control(o.value)
    })) || [])
  }

  constructor(private entityService: EntityService, private eventService: EventsService, private fb: FormBuilder) {
    
    this.eventService.eventEvent$.subscribe(ev => {
      if(ev instanceof Refresh) {
        this.entity = this.entityService.getEntity()
        this.setOpts()
      }
    })

  }

  apply() {
    if(this.entity_) {
      this.entity_.options.length = 0
      this.optionsArray.controls.forEach(c => this.entity_?.options.push(new Option(c.value.name, c.value.value)))
    }
  }

  ngOnInit(): void {
  
  }

  add() {
    this.optionsArray.push(
      this.fb.group({
        name: this.fb.control(''),
        value: this.fb.control('')
      })
    )    
  }

  del(index: number) {
    this.optionsArray.removeAt(index)
  }

}
