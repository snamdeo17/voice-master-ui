import { Component, OnInit } from "@angular/core";
import { merge, Observable, Subject, Subscription, timer } from "rxjs";
import { map, tap, debounceTime, takeUntil, switchMap } from "rxjs/operators";
import {
  ListeningStarted,
  SpeakingStarted,
  RecognizedTextAction,
} from "../../../classes/models";
import { SenseService } from "../../../services/sense.service";
import { BotInteractionService } from "../../../services/bot-interaction.service";
import { CustomerService } from "../../../services/customer.service";
import { RecordRTCService } from "../../../services/record.service";
import { RegisterComponent } from '../register/register.component';


interface HistoryTransaction {
  billname: Number;

  paidon: String;

  amount: String;

  type: String;
}
interface PendingBills {
  pendingBillName: String;
  billAmount: String;
  billDueDate: String;
}

@Component({
  selector: "app-bot",
  templateUrl: "./bot.component.html",
  styleUrls: ["./bot.component.css"],
})
export class BotComponent implements OnInit {
  destroy$ = new Subject();
  isRegisterOpen: boolean = false;
  isRecordingOn: boolean = false;
  register$: Subscription;
  recognized$ = this.senseService.getType(RecognizedTextAction);
  state$: Observable<string>;
  historyTransactions: HistoryTransaction[];
  isShown: boolean = false; // hidden by default
  message$: Observable<string>;
  outputMsg$: string;
  isVoiceAuthenticated$: boolean = false;
  userId$: string;
  accountBalance$: string;
  isAccntBalance: boolean = false;
  subscription: Subscription;
  defaultAlertInput: string = "show my bills";
  blobUrl = this.recordRTCService?.blobUrl;
  isBillPending: boolean = false;
  pendingBills: PendingBills[];
  micAccess$ = this.senseService.hasMicrofonAccess$;
  counterRetry: number = 2;

  constructor(
    private senseService: SenseService,
    private botInteraction: BotInteractionService,
    public recordRTCService: RecordRTCService,
    private customerService: CustomerService,
    public registerComponent: RegisterComponent,
  ) {

    this.register$ = this.customerService.isRegisterOpen$.subscribe(
      (isRegisterOpen: boolean) => {
        this.isRegisterOpen = isRegisterOpen;

      }
    );
    this.message$ = this.recognized$.pipe(tap(console.log));

    const speaking$ = this.senseService
      .getType(SpeakingStarted)
      .pipe(map(() => "Speaking..."));

    const listening$ = this.senseService
      .getType(ListeningStarted)
      .pipe(map(() => "Listening..."));

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
          if (msg.includes("master") || msg === "yes") {
            var result = msg.replace("master", "").replace("-", " ");
            console.log(result);
            msg = result.trim();
            //msg should contain master except
            // don't send a message to server if recording is on for user voice authentication
          if(!this.isRecordingOn){
            this.botInteraction
              .sendMessge(msg, this.userId$, this.isVoiceAuthenticated$)
              .subscribe((data: any) => {
                // read user id from header

                if (data["userId"] == undefined) {
                  this.userId$ = this.userId$;
                  this.isAccntBalance = false;
                } else if (data["userId"] == "") {
                  //user logged out after Bye Bye
                  this.userId$ = null;
                  this.isAccntBalance = false;
                } else if (data["userId"] != undefined) {
                  this.userId$ = data["userId"];
                  this.isAccntBalance = true;
                }
                const message = data["resp"];
                const pendingBillPresent = data["pendingBill"];

                this.isBillPending = false;
                this.pendingBills = message;

                this.isShown = false; // hidden by default
                this.historyTransactions = message;
                this.accountBalance$ = data["accountBalance"];
                if (
                  message[0].pendingBillName == null &&
                  message[0].billname == null
                ) {
                  //console.log('both null');
                  this.outputMsg$ = message;
                } else if (pendingBillPresent != null) {
                  //console.log("inside else");
                  this.isBillPending = true;
                  this.outputMsg$ = "Please find list of pending bills below";
                } else if (message[0].billname != null) {
                  this.isShown = true;
                  this.outputMsg$ =
                    "Please find your transaction history below";
                }

                if (message[0].billname == null && pendingBillPresent == null) {
                  //console.log('line 127');

                  this.senseService.speak(message);
                  if (message.includes("Thank you")) {
                    this.compareVoice();
                  }
                } else if (message[0].pendingBillName != null) {
                  //console.log('line 130');
                  this.senseService.speak(pendingBillPresent);
                } else {
                  //console.log("else:"+this.outputMsg$);
                  this.senseService.speak(this.outputMsg$);
                }
              });
            }
          } else {
            console.log("command not started from master");
          }
        }, takeUntil(this.destroy$))
      )
      .subscribe();
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  getImageClass() {
    return {
      image: true,
    };
  }

  public async compareVoice() {
    let alreadyCalled = false;
this.isRecordingOn = true;
    await this.delay(5500);
    this.registerComponent.startRecordingForAuth(this.userId$);
    console.log('before delay');
    await this.delay(10000);
    console.log('after delay');
    this.registerComponent.stopRecordingForAuth(this.userId$);
  this.isRecordingOn = false;
    //await this.delay(5500);
    //this.outputMsg$ = this.recordRTCService.voiceAuthResponse;
    this.recordRTCService.userVoiceObs.subscribe((voiceAuthRes) => {
      this.outputMsg$ = voiceAuthRes;

      if (!this.isVoiceAuthenticated$ && this.recordRTCService.counterRetry > 0 && !alreadyCalled) {
        // this.senseService.speak(voiceAuthRes);
        alreadyCalled = true;
        this.compareVoice();
      }
    })
    this.recordRTCService.isVoiceAuthenticatedObs.subscribe((isVoiceAuthenticated) => {
      this.isVoiceAuthenticated$ = isVoiceAuthenticated;
      console.log('isVoiceAuthenticated$' + this.isVoiceAuthenticated$);
    })
  }

  ngOnInit() {
    this.getAlertForPendingBill();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.register$.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  activate() {
    this.senseService.activate();
  }

  getAlertForPendingBill() {
    this.subscription = timer(2 * 60 * 1000, 10 * 60 * 1000)
      .pipe(
        switchMap(() =>
          this.botInteraction.sendMessge(this.defaultAlertInput, this.userId$, this.isVoiceAuthenticated$)
        )
      )
      .subscribe((data: any) => {
        const message = data["resp"];
        const MessageToSpeakOut = data['pendingBill'];

        if (data["userId"] != undefined) {
          this.userId$ = data["userId"];
          console.log("User is logged in ",this.userId$);
          this.isAccntBalance = true;
          if (message[0].billname == null && !message.includes("no bill")) {
            this.outputMsg$ = "Please see below list of pending bills.";
						this.isBillPending = true;
						this.pendingBills = message;						
						this.senseService.speak(MessageToSpeakOut);
          }
        } else {
          console.log("User is not logged in");
        }
      });
  }
}
