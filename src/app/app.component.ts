import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SystemSettingsService } from './core/services/system-settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {

  constructor(
    private settingsService: SystemSettingsService,
    private titleService: Title,
  ) { }

  ngOnInit() {
    this.settingsService.settings$.subscribe(settings=> {
      this.titleService.setTitle(settings.general.systemName);
    });
  }
}
