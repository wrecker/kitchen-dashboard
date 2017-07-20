
function getCurrentCondition() {
  weatherUrl = "https://api.wunderground.com/api/SECRET-KEY/conditions/q/CA/San_Jose.json";
  $.ajax({
		url : weatherUrl,
		type: "GET",
		dataType: "json",
    success:function(data, textStatus, jqXHR)
		{
      conditions = jqXHR.responseJSON.current_observation;
      $(".location").text(conditions.display_location.full);
      $(".current .desc").text(conditions.weather);
      $(".current .icon").removeClass().addClass("icon").addClass(conditions.icon);
      $(".current .temp").text(Math.round(conditions.temp_f));
		}
	});
}

function getWeatherForecast() {
  weatherUrl = "https://api.wunderground.com/api/SECRET-KEY/forecast10day/q/CA/San_Jose.json";
  $.ajax({
		url : weatherUrl,
		type: "GET",
		dataType: "json",
    success:function(data, textStatus, jqXHR)
		{
      forecast = jqXHR.responseJSON.forecast.simpleforecast;
      $(".seven-day-fc").each(function(index) {
        $(this).find(".date").text(forecast.forecastday[index].date.weekday_short);
        $(this).find(".icon").removeClass().addClass("icon").addClass(forecast.forecastday[index].icon);
        $(this).find(".temp-high").html(forecast.forecastday[index].high.fahrenheit + "&deg;");
        $(this).find(".temp-low").html(forecast.forecastday[index].low.fahrenheit + "&deg;");
      });

		}
	});
}

$(function() {
  getCurrentCondition();
  getWeatherForecast();

  setInterval(function() {
    getCurrentCondition();
    getWeatherForecast();
  }, 3600 * 1000);

});
