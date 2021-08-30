//Returns current date
exports.getDate = function() {

  const today = new Date();
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  return today.toLocaleDateString("en-US", options);
}

//Returns current day
exports.getDay = function() {

  const today = new Date();
  const options = {
    weekday: "long",
  };

  return today.toLocaleDateString("en-US", options);
}
