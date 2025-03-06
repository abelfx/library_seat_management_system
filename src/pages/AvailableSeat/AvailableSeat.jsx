"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Clock, Info, Check } from "lucide-react"

const SeatSelection = () => {
  const zones = [
    { id: 1, name: "Zone A", seats: 4 },
    { id: 2, name: "Zone B", seats: 4 },
    { id: 3, name: "Zone C", seats: 4 },
    { id: 4, name: "Zone D", seats: 4 },
  ]

  const [selectedSeat, setSelectedSeat] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentSeat, setCurrentSeat] = useState(null)
  const [checkInTime, setCheckInTime] = useState("")
  const [checkOutTime, setCheckOutTime] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")

  const getSeatStatus = (zoneId, seatIndex) => {
    const random = (zoneId + seatIndex) % 3
    if (random === 0) return "available"
    if (random === 1) return "booked"
    return "occupied"
  }

  const selectSeat = (seatId, status, zoneName, seatNumber) => {
    if (status === "available") {
      setSelectedSeat(selectedSeat === seatId ? null : seatId)
      setCurrentSeat({ id: seatId, zone: zoneName, seatNumber })
      setDialogOpen(true)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "available":
        return "✅"
      case "booked":
        return "🔴"
      case "occupied":
        return "🟡"
    }
  }

  const handleConfirm = () => {
    console.log({
      seat: currentSeat,
      checkInTime,
      checkOutTime,
      additionalInfo,
    })
    setDialogOpen(false)
    setCheckInTime("")
    setCheckOutTime("")
    setAdditionalInfo("")
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Seat Selection</h1>
          <p className="text-xl text-gray-600">Choose your perfect spot</p>
        </header>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="flex justify-center gap-6 py-4 bg-gray-50 border-b">
            {[
              { icon: "✅", text: "Available" },
              { icon: "🔴", text: "Booked" },
              { icon: "🟡", text: "Occupied" },
            ].map((status, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-2xl">{status.icon}</span>
                <span className="text-sm font-medium text-gray-700">{status.text}</span>
              </div>
            ))}
          </div>

          <div className="p-6 space-y-8">
            {zones.map((zone) => (
              <div key={zone.id} className="space-y-4">
                <div className="flex items-center">
                  <div className="w-24 h-12 bg-gray-800 text-white flex items-center justify-center rounded-lg shadow">
                    <span className="text-sm font-medium">{zone.name}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 flex-1 ml-4">
                    {Array.from({ length: zone.seats }).map((_, seatIndex) => {
                      const seatId = `${zone.id}-${seatIndex}`
                      const status = getSeatStatus(zone.id, seatIndex)
                      const isSelected = selectedSeat === seatId


                      return (
                        <motion.button
                          key={seatIndex}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`h-12 flex items-center justify-between px-4 rounded-md shadow transition-colors ${
                            status !== "available"
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                              : isSelected
                                ? "bg-green-500 text-white"
                                : "bg-gray-800 text-white hover:bg-gray-700"
                          }`}
                          onClick={() => selectSeat(seatId, status, zone.name, seatIndex + 1)}
                          disabled={status !== "available"}
                        >
                          <span className="text-sm font-medium">Seat {seatIndex + 1}</span>
                          <span>{getStatusIcon(status)}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {dialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold mb-4">Seat Booking Details</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="w-1/3 text-gray-600">Seat:</span>
                  <span className="w-2/3 font-medium">
                    {currentSeat?.zone} - Seat {currentSeat?.seatNumber}
                  </span>
                </div>
                <div className="flex items-center">
                  <label htmlFor="checkin" className="w-1/3 text-gray-600">
                    Check-in:
                  </label>
                  <div className="w-2/3 relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      id="checkin"
                      type="time"
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <label htmlFor="checkout" className="w-1/3 text-gray-600">
                    Check-out:
                  </label>
                  <div className="w-2/3 relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      id="checkout"
                      type="time"
                      value={checkOutTime}
                      onChange={(e) => setCheckOutTime(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <label htmlFor="info" className="w-1/3 text-gray-600">
                    Additional Info:
                  </label>
                  <div className="w-2/3 relative">
                    <Info className="absolute left-3 top-3 text-gray-400" size={18} />
                    <textarea
                      id="info"
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}

                      className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => setDialogOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Check size={18} />
                  Confirm Booking
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SeatSelection
