import { Component, EventEmitter, Output } from "@angular/core";
import { LandingHeaderComponent } from "../landing-header/landing-header.component";
import { LandingFooterComponent } from "../landing-footer/landing-footer.component";

@Component({
  selector: "app-landing-page",
  standalone: true,
  imports: [LandingHeaderComponent, LandingFooterComponent],
  templateUrl: "./landing-page.component.html",
  styleUrl: "./landing-page.component.css",
})
export class LandingPageComponent {
  @Output() login = new EventEmitter<void>();
  @Output() signup = new EventEmitter<void>();
  @Output() guest = new EventEmitter<void>();
}
