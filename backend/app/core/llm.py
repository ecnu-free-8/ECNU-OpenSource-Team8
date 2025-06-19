import json
import datetime
import app.core.functions as F
from openai import OpenAI

available_functions = {
    "get_current_datetime": F.get_current_datetime,
    "add": F.add,
    "get_summary": F.get_summary,
    "get_transactions": F.get_transactions,
    "create_transaction": F.create_transaction,
    "update_transaction": F.update_transaction,
    "delete_transaction": F.delete_transaction,
    "get_budgets": F.get_budgets,
    "create_budget": F.create_budget,
    "get_categories": F.get_categories,
    "add_category": F.add_category,
    "update_category": F.update_category,
    "delete_category": F.delete_category,
    "get_reports": F.get_reports,
}

# for name, func in available_functions.items():
#     print(name)
#     print(func.__doc__)
#     print('——————————————————————————————————————————————————————————')

url = 'https://chat.ecnu.edu.cn/open/api/v1'
api_key = 'sk-7520506088e9433181ebb26557dac875'

def format_tools_for_prompt(tools): # ReAct format_tools_for_prompt
    prompt_str = """
You are a professional expense tracking assistant. Your primary task is to help users manage their expenses by accurately understanding their natural language requests and converting them into calls to the provided database operation tools (CRUD). You must strictly follow the constraints below.

### CONSTRAINTS ####
1. The tool selected must be one of the tools in the tool list.
2. When unable to find the input for the tool, please adjust immediately and use the AskHumanHelpTool to ask the user for additional parameters.
3. When you believe that you have the final answer and can respond to the user, please use the TaskCompleteTool.
4. The Thought field must be explained in chinese.
5. You must respond in JSON format, DO NOT include "```json" tags.
"""
    prompt_str += "### Partial parameter constraints ###\n"
    prompt_str += "1. 现在已经获取所有分类的 id 与名称，如果需要修改或删除请使用下方的 id (最大id不表示分类个数)\n"
    categories = F.get_categories()['data']
    for category in categories:
        prompt_str += f"- {category}\n"
    prompt_str += "2. type 参数有下面两种\n"
    prompt_str += "- expense\n- income\n"
    prompt_str += "### Tool List ###\n"
    descriptions = []
    for tool_name, tool_function in tools.items():
        func_description = '\n    {'
        func_description += f"`name`: {tool_name},"
        func_description += f"`description`: {tool_function.__doc__.strip()},"
        func_description += f"`parameters`: {tool_function.__annotations__}"
        func_description += '}'
        descriptions.append(func_description)
    prompt_str += '[' + ','.join(descriptions) + '\n]'
    prompt_str += """
You should only respond in JSON format as described below

### RESPONSE FORMAT ###
    {"thought": "为什么选择这个工具的思考","status": "true", "tool_names": "工具名","args_list": {“工具名1”:{"参数名1": "参数值1","参数名2": "参数值2"}}}
  
    {"thought": "用户没有提供具体问题，因此需要请求用户提供更多信息以便选择适当的工具。","tool_names": "", "status": "false","args_list": {}}

Make sure that the response content you return is all in JSON format and does not contain any extra content.
"""
    return prompt_str

def call_llm(prompt, username, functions=None):
    """
    Call the LLM with a prompt and optional functions.
    
    Args:
        prompt (str): The prompt to send to the LLM.
        functions (dict, optional): A dictionary of available functions.
        
    Returns:
        dict: A dictionary containing the status, thought, and result of the LLM response.
    """
    
    client = OpenAI(api_key=api_key, base_url=url)
    messages = [
        {"role": "system", "content": format_tools_for_prompt(available_functions)},
        {"role": "user", "content": f"username: {username}" + prompt}
    ]
    # print(messages[0]['content'])
    response = client.chat.completions.create(
        model="ecnu-reasoner",
        messages=messages,
    )
    import logging
    logging.debug("—————————————————LLM Response————————————————————————")
    logging.debug(response.choices[0].message.content)  # Debugging output
    json_response = json.loads(response.choices[0].message.content)
    if json_response.get("status", "false") == "false":
        return {'status': False}
    thought = json_response.get("thought", "")
    function_name = json_response.get("tool_names", None)
    args = json_response.get("args_list", {})
    args = args.get(function_name, {}) if function_name else {}
    function = functions.get(function_name) if function_name else None
    result = function(**args) if function else None
    return {
        'status': True,
        'thought': thought,
        'result': result,
    }

def chat_llm(username, prompt):
    """
    这是一个二阶段的调用函数，首先调用call_llm函数获取结果：
    如果结果状态为False，则直接使用OpenAI的API进行聊天回复。
    如果结果状态为True，则根据调用函数后的结果使用OpenAI的API进行聊天回复。
    
    Args:
        prompt (str): The prompt to send to the LLM.
        username (str): The username of the user making the request.
    Returns:
        dict: A dictionary containing the status and data of the response.
    """
    result = call_llm(prompt, username, functions=available_functions)
    
    client = OpenAI(api_key=api_key, base_url=url)
    if result['status'] == False:
        messages = [
            {"role": "system", "content": "You are a professional expense tracking assistant."},
            {"role": "user", "content": prompt}
        ]
        response = client.chat.completions.create(
            model="ecnu-reasoner",
            messages=messages,
        )
        return {
            "success": True,
            "data": response.choices[0].message.content.strip()
        }
    
    messages = [
        {"role": "system", "content": "You are a professional expense tracking assistant. Please respond to the user's request based on the function call result."},
        {"role": "user", "content": "用户请求为：\n" + prompt + f"""

根据用户请求调用函数后结果为：\n"+ {json.dumps(result, ensure_ascii=False)} + "\n\n请给一个合适的回应比如：
"好的，我已经记录了这笔开支：\n💰 金额：25元\n🍽 分类：餐饮\n📅 时间：今天";
"本月您总共花费了2580.00元，主要支出为餐饮580元，交通320元。";
"""},
    ]
    response = client.chat.completions.create(
        model="ecnu-reasoner",
        messages=messages,
    )
    return {
        "success": True,
        "data": response.choices[0].message.content.strip()
    }
    
if __name__ == "__main__":
    # Example usage
    print(call_llm("计算 329485234587 和 23985789234 的和", "user1", functions=available_functions))
    print(chat_llm("计算 329485234587 和 23985789234 的和", "user1"))
    # 因为涉及到Flask上下文， 涉及到数据库查询的只能通过api调用来测试