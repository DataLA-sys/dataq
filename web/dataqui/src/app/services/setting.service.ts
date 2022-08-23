import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class SettingService {
  
  constructor(private http: HttpClient) { }

  getSettings(): Observable<any> {    
    return this.http.get<any>("/settings")
  }

}
