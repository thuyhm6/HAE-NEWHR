import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { patchNzOptionDebugValueAttribute } from './app/core/config/nz-option-debug.config';

// Gán attribute data-nz-value cho toàn bộ nz-option trong dropdown để xem value khi bấm F12
patchNzOptionDebugValueAttribute();

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
