from openai import OpenAI
url = 'https://chat.ecnu.edu.cn/open/api/v1'
api_key = 'sk-7520506088e9433181ebb26557dac875'

def call_llm(prompt, functions=None):
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
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": prompt}
    ]
    response = client.chat.completions.create(
        model="ecnu-reasoner",
        messages=messages,
    )
    print(response.choices[0].message.content)


if __name__ == "__main__":
    # call_llm("你好，请问如何学习python")
    print(__import__('datetime').datetime.now().isoformat())