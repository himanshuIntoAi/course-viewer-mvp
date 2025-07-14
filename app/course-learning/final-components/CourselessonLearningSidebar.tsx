import { FiChevronDown, FiCheckSquare, FiSquare } from "react-icons/fi";
import Image from "next/image";
function CourseLessonLearningSidebar() {
  return (
    <aside className="w-full max-w-[400px] min-h-screen bg-[#faf9fb] border-r border-[#ececec] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-[#ececec] px-6 py-4 border-b border-[#e0e0e0]">
        <div className="flex items-center gap-2">
          <Image src="/images/learner-icon.svg" alt="Cloud OU Logo" width={20} height={40} />
          <span className="font-medium text-gray-800">Learn</span>
        </div>
        <button className="p-2 rounded hover:bg-gray-200">
          <Image src="/images/resize-icon.svg" alt="Cloud OU Logo" width={20} height={40} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 py-6 gap-6 overflow-y-auto">
        {/* Lesson Label */}
        <div className="text-xs text-gray-500 tracking-widest font-semibold mb-1">HELLO WORLD</div>
        {/* Title & Duration */}
        <div className="mb-2">
          <h2 className="text-xl font-bold mb-1">Introduction to Java</h2>
          <div className="text-sm text-gray-500 mb-2">3 min</div>
        </div>
        {/* Intro Text */}
        <div className="text-[15px] text-gray-800 leading-relaxed space-y-3 mb-2">
          <p>Welcome to the world of Java programming!</p>
          <p>Programming languages enable humans to write instructions that a computer can perform. With precise instructions, computers coordinate applications and systems that run the modern world.</p>
          <p>One reason people love Java is the Java Virtual Machine, which ensures the same Java code can be run on different operating systems and platforms. Sun Microsystems’ slogan for Java was “write once, run everywhere”.</p>
          <p>Let’s start with the universal greeting for a programming language. We’ll explore the syntax in the next exercise.</p>
        </div>

        {/* Instructions Section */}
        <div className="bg-[#f5f5f5] border border-[#e0e0e0] rounded-lg mb-2">
          <div className="flex items-center px-4 py-3 border-b border-[#e0e0e0]">
            <FiCheckSquare className="mr-2 text-gray-700" />
            <span className="font-medium text-gray-800">Instructions</span>
          </div>
          <div className="px-4 py-3 flex items-start gap-3">
            <input type="checkbox" checked readOnly className="accent-violet-600 w-5 h-5 mt-1" />
            <div>
              <div className="text-[15px] text-gray-900 font-medium mb-1">1. You’re looking at a computer program written in Java.</div>
              <div className="text-[15px] text-gray-700">Run the code in the text editor to see what is printed to the screen.</div>
            </div>
          </div>
        </div>

        {/* Hint Section */}
        <div className="bg-[#fff7cc] border border-[#ffe066] rounded-lg mb-2">
          <button className="w-full flex items-center justify-between px-4 py-3 font-medium text-gray-800">
            Stuck? Get a hint
            <FiChevronDown className="ml-2 text-gray-600" />
          </button>
        </div>

        {/* Concept Review */}
        <div className="bg-[#f5f5f5] border border-[#e0e0e0] rounded-lg mb-2">
          <div className="flex items-center px-4 py-3 border-b border-[#e0e0e0]">
            <FiSquare className="mr-2 text-gray-700" />
            <span className="font-medium text-gray-800">Concept Review</span>
          </div>
          <div className="px-4 py-3 text-[15px] text-gray-700">
            Want to quickly review some of the concepts you’ve been learning? <br />
            Take a look at this material’s <a href="#" className="text-violet-600 underline font-medium">cheatsheet!</a>
          </div>
        </div>

        {/* Community Support */}
        <div className="bg-[#f5f5f5] border border-[#e0e0e0] rounded-lg">
          <div className="flex items-center px-4 py-3 border-b border-[#e0e0e0]">
            <FiSquare className="mr-2 text-gray-700" />
            <span className="font-medium text-gray-800">Community Support</span>
          </div>
          <div className="px-4 py-3 text-[15px] text-gray-700">
            Still have questions? Get help from the <a href="#" className="text-violet-600 underline font-medium">Cloud OU community</a>.
          </div>
        </div>
      </div>
    </aside>
  );
}

export default CourseLessonLearningSidebar;