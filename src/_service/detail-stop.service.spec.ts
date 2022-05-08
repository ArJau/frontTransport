import { TestBed } from '@angular/core/testing';

import { DetailStopService } from './detail-stop.service';

describe('DetailStopService', () => {
  let service: DetailStopService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetailStopService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
