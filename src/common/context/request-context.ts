export type RequestContext = { associationId?: number };
declare global {
  namespace Express {
    interface Request { context?: RequestContext }
  }
}