import { Injector, signal } from "@angular/core";
import { test } from "node:test";
import assert from "node:assert/strict";
import { I18nService } from "../../../core/i18n/i18n.service";
import { StudyStore } from "../../../core/state/study-store";
import { CalendarStore } from "./calendar-store";

function createCalendar() {
  const history = signal([
    {
      date: "2026-10-05",
      learning: ["Signals"],
      reviews: ["Angular"],
    },
  ]);
  const language = signal<"pt-BR" | "en">("pt-BR");
  const injector = Injector.create({
    providers: [
      { provide: StudyStore, useValue: { history } },
      { provide: I18nService, useValue: { language } },
      CalendarStore,
    ],
  });
  return { store: injector.get(CalendarStore), language };
}

test("CalendarStore calcula dias, seleção e quantidade mensal", () => {
  const { store } = createCalendar();
  store.month.set(new Date("2026-10-01T12:00:00"));
  store.selectedDate.set("2026-10-05");

  assert.equal(store.selectedDay()?.date, "2026-10-05");
  assert.equal(store.count(), 1);
  assert.equal(store.days().some((day) => day.date === "2026-10-05"), true);
});

test("CalendarStore muda mês, limpa seleção e respeita idioma", () => {
  const { store, language } = createCalendar();
  store.month.set(new Date("2026-10-01T12:00:00"));
  store.selectedDate.set("2026-10-05");

  store.change(1);

  assert.equal(store.month().getMonth(), 10);
  assert.equal(store.selectedDate(), null);

  language.set("en");
  assert.match(store.monthLabel(), /November 2026/i);
});
