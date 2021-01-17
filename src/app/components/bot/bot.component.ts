import { Component, OnInit } from '@angular/core';
import { merge, Observable, Subject } from 'rxjs';
import { map, tap, debounceTime, takeUntil } from 'rxjs/operators';
import {
	ListeningStarted,
	SpeakingStarted,
	RecognizedTextAction,
} from '../../../classes/models';
import { SenseService } from '../../../services/sense.service';
import { BotInteractionService } from '../../../services/bot-interaction.service';

@Component({
	selector: 'app-bot',
	templateUrl: './bot.component.html',
	styleUrls: ['./bot.component.css'],
})
export class BotComponent implements OnInit {
	destroy$ = new Subject();

	recognized$ = this.senseService.getType(RecognizedTextAction);
	state$: Observable<string>;
	message$: Observable<string>;
	outputMsg$: string;
	userId$: string;

	micAccess$ = this.senseService.hasMicrofonAccess$;

	constructor(private senseService: SenseService, private botInteraction: BotInteractionService) {
		this.message$ = this.recognized$.pipe(tap(console.log));

		const speaking$ = this.senseService
			.getType(SpeakingStarted)
			.pipe(map(() => 'SPEAKING'));

		const listening$ = this.senseService
			.getType(ListeningStarted)
			.pipe(map(() => 'LISTENING'));

		this.state$ = merge(speaking$, listening$);

		this.recognized$
			.pipe(
				debounceTime(200),
				tap((msg) => {
					// msg = `you said ${msg}`;
					this.botInteraction.sendMessge(msg, this.userId$).subscribe((data: any) => {
						if (data['userId'] != undefined) {
							this.userId$ = data['userId'];
						}
						const message = data['resp'];
						this.outputMsg$ = message;
						this.senseService.speak(message);

					})
				}, takeUntil(this.destroy$))
			)
			.subscribe();
	}

	getImageClass() {
		return {
			image: true,
		};
	}

	ngOnInit() { }

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	activate() {
		this.senseService.activate();
	}
}
