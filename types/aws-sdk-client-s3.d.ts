declare module '@aws-sdk/client-s3' {
  export class S3Client {
    config: any
    middlewareStack: any
    constructor(...args: any[])
    send(command: any): Promise<any>
    destroy(): void
  }
  export class GetObjectCommand {
    input: any
    middlewareStack: any
    constructor(...args: any[])
    resolveMiddleware(): any
    resolveMiddlewareWithContext(): any
  }
  export class PutObjectCommand {
    input: any
    middlewareStack: any
    constructor(...args: any[])
    resolveMiddleware(): any
    resolveMiddlewareWithContext(): any
  }
}
