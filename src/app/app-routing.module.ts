import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { BotComponent } from './components/bot/bot.component';
import { RegisterComponent } from './components/register/register.component';
import { SettingsComponent } from './components/settings/settings.component';

const routes: Routes = [
    { path: '', component: BotComponent},
    { path: 'register', component: RegisterComponent },
    { path: 'setting', component: SettingsComponent },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }