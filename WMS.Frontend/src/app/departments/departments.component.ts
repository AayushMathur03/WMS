import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AuthService } from '../shared/services/auth.service';
import { environment } from '../../environments/environment';
import { DepartmentFormDialogComponent } from './department-form-dialog/department-form-dialog.component';

export interface Department {
  departmentId: number;
  departmentName: string;
  description: string;
}

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './departments.component.html',
  styleUrl: './departments.component.scss'
})
export class DepartmentsComponent implements OnInit {
  departments: Department[] = [];
  loading = true;
  displayedColumns = ['name', 'description', 'actions'];

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.http.get<Department[]>(`${environment.apiUrl}/department`).subscribe({
      next: (data) => { this.departments = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openAdd(): void {
    const ref = this.dialog.open(DepartmentFormDialogComponent, { width: '450px', data: null });
    ref.afterClosed().subscribe(result => {
      if (result) { this.load(); this.showSnack('Department added'); }
    });
  }

  openEdit(dept: Department): void {
    const ref = this.dialog.open(DepartmentFormDialogComponent, { width: '450px', data: dept });
    ref.afterClosed().subscribe(result => {
      if (result) { this.load(); this.showSnack('Department updated'); }
    });
  }

  delete(dept: Department): void {
    if (!confirm(`Delete "${dept.departmentName}"?`)) return;
    this.http.delete(`${environment.apiUrl}/department/${dept.departmentId}`).subscribe({
      next: () => { this.load(); this.showSnack('Department deleted'); },
      error: () => this.showSnack('Delete failed', true)
    });
  }

  private showSnack(msg: string, error = false): void {
    this.snackBar.open(msg, 'Close', { duration: 3000, panelClass: error ? ['snack-error'] : ['snack-success'] });
  }
}
