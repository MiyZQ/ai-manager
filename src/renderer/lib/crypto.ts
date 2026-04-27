// 简单的编码/解码函数
// 注意：这是基础实现，生产环境应使用更安全的加密方式

export function encodeKey(key: string): string {
  return Buffer.from(key).toString('base64')
}

export function decodeKey(encoded: string): string {
  return Buffer.from(encoded, 'base64').toString('utf-8')
}
