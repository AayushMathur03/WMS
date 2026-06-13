import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../shared/services/auth.service';
import { environment } from '../../environments/environment';

// Backend DTO — matches WMS.Application.DTOs.Announcement.AnnouncementDto exactly
export interface AnnouncementDto {
  announcementId: number;
  title: string;
  message: string;       // Backend field is 'message', NOT 'content'
  audience: string;      // NEW: target audience stored in DB ("All", "Employee", "Manager", role name)
  createdBy: number;     // Backend returns employee ID integer
  createdOn: string;
  isActive: boolean;
}

// Backend DTO — matches WMS.Domain.Entities.Role
export interface RoleDto {
  roleId: number;
  roleName: string;
  description?: string;
}

// Audience option for UI display only (backend has no audience field)
export interface AudienceOption {
  label: string;
  value: string;
  icon: string;
}

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatDividerModule,
    MatButtonToggleModule,
  ],
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.scss',
})
export class AnnouncementsComponent implements OnInit, OnDestroy {
  allAnnouncements: AnnouncementDto[] = [];
  filteredAnnouncements: AnnouncementDto[] = [];
  pagedAnnouncements: AnnouncementDto[] = [];
  roles: RoleDto[] = [];

  loading = true;
  saving = false;
  rolesLoading = false;
  error: string | null = null;

  pageSize = 6;
  pageIndex = 0;

  showForm = false;
  editingId: number | null = null;
  form!: FormGroup;

  // Filter: 'all' or 'active' — Admins/Managers can filter; Employees see only active
  viewFilter: 'all' | 'active' = 'active';

  // Audience options for the creation form — values match what is stored in the DB
  audienceOptions: AudienceOption[] = [
    { label: 'All Users',      value: 'All',      icon: 'groups'          },
    { label: 'All Employees',  value: 'Employee', icon: 'badge'           },
    { label: 'All Managers',   value: 'Manager',  icon: 'manage_accounts' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private snack: MatSnackBar,
    public authService: AuthService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title:    ['', [Validators.required, Validators.maxLength(100)]],
      message:  ['', [Validators.required, Validators.maxLength(2000)]],
      audience: ['All'],   // Persisted to DB — matches backend Audience field
    });

    // Employees always see only active announcements
    if (!this.authService.isManagerOrAdmin()) {
      this.viewFilter = 'active';
    }

    this.loadAnnouncements();

