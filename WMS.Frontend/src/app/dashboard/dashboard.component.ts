import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Chart, registerables } from 'chart.js';
import { environment } from '../../environments/environment';

Chart.register(...registerables);

interface DashboardSummary {
  totalEmployees: number;
  activeEmployees: number;
  todayCheckIns: number;
  pendingLeaves: number;
  activeProjects: number;
  totalDepartments: number;
  totalClients: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('attendanceChart') attendanceChartRef!: ElementRef;

  summary: DashboardSummary | null = null;
  loading = true;
  chart: Chart | null = null;

  kpiCards: { label: string; key: keyof DashboardSummary; icon: string; color: string }[] = [
    { label: 'Total Employees', key: 'totalEmployees', icon: 'people', color: '#1976d2' },
    { label: 'Active Employees', key: 'activeEmployees', icon: 'person_check', color: '#388e3c' },
    { label: "Today's Check-ins", key: 'todayCheckIns', icon: 'login', color: '#f57c00' },
    { label: 'Pending Leaves', key: 'pendingLeaves', icon: 'event_busy', color: '#d32f2f' },
    { label: 'Active Projects', key: 'activeProjects', icon: 'work', color: '#7b1fa2' },
    { label: 'Departments', key: 'totalDepartments', icon: 'business', color: '#0288d1' },
    { label: 'Clients', key: 'totalClients', icon: 'handshake', color: '#00796b' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<DashboardSummary>(`${environment.apiUrl}/dashboard/summary`).subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
        setTimeout(() => this.renderChart(), 100);
      },
      error: () => { this.loading = false; }
    });
  }

  ngAfterViewInit(): void {}

  renderChart(): void {
    if (!this.attendanceChartRef || !this.summary) return;
    if (this.chart) this.chart.destroy();

    const ctx = this.attendanceChartRef.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Checked In Today', 'Not Checked In', 'Pending Leaves'],
        datasets: [{
          data: [
            this.summary.todayCheckIns,
            this.summary.activeEmployees - this.summary.todayCheckIns,
            this.summary.pendingLeaves
          ],
          backgroundColor: ['#388e3c', '#e0e0e0', '#d32f2f'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: "Today's Workforce Overview" }
        }
      }
    });
  }
}
