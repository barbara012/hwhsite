module.exports = {
  formateNews (articles) {
    let result = articles.map((article) => {
      let r = article.content.match(/<img.+?>/)
      let rendNumber = Math.random() * (200 - 150 + 1) + 150
      let p = article.content.replace(/<[^>]+>/g, '')
      article.img = r ? r[0] : ''
      article.content = p.substr(0, rendNumber) + '...'
      article.tag = article.tag ? article.tag.split(/，|\/|,|\\|-|&|\||@|·/) : []
      article.pv = article.pv || 0
      return article
    })
    return result
  }
}
