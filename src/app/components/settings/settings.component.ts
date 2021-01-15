import { Component, OnInit, OnDestroy } from '@angular/core';
import { SenseService } from '../../../services/sense.service';
import { tap, filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

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

	constructor(private sense: SenseService) {}

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
