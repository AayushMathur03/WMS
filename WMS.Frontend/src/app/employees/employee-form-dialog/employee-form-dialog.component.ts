import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { environment } from '../../../environments/environment';
import { Employee } from '../employees.component';

interface Department { departmentId: number; departmentName: string; }
interface Role { roleId: number; roleName: string; }

@Component({
  selector: 'app-employee-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './employee-form-dialog.component.html'
})
export class EmployeeFormDialogComponent implements OnInit {
  form: FormGroup;
  departments: Department[] = [];
  roles: Role[] = [];
  isEdit: boolean;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dialogRef: MatDialogRef<EmployeeFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'add' | 'edit'; employee?: Employee }
  ) {
    this.isEdit = data.mode === 'edit';
    this.form = this.fb.group({
      firstName: [data.employee?.firstName ?? '', Validators.required],
      lastName: [data.employee?.lastName ?? '', Validators.required],
      email: [data.employee?.email ?? '', [Validators.required, Validators.email]],
      phoneNumber: [data.employee?.phoneNumber ?? '', Validators.required],
      gender: [data.employee?.gender ?? ''],
      dob: [data.employee?.dob ?? '', Validators.required],
      doj: [data.employee?.doj ?? '', Validators.required],
      departmentId: ['', Validators.required],
      roleId: ['', Validators.required],
      ...(this.isEdit ? { status: [data.employee?.status ?? 'Active'] } : {
        username: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]]
      })
    });
  }

  ngOnInit(): void {
    this.http.get<Department[]>(`${environment.apiUrl}/department`).subscribe(d => this.departments = d);
    this.http.get<Role[]>(`${environment.apiUrl}/role`).subscribe(r => this.roles = r);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const emp = this.data.employee;

    const req = this.isEdit
      ? this.http.put(`${environment.apiUrl}/employee/${emp!.employeeId}`, this.form.value)
      : this.http.post(`${environment.apiUrl}/employee`, this.form.value);

    req.subscribe({
      next: () => { this.saving = false; this.dialogRef.close(true); },
      error: () => { this.saving = false; }
    });
  }

  cancel(): void { this.dialogRef.close(false); }
}
