import { Component } from '@angular/core';
import { JobOrderBoard } from './job-order-board';

@Component({
  selector: 'app-jobs-page',
  standalone: true,
  imports: [JobOrderBoard],
  templateUrl: './jobs-page.html',
  styleUrl: './jobs-page.scss',
})
export class JobsPage {}
