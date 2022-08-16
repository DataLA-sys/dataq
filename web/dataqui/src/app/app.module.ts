import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';

import { CacheInterceptor } from 'src/app/http-interceptors/cache.interceptor';
import { BasicAuthInterceptor } from 'src/app/http-interceptors/basic-auth.interceptor';
import { ErrorInterceptor } from 'src/app/http-interceptors/error.interceptor';
import { HomeComponent } from 'src/app/components/home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {MatGridListModule} from '@angular/material/grid-list';
import { FlexLayoutModule } from '@angular/flex-layout';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatButtonModule} from '@angular/material/button';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCardModule} from '@angular/material/card';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatMenuModule} from '@angular/material/menu';
import {MatSidenavModule} from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { AceEditorModule } from 'ng2-ace-editor';
import 'material-icons/iconfont/material-icons.css';

import { StepListComponent } from './components/step-list/step-list.component';
import { StepPropsComponent } from './components/step-props/step-props.component';
import { GraphComponent } from './components/graph/graph.component';
import { StepOptsComponent } from './components/step-opts/step-opts.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { OpenFileComponent } from './components/open-file/open-file.component';
import { OptionsComponent } from './components/options/options.component';
import { CommandsComponent } from './components/commands/commands.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    StepListComponent,
    StepPropsComponent,
    GraphComponent,
    StepOptsComponent,
    ProjectsComponent,
    OpenFileComponent,
    OptionsComponent,
    CommandsComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],  
  imports: [
    HttpClientModule,
    BrowserModule,
    ReactiveFormsModule,
    CommonModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatGridListModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatTabsModule,
    MatCardModule,
    MatExpansionModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatMenuModule,
    MatSidenavModule,
    MatTooltipModule,
    MatAutocompleteModule,
    FlexLayoutModule,
    FormsModule,
    NgxGraphModule,
    AceEditorModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
