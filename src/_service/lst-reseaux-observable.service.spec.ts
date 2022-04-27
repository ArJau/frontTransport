import { TestBed } from '@angular/core/testing';

import { LstReseauxObservableService } from './lst-reseaux-observable.service';

describe('LstReseauxObservableService', () => {
  let service: LstReseauxObservableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LstReseauxObservableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
