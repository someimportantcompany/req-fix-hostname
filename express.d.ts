import type { RequestHandler } from 'express';

export default function reqFixHostname(headers: string[]): RequestHandler;
