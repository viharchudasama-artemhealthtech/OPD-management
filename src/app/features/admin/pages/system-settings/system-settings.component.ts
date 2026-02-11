import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SliderModule } from 'primeng/slider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { SystemSettingsService, SystemSettings } from '../../../../core/services/system-settings.service';

interface SystemSetting {
  key: string;
  value: any;
}

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    InputSwitchModule,
    SliderModule,
    ToastModule,
    InputNumberModule,
    DividerModule,
  ],
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.scss'],
  providers: [MessageService],
})
export class SystemSettingsComponent implements OnInit {
  settingsForm: FormGroup;
  backupForm: FormGroup;
  securityForm: FormGroup;

  timezones = [
    { label: 'UTC', value: 'UTC' },
    { label: 'IST (India)', value: 'Asia/Kolkata' },
    { label: 'EST (US)', value: 'America/New_York' },
    { label: 'PST (US)', value: 'America/Los_Angeles' },
    { label: 'GMT (UK)', value: 'Europe/London' },
  ];

  backupFrequencies = [
    { label: 'Hourly', value: 'hourly' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
  ];

  logLevels = [
    { label: 'Debug', value: 'debug' },
    { label: 'Info', value: 'info' },
    { label: 'Warning', value: 'warning' },
    { label: 'Error', value: 'error' },
  ];

  emailTemplates = [
    { label: 'Appointment Confirmation', value: 'appointment_confirmation' },
    { label: 'Appointment Reminder', value: 'appointment_reminder' },
    { label: 'Patient Registration', value: 'patient_registration' },
    { label: 'Password Reset', value: 'password_reset' },
  ];

  selectedTemplate = 'appointment_confirmation';

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private settingsService: SystemSettingsService,
  ) {
    this.settingsForm = this.createSettingsForm();
    this.backupForm = this.createBackupForm();
    this.securityForm = this.createSecurityForm();
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  createSettingsForm(): FormGroup {
    return this.fb.group({
      systemName: ['', Validators.required],
      systemUrl: ['', Validators.required],
      timezone: ['', Validators.required],
      systemEmail: ['', [Validators.required, Validators.email]],
      adminEmail: ['', [Validators.required, Validators.email]],
      maintenanceMode: [false],
      maintenanceMessage: [''],
    });
  }

  createBackupForm(): FormGroup {
    return this.fb.group({
      autoBackup: [true],
      backupFrequency: ['', Validators.required],
      backupRetention: [30, [Validators.required, Validators.min(1), Validators.max(365)]],
      backupLocation: ['', Validators.required],
      compressBackup: [true],
      encryptBackup: [true],
      backupNotification: [true],
    });
  }

  createSecurityForm(): FormGroup {
    return this.fb.group({
      sessionTimeout: [30, [Validators.required, Validators.min(5), Validators.max(480)]],
      passwordMinLength: [8, [Validators.required, Validators.min(6), Validators.max(20)]],
      passwordExpiry: [90, [Validators.required, Validators.min(0), Validators.max(365)]],
      maxLoginAttempts: [5, [Validators.required, Validators.min(1), Validators.max(20)]],
      lockoutDuration: [15, [Validators.required, Validators.min(5), Validators.max(120)]],
      requireTwoFactor: [false],
      logLevel: ['', Validators.required],
      auditLogging: [true],
      ipWhitelist: [''],
    });
  }

  loadSettings(): void {
    this.settingsService.getSettings().subscribe((settings: SystemSettings) => {
      this.settingsForm.patchValue(settings.general);
      this.backupForm.patchValue(settings.backup);
      this.securityForm.patchValue(settings.security);
    });
  }

  saveGeneralSettings(): void {
    if (this.settingsForm.valid) {
      const currentSettings = this.getCurrentSettings();
      currentSettings.general = this.settingsForm.value;
      this.settingsService.updateSettings(currentSettings);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'General settings updated successfully!',
      });
    }
  }

  saveBackupSettings(): void {
    if (this.backupForm.valid) {
      const currentSettings = this.getCurrentSettings();
      currentSettings.backup = this.backupForm.value;
      this.settingsService.updateSettings(currentSettings);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Backup settings updated successfully!',
      });
    }
  }

  saveSecuritySettings(): void {
    if (this.securityForm.valid) {
      const currentSettings = this.getCurrentSettings();
      currentSettings.security = this.securityForm.value;
      this.settingsService.updateSettings(currentSettings);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Security settings updated successfully!',
      });
    }
  }

  private getCurrentSettings(): SystemSettings {
    let current!: SystemSettings;
    this.settingsService
      .getSettings()
      .subscribe((s: SystemSettings) => (current = s))
      .unsubscribe();
    return JSON.parse(JSON.stringify(current)); // Deep clone
  }

  triggerBackup(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Backup Started',
      detail: 'System backup initiated. This may take a few minutes.',
    });
    // Simulate backup process
    setTimeout(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Backup Completed',
        detail: 'System backup completed successfully!',
      });
    }, 3000);
  }

  testEmailConfiguration(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Email Test',
      detail: 'Sending test email to ' + this.settingsForm.get('adminEmail')?.value,
    });
    // Simulate email sending
    setTimeout(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Email Sent',
        detail: 'Test email sent successfully!',
      });
    }, 2000);
  }

  clearLogs(): void {
    if (confirm('Are you sure you want to clear all system logs? This action cannot be undone.')) {
      localStorage.removeItem('system_logs');
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'All system logs cleared successfully!',
      });
    }
  }

  exportSettings(): void {
    const settings = this.getCurrentSettings();
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'system-settings-backup.json';
    link.click();
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Settings exported successfully!',
    });
  }
}
