import { TestBed } from '@angular/core/testing';

import { RechercherLieuService } from './rechercher-lieu.service';

describe('RechercherLieuService', () => {
  let service: RechercherLieuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RechercherLieuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
