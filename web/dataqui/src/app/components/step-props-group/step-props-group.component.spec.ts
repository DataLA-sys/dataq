import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepPropsGroupComponent } from './step-props-group.component';

describe('StepPropsGroupComponent', () => {
  let component: StepPropsGroupComponent;
  let fixture: ComponentFixture<StepPropsGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StepPropsGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StepPropsGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
