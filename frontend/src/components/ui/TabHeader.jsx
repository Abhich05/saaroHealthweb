const TabHeader = ({ tabs, activeTabId, setActiveTabId }) => {
  return (
    <div className="w-full flex justify-center">
      <div className="flex space-x-4 bg-white rounded-xl px-4 py-2 ">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`relative pb-2 px-3 text-sm md:text-base transition font-medium ${
                isActive ? "text-black border-b-2 border-black " : "text-gray-500 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabHeader;
