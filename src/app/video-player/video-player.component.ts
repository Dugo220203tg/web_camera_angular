import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient, HttpErrorResponse } from '@angular/common/http';
import videojs from 'video.js';
import 'videojs-contrib-quality-levels';
import '@videojs/http-streaming';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div>
      <video #videoPlayer id="videoPlayer" class="video-js vjs-default-skin" controls></video>
      <div class="controls">
        <button (click)="controlCamera('up')">Up</button>
        <button (click)="controlCamera('down')">Down</button>
        <button (click)="controlCamera('left')">Left</button>
        <button (click)="controlCamera('right')">Right</button>
        <button (click)="zoomCamera('in')">Zoom In</button>
        <button (click)="zoomCamera('out')">Zoom Out</button>
        <button (click)="stopCamera()">Stop</button>
      </div>
      <div *ngIf="statusMessage" [class]="statusMessageClass">{{ statusMessage }}</div>
    </div>
  `,
  styles: [
    `
    .video-js {
      width: 100%;
      height: 100%;
      padding-top: 45.25%; /* 16:9 Aspect Ratio */
    }
    .controls {
      margin-top: 10px;
      display: flex;
      justify-content: center;
      gap: 10px;
    }
    .status-message {
      margin-top: 10px;
      text-align: center;
    }
    .error-message {
      color: red;
    }
    .success-message {
      color: green;
    }
    `
  ]
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  private player: any;
  private apiUrl = 'http://localhost:5115/api/Stream';
  statusMessage: string = '';
  statusMessageClass: string = '';

  @ViewChild('videoPlayer', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.initializePlayer();
  }

  ngOnDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  }

  private initializePlayer() {
    const videoElement = this.videoElement.nativeElement;

    this.player = videojs(videoElement, {
      autoplay: true,
      controls: true,
      html5: {
        hlsjsConfig: {
          // Add any HLS.js configurations if needed
        }
      }
    });

    this.loadStreamUrl();
  }

  private loadStreamUrl() {
    this.http.get<any>(`${this.apiUrl}/camera`).subscribe(
      response => {
        const streamUrl = `${response.streamUrl}`;
        console.log('Stream URL:', streamUrl);

        this.player.src({ src: streamUrl, type: 'application/x-mpegURL' });
      },
      error => {
        console.error('Error fetching stream URL:', error);
      }
    );
  }

  controlCamera(direction: string) {
    this.clearStatusMessage();
    this.http.post(`${this.apiUrl}/control/${direction}`, {}, { responseType: 'text' }).subscribe(
      response => {
        console.log(`Camera moved ${direction}`, response);
        this.setStatusMessage(`Camera moved ${direction}`, 'success');
      },
      (error: HttpErrorResponse) => {
        this.handleError(error, `Error moving camera ${direction}`);
      }
    );
  }

  zoomCamera(operation: string) {
    this.clearStatusMessage();
    this.http.post(`${this.apiUrl}/zoom/${operation}`, {}, { responseType: 'text' }).subscribe(
      response => {
        console.log(`Camera zoomed ${operation}`, response);
        this.setStatusMessage(`Camera zoomed ${operation}`, 'success');
      },
      (error: HttpErrorResponse) => {
        this.handleError(error, `Error zooming camera ${operation}`);
      }
    );
  }

  stopCamera() {
    this.clearStatusMessage();
    this.http.post(`${this.apiUrl}/stop`, {}, { responseType: 'text' }).subscribe(
      response => {
        console.log('Camera stopped', response);
        this.setStatusMessage('Camera stopped', 'success');
      },
      (error: HttpErrorResponse) => {
        this.handleError(error, 'Error stopping camera');
      }
    );
  }

  private handleError(error: HttpErrorResponse, defaultMessage: string) {
    console.error(defaultMessage, error);
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error occurred
      this.setStatusMessage(`An error occurred: ${error.error.message}`, 'error');
    } else if (error.status === 200 && typeof error.error === 'string') {
      // Server might have returned a non-JSON response with status 200
      this.setStatusMessage(error.error || defaultMessage, 'success');
    } else {
      // Backend returned an unsuccessful response code
      this.setStatusMessage(`${defaultMessage}: ${error.status} ${error.statusText}`, 'error');
    }
  }

  private setStatusMessage(message: string, type: 'error' | 'success') {
    this.statusMessage = message;
    this.statusMessageClass = type === 'error' ? 'error-message' : 'success-message';
  }

  private clearStatusMessage() {
    this.statusMessage = '';
    this.statusMessageClass = '';
  }
}