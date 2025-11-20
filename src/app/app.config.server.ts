import { appConfig } from './app.config';
import { provideServerRendering } from '@angular/platform-server';
import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering()],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
