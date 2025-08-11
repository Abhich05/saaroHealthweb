const TabHeader = ({ tabs, activeTabId, setActiveTabId }) => {
  return (
    <div className="w-full flex justify-center">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`px-3 lg:px-4 py-2 rounded-full text-xs lg:text-sm font-medium transition-all ${
                isActive ? "bg-blue-100 text-blue-800 border-2 border-blue-300" : "bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200"
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
