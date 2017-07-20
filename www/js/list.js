$(function() {
  display = 1;
  if (display) {
    $(".items").on("focusin", ".label", function(e) { beginEditing(this); });

    $(".items").on("focusout", ".label", function(e) {
      finishEditing(this);
    });

    $(".items").on("click", ".toggle", function(e) {
      toggleTaskStatus($(this).closest("li"));
    });

    $(".items").on("click", ".destroy", function(e) {
      deleteTask($(this).closest("li"));
    });

    $(".items").on("keydown", ".label", function(e) {
      if(e.keyCode == 13) {
        e.preventDefault();
        finishEditing(this);
        $(this).blur();
      }
    });

    $(".add-item-form").submit(addNewTask);
  }

  $("div.list-container").each(function() {
    refreshList(this);
  });

  setInterval(function() {
    $("div.list-container").each(function() {
      refreshList(this);
    });
  }, 10000);

})



function refreshList(el) {
  // Get listId
  listId = $(el).data("list-id");
  if (typeof listId == "undefined") return;
  getTasksForList(el, listId);
}

function getTasksForList(el, listId) {
  taskUrl = location.protocol + "//" + location.host + "/api/list/" + listId + "/tasks";
  $.ajax(
		{
			url : taskUrl,
			type: "GET",
			dataType: "json",
      context: el,
      success:function(data, textStatus, jqXHR)
			{
        list = jqXHR.responseJSON.list;
        $(this).find(".list-title").text(list.title);
        tasks = jqXHR.responseJSON.tasks;
        tasks.sort(function(a,b){
          return a.sort_order - b.sort_order;
        });
        $(this).find(".items").empty();
        tasks.forEach(function(item, index) {
          insertTask(item);
        });
			}
		});
}

function insertTask(task) {
  cloned = $(".clone-source").clone().removeClass("clone-source");
  $(cloned).find(".label").html(task.content);
  $(cloned).data("listId", task.list_id);
  $(cloned).data("taskId", task.id);
  if (task.done) {
    $(cloned).addClass("completed");
  }
  // $(".items").append(cloned);
  // Find list container to attach to
  $('div.list-container').filter('[data-list-id=' + task.list_id + ']').find(".items").append(cloned);
}

function addNewTask(e) {
  e.preventDefault();
  var data = {};
  var Form = this;

  $.each(this.elements, function(i, v){
    var input = $(v);
    data[input.attr("name")] = input.val();
    delete data["undefined"];
  });

  if (!data["content"]) {
    return;
  }
  listId = $(this).closest("div.list-container").data("list-id");

  taskUrl = location.protocol + "//" + location.host + "/api/list/" + listId + "/tasks";
  //Save Form Data.
  $.ajax({
      cache: false,
      url : taskUrl,
      type: "POST",
      contentType: "application/json; charset=utf-8",
      dataType : "json",
      data : JSON.stringify(data),
      context : Form,
      success : function(data, textStatus, jqXHR){
          //Where $(this) => context == FORM
          $(this).find("input[type=text], textarea").val("");
          task = jqXHR.responseJSON.task;
          insertTask(task);
      },
  });
}

function toggleTaskStatus(row) {
  data = {"done": false};
  if (! $(row).hasClass("completed")) {
      data["done"] = true;
  }
  taskId = $(row).data("taskId");
  taskUrl = location.protocol + "//" + location.host + "/api/tasks/" + taskId;

  $.ajax(
    {
      url : taskUrl,
      type: "PUT",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      data: JSON.stringify(data),
      context: row,
      success: function(data, textStatus, jqXHR) {
        console.log("toggleTaskStatus: Task updated.")
        $(row).toggleClass("completed");
      },
      error: function(jqXHR, textStatus, errorThrown) {
        // Restore the original content
        console.log("toggleTaskStatus: Task update Failed: " + errorThrown);
      }
    });
}

function deleteTask(row) {
  taskId = $(row).data("taskId");
  taskUrl = location.protocol + "//" + location.host + "/api/tasks/" + taskId;
  $.ajax(
    {
      url : taskUrl,
      type: "DELETE",
      context: row,
      success: function(data, textStatus, jqXHR) {
        console.log("deleteTask: Task deleted.")
        $(row).hide().remove();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        // Restore the original content
        console.log("deleteTask: Task deleted failed: " + errorThrown);
      }
    });
}

function beginEditing(label) {
  // Save the current value to check later
  currContent = $(label).text();
  $(label).closest("li").data("content", currContent);
  $(label).closest("li").addClass("editing");
}

function finishEditing(label) {
  li = $(label).closest("li");
  taskId = $(li).data("taskId");
  listId = $(li).data("listId");
  currContent = $(label).text();
  prevContent = $(li).data("content");
  taskUrl = location.protocol + "//" + location.host + "/api/tasks/" + taskId;

  var data = {};
  data["content"] = $(label).text();

  if (currContent != prevContent) {
    console.log($(li).find(".label").text() + " " + listId + " " + taskId);
    $.ajax(
  		{
  			url : taskUrl,
  			type: "PUT",
        contentType: "application/json; charset=utf-8",
  			dataType: "json",
        data: JSON.stringify(data),
        context: li,
        success: function(data, textStatus, jqXHR) {
          console.log("finishEditing: Task updated.")
  			},
        error: function(jqXHR, textStatus, errorThrown) {
          // Restore the original content
          $(this).find(".label").text($(this).data("content"));
          console.log("finishEditing: Task update Failed: " + errorThrown);
        }
  		});

  } else {
    console.log("No Change in content");
  }
  $(li).removeClass("editing");
}
