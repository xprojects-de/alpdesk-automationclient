import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RestviewComponent } from './restview/restview.component';
import { SocketviewComponent } from './socketview/socketview.component';
import { DevicesviewComponent } from './devicesview/devicesview.component';

const appRoutes: Routes = [
  { path: 'restview', component: RestviewComponent },
  { path: 'socketview', component: SocketviewComponent },
  { path: 'devicesview', component: DevicesviewComponent },
  { path: '**', component: RestviewComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(
    appRoutes,
    { enableTracing: false }
),],
  exports: [RouterModule]
})
export class AppRoutingModule { }
