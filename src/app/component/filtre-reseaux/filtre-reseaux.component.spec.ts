import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltreReseauxComponent } from './filtre-reseaux.component';

describe('FiltreReseauxComponent', () => {
  let component: FiltreReseauxComponent;
  let fixture: ComponentFixture<FiltreReseauxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FiltreReseauxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FiltreReseauxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
