import Image from "next/image";

export default function Home() {
  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Jidoka - Chat</h1>
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-600">Project: New Automation</p>
          <button className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            New Project
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-y-auto p-4">
        <div className="flex w-full flex-col space-y-4">
          {/* Chat Messages */}
          <div className="flex-1 space-y-6 overflow-y-auto rounded-lg bg-white p-4 shadow">
            {/* Example Message (User) */}
            <div className="flex items-start justify-end">
              <div className="max-w-lg rounded-lg bg-blue-500 px-4 py-2 text-white">
                <p className="text-sm">こんにちは。ExcelのデータをWebシステムに転記する作業を自動化したいです。</p>
              </div>
            </div>

            {/* Example Message (AI) */}
            <div className="flex items-start">
              <div className="max-w-lg rounded-lg bg-gray-200 px-4 py-2 text-gray-800">
                <p className="text-sm">
                  承知いたしました。Excelデータの転記ですね。どのようなデータで、どのWebシステムのどの項目に転記するのか、詳しく教えていただけますか？
                </p>
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Type your message here..."
                className="flex-1 rounded-md border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
              />
              <button className="ml-4 rounded-md bg-blue-500 px-6 py-2 font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Send
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
