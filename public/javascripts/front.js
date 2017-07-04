$(document).ready(function() {
  $("#upload-btn").hide();

  $(function(){
        $('a').each(function(){
            if ($(this).prop('href') == window.location.href) {
                $(this).addClass('active'); $(this).parents('li').addClass('active');
            }
        });
    });

    $("#profileFile").change(function() {
       var fileName = $(this).val();
       if (fileName !== "") {
         $("#upload-btn").show();
       } //show the button
     });
});
