import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";

@Injectable()
export class SessionSerializer extends PassportSerializer{
    constructor(){
        super()
    }
    serializeUser(user: any, done: Function) {
        done(null,user)
    }
    deserializeUser(payload: any, done: Function) {

        // find use with user service
        done(null,payload)
    }
}