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
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../shared/services/auth.service';
import { environment } from '../../environments/environment';
import { EmployeeFormDialogComponent } from './employee-form-dialog/employee-form-dialog.component';

export interface Employee {
  employeeId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  dob: string;
  doj: string;
  departmentName: string;
  roleName: string;
  status: string;
}

@Component({
  selector: 'app-employees',
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
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  loading = true;
  searchTerm = '';

  displayedColumns = ['name', 'email', 'phone', 'department', 'role', 'status', 'actions'];

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.http.get<Employee[]>(`${environment.apiUrl}/employee`).subscribe({
      next: (data) => {
        this.employees = data;
        this.filteredEmployees = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    if (!term.trim()) {
      this.filteredEmployees = this.employees;
      return;
    }
    this.http.get<Employee[]>(`${environment.apiUrl}/employee/search?term=${term}`).subscribe({
      next: (data) => { this.filteredEmployees = data; }
    });
  }

  openAddDialog(): void {
    const ref = this.dialog.open(EmployeeFormDialogComponent, {
      width: '600px',
      data: { mode: 'add' }
    });
    ref.afterClosed().subscribe(result => {
      if (result) { this.loadEmployees(); this.showSnack('Employee added successfully'); }
    });
  }

  openEditDialog(employee: Employee): void {
    const ref = this.dialog.open(EmployeeFormDialogComponent, {
      width: '600px',
      data: { mode: 'edit', employee }
    });
    ref.afterClosed().subscribe(result => {
      if (result) { this.loadEmployees(); this.showSnack('Employee updated successfully'); }
    });
  }

  deactivate(employee: Employee): void {
    if (!confirm(`Deactivate ${employee.fullName}?`)) return;
    this.http.delete(`${environment.apiUrl}/employee/${employee.employeeId}`).subscribe({
      next: () => { this.loadEmployees(); this.showSnack('Employee deactivated'); },
      error: () => { this.showSnack('Failed to deactivate employee', true); }
    });
  }

  private showSnack(msg: string, error = false): void {
    this.snackBar.open(msg, 'Close', {
      duration: 3000,
      panelClass: error ? ['snack-error'] : ['snack-success']
    });
  }
}
