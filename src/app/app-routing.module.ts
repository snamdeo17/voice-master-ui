import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { BotComponent } from './components/bot/bot.component';
import { RegisterComponent } from './components/register/register.component';

const routes: Routes = [
   // { path: '', component: BotComponent , pathMatch: 'full' },
    { path: 'register', component: RegisterComponent },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }