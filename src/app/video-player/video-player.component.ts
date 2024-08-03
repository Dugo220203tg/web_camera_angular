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
      <div *ngIf="errorMessage" class="error-message">{{ errorMessage }}</div>
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
    .error-message {
      color: red;
      margin-top: 10px;
      text-align: center;
    }
    `
  ]
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  private player: any;
  private apiUrl = 'http://localhost:5115/api/Stream';
  errorMessage: string = '';

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
    this.errorMessage = ''; // Reset error message
    this.http.post<any>(`${this.apiUrl}/control/${direction}`, {}).subscribe(
      response => {
        console.log(`Camera moved ${direction}`, response);
        if (response && (response as any).error) {
          this.handleError(new HttpErrorResponse({ error: (response as any).error, status: 200 }), `Error moving camera ${direction}`);
        }
      },
      (error: HttpErrorResponse) => {
        this.handleError(error, `Error moving camera ${direction}`);
      }
    );
  }

  zoomCamera(operation: string) {
    this.errorMessage = ''; // Reset error message
    this.http.post<any>(`${this.apiUrl}/zoom/${operation}`, {}).subscribe(
      response => {
        console.log(`Camera zoomed ${operation}`, response);
        if (response && (response as any).error) {
          this.handleError(new HttpErrorResponse({ error: (response as any).error, status: 200 }), `Error zooming camera ${operation}`);
        }
      },
      (error: HttpErrorResponse) => {
        this.handleError(error, `Error zooming camera ${operation}`);
      }
    );
  }

  stopCamera() {
    this.http.post<any>(`${this.apiUrl}/stop`, {}).subscribe(
      response => {
        console.log('Camera stopped', response);
        if (response && (response as any).error) {
          this.handleError(new HttpErrorResponse({ error: (response as any).error, status: 200 }), 'Error stopping camera');
        }
      },
      (error: HttpErrorResponse) => {
        this.handleError(error, 'Error stopping camera');
      }
    );
  }

  private handleError(error: HttpErrorResponse, defaultMessage: string) {
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      this.errorMessage = error.error.message;
    } else {
      // Backend returned an unsuccessful response code
      try {
        this.errorMessage = `Server returned code ${error.status}, message: ${JSON.stringify(error.error)}`;
      } catch (e) {
        this.errorMessage = `Server returned code ${error.status}, message: ${error.error}`;
      }
    }
    console.error(defaultMessage, error);
  }
}
