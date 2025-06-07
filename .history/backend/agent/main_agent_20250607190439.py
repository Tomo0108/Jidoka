import os
import uuid
from openai import OpenAI

def process_message(message: str) -> str:
    """
    ユーザーからのメッセージを処理し、タスクを実行して応答を生成する
    """
    if "python" in message.lower() and ("create" in message.lower() or "作成" in message.lower() or "作って" in message.lower()):
        return create_python_script(message)
    else:
        return f"AIが応答します: 「{message}」について、どのような処理をご希望ですか？具体的な指示（例：「『ハローワールド』と表示するPythonスクリプトを作成して」）をいただけると、コードを生成できます。"

def create_python_script(instruction: str) -> str:
    """
    OpenAI APIを使用してPythonスクリプトを生成し、ファイルに保存する
    """
    try:
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        system_prompt = "You are an expert Python programmer. Based on the user's request, generate a Python script. Only output the raw Python code, without any explanation or markdown formatting."
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": instruction}
            ]
        )
        
        code_content = response.choices[0].message.content
        if not code_content:
            return "コードを生成できませんでした。指示を再確認してください。"

    except Exception as e:
        return f"OpenAI APIの呼び出し中にエラーが発生しました: {e}"

    filename = f"script_{uuid.uuid4().hex[:8]}.py"
    workspace_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'workspace')
    
    if not os.path.exists(workspace_dir):
        os.makedirs(workspace_dir)
        
    file_path = os.path.join(workspace_dir, filename)

    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(code_content)
        
        response_message = f"承知しました。 `{instruction}` の指示に基づき、 `{filename}` を `workspace` ディレクトリに作成しました。"
        return response_message
    except Exception as e:
        return f"ファイルの作成中にエラーが発生しました: {e}" 