import { applyDecorators, Type } from "@nestjs/common";
import {
  ApiExtraModels,
  ApiResponse,
  getSchemaPath,
} from "@nestjs/swagger";
import { ResponseOKDto } from "../dtos/base-response.dto";

type ApiCustomResponseOptions<T = any> = {
  model?: T;
  isArray?: boolean;
  status: number;
  description: string;
};

export const ApiCustomResponse = <TModel extends Type<any>>(
  options: ApiCustomResponseOptions<TModel>
) => {
  const { model, status, description, isArray = false } = options;

  const decorators:any = [];

  if (model) {
    decorators.push(ApiExtraModels(ResponseOKDto, model));
  } else {
    decorators.push(ApiExtraModels(ResponseOKDto));
  }

  const schema: any = {
    allOf: [
      { $ref: getSchemaPath(ResponseOKDto) },
    ],
  };

  if (model) {
    const dataSchema = isArray
      ? {
          type: 'array',
          items: { $ref: getSchemaPath(model) },
        }
      : { $ref: getSchemaPath(model) };

    schema.allOf.push({
      properties: {
        data: dataSchema,
      },
    });
  }

  decorators.push(
    ApiResponse({
      status,
      description,
      schema,
    })
  );

  return applyDecorators(...decorators);
};
