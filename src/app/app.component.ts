import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoPlayerComponent } from './video-player/video-player.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, VideoPlayerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'camera-view';
}
