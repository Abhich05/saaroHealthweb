const validateLocationSchedule = (locations) => {
  for (let i=0; i<locations.length; i++) {
    const loc1 = locations[i];
    const loc1From = convertToMinutes(loc1.from);
    const loc1To = convertToMinutes(loc1.to);
    
    for (let j=i+1; j<locations.length; j++) {
      const loc2 = locations[j];

      const commonDays = loc1.days.filter((day) => loc2.days.includes(day));
      if (commonDays.length > 0) {
        const loc2From = convertToMinutes(loc2.from);
        const loc2To = convertToMinutes(loc2.to);

        if (
          (loc1From < loc2To && loc1To > loc2From) || 
          (loc2From < loc1To && loc2To > loc1From)
        ) {
          return {
            success: false,
            message: `Schedule conflict detected between locations "${loc1.name}" and "${loc2.name}" on ${commonDays.join(", ")}`,
          };
        }
      }
    }
  }

  return {
    success: true,
    message: "No schedule conflicts detected",
  };
}

const convertToMinutes = (time) => {
  const [hour, minute] = time.split(/[: ]/);
  const isPM = time.includes("PM");
  const hoursInMinutes = (parseInt(hour) % 12 + (isPM ? 12 : 0)) * 60;
  return hoursInMinutes + parseInt(minute);
};

module.exports = {
  validateLocationSchedule,
};
