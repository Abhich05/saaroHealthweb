const TabHeader = ({
  tabs,
  activeTabId,
  setActiveTabId,
  // Optional theming (non-breaking defaults)
  activeBg = "bg-blue-100",
  activeText = "text-blue-800",
  activeBorder = "border-2 border-blue-300",
  inactiveBg = "bg-gray-100",
  inactiveText = "text-gray-700",
  inactiveBorder = "border-2 border-gray-200",
  inactiveHover = "hover:bg-gray-200",
  // Optional inline style overrides for dynamic theming
  activeStyle,
  inactiveStyle,
}) => {
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
                isActive
                  ? `${activeBg} ${activeText} ${activeBorder}`
                  : `${inactiveBg} ${inactiveText} ${inactiveBorder} ${inactiveHover}`
              }`}
              style={isActive ? activeStyle : inactiveStyle}
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
