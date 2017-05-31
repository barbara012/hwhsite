let dateFormate  = (date) => {
  let date1 = new Date(date)
  let day1 = date1.getDate()
  let ts1 = date1.getTime() / (1000 * 60)

  let nowDate = new Date()
  let day2 = nowDate.getDate()
  let ts2 = nowDate / (1000 * 60)
  let diff = ts2 - ts1
  if (diff <= 1) {
    return '刚才'
  } else if (diff > 1 && diff <= 5) {
    return '1分钟前'
  } else if (diff > 5 && diff <= 10) {
    return '5分钟前'
  } else if (diff > 10 && diff <= 30) {
    return '10分钟前'
  } else if (diff > 30 && diff <= 60) {
    return '半小时前'
  } else if (diff > 60 && diff <= 60 * 2) {
    return '1小时前'
  } else {
    return date
  }
}
module.exports = {
  formateArticle (articles) {
    let result = articles.map((article) => {
      let r = article.content.match(/<img.+?>/)
      let rendNumber = Math.random() * (200 - 150 + 1) + 150
      let p = article.content.replace(/<[^>]+>/g, '')
      if (r) {
        let imgUrl = r[0].match(/src=[\'\"]?([^\'\"]*)[\'\"]?/i)
        article.img = r[0]
        article.imgUrl = imgUrl[1]
      } else {
        article.img = null
        article.imgUrl = null
      }
      article.content = p.substr(0, rendNumber) + '...'
      article.created_at = dateFormate(article.created_at)
      if (typeof article.author === 'object') {
        const author = article.author
        article.author = author.name,
        article.userId = author._id,
        article.avatar = author.avatar
      }
      article.tag = article.tag ? article.tag.split(/，|\/|,|\\|-|&|\||@|·/) : []
      article.pv = article.pv || 0
      return article
    })
    return result
  },
  highLight (articles, keyword) {
    let result = articles.map(article => {
      let pattern = new RegExp(keyword, "g")
      article.title =article.title.replace(pattern, `<span class="highlight">${keyword}</span>`)
      article.content =article.content.replace(pattern, `<span class="highlight">${keyword}</span>`)
      return article
    })
    return result
  }
}
