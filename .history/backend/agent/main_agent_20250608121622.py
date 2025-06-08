import os
import uuid
import subprocess
import sys
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
        
        # Execute the generated script and get the result
        execution_result = execute_python_script(file_path)

        # Create response message
        response_message = f"承知しました。`{instruction}`の指示に基づき、`{filename}`を作成し、実行しました。\n\n"
        response_message += f"**実行結果:**\n"
        response_message += f"```\n"
        if execution_result['stdout']:
            response_message += f"--- 標準出力 ---\n{execution_result['stdout']}\n"
        if execution_result['stderr']:
            response_message += f"--- エラー出力 ---\n{execution_result['stderr']}\n"
        response_message += f"--- 終了コード: {execution_result['returncode']} ---\n"
        response_message += f"```"
        
        return response_message
    except Exception as e:
        return f"ファイルの作成中にエラーが発生しました: {e}"

def execute_python_script(script_path: str) -> dict:
    """
    指定されたPythonスクリプトを実行し、その結果を返す
    """
    try:
        result = subprocess.run(
            [sys.executable, script_path],
            capture_output=True,
            text=True,
            timeout=15,  # Set a timeout for security
            encoding='utf-8'
        )
        return {
            "returncode": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr,
        }
    except subprocess.TimeoutExpired:
        return {
            "returncode": -1,
            "stdout": "",
            "stderr": "実行がタイムアウトしました（15秒）。無限ループなどが原因の可能性があります。",
        }
    except Exception as e:
        return {
            "returncode": -1,
            "stdout": "",
            "stderr": f"スクリプトの実行中に予期せぬエラーが発生しました: {e}",
        } 