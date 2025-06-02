import { ApiProperty } from "@nestjs/swagger";


export class UserDto {
    @ApiProperty()
    googleId:string
    @ApiProperty()
    email:string
    @ApiProperty()
    username:string

}