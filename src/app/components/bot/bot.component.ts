import { Component, OnInit } from '@angular/core';
import { merge, Observable, Subject, Subscription, timer  } from 'rxjs';
import { map, tap, debounceTime, takeUntil, switchMap } from 'rxjs/operators';
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
	type: String;
}

interface PendingBills {

	pendingBillName: String;
	billAmount: String ;
	billDueDate: String;
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
	accountBalance$:string;
	isAccntBalance: boolean = false;
	subscription: Subscription;
	defaultAlertInput: string = 'show my bills';

	isBillPending: boolean = false;
	pendingBills: PendingBills[];
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

							if(data['userId'] == undefined ) {
								this.userId$ = this.userId$;
								this.isAccntBalance = false;																
							}
							else if (data['userId'] == '') { //user logged out after Bye Bye
								this.userId$ = null; 
								this.isAccntBalance = false;									
							}
							else if (data['userId'] != undefined) {
								this.userId$ = data['userId'];
								this.isAccntBalance = true;
							}
							const message = data['resp'];
							
							const pendingBillPresent = data['pendingBill'];
							
							this.isBillPending = false;
							this.pendingBills = message;
							
							this.isShown = false ; // hidden by default
							this.historyTransactions = message;
							this.accountBalance$ = data['accountBalance'];

							if(message[0].pendingBillName == null && message[0].billname == null){								
								this.outputMsg$ = message;
							}else if(pendingBillPresent != null){								
								this.isBillPending = true;
								this.outputMsg$ = "Please find list of pending bills below";
							}
							else if(message[0].billname != null){
								this.isShown = true;
								this.outputMsg$ = "Please find your transaction history below";
							}						
							
							if(message[0].billname == null && pendingBillPresent == null){								
								this.senseService.speak(message);
							}
							else if(message[0].pendingBillName != null){								
								this.senseService.speak(pendingBillPresent);
							}
							else {								
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

	ngOnInit() {
		this.getAlertForPendingBill();
	 }

	ngOnDestroy() {
		this.subscription.unsubscribe();
		this.destroy$.next();
		this.destroy$.complete();		
	}

	activate() {
		this.senseService.activate();
	}
	
	getAlertForPendingBill() {
			this.subscription = timer(60*1000, 10*60*1000).pipe(
				switchMap(() => this.botInteraction.sendMessge(this.defaultAlertInput, this.userId$))
			  ).subscribe((data: any) => {				
				const message = data['resp'];
				const MessageToSpeakOut = data['pendingBill'];
				
				if (data['userId'] != undefined) {
					this.userId$ = data['userId'];
					this.isAccntBalance = true;
					if(message[0].billname == null && !message.includes("no bill")){						
						this.outputMsg$ = "Please see below list of pending bills.";
						this.isBillPending = true;
						this.pendingBills = message;						
						this.senseService.speak(MessageToSpeakOut);
					}
				} else {
					  console.log('User is not logged in');
				}
			  });
	}
}
