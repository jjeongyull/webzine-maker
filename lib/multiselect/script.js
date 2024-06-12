$(document).ready(function() {
    $('#multiple-checkboxes').multiselect({
      includeSelectAllOption: true,
    });

   $('#example-selectAll-visible').on('click', function() {
     $('#example-selectAll').multiselect('selectAll', true);
  });
  
  $('#example-selectAll-all').on('click', function() {
      $('#example-selectAll').multiselect('selectAll', false);
  });
});


