import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RechercheLieuComponent } from './recherche-lieu.component';

describe('RechercheLieuComponent', () => {
  let component: RechercheLieuComponent;
  let fixture: ComponentFixture<RechercheLieuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RechercheLieuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RechercheLieuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
