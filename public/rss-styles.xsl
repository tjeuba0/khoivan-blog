<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title>RSS Feed - Khoi Van Blog</title>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'IBM Plex Mono', monospace;
            line-height: 1.6;
            color: #333;
            background: #fbfefb;
            padding: 2rem 1rem;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          h1 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            color: #212737;
          }
          .subtitle {
            color: #666;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #e5e7eb;
          }
          .info-box {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 2rem;
          }
          .info-box h2 {
            font-size: 1.2rem;
            margin-bottom: 1rem;
            color: #374151;
          }
          .info-box p {
            margin-bottom: 0.5rem;
            color: #4b5563;
          }
          .info-box code {
            background: #e5e7eb;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-size: 0.9rem;
            color: #1f2937;
          }
          .feed-info {
            margin-bottom: 2rem;
            padding: 1rem;
            background: #fef3c7;
            border: 1px solid #fcd34d;
            border-radius: 8px;
          }
          .feed-info a {
            color: #0969da;
            text-decoration: none;
          }
          .feed-info a:hover {
            text-decoration: underline;
          }
          .item {
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid #e5e7eb;
          }
          .item:last-child {
            border-bottom: none;
          }
          .item-title {
            font-size: 1.3rem;
            margin-bottom: 0.5rem;
          }
          .item-title a {
            color: #0969da;
            text-decoration: none;
          }
          .item-title a:hover {
            text-decoration: underline;
          }
          .item-meta {
            font-size: 0.9rem;
            color: #6b7280;
            margin-bottom: 0.5rem;
          }
          .item-description {
            color: #4b5563;
            line-height: 1.6;
            margin-bottom: 0.5rem;
          }
          .tags {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            margin-top: 0.5rem;
          }
          .tag {
            background: #e5e7eb;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.85rem;
            color: #374151;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📡 RSS Feed</h1>
          <p class="subtitle">Khoi Van - Android Developer Blog</p>
          
          <div class="info-box">
            <h2>What is RSS?</h2>
            <p>RSS allows you to subscribe to this blog and get updates in your feed reader.</p>
            <p>Copy this URL to subscribe: <code><xsl:value-of select="/rss/channel/link"/>rss.xml</code></p>
            <p>Popular RSS readers: Feedly, Inoreader, NetNewsWire, Reeder</p>
          </div>

          <div class="feed-info">
            <p>🏠 Back to <a href="/">homepage</a> | 📝 View all <a href="/blog">posts</a></p>
          </div>

          <h2 style="margin-bottom: 1.5rem;">Latest Posts</h2>
          
          <xsl:for-each select="/rss/channel/item">
            <div class="item">
              <h3 class="item-title">
                <a>
                  <xsl:attribute name="href">
                    <xsl:value-of select="link"/>
                  </xsl:attribute>
                  <xsl:value-of select="title"/>
                </a>
              </h3>
              <div class="item-meta">
                <xsl:value-of select="pubDate"/>
                <xsl:if test="author">
                  | By <xsl:value-of select="author"/>
                </xsl:if>
              </div>
              <p class="item-description">
                <xsl:value-of select="description"/>
              </p>
              <div class="tags">
                <xsl:for-each select="category">
                  <span class="tag"><xsl:value-of select="."/></span>
                </xsl:for-each>
              </div>
            </div>
          </xsl:for-each>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>