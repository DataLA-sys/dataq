import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../classes/user';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User|undefined>;
    public currentUser: Observable<User|undefined>;

    constructor(private http: HttpClient) {
        let u = localStorage.getItem('currentUser')
        if(u == null) {
            this.currentUserSubject = new BehaviorSubject<User|undefined>(undefined);
        } else {
            this.currentUserSubject = new BehaviorSubject<User|undefined>(JSON.parse(u));
        }
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User | undefined {
        return this.currentUserSubject.value;
    }

    login(username: string, password: string) {
        return this.http.post<any>(`/user`, { username, password })
            .pipe(map(user => {
                // store user details and basic auth credentials in local storage to keep user logged in between page refreshes
                user.authdata = window.btoa(username + ':' + password);
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
                return user;
            }));
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(undefined);
    }
}