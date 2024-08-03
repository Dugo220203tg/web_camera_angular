import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { VideoPlayerComponent } from './video-player/video-player.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, VideoPlayerComponent],
  template: '<app-video-player></app-video-player>',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'camera-view';
}