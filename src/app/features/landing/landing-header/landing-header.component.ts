import { Component, EventEmitter, Output, signal } from "@angular/core";

@Component({
  selector: "app-landing-header",
  standalone: true,
  templateUrl: "./landing-header.component.html",
  styleUrl: "./landing-header.component.css",
})
export class LandingHeaderComponent {
  @Output() login = new EventEmitter<void>();
  @Output() signup = new EventEmitter<void>();
  readonly menuOpen = signal(false);
}
