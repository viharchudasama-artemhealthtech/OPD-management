import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../../../features/auth/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent implements OnInit {

  public isSidebarCollapsed: boolean = false;
  public userRole: string | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  public ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      if (user) {
        this.userRole = user.role;
        this.cdr.markForCheck();
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
