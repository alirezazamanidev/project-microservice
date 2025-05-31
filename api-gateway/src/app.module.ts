import { Module } from '@nestjs/common';
import { appExternalImports } from './app/imports/external.imports';
import { appIntervalImports } from './app/imports/interval.imports';

@Module({
  imports: [
    ...appExternalImports,
    ...appIntervalImports,
  ],
})
export class AppModule {}
