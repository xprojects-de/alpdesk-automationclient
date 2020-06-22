import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestviewComponent } from './restview.component';

describe('RestviewComponent', () => {
  let component: RestviewComponent;
  let fixture: ComponentFixture<RestviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
