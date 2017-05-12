$(document).ready(function() {
  $('.back-top').click(function() {
    $('html, body').stop().animate({
      scrollTop: 0
    }, 500)
  })
  var $deleteBtn = $('.delete-btn')
  var animat = {
    open: function (promise) {
      var n = this
      Velocity(n.barDom, {
        left: 450,
        scaleY: 2
      }, {
        duration: 0
      })
      Velocity(n.barDom, {
        left: 0,
        scaleY: 1
      }, {
        easing: [ 8, 8 ],
        complete: function() {
          promise(function(resolve) {
            resolve();
          })
        }
      })
    },
    close: function (promise) {
      var n = this
      Velocity(n.barDom, {
        left: '+=-50'
      }, {
        easing: [ 8, 8, 2],
        duration: 350
      })
      Velocity(n.barDom, {
        left: 450,
        scaleY: .2,
        height: 0,
        margin: 0
      }, {
        easing: [ 8, 8 ],
        complete: function () {
          promise(function(resolve) {
              resolve();
          })
        }
      })
    }
  }
  if ($deleteBtn) {
    $deleteBtn.on('click', function () {
      var that = this
      var n = new Noty({
        type: 'warning',
        layout: 'center',
        theme: 'mint',
        text: '确定要删除《'+ $(that).data('title') +'》文章？',
        closeWith: ['click', 'button'],
        animation: animat,
        id: false,
        force: false,
        queue: 'global',
        container: false,
        buttons: [
          Noty.button('确定', 'btn btn-success', function () {
            n.close()
            $.ajax({
              type: 'POST',
              url: $(that).data('url'),
              success: function (res) {
                if (res.ok) {
                  new Noty({
                    type: 'success',
                    layout: 'topRight',
                    text: '删除成功',
                    timeout: 2000,
                    progressBar: true,
                    animation: animat
                  }).show()
                  var $target  = $(that).parents('.article-item')
                  Velocity($target, {
                    right: '+=-50'
                  }, {
                    easing: [ 8, 8, 2],
                    duration: 600
                  })
                  Velocity($target, {
                    right: 900,
                    scaleY: .2,
                    height: 0,
                    margin: 0
                  }, {
                    easing: [ 8, 8 ],
                    complete: function () {
                      $target.remove()
                    }
                  })
                } else {
                  new Noty({
                    type: 'error',
                    layout: 'topRight',
                    text: res.n,
                    timeout: 2000,
                    progressBar: true,
                    animation: animat,
                  }).show()
                }
              }
            })
          }, {id: 'button1', 'data-status': 'ok'}),
          Noty.button('取消', 'btn btn-error', function () {
            n.close()
          })
        ],
        sounds: {
          sources: [],
          volume: 1,
          conditions: []
        }
      }).show()
    })
  }
})
