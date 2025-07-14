import Image from "next/image";

function CourseEditor() {
  return (
    <div className="flex flex-col h-full w-[40%] bg-white rounded-lg shadow border overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-[#f5f0fa] px-4 py-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="bg-[#e6d6fa] text-[#a259ff] px-3 py-1 rounded-t-md text-xs font-semibold">HelloWorld.java</span>
        </div>
        <button className="p-2 rounded hover:bg-gray-200">
          {/* <Image src="/images/resize-icon.svg" alt="Resize" width={20} height={20} /> */}
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 max-h-[50vh] flex flex-col bg-[#18192b] text-white font-mono text-sm relative overflow-auto">
        <div className="flex h-full">
          {/* Line Numbers */}
          <div className="py-4 px-3 text-right select-none text-[#7c7c8a] bg-[#18192b]">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="h-5 leading-5">{i + 1}</div>
            ))}
          </div>
          {/* Code Area (static for now) */}
          <pre className="py-4 px-4 whitespace-pre h-full w-full overflow-x-auto">

          </pre>
        </div>
      </div>
      {/* Result Section */}
      <div className="bg-white border-t border-gray-200">
        {/* Result Header */}
        <div className="flex items-center justify-between bg-[#7c3aed] px-4 py-2">
          <span className="text-white font-semibold text-sm tracking-wider">RESULT</span>
          <div className="flex items-center gap-2">
            <button className="p-1 rounded hover:bg-[#a78bfa]">
              {/* <Image src="/images/copy-icon.svg" alt="Copy" width={18} height={18} /> */}
            </button>
            <button className="p-1 rounded hover:bg-[#a78bfa]">
              {/* <Image src="/images/refresh-icon.svg" alt="Refresh" width={18} height={18} /> */}
            </button>
            <button className="ml-2 px-4 py-1.5 bg-white text-[#7c3aed] font-semibold rounded hover:bg-[#ede9fe] border border-[#7c3aed] transition">RUN</button>
          </div>
        </div>
        {/* Output Area */}
        <div className="bg-white px-4 py-4 min-h-[13vw] text-gray-900 text-base border-b border-gray-200">
          Hello World!
        </div>
        {/* Talk To Mentor Button */}
        <div className="bg-[#f5f5f5] px-4 py-3 flex justify-end">
          <button className="px-6 py-2 bg-gray-200 text-gray-800 rounded font-medium hover:bg-gray-300 transition">Talk To Mentor</button>
        </div>
      </div>
    </div>
  );
}

export default CourseEditor;
