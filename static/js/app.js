$(document).ready(function() {
  $('.back-top').click(function() {
    $('html, body').stop().animate({
      scrollTop: 0
    }, 500)
  })
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
  var animatRight = {
    open: function (promise) {
      var n = this
      Velocity(n.barDom, {
        right: 450,
        scaleY: 2
      }, {
        duration: 0
      })
      Velocity(n.barDom, {
        right: 0,
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
        right: '+=-50'
      }, {
        easing: [ 8, 8, 2],
        duration: 350
      })
      Velocity(n.barDom, {
        right: 450,
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
  //删除
  var $deleteBtn = $('.delete-btn')
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
  //评论
  var $commentBtn = $('.commenter_button')
  var $commentText = $('.commenter_text')
  var submitFlag = true
  if ($commentBtn) {
    $commentBtn.click(function () {
      if (!submitFlag) {
        new Noty({
          type: 'error',
          layout: 'bottomLeft',
          text: '慢点点老哥',
          timeout: 2000,
          progressBar: true,
          animation: animatRight,
        }).show()
        return
      }
      submitFlag = false
      var val = $commentText.val()
      val = val ? val.replace(/\s/g, ''): null
      if (!val) {
        new Noty({
          type: 'error',
          layout: 'bottomLeft',
          text: '随便说点什么再提交？',
          timeout: 2000,
          progressBar: true,
          animation: animatRight,
        }).show()
        submitFlag = true
        return
      }
      $.ajax({
        type: 'post',
        url: location.pathname + '/comment',
        data: {
          content: val
        },
        success: function(res) {
          if (res.status === 'ok') {
             new Noty({
              type: 'success',
              layout: 'bottomLeft',
              text: res.mes,
              timeout: 2000,
              progressBar: true,
              animation: animatRight,
              callbacks: {
                onTemplate: function() {
                  location.reload()
                }
              }
            }).show()
            submitFlag = true
          }
        }
      })
    })
  }
  // 删除评论
  var $commentReply = $('.comment_reply')
  if ($commentReply) {
    $commentReply.click(function() {
      var commentId = $(this).data('id')
      var $this = $(this)
      $.ajax({
        type: 'post',
        url: location.pathname + '/remove',
        data: {
          commentId: commentId
        },
        success: function(res) {
          if (res.status === 'ok') {
             new Noty({
              type: 'success',
              layout: 'bottomLeft',
              text: res.mes,
              timeout: 2000,
              progressBar: true,
              animation: animatRight
            }).show()
            submitFlag = true
            var $target = $this.parents('.comment')
            Velocity($target, {
              right: '+=-50'
            }, {
              easing: [ 8, 8, 2],
              duration: 600
            })
            Velocity($target, {
              right: 1000,
              scaleY: 0,
              height: 0,
              margin: 0
            }, {
              easing: [ 8, 8 ],
              complete: function () {
                $target.remove()
              }
            })
          }
        }
      })
    })
  }
})
