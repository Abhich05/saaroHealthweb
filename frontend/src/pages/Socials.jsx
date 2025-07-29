import React from "react";
import Sidebar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import Button from "../components/ui/Button";

const platforms = [
  {
    name: "Facebook",
    description: "Manage your Facebook page effortlessly by integrating it with your platform.",
    icon: "https://cdn-icons-png.flaticon.com/512/733/733547.png",
  },
  {
    name: "Instagram",
    description: "Integrate Instagram to engage with your followers seamlessly.",
    icon: "https://cdn-icons-png.flaticon.com/512/2111/2111463.png",
  },
  {
    name: "WhatsApp",
    description: "Connect with your customers directly on WhatsApp.",
    icon: "https://cdn-icons-png.flaticon.com/512/733/733585.png",
  },
  {
    name: "Google Business",
    description: "Keep your Google Business profile updated to attract more customers.",
    icon: "https://cdn-icons-png.flaticon.com/512/300/300221.png",
  },
];

const Socials = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 bg-[#f5f6fa] p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto flex flex-wrap gap-6 justify-center">
            {platforms.map((platform) => (
              <div
                key={platform.name}
                className="w-[280px] bg-white shadow-md rounded-xl p-6 text-center flex flex-col items-center justify-between transition transform hover:scale-105 duration-200"
              >
                <div className="flex flex-col items-center">
                  <div className="bg-gray-200 rounded-full p-4 mb-4">
                    <img
                      src={platform.icon}
                      alt={`${platform.name} Icon`}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-semibold">{platform.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 text-center">
                    {platform.description}
                  </p>
                </div>
                <Button className="mt-5  w-full text-white px-6 py-2 text-sm rounded hover:bg-blue-700 transition">
                  Manage
                </Button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Socials;
