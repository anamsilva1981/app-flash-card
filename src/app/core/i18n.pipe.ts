import { Pipe, PipeTransform, inject } from "@angular/core";
import { I18nService, TranslationParams } from "./i18n.service";
@Pipe({ name: "t", standalone: true, pure: false })
export class I18nPipe implements PipeTransform {
  private i18n = inject(I18nService);
  transform(key: string, params?: TranslationParams) {
    return this.i18n.t(key, params);
  }
}
