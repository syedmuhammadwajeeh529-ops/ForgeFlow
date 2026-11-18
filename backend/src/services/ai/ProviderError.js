export class ProviderError extends Error {
  constructor(provider, message, { status = 502, retryable = true, cause } = {}) {
    super(message, { cause });
    this.name = 'ProviderError';
    this.provider = provider;
    this.status = status;
    this.retryable = retryable;
  }
}
