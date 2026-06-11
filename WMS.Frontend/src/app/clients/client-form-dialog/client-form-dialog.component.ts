import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { environment } from '../../../environments/environment';
import { Client } from '../clients.component';

@Component({
  selector: 'app-client-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './client-form-dialog.component.html'
})
export class ClientFormDialogComponent {
  form: FormGroup;
  isEdit: boolean;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dialogRef: MatDialogRef<ClientFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Client | null
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      clientName: [data?.clientName ?? '', Validators.required],
      clientAddress: [data?.clientAddress ?? ''],
      clientPhoneNumber: [data?.clientPhoneNumber ?? '', Validators.required],
      clientLocation: [data?.clientLocation ?? ''],
      status: [data?.status ?? true]
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const req = this.isEdit
      ? this.http.put(`${environment.apiUrl}/client/${this.data!.clientId}`, this.form.value)
      : this.http.post(`${environment.apiUrl}/client`, this.form.value);
    req.subscribe({
      next: () => { this.saving = false; this.dialogRef.close(true); },
      error: () => { this.saving = false; }
    });
  }

  cancel(): void { this.dialogRef.close(false); }
}
