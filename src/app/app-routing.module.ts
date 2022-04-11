import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './component/auth.guard';
import { BoardAdminComponent } from './component/board-admin/board-admin.component';
import { BoardModeratorComponent } from './component/board-moderator/board-moderator.component';
import { BoardUserComponent } from './component/board-user/board-user.component';
import { LoginComponent } from './component/login/login.component';
import { MapComponent } from './component/map/map.component';
import { ProfileComponent } from './component/profile/profile.component';
import { RegisterComponent } from './component/register/register.component';

const routes: Routes = [
  { path: 'map',  component: MapComponent },//canActivate:[AuthGuard],
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'user', component: BoardUserComponent },
  { path: 'mod', component: BoardModeratorComponent },
  { path: 'admin', component: BoardAdminComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
