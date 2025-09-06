export class SystemContext {
  getSearchHistory(): string {}

  reportUsage(
    descriptor: string,
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    }
  ) {
    this.usages.push({
      descriptor,
      promptTokens: usage.promptTokens
    })
  }

  getUsages(): TokenUsage[] {
    return this.usages;
  }
}
