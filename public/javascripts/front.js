$.fn.stars = function() {
  return $(this).each(function() {
      // Get the value
      var val = parseFloat($(this).html());
      // Make sure that the value is in 0 - 5 range, multiply to get width
      val = Math.round(val * 2) / 2;
      var size = Math.max(0, (Math.min(5, val))) * 16;
      // Create stars holder
      var $span = $('<span />').width(size);
      // Replace the numerical value with stars
      $(this).html($span);
  });
};

$(document).ready(function() {
  $("#upload-btn").hide();
  $("#upload-recipe-btn").hide();

  $(function(){
        $('a').each(function(){
            if ($(this).prop('href') == window.location.href) {
                $(this).addClass('active'); $(this).parents('li').addClass('active');
            }
        });
    });




    $(function() {
        $('span.stars').stars();
    });

    $("#profileFile").change(function() {
       var fileName = $(this).val();
       if (fileName !== "") {
         $("#upload-btn").show();
       } //show the button
     });

     $("#recipeFile").change(function() {
        var fileName = $(this).val();
        if (fileName !== "") {
          $("#upload-recipe-btn").show();
        } //show the button
      });
});
