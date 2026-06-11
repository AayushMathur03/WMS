import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../shared/services/auth.service';
import { environment } from '../../environments/environment';

interface AttendanceRecord {
  attendanceId: number;
  empId: number;
  employeeName: string;
  checkIn: string;
  checkOut: string;
  totalHours: number;
  workMode: string;
  attendanceDate: string;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.scss'
})
export class AttendanceComponent implements OnInit {
  checkInForm: FormGroup;
  monthlyRecords: AttendanceRecord[] = [];
  loadingMonthly = false;
  checkingIn = false;
  checkingOut = false;

  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  displayedColumns = ['date', 'checkIn', 'checkOut', 'totalHours', 'workMode'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.checkInForm = this.fb.group({
      empId: [this.authService.getEmployeeId(), Validators.required],
      workMode: ['WFO', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadMonthly();
  }

  checkIn(): void {
    if (this.checkInForm.invalid) return;
    this.checkingIn = true;
    this.http.post(`${environment.apiUrl}/attendance/checkin`, this.checkInForm.value).subscribe({
      next: () => {
        this.checkingIn = false;
        this.showSnack('Checked in successfully');
        this.loadMonthly();
      },
      error: (err) => {
        this.checkingIn = false;
        this.showSnack(err.error?.message ?? 'Check-in failed', true);
      }
    });
  }

  checkOut(): void {
    const empId = this.authService.getEmployeeId();
    this.checkingOut = true;
    this.http.put(`${environment.apiUrl}/attendance/checkout/${empId}`, {}).subscribe({
      next: () => {
        this.checkingOut = false;
        this.showSnack('Checked out successfully');
        this.loadMonthly();
      },
      error: (err) => {
        this.checkingOut = false;
        this.showSnack(err.error?.message ?? 'Check-out failed', true);
      }
    });
  }

  loadMonthly(): void {
    const empId = this.authService.getEmployeeId();
    this.loadingMonthly = true;
    this.http.get<AttendanceRecord[]>(
      `${environment.apiUrl}/attendance/monthly/${empId}?month=${this.selectedMonth}&year=${this.selectedYear}`
    ).subscribe({
      next: (data) => { this.monthlyRecords = data; this.loadingMonthly = false; },
      error: () => { this.loadingMonthly = false; }
    });
  }

  private showSnack(msg: string, error = false): void {
    this.snackBar.open(msg, 'Close', {
      duration: 3000,
      panelClass: error ? ['snack-error'] : ['snack-success']
    });
  }
}
