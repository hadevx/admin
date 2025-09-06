import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DynamicIsland() {
  const [dateTime, setDateTime] = useState<string>("");
  const [secondsAngle, setSecondsAngle] = useState<number>(0);
  const [minutesAngle, setMinutesAngle] = useState<number>(0);
  const [hoursAngle, setHoursAngle] = useState<number>(0);

  // Roman numerals for clock
  const romanNumerals = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // Arabic weekday names
      const weekdays = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
      const dayName = weekdays[now.getDay()];

      // Get hours, minutes, seconds
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      // Set angles for analog clock
      setSecondsAngle(seconds * 6);
      setMinutesAngle(minutes * 6 + seconds * 0.1);
      setHoursAngle((hours % 12) * 30 + minutes * 0.5);

      // Determine AM/PM in Arabic
      const isPM = hours >= 12;
      const period = isPM ? "مساء" : "صباحا";
      hours = hours % 12 || 12;

      setDateTime(
        `اليوم ${dayName} الساعة ${hours}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")} ${period}`
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Function to get (x,y) coordinates for Roman numerals
  const getNumeralPosition = (angleDeg: number, radius: number) => {
    const angleRad = (angleDeg - 90) * (Math.PI / 180); // rotate -90 to start at top
    const x = 50 + radius * Math.cos(angleRad);
    const y = 50 + radius * Math.sin(angleRad);
    return { x, y };
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0, scale: 0.5 }}
        animate={{ y: 10, opacity: 1, scale: 1 }}
        exit={{ y: -100, opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="fixed top-0 left-1/2  -translate-x-1/2 z-40">
        <div
          dir="rtl"
          className="flex items-center gap-4 px-6 py-2 rounded-2xl shadow-xl 
                      backdrop-blur-md bg-black/70 border border-white/10
                      text-white min-w-[280px] max-w-[380px]">
          {/* Analog Clock with Roman numerals */}
          <svg className="w-12 h-12" viewBox="0 0 100 100">
            {/* Clock face */}
            <circle cx="50" cy="50" r="48" stroke="black" fill="white" />

            {/* Roman numerals */}
            {romanNumerals.map((num, i) => {
              const angle = i * 30; // each hour 30 degrees
              const pos = getNumeralPosition(angle, 38);
              return (
                <text
                  key={i}
                  x={pos.x}
                  y={pos.y + 3} // adjust vertical alignment
                  textAnchor="middle"
                  fontSize="7"
                  fill="black"
                  fontWeight="bold">
                  {num}
                </text>
              );
            })}

            {/* Hour hand */}
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="30"
              stroke="black"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${hoursAngle} 50 50)`}
            />
            {/* Minute hand */}
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="20"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              transform={`rotate(${minutesAngle} 50 50)`}
            />
            {/* Second hand */}
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="15"
              stroke="red"
              strokeWidth="1"
              strokeLinecap="round"
              transform={`rotate(${secondsAngle} 50 50)`}
            />
          </svg>

          {/* Text */}
          <div className="flex flex-col text-right">
            <span className="font-semibold text-sm">مرحبا بعودتك</span>
            <span className="text-xs text-gray-300">{dateTime}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
