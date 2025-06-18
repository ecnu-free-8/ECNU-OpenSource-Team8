from __future__ import annotations

"""LLM 接口封装：负责将用户自然语言送入 ECNU 大模型，并获取严格的 JSON 结果。"""

import json
import os
import re
from typing import Dict, Any

from openai import OpenAI

# 环境变量中读取，如无则留空（上层应保证存在）
ECNU_API_KEY = os.getenv("ECNU_API_KEY") or os.getenv("OPENAI_API_KEY")
BASE_URL = "https://chat.ecnu.edu.cn/open/api/v1"

if not ECNU_API_KEY:
    raise EnvironmentError("请在环境变量 ECNU_API_KEY 或 OPENAI_API_KEY 中配置大模型 API Key")

_client = OpenAI(api_key=ECNU_API_KEY, base_url=BASE_URL)

_JSON_PATTERN = re.compile(r"\{[^{}]*\}")

_PROMPT_TEMPLATE = """
你是一名智能财务助手，负责帮助用户记录支出、查询账单等。
请根据给定的 `username` 与 `message` 判断其意图，并【只返回】符合以下格式的严格 JSON（不允许出现除 JSON 以外的任何字符）：

{
  "success": true,
  "data": {
    "intent": "RECORD_TRANSACTION" | "QUERY_DATA",
    "response": "...中文回应...",
    "transaction_id": 0
  }
}

约束说明：
1. 若 `message` 中包含金额（形如"25元"￥25），则 `intent` 为 RECORD_TRANSACTION，否则为 QUERY_DATA。
2. 当 intent 为 RECORD_TRANSACTION 时：
   - `response` 必须类似于 "好的，我已经记录了这笔开支：\n💰 金额：25元\n🍽 分类：餐饮\n📅 时间：今天"。
   - `transaction_id` 填 0（后续由服务器生成实际 ID）。
3. 当 intent 为 QUERY_DATA 时：
   - `response` 给出对账单/统计等中文回答。
   - `transaction_id` 可以省略或者填 0。
4. 必须严格输出 JSON。
"""


def ask_llm(username: str, message: str) -> Dict[str, Any]:
    """向大模型发送 prompt 并解析返回的 JSON。

    Parameters
    ----------
    username : str
        用户名。
    message : str
        用户输入的原始消息。

    Returns
    -------
    Dict[str, Any]
        LLM 返回的 JSON 反序列化结果。
    """

    prompt = _PROMPT_TEMPLATE + f"\nusername: {username}\nmessage: {message}"

    completion = _client.chat.completions.create(
        model="ecnu-reasoner",
        messages=[
            {"role": "system", "content": prompt},
        ],
    )

    content = completion.choices[0].message.content

    # 截取最外层 JSON，防止出现额外文本
    match = _JSON_PATTERN.search(content)
    if not match:
        raise ValueError("LLM 响应中未包含有效 JSON")

    return json.loads(match.group(0)) 