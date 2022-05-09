import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent } from './component/map/map.component';
import { HttpClientModule } from '@angular/common/http';
import { StopComponent } from './component/stop/stop.component';
import { RegisterComponent } from './component/register/register.component';
import { HomeComponent } from './component/home/home.component';
import { ProfileComponent } from './component/profile/profile.component';
import { LoginComponent } from './component/login/login.component';
import { RouterModule } from '@angular/router';
import { RechercheLieuComponent } from './component/recherche-lieu/recherche-lieu.component';
import { DetailStopComponent } from './component/detail-stop/detail-stop.component';
import { FiltreReseauxComponent } from './component/filtre-reseaux/filtre-reseaux.component';
import { authInterceptorProviders } from 'src/_helpers/auth.interceptor';
import { AlertComponent } from './component/alert/alert.component';



@NgModule({
  declarations: [
    MapComponent,
    StopComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    ProfileComponent,
    AppComponent,
    RechercheLieuComponent,
    DetailStopComponent,
    FiltreReseauxComponent,
    AlertComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, 
    FormsModule, 
    HttpClientModule
  ],
  exports: [RouterModule],
  providers: authInterceptorProviders,
  bootstrap: [AppComponent]
})
export class AppModule { }
