import { ConfigModule } from "@nestjs/config";

export const appIntervalImports=[
    ConfigModule.forRoot({
        isGlobal:true,
        envFilePath:'.env'
    })
]