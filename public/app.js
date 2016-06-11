




$("#scrape").on('click', function(){
  $.ajax({
    method: "GET",
    url:"/scrape"
  }).done(function(){
    getarticle();
  });
});

function getarticle(){
  $("#anarticle").empty();
  
  $.getJSON('/articles', function(data) {

    for (var i = 0; i<data.length; i++){
      $('#articles').append('<p id="anarticle" data-id="' + data[i]._id + '">'+ data[i].title + '<br /><a href="'+ data[i].link + '">Go to Article</a><br />'+ data[i].summary+'</p>');
    }
  });
}







$("#articles").on('click', 'p', function(){
  $('#notes').empty();
  $(".oldnote").empty();
  var thisId = $(this).attr('data-id');
  $("#notes").attr("data-id", thisId);

  $.ajax({
    method: "GET",
    url: "/articles/" + thisId,
  })
    .done(function( data ) {
      console.log(data);
      showNote(data);
      console.log('the article idwas');
      console.log(thisId);

      if(data.note.length>0){
        showOld(data.note)
      }

      // if(data.note.length > 0){
      //   for(var i=0; i<data.note.length; i++){
      //     $('#old').append("<div class='oldnote' id='"+data.note[i]._id+"'data-value='" +data.note[i].title+"'><h3>"+data.note[i].name +'</h3><p>'+data.note[i].body+'</p></div>')
      //   }
        // $('#titleinput').val(data.note.title);
        // $('#bodyinput').val(data.note.body);
      
    });
});

function showOld(data){
console.log('Got to show old')
console.log(data);

  for(var i=0; i<data.length; i++){
    
          $('#old').append("<div class='oldnote' id='"+data[i]._id+"'data-value='" +data[i].title+"'><h3>"+data[i].name +'</h3><p>'+data[i].body+'</p></div>')
        }
};

$("#old").on('click', 'div', function(){
  var noteId = $(this).attr('id');
  var name = $(this).find("h3").contents();
  var body = $(this).find("p").contents();
  var title = $(this).attr("data-value");
  var data = {};
  data._id = noteId;
  data.name= name[0].data;
  data.title = title;
  data.body = body[0].data;
  data.old = true;
  console.log("In old, data is:")
  console.dir(data)
  showNote(data);

});





function showNote(data){
  console.log("hit showNote");
    $("#notes").empty();
    $('#notes').append('<h2 id="artictitle">' + data.title + '</h2>');
    $('#notes').append('<textarea id="titleinput" name="title"></textarea>');
    $('#notes').append('<textarea id="bodyinput" name="body"></textarea>');

    if (data.old != null){
      $('#notes').append('<button data-id="' + data._id + '" id="updatenote">Update Note</button>');
       $('#notes').append('<button data-id="'+ data._id +'" id="deletenote">Delete</button>')
    }else{
    $('#notes').append('<button data-id="' + data._id + '" id="savenote">Save Note</button>');
    $('#notes').append('<button data-id="'+ data._id +'" id="clearnote">Clear</button>')
    };
    if (data.body != null){
      $("#notes").find("#bodyinput").val(data.body)
    }
    if (data.name){
      $("#notes").find("#titleinput").val(data.name)
    }
};

$("#notes").on('click', '#deletenote', function(){
  var thisId = $(this).attr('data-id');
  $.ajax({
    method: "POST",
    url: "/delete/" + thisId  
  }).done(function(err){
    console.log("got to delete done")
      
      $('#'+ thisId).remove();
      $('#titleinput').val("");
      $('#bodyinput').val("");
      changeButton();

  })
})

function changeButton(){
  var artID = $("#notes").attr("data-id");
  $("#updatenote").attr("data-id", artID);
  $("#updatenote").text('');
  $("#updatenote").text("Save Note");
  $("#updatenote").attr("id", "savenote");
  $("#deletenote").text('');
  $("#deletenote").text("Clear");
  $("#deletenote").attr("id", "clearnote");
  
}

$("#notes").on('click', "#clearnote", function(){
  $('#titleinput').val("");
  $('#bodyinput').val("");
})

$("#notes").on('click', '#updatenote', function(){
   var thisId = $(this).attr('data-id');
  var thisTitle = $('#notes').find("h2").contents();
  console.log(thisTitle[0].data)

  $.ajax({
    method: "POST",
    url: "/notes/" + thisId,
    data: {
      title: thisTitle[0].data,
      name: $('#titleinput').val(),
      body: $('#bodyinput').val()
    }
  })
    .done(function( data ) {
      console.log(data);
      console.log("Go to the end of update note...")
      $('#'+ thisId).remove();
      var newData = [];
      newData.push(data);
      showOld(newData);
      changeButton();
     
    });
  $('#titleinput').val("");
  $('#bodyinput').val("");
  



})



$(document).on('click', '#savenote', function(){
  var thisId = $(this).attr('data-id');
  var thisTitle = $('#notes').find("h2").contents();
  console.log(thisTitle[0].data)

  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      title: thisTitle[0].data,
      name: $('#titleinput').val(),
      body: $('#bodyinput').val()
    }
  }).done(function( data ) {
      console.log("gothere")
      console.log(data);
      $('#'+ thisId).remove();
      var newData = [];
      newData.push(data);
      showOld(newData);
    });


  $('#titleinput').val("");
  $('#bodyinput').val("");
});
