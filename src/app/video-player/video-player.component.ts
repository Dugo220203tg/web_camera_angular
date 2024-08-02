import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import videojs from 'video.js';
import 'videojs-contrib-quality-levels';
import '@videojs/http-streaming';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: '<video #videoPlayer id="videoPlayer" class="video-js vjs-default-skin" controls></video>',
  styles: [
    `
    .video-js {
      width: 100%;
      height: 0;
      padding-top: 56.25%; /* 16:9 Aspect Ratio */
    }
    `
  ]
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  private player: any;

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
    this.http.get<any>('http://localhost:5115/api/Stream/camera').subscribe(
      response => {
        const streamUrl = `http://localhost:5115${response.streamUrl}`;
        console.log('Stream URL:', streamUrl); // Log URL

        // Validate if URL is accessible
        this.http.get(streamUrl, { responseType: 'text' }).subscribe(
          () => {
            // URL is accessible, set the player source
            this.player.src({ src: streamUrl, type: 'application/x-mpegURL' });
          },
          error => {
            console.error('Error accessing stream URL:', error);
          }
        );
      },
      error => {
        console.error('Error fetching stream URL:', error);
      }
    );
  }
}
