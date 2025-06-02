import { ApiProperty } from "@nestjs/swagger";

export class ResponseOKDto<T>{
  @ApiProperty()
  message:string
  @ApiProperty()
  data?:T
}