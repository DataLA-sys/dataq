import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepPropsComponent } from './step-props.component';

describe('StepPropsComponent', () => {
  let component: StepPropsComponent;
  let fixture: ComponentFixture<StepPropsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StepPropsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StepPropsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
