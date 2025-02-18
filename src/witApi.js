// src/witApi.js
const WIT_SERVER_TOKEN = "WNRSZCFCJY2ITD2PLI55XJ2RXXC6MAT6"; 
// !!! 切勿在生产环境中暴露此 Token

/**
 * 调用 Wit.ai 的 message API，解析用户输入
 * @param {string} userMessage - 用户输入的文本
 * @returns {Promise<Object>} - Wit.ai 返回的解析结果
 */
export async function callWitApi(userMessage) {
  const url = `https://api.wit.ai/message?v=20230201&q=${encodeURIComponent(userMessage)}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${WIT_SERVER_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  return data;
}
