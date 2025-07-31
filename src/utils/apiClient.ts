// 统一的API客户端，包含重试机制和错误处理
export interface APIRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
}

export class APIClient {
  private static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 带重试机制的API调用
   */
  static async fetchWithRetry(
    url: string, 
    options: RequestInit, 
    retryOptions: APIRetryOptions = {}
  ): Promise<Response> {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      backoffMultiplier = 2
    } = retryOptions;

    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        
        // 如果是5xx错误或429（速率限制），进行重试
        if (response.status >= 500 || response.status === 429) {
          if (attempt === maxRetries) {
            return response; // 最后一次尝试，返回响应让调用者处理
          }
          
          const delay = retryDelay * Math.pow(backoffMultiplier, attempt);
          console.warn(`API call failed (${response.status}), retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
          await this.delay(delay);
          continue;
        }
        
        return response;
      } catch (error) {
        lastError = error as Error;
        
        // 网络错误或超时，进行重试
        if (attempt < maxRetries) {
          const delay = retryDelay * Math.pow(backoffMultiplier, attempt);
          console.warn(`Network error, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
          await this.delay(delay);
          continue;
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * OpenRouter API调用的统一方法
   */
  static async callOpenRouter(params: {
    apiKey: string;
    messages: Array<{ role: string; content: string }>;
    maxTokens?: number;
    temperature?: number;
    model?: string;
    timeout?: number;
  }): Promise<string> {
    const {
      apiKey,
      messages,
      maxTokens = 1000,
      temperature = 0.7,
      model = 'anthropic/claude-3.5-sonnet',
      timeout = 45000
    } = params;

    if (!apiKey || !apiKey.startsWith('sk-or-v1-')) {
      throw new Error('Invalid or missing OpenRouter API key');
    }

    // 设置超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await this.fetchWithRetry(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://readyscriptpro.com',
            'X-Title': 'ReadyScriptPro'
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens: maxTokens,
            temperature,
            stream: false
          }),
          signal: controller.signal
        },
        { maxRetries: 2, retryDelay: 2000 }
      );

      if (!response.ok) {
        let errorText: string;
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Failed to read error response';
        }
        
        console.error(`OpenRouter API Error ${response.status}:`, errorText);
        
        // 根据错误状态码提供具体的错误信息
        let userMessage = 'API request failed';
        if (response.status === 401) {
          userMessage = 'API authentication failed. Please check API key configuration.';
        } else if (response.status === 429) {
          userMessage = 'API rate limit exceeded. Please try again later.';
        } else if (response.status === 500) {
          userMessage = 'OpenRouter API is temporarily unavailable. Please try again.';
        } else if (response.status === 402) {
          userMessage = 'Insufficient API credits. Please check your OpenRouter account balance.';
        }
        
        throw new Error(userMessage);
      }

      // 解析响应
      let data: any;
      try {
        const responseText = await response.text();
        console.log('Raw API response length:', responseText.length);
        
        data = JSON.parse(responseText);
        const content = data.choices?.[0]?.message?.content || data.content || data.text || '';
        
        if (!content || content.trim().length === 0) {
          console.error('Empty content from API:', data);
          throw new Error('API returned empty content');
        }
        
        console.log('Generated content length:', content.length);
        return content;
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        throw new Error('Failed to parse API response. Please try again.');
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 解析可能包含JSON的文本响应
   */
  static parseJSONFromText(text: string): any {
    let jsonText = text.trim();
    
    // 尝试多种方式提取JSON
    const jsonPatterns = [
      /```json\s*(\{[\s\S]*?\})\s*```/,
      /```\s*(\{[\s\S]*?\})\s*```/,
      /\{[\s\S]*\}/
    ];
    
    for (const pattern of jsonPatterns) {
      const match = text.match(pattern);
      if (match) {
        jsonText = match[1] || match[0];
        break;
      }
    }
    
    // 清理JSON字符串
    jsonText = jsonText
      .replace(/[\u2018\u2019]/g, "'")  // 替换引号
      .replace(/[\u201c\u201d]/g, '"')  // 替换双引号
      .replace(/\\n/g, '\\\\n')       // 转义换行符
      .trim();
    
    return JSON.parse(jsonText);
  }
}