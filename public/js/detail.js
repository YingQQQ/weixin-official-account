$(function() {
  $('.comment').click(function(e) {
    var target = $(this)
    var toId = target.data('tid')
    var commentId = target.data('cid')

    $('#toId').val(toId)
    $('#commentId').val(commentId)
  })
  $('#btn').click(function(e) {
    e.preventDefault();
    $.ajax({
      type:'POST',
      data:$('#commentForm').serialize(),
      url:'/user/comment'
    })
    .done(function(results){
      if(results.success === 1){
        window.location.reload()
      }
    })
  })
})