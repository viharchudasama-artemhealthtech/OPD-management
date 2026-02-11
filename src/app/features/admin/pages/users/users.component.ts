import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AppUser } from '../../../../core/models/user.model';
import { UserRole } from '../../../../core/models/enums/user-role.enum';
import { UserStatus } from '../../../../core/models/enums/user-status.enum';
import { UserService } from '../../../../core/services/user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-super-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {
  public displayDialog = false;
  public selectedUser: AppUser | null = null;
  public userForm: FormGroup;
  public searchValue = '';
  public readonly users$: Observable<AppUser[]>;

  public readonly roles = [
    { label: 'Admin', value: UserRole.ADMIN },
    { label: 'Doctor', value: UserRole.DOCTOR },
    { label: 'Receptionist', value: UserRole.RECEPTIONIST },
    { label: 'Patient', value: UserRole.PATIENT },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly userService: UserService,
  ) {
    this.users$ = this.userService.users$;

    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      status: [UserStatus.ACTIVE, Validators.required],
      password: ['password123', Validators.required],
    });
  }

  public openDialog(): void {
    this.selectedUser = null;
    this.userForm.reset({ status: UserStatus.ACTIVE, password: 'password123' });
    this.displayDialog = true;
  }

  public editUser(user: AppUser): void {
    this.selectedUser = user;
    this.userForm.patchValue(user);
    this.displayDialog = true;
  }

  public saveUser(): void {
    if (this.userForm.invalid) return;

    const userData = this.userForm.value;
    const request$ = this.selectedUser
      ? this.userService.updateUser(this.selectedUser.id, userData)
      : this.userService.addUser(userData);

    request$.subscribe(() => {
      this.messageService.add({
        severity: 'success',
        summary: this.selectedUser ? 'Updated' : 'Created',
        detail: `User ${userData.fullName} saved successfully`,
      });
      this.closeDialog();
    });
  }

  public deleteUser(user: AppUser): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete user ${user.fullName}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.deleteUser(user.id).subscribe(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: `User ${user.fullName} deleted successfully`,
          });
        });
      },
    });
  }

  public closeDialog(): void {
    this.displayDialog = false;
    this.selectedUser = null;
    this.userForm.reset();
  }

  public getRoleSeverity(role: UserRole): 'danger' | 'info' | 'success' | 'secondary' {
    switch (role) {
      case UserRole.ADMIN:
        return 'danger';
      case UserRole.DOCTOR:
        return 'info';
      case UserRole.RECEPTIONIST:
        return 'success';
      default:
        return 'secondary';
    }
  }

  public getStatusSeverity(status: UserStatus): 'success' | 'warning' {
    return status === UserStatus.ACTIVE ? 'success' : 'warning';
  }
}
