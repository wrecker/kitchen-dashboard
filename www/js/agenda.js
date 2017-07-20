$(function() {
  $('#calendar').fullCalendar({
    header: false,
    // customize the button names,
    // otherwise they'd all just say "list"
    views: {
      listDay: { buttonText: 'list day' },
      listWeek: { buttonText: 'list week'}
    },
    defaultView: 'listWeek',
    navLinks: false, // can click day/week names to navigate views
    editable: false,
    eventLimit: true, // allow "more" link when too many events
    timezone: "America/Los_Angeles",
    eventSources: [
      {
        url: "json/events.json",
        backgroundColor: "#bfe185",
        color: "#93C00B",
        className: "cal-events"
      },
      {
        url: "json/mahesh.json",
        backgroundColor: "#bfe185",
        color: "#93C00B",
        className: "cal-mahesh"
      },
      {
        url: "json/chitra.json",
        backgroundColor: "#bfe185",
        color: "#93C00B",
        className: "cal-chitra"
      },
      {
        url: "json/reminders.json",
        backgroundColor: "#bfe185",
        color: "#93C00B",
        className: "cal-reminders"
      },
      {
        url: "json/us-holidays.json",
        backgroundColor: "#bfe185",
        color: "#93C00B",
        className: "cal-us-holidays"
      }
   ]
  });

  setInterval(function() {
    $("#calendar").fullCalendar('refetchEvents');
  }, 600 * 1000);
});
