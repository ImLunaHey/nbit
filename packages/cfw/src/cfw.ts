import { createCreateApplication } from './core';
import CustomRequest from './Request';

export const createApplication = createCreateApplication(
  (routeRequest, _applicationOptions) => {
    return async (request: Request) => {
      const { method } = request;
      const { pathname } = new URL(request.url);
      return await routeRequest({
        method,
        pathname,
        instantiateRequest: (captures) => {
          // TODO: Should we pass in the parsed URL to avoid parsing it again
          return new CustomRequest(request, captures);
        },
        onError: (e) => {
          return new Response(String(e), {
            status: 500,
            headers: { 'Content-Type': 'text/plain; charset=UTF-8' },
          });
        },
        toResponse: async (input: unknown) => {
          if (input instanceof Response) {
            return input;
          }
          return Response.json(input);
        },
      });
    };
  },
);
