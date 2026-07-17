import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar {

  isMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  get username(): string {
    return this.authService.getUser()?.username ?? 'Invitado';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/auth');
  }
}