$(document).ready(function() {
  var editor = new Simditor({
    textarea: $('#editor'),
    toolbar: ['title','bold','italic','underline','strikethrough','fontScale','color',
      'ol','ul','blockquote','code', 'table','link','image','hr', 'indent', 'outdent','alignment', 'html'
    ],
    upload: {
      url: '/posts/image',
      params: null,
      fileKey: 'upload_file',
      connectionCount: 1,
      leaveConfirm: 'Uploading is in progress, are you sure to leave this page?',
    }
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
  var submitFlag = true //  防多次提交
  $('#post-btn').click(function() {
    if (!submitFlag) {
      new Noty({
        type: 'error',
        layout: 'topRight',
        text: '老哥慢点',
        timeout: 2000,
        progressBar: true,
        animation: animat,
      }).show()
      return
    }
    var title = $('#title').val()
    var content = editor.getValue()
    var tag  = $('#tag').val()
    title = title ? title.replace(/\s/g, '') : ''
    
    if (!title || !content) {
      new Noty({
        type: 'error',
        layout: 'topRight',
        text: '标题和内容都不能为空',
        timeout: 2000,
        progressBar: true,
        animation: animat,
      }).show()
      return
    }
    submitFlag = false
    $.ajax({
      type: 'post',
      url: location.pathname,
      data: {
        title: title,
        content: content,
        tag: tag
      },
      success: function(res) {
        if (res.status === 'ok') {
            new Noty({
            type: 'success',
            layout: 'topRight',
            text: res.mes,
            timeout: 1000,
            progressBar: true,
            animation: animat,
            callbacks: {
              afterClose: function() {
                location.href = res.url
              }
            }
          }).show()
          submitFlag = true
        }
      }
    })
  })
})