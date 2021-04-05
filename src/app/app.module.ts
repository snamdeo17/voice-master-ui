import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { TableModule } from 'primeng/table';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {ButtonModule} from 'primeng/button';

import { AppComponent } from './app.component';
import { SettingsComponent } from './components/settings/settings.component';
import { BotComponent } from './components/bot/bot.component';
import { HttpServiceService } from 'src/services/http.service';
import { BotInteractionService } from 'src/services/bot-interaction.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RegisterComponent } from './components/register/register.component';
import { MessagingService } from 'src/services/messaging.service'
import { HeaderComponent } from './header/header.component'


@NgModule({
  declarations: [AppComponent, SettingsComponent, BotComponent, RegisterComponent,HeaderComponent],
  providers: [HttpServiceService, BotInteractionService, RegisterComponent, MessagingService],
  imports: [
    AppRoutingModule,
    BrowserModule, 
    BrowserAnimationsModule,
    FormsModule, 
    HttpClientModule,
    TableModule,
    OverlayPanelModule,
    ButtonModule],
  bootstrap: [AppComponent],
})
export class AppModule { }
