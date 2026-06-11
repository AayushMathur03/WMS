import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../shared/services/auth.service';
import { environment } from '../../../environments/environment';
import { Project } from '../projects.component';

interface Employee { employeeId: number; fullName: string; }

@Component({
  selector: 'app-assign-employee-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatSnackBarModule],
  templateUrl: './assign-employee-dialog.component.html'
})
export class AssignEmployeeDialogComponent implements OnInit {
  form: FormGroup;
  employees: Employee[] = [];
  saving = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dialogRef: MatDialogRef<AssignEmployeeDialogComponent>,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public project: Project
  ) {
    this.form = this.fb.group({
      empId: ['', Validators.required],
      projectId: [project.projectId],
      assignedOn: [new Date(), Validators.required],
      createdBy: [this.authService.getUsername()]
    });
  }

  ngOnInit(): void {
    this.http.get<Employee[]>(`${environment.apiUrl}/employee`).subscribe(e => this.employees = e);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.http.post(`${environment.apiUrl}/project/assign`, this.form.value).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Employee assigned successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => { this.saving = false; }
    });
  }

  cancel(): void { this.dialogRef.close(false); }
}
