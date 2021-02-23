import { Injectable } from "@angular/core";
import * as RecordRTC from "recordrtc";
import { DomSanitizer } from "@angular/platform-browser";

import { Observable, from, of, Subscription } from "rxjs";
import { catchError, map } from "rxjs/operators";

import {
  HttpErrorResponse,
  HttpHeaders,
} from "@angular/common/http";

import { environment } from "../environments/environment";
import { HttpServiceService } from "./http.service";

@Injectable({
  providedIn: "root",
})
export class RecordRTCService {
  blobUrl: any;
  interval;
  recordingTimer: string;
  recordWebRTC: any;
  mediaRecordStream: any;
  subscription: Subscription;
 

  options: any = {
    type: "audio",
    mimeType: '"audio/wav',
    numberOfAudioChannels: 1,
  };

  serviceUrl: string = environment.authUrl;

  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpServiceService
  ) {}

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  toggleRecord() {
    if (this.recordingTimer) {
      this.stopRTC();
    } else {
      this.subscription = from(
        navigator.mediaDevices.getUserMedia({ audio: true })
      ).subscribe(
        stream => {
          this.startRTC(stream);
        },
        catchError((err) => {
          console.error(err);
          console.log("No microphone access");
          return of(false);
        })
      );
    }
  }

  startRTC(stream: any) {
    this.recordWebRTC = new RecordRTC.StereoAudioRecorder(stream, this.options);
    this.mediaRecordStream = stream;
    this.blobUrl = null;
    this.recordWebRTC.record();
    this.startCountdown();
  }

  stopRTC() {
    this.recordWebRTC.stop((blob) => {
      //verify blob
      this.startCountdown(true);
      this.saveFileToServer(blob, 1)
        .pipe(
          map(event => {
              // if(event.type === HttpEventType.Response)
              //   return event;
              console.log(event);
            }),
          catchError((error: HttpErrorResponse) => {
            return of(`Upload failed : ${error}`);
          })
        )
        .subscribe((event: any) => {
          if (typeof event === "object") {
            console.log(event.body);
          }
        });
      this.blobUrl = this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(blob)
      );
    });
  }
  
  saveFileToServer(blob: any, userId: number): Observable<any> {
    let uploadUrl = this.serviceUrl + "user/uploadnewvoice";
    const formData = new FormData();
    formData.append("file", blob, "sample.wav");

    if (userId != undefined) {
      const headers = new HttpHeaders().set("userId", "" + userId);
      return this.http.postData(uploadUrl, formData, { 'headers': headers })
    } else {
      console.log('User is not registered yet');
    }
  }

  /**
   * @param clearTime default value `false`
   * `false` miens recording start if getting `true` then we are stop counting `clearStream`
   * Maximum Recoding time `10`Minutes @see minutes == 1
   */
  startCountdown(clearTime = false) {
    if (clearTime) {
      this.clearStream(this.mediaRecordStream);
      this.recordWebRTC = null;
      this.recordingTimer = null;
      this.mediaRecordStream = null;
      return;
    } else {
      this.recordingTimer = `00:00`;
    }
    clearInterval(this.interval);

    this.interval = setInterval(() => {
      console.log(this.recordingTimer);
      let timer: any = this.recordingTimer;
      timer = timer.split(":");

      let minutes = +timer[0];
      let seconds = +timer[1];

      if (minutes == 1) {
        this.recordWebRTC.stopRecording();
        clearInterval(this.interval);
        return;
      }
      ++seconds;
      if (seconds >= 59) {
        ++minutes;
        seconds = 0;
      }

      if (seconds < 10) {
        this.recordingTimer = `0${minutes}:0${seconds}`;
      } else {
        this.recordingTimer = `0${minutes}:${seconds}`;
      }
    }, 1000);
  }

  /**
   * @param stream clear stream Audio also video
   */
  clearStream(stream: any) {
    try {
      stream.getAudioTracks().forEach((track) => track.stop());
    } catch (error) {
      //stream error
    }
  }

}
