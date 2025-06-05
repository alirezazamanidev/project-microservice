import { AuthModule } from 'src/modules/auth/auth.module';
import { FileModule } from 'src/modules/file/file.module';
import { HealthModule } from 'src/modules/health/health.module';

export const appIntervalImports = [AuthModule, FileModule, HealthModule];
