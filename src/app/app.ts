import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('fronted-test');
  protected readonly hideNavbar = signal(false);

  private hiddenRoutes = ['/auth'];

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const isHidden = this.hiddenRoutes.some(route =>
          event.urlAfterRedirects.startsWith(route)
        );

        this.hideNavbar.set(isHidden);

        // Agrega o quita la clase en el body
        if (isHidden) {
          document.body.classList.add('no-scrollbar');
        } else {
          document.body.classList.remove('no-scrollbar');
        }
      });
  }
}