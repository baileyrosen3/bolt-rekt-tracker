import Image from "next/image";
import Link from "next/link"; // Import Link from next/link

import { bclogo, bctitle } from "../assets/index";
// import { navLinks } from "../constants";

export const Navbar = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-2 max-w-[300px] h-full">
      <div className="flex items-center justify-center">
        <Image
          src={bclogo}
          alt="becompounding logo"
          width={40}
          height={40}
          className="mr-2"
        />
        <Image
          src={bctitle}
          alt="becompounding title"
          width={132}
          height={40}
          className="w-[132px] h-[40px]"
        />
      </div>
      <div className="flex flex-col items-center justify-center mt-2 text-center">
        <p className="text-gray-400 text-xs">
          Your trusted source for real-time rekt event monitoring and analysis.
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="mt-4 w-full">
        <ul className="flex flex-col space-y-2">
          <li>
            <Link href="/rekt-dashboard">
              <a className="text-gray-300 hover:text-white">Rekt Dashboard</a>
            </Link>
          </li>
          {/* Add more navigation links here if needed */}
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
