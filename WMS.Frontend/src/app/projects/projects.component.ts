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
import { ProjectFormDialogComponent } from './project-form-dialog/project-form-dialog.component';
import { AssignEmployeeDialogComponent } from './assign-employee-dialog/assign-employee-dialog.component';

export interface Project {
  projectId: number;
  projectName: string;
  clientId: number;
  clientName: string;
  startDate: string;
  endDate: string;
  status: string;
}

@Component({
  selector: 'app-projects',
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
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  loading = true;
  displayedColumns = ['name', 'client', 'start', 'end', 'status', 'actions'];

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.http.get<Project[]>(`${environment.apiUrl}/project`).subscribe({
      next: (data) => { this.projects = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openAdd(): void {
    const ref = this.dialog.open(ProjectFormDialogComponent, { width: '500px', data: null });
    ref.afterClosed().subscribe(r => { if (r) { this.load(); this.showSnack('Project added'); } });
  }

  openEdit(project: Project): void {
    const ref = this.dialog.open(ProjectFormDialogComponent, { width: '500px', data: project });
    ref.afterClosed().subscribe(r => { if (r) { this.load(); this.showSnack('Project updated'); } });
  }

  openAssign(project: Project): void {
    this.dialog.open(AssignEmployeeDialogComponent, { width: '450px', data: project });
  }

  delete(project: Project): void {
    if (!confirm(`Delete "${project.projectName}"?`)) return;
    this.http.delete(`${environment.apiUrl}/project/${project.projectId}`).subscribe({
      next: () => { this.load(); this.showSnack('Project deleted'); },
      error: () => this.showSnack('Delete failed', true)
    });
  }

  private showSnack(msg: string, error = false): void {
    this.snackBar.open(msg, 'Close', { duration: 3000, panelClass: error ? ['snack-error'] : ['snack-success'] });
  }
}
