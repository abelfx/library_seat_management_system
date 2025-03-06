import { Check, User } from "lucide-react";
import { Link } from "react-router-dom";

function BuildingIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
      <path d="M9 22v-4h6v4"></path>
      <path d="M8 6h.01"></path>
      <path d="M16 6h.01"></path>
      <path d="M12 6h.01"></path>
      <path d="M12 10h.01"></path>
      <path d="M12 14h.01"></path>
      <path d="M16 10h.01"></path>
      <path d="M16 14h.01"></path>
      <path d="M8 10h.01"></path>
      <path d="M8 14h.01"></path>
    </svg>
  );
}

function FloorCard({ floor, available, reserved, occupied }) {
  return (
    <div className="bg-black text-white rounded-md p-4">
      <div className="flex items-center gap-2 mb-3">
        <BuildingIcon className="w-5 h-5" />
        <span className="text-sm">Floor {floor}</span>
      </div>

      <div className="flex justify-between">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">{available}</span>
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-xs">Available</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">{reserved}</span>
          <div className="w-4 h-4 rounded-full bg-amber-400"></div>
          <span className="text-xs">Reserved</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">{occupied}</span>
          <User className="w-4 h-4 text-blue-500" />
          <span className="text-xs">Occupied</span>
        </div>
      </div>
    </div>
  );
}

export default function SeatAvailability() {
  return (
    <div className="min-h-screen flex flex-col border border-amber-200">
      <header className="border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium">EduWave</span>
        </div>
        <nav className="flex gap-4">
          <Link to="#" className="text-sm font-medium">
            Home
          </Link>
          <Link to="#" className="text-sm font-medium ">
            Profile
          </Link>
        </nav>
      </header>

      <main className="flex-1 p-4">
        <h1 className="text-3xl font-extrabold mb-4">Available Seats</h1>

        <div className="mb-6">
          <h2 className="text-sm font-medium mb-2">Status Guide</h2>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-400"></div>
              <span className="text-sm font-extrabold">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Occupied</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FloorCard floor={1} available={12} reserved={0} occupied={0} />
          <FloorCard floor={2} available={9} reserved={2} occupied={1} />
          <FloorCard floor={3} available={12} reserved={0} occupied={0} />
          <FloorCard floor={4} available={11} reserved={0} occupied={0} />
          <FloorCard floor={5} available={12} reserved={0} occupied={0} />
        </div>

       <div className="bg-black rounded-2xl mt-7 h-[200px] w-[250px] items-center flex flex-col p-7">
        <h1 className="text-white font-extrabold mb-3">Reserved</h1>
        <div className="bg-white rounded-xl h-[100px] p-1">
          <h1 className="font-extrabold">Zone 3 Seat 1</h1>
          <p>Check-in Time 8:00LT check-out Time : 10:00LT</p>

        </div>

       </div>
      </main>

  
    </div>
  );
}
