import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { SettingsComponent } from './components/settings/settings.component';
import { BotComponent } from './components/bot/bot.component';
import { HttpServiceService } from 'src/services/http.service';
import { BotInteractionService } from 'src/services/bot-interaction.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RegisterComponent } from './components/register/register.component';
import { MessagingService } from 'src/services/messaging.service'

@NgModule({
  declarations: [AppComponent, SettingsComponent, BotComponent, RegisterComponent],
  providers: [HttpServiceService, BotInteractionService, RegisterComponent, MessagingService],
  imports: [BrowserModule, FormsModule, HttpClientModule],
  bootstrap: [AppComponent],
})
export class AppModule { }
