// Coupon.tsx
interface CouponProps {
  discountBy: number; // e.g., 0.5 for 50%
  categories?: string[];
  validUntil?: string; // optional date
  children?: React.ReactNode;
  id?: any;
}
// Inside your component
/* const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const leftCircleColor = getRandomColor(); */
const colors = [
  "#f87171",
  "#E43636",
  "#60a5fa",
  "#a78bfa", // purple
  "#f472b6", // pink

  "#22d3ee", // cyan
  "#fb7185", // rose
  "#8b5cf6", // violet
  "#10b981", // emerald
  "#3b82f6", // blue-500
  "#ec4899", // pink-500
];

// Dark color palette

// Function to pick a random color from the list
const getRandomColorFromPalette = () => {
  return colors[Math.floor(Math.random() * colors.length)];
};

const color = getRandomColorFromPalette();
export default function Coupon({
  discountBy,
  categories = [],

  children,
}: CouponProps) {
  return (
    <div className="relative text-white  w-[400px]  h-[200px] rounded-lg overflow-hidden shadow-[0_2px_rgba(0,0,0,0.1)] flex items-stretch">
      {/* Coupon Design */}
      <div
        className="w-full h-full flex items-stretch uppercase "
        style={{
          backgroundImage: `
    radial-gradient(circle at 0 50%, transparent 25px, ${color} 26px),
    radial-gradient(circle at 100% 50%, transparent 25px, ${color} 26px)
  `,
          backgroundSize: "50% 100%, 50% 100%",
          backgroundRepeat: "no-repeat, no-repeat",
          backgroundPosition: "left top, right top",
        }}>
        {/* Left Section */}
        <div className="w-[20%] border-r-2 border-white/50 border-dashed  flex items-center justify-center">
          <div className="-rotate-90 whitespace-nowrap font-bold">Discount</div>
        </div>

        {/* Center Section */}
        <div className="flex-grow text-center flex flex-col justify-center items-center px-2">
          <h2 className="bg-white text-black px-2 text-[2.15rem] whitespace-nowrap">
            {discountBy * 100}% OFF
          </h2>
          <h3 className="text-lg font-bold">
            {categories.length > 0 ? categories.join(", ") : "Coupon"}
          </h3>
          <small className="text-[0.625rem] font-semibold tracking-[2px]">Limited Time Offer</small>
        </div>

        {/* Right Section */}
        <div
          className="w-[120px] flex items-center justify-center p-5"
          style={{
            backgroundImage: `radial-gradient(circle at 100% 50%, transparent 25px, #fff 26px)`,
          }}>
          <div className=" text-lg text-black font-normal -rotate-90 ">webschema</div>
        </div>
      </div>

      {/* Delete Button or any overlayed content */}
      {children && <div className="absolute top-2 right-2 z-10">{children}</div>}
    </div>
  );
}
