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
interface HistoryTransaction {

    billname: Number;

    paidon: String;

    amount: String;
}
@Component({
	selector: 'app-bot',
	templateUrl: './bot.component.html',
	styleUrls: ['./bot.component.css'],
})
export class BotComponent implements OnInit {
	destroy$ = new Subject();

	recognized$ = this.senseService.getType(RecognizedTextAction);
	state$: Observable<string>;
	historyTransactions: HistoryTransaction[];
	isShown: boolean = false ; // hidden by default
	message$: Observable<string>;
	outputMsg$: string;
	userId$: string;

	micAccess$ = this.senseService.hasMicrofonAccess$;

	constructor(private senseService: SenseService, private botInteraction: BotInteractionService) {
		this.message$ = this.recognized$.pipe(tap(console.log));

		const speaking$ = this.senseService
			.getType(SpeakingStarted)
			.pipe(map(() => 'Speaking...'));

		const listening$ = this.senseService
			.getType(ListeningStarted)
			.pipe(map(() => 'Listening...'));

		this.state$ = merge(speaking$, listening$);

		this.recognized$
			.pipe(
				debounceTime(200),
				tap((msg) => {
					// msg = `you said ${msg}`;
					// check on start if Master is present, if present then remove master from that msg
					// else don't do anything

					// yes please proceed also check in or condition with Master condition

					// if input "bye-bye"
					// userid set to null and close the session
					//if()
					msg = msg.toLowerCase();
					if (msg.includes("master")
						|| msg === 'yes') {
						var result = msg.replace("master", '').replace("-", ' ');
						console.log(result);
						msg = result.trim();
						//msg should contain master except
						this.botInteraction.sendMessge(msg, this.userId$).subscribe((data: any) => {
							// read user id from header 
							if (data['userId'] != undefined) {
								this.userId$ = data['userId'];
							}
							const message = data['resp'];
							this.isShown = false ; // hidden by default
							this.historyTransactions = message;
							if(message[0].billname == null){
								this.outputMsg$ = message;
							}
							else{
								this.isShown = true;
								this.outputMsg$ = "Please find your transaction history below";
							}
							if(message[0].billname == null){
								this.senseService.speak(message.replaceAll("<br/>", ""));
							}
							else
							{
								this.senseService.speak(this.outputMsg$);
							}

						})
					} else {
						console.log('command not started from master');
					}
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