    // Load roles for display purposes (audience chips)
    if (this.authService.isAdmin()) {
      this.loadRoles();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Data Loading ────────────────────────────────────────────────────────────

  loadAnnouncements(): void {
    this.loading = true;
    this.error = null;

    // Admins/Managers fetch all; Employees fetch only active
    const endpoint = this.authService.isManagerOrAdmin()
      ? `${environment.apiUrl}/announcement`
      : `${environment.apiUrl}/announcement/active`;

    this.http.get<AnnouncementDto[]>(endpoint)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.zone.run(() => {
            this.allAnnouncements = data.sort((a, b) =>
              new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
            );
            this.applyFilter();
            this.loading = false;
            this.cdr.markForCheck();
          });
        },
        error: (err) => {
          this.zone.run(() => {
            this.loading = false;
            this.error = 'Failed to load announcements. Please try again.';
            this.cdr.markForCheck();
          });
        },
      });
  }

  loadRoles(): void {
    this.rolesLoading = true;
    this.http.get<RoleDto[]>(`${environment.apiUrl}/role`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.zone.run(() => {
            this.roles = data;
            this.rolesLoading = false;
            this.cdr.markForCheck();
          });
        },
        error: () => {
          this.zone.run(() => {
            this.rolesLoading = false;
            this.cdr.markForCheck();
          });
        },
      });
  }

  // ─── Filtering & Paging ──────────────────────────────────────────────────────

  applyFilter(): void {
    const isEmployee = !this.authService.isManagerOrAdmin();
    if (isEmployee || this.viewFilter === 'active') {
      this.filteredAnnouncements = this.allAnnouncements.filter(a => a.isActive);
    } else {
      this.filteredAnnouncements = [...this.allAnnouncements];
    }
    this.pageIndex = 0;
    this.updatePagedList();
  }

  onFilterChange(filter: 'all' | 'active'): void {
    this.viewFilter = filter;
    this.applyFilter();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedList();
  }

  updatePagedList(): void {
    const start = this.pageIndex * this.pageSize;
    this.pagedAnnouncements = this.filteredAnnouncements.slice(start, start + this.pageSize);
  }

  // ─── Form Operations ─────────────────────────────────────────────────────────

  openCreate(): void {
    this.editingId = null;
    this.form.reset({ title: '', message: '', audience: 'All' });
    this.showForm = true;
    // Scroll to top so form is visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openEdit(a: AnnouncementDto): void {
    this.editingId = a.announcementId;
    // Restore the saved audience value so the admin sees what was previously selected
    this.form.patchValue({ title: a.title, message: a.message, audience: a.audience || 'all' });
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelForm(): void {
    this.showForm = false;
    this.form.reset();
    this.editingId = null;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;

    // Capture before nulling for snack message
    const isEdit = !!this.editingId;

    // Build payload — backend CreateAnnouncementDto: { title, message, audience, createdBy }
    const payload = {
      title:     this.form.value.title,
      message:   this.form.value.message,
      audience:  this.form.value.audience || 'All',
      createdBy: this.authService.getEmployeeId(),
    };

    const obs = isEdit
      ? this.http.put(`${environment.apiUrl}/announcement/${this.editingId}`, payload)
      : this.http.post(`${environment.apiUrl}/announcement`, payload);

    obs.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.zone.run(() => {
          this.saving = false;
          this.showForm = false;
          this.editingId = null;
          this.form.reset();
          this.snack.open(
            isEdit ? 'Announcement updated successfully' : 'Announcement posted successfully',
            'Close',
            { duration: 4000, panelClass: 'snack-success' }
          );
          this.loadAnnouncements();
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.saving = false;
          const msg = err?.status === 403
            ? 'You do not have permission to perform this action'
            : 'Failed to save announcement. Please try again.';
          this.snack.open(msg, 'Close', { duration: 5000, panelClass: 'snack-error' });
          this.cdr.markForCheck();
        });
      },
    });
  }

  // ─── Deactivate ──────────────────────────────────────────────────────────────

  deactivate(id: number, title: string): void {
    if (!confirm(`Deactivate "${title}"?\n\nThe announcement will remain in history but stop appearing to employees.`)) {
      return;
    }

    // FIX: Correct URL is PUT /api/announcement/{id}/deactivate (not /deactivate/{id})
    this.http.put(`${environment.apiUrl}/announcement/${id}/deactivate`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.zone.run(() => {
            this.snack.open('Announcement deactivated successfully', 'Close', {
              duration: 4000,
              panelClass: 'snack-success',
            });
            this.loadAnnouncements();
            this.cdr.markForCheck();
          });
        },
        error: (err) => {
          this.zone.run(() => {
            const msg = err?.status === 403
              ? 'You do not have permission to deactivate announcements'
              : 'Failed to deactivate announcement';
            this.snack.open(msg, 'Close', { duration: 5000, panelClass: 'snack-error' });
            this.cdr.markForCheck();
          });
        },
      });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  getCreatorLabel(createdBy: number): string {
    return `Employee #${createdBy}`;
  }

  getAudienceIcon(audience: string): string {
    switch ((audience || 'All').toLowerCase()) {
      case 'employee': return 'badge';
      case 'manager':  return 'manage_accounts';
      default:         return 'groups';
    }
  }

  getAudienceLabel(audience: string): string {
    switch ((audience || 'All').toLowerCase()) {
      case 'all':      return 'All Users';
      case 'employee': return 'All Employees';
      case 'manager':  return 'All Managers';
      default:         return audience || 'All Users';
    }
  }

  getActiveCount(): number {
    return this.allAnnouncements.filter(a => a.isActive).length;
  }

  getInactiveCount(): number {
    return this.allAnnouncements.filter(a => !a.isActive).length;
  }

  trackByAnnouncement(_: number, a: AnnouncementDto): number {
    return a.announcementId;
  }
}
