import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { SenseService } from '../../../services/sense.service';
import { tap, filter, takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { MessagingService } from 'src/services/messaging.service';

@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit, OnDestroy {
	
	settingsOpen = false;
	selectedIndex: number;

	voices: any[];
	activeVoice: any;
	destroy$ = new Subject();

	subscription: Subscription;

	constructor(private sense: SenseService, 
		private messageService:MessagingService) {
		this.subscription = this.messageService.getMessage().subscribe(message => {
			if (message){
			  if(message == "false"){
				  this.settingsOpen = false;
			  }
			}
		  });
	}

	ngOnInit() {
		this.loadVoices();
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	toggleSettings() {
		this.settingsOpen = !this.settingsOpen;
	}

	loadVoices() {
		this.sense.voices$
			.pipe(
				filter((i) => !!i),
				tap((v) => {
					console.log(v.length, 'voices loaded');
					this.voices = v;
				}),
				takeUntil(this.destroy$)
			)
			.subscribe();

		this.sense.activeVoice$
			.pipe(
				filter((i) => !!i),
				tap((voice) => {
					// this.activeVoice = voice;
					this.selectedIndex = this.voices.indexOf(voice);
					console.log(voice, this.selectedIndex);
					// this.updateVoice();
				}),
				takeUntil(this.destroy$)
			)
			.subscribe();
	}

	updateVoice() {
		if (!this.voices) return;
		const voice = this.voices[this.selectedIndex];
		if (!voice) return;

		console.log(voice.name);
		this.sense.onVoiceSelected(voice);
	}

	onChange(index: number) {
		this.selectedIndex = index;
	}
}
