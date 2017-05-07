$(document).ready(function() {
  $('.back-top').click(function() {
    $('html, body').stop().animate({
      scrollTop: 0
    }, 500)
  })
})
