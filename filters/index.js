module.exports = {
  formateArticle (articles) {
    let result = articles.map((article) => {
      let r = article.content.match(/<img.+?>/)
      let rendNumber = Math.random() * (200 - 150 + 1) + 150
      let p = article.content.replace(/<[^>]+>/g, '')
      article.img = r ? r[0] : ''
      article.content = p.substr(0, rendNumber) + '...'
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
