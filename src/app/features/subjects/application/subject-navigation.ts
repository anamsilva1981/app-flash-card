import { Injectable } from "@angular/core";
import { ManagedSubject } from "../../../shared/models";

export interface SubjectManagerPort {
  subjects: () => ManagedSubject[];
  openNew(): void;
  openSubject(subject: ManagedSubject): void;
  edit(subject: ManagedSubject): void;
  detailTab: { set(value: "topics" | "flashcards"): void };
}

@Injectable()
export class SubjectNavigation {
  private port?: SubjectManagerPort;
  private pending: Array<(port: SubjectManagerPort) => void> = [];

  attach(port: SubjectManagerPort) {
    this.port = port;
    const actions = this.pending.splice(0);
    for (const action of actions) action(port);
  }

  detach() {
    this.port = undefined;
  }

  run(action: (port: SubjectManagerPort) => void) {
    if (this.port) action(this.port);
    else this.pending.push(action);
  }
}
