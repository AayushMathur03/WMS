import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'employees', loadComponent: () => import('./employees/employees.component').then(m => m.EmployeesComponent), canActivate: [authGuard] },
  { path: 'attendance', loadComponent: () => import('./attendance/attendance.component').then(m => m.AttendanceComponent), canActivate: [authGuard] },
  { path: 'leaves', loadComponent: () => import('./leaves/leaves.component').then(m => m.LeavesComponent), canActivate: [authGuard] },
  { path: 'departments', loadComponent: () => import('./departments/departments.component').then(m => m.DepartmentsComponent), canActivate: [authGuard] },
  { path: 'projects', loadComponent: () => import('./projects/projects.component').then(m => m.ProjectsComponent), canActivate: [authGuard] },
  { path: 'clients', loadComponent: () => import('./clients/clients.component').then(m => m.ClientsComponent), canActivate: [authGuard] },
  { path: 'announcements', loadComponent: () => import('./announcements/announcements.component').then(m => m.AnnouncementsComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: 'dashboard' }
];
