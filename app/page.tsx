import { ChatWindow } from "@/components/chat/chat";
import { Sidebar } from "@/components/sidebar/sidebar";
import { TutorCard } from "@/components/tutor/tutor";
import { FiSearch } from "react-icons/fi";

export default function Home() {
  return (
<div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Available Tutors</h1>
          <div className="flex items-center border border-gray-300 rounded p-2">
            <FiSearch className="text-gray-500" />
            <input
              type="text"
              placeholder="Search tutors..."
              className="ml-2 outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TutorCard name="Emma Watson" subject="English, Literature" rate="$2 - $10" rating={4.5} />
          <TutorCard name="John Doe" subject="Math, Science" rate="$5 - $15" rating={4.0} />
          <TutorCard name="Sophia Brown" subject="History, Geography" rate="$3 - $12" rating={4.2} />
        </div>
      </main>
      <ChatWindow />
    </div>
  );
}
