import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Range');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

const AJN_VIDEO_SOURCES = {
  'alex-jones-show': {
    title: 'The Alex Jones Show',
    channel: 'Ch 1: AJN One (Primary Broadcast)',
    description: 'In-depth analysis and live breaking news',
    rssUrl: 'https://rss.alexjones.media/Alex.xml',
    videoUrls: [
      'https://ajn.archives.pub/hourly-m4v/ajn-alex-jones-hr-01.m4v',
      'https://ajn.archives.pub/hourly-m4v/ajn-alex-jones-hr-02.m4v',
      'https://ajn.archives.pub/hourly-m4v/ajn-alex-jones-hr-03.m4v',
      'https://archive.org/download/infowars_archive_2021_01/Infowars_20210101_175000.m4v',
      'https://archive.org/download/infowars_archive_2021_02/Infowars_20210102_175000.m4v',
    ],
    audioUrls: [
      'https://stream.alexjones.media/alexjonesshow',
      'https://stream.alexjones.media/stream/1/',
    ]
  },
  'war-room': {
    title: 'War Room with Harrison Smith',
    channel: 'Ch 2: AJN News & Tech',
    description: 'War Room midday show with breaking news',
    rssUrl: 'https://rss.alexjones.media/WarRoom.xml',
    videoUrls: [
      'https://ajn.archives.pub/hourly-m4v/ajn-war-room-hr-01.m4v',
      'https://ajn.archives.pub/hourly-m4v/ajn-war-room-hr-02.m4v',
      'https://ajn.archives.pub/hourly-m4v/ajn-war-room-hr-03.m4v',
      'https://archive.org/download/infowars_war_room_2021/WarRoom_20210101_160000.m4v',
      'https://archive.org/download/infowars_war_room_2021/WarRoom_20210102_160000.m4v',
    ],
    audioUrls: [
      'https://stream.alexjones.media/warroom/',
      'https://stream.alexjones.media/stream/4/',
    ]
  },
  'sunday-live': {
    title: 'Sunday Night Live',
    channel: 'Ch 3: AJN Cinema & Ambient',
    description: 'Live Sunday broadcast',
    rssUrl: 'https://rss.alexjones.media/SundayLive.xml',
    videoUrls: [
      'https://ajn.archives.pub/hourly-m4v/ajn-sunday-live-seg-01.m4v',
      'https://ajn.archives.pub/hourly-m4v/ajn-sunday-live-seg-02.m4v',
      'https://ajn.archives.pub/hourly-m4v/ajn-sunday-live-seg-03.m4v',
      'https://archive.org/download/infowars_sunday_live/SundayLive_20210107_190000.m4v',
    ],
    audioUrls: [
      'https://stream.alexjones.media/stream/7/',
      'https://stream.alexjones.media/stream/8/',
    ]
  }
};

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ajn-broadcast-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT
  });
});

app.get('/api/shows', (req, res) => {
  try {
    console.log('✅ /api/shows: Returning available channels');
    const shows = Object.entries(AJN_VIDEO_SOURCES).map(([id, data]) => ({
      id,
      title: data.title,
      channel: data.channel,
      description: data.description,
      rssUrl: data.rssUrl,
      videoCount: data.videoUrls.length,
      audioCount: data.audioUrls.length,
      hasArchiveBackup: true
    }));
    res.json({
      success: true,
      shows,
      totalShows: shows.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('❌ /api/shows error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shows',
      message: String(err)
    });
  }
});

app.get('/api/episodes/:showId', (req, res) => {
  try {
    const { showId } = req.params;
    const showData = AJN_VIDEO_SOURCES[showId];

    if (!showData) {
      return res.status(404).json({
        success: false,
        error: 'Show not found',
        showId
      });
    }

    console.log(`✅ /api/episodes/${showId}: Returning ${showData.videoUrls.length} episodes`);

    const episodes = showData.videoUrls.map((url, index) => ({
      id: `${showId}-video-${index + 1}`,
      title: `${showData.title} - Segment ${index + 1}`,
      url: `/api/stream-proxy?url=${encodeURIComponent(url)}`,
      sourceUrl: url,
      duration: 3600,
      format: 'video/mp4',
      date: new Date(Date.now() - (index * 86400000)).toISOString(),
      quality: '720p',
      size: 'Varies'
    }));

    res.json({
      success: true,
      showId,
      showTitle: showData.title,
      episodeCount: episodes.length,
      episodes,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error(`❌ /api/episodes error:`, err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch episodes',
      message: String(err)
    });
  }
});

app.get('/api/stream-proxy', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'url parameter required'
      });
    }

    const allowedDomains = [
      'ajn.archives.pub',
      'archive.org',
      'rss.alexjones.media',
      'stream.alexjones.media',
      'audio.alexjoneslive.com',
      'affiliates.alexjoneslive.com'
    ];

    const isAllowed = allowedDomains.some(domain => url.includes(domain));
    if (!isAllowed) {
      console.warn(`🚫 Blocked unauthorized URL: ${url.slice(0, 80)}`);
      return res.status(403).json({
        success: false,
        error: 'URL domain not allowed'
      });
    }

    console.log(`📡 Proxying stream: ${url.slice(0, 80)}...`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'AJN-Broadcast-Player/1.0',
          'Accept-Encoding': 'gzip, deflate'
        },
        timeout: 30000
      });

      if (!response.ok) {
        console.warn(`⚠️ Stream fetch returned ${response.status}: ${url.slice(0, 80)}`);
        return res.status(response.status).json({
          success: false,
          error: 'Stream unavailable',
          upstreamStatus: response.status
        });
      }

      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const contentLength = response.headers.get('content-length');

      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Range');
      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=86400');

      if (contentLength) {
        res.set('Content-Length', contentLength);
      }

      const range = req.headers.range;
      if (range && contentLength) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : parseInt(contentLength, 10) - 1;
        const chunksize = end - start + 1;
        res.status(206);
        res.set('Content-Range', `bytes ${start}-${end}/${contentLength}`);
        res.set('Content-Length', String(chunksize));
        console.log(`⏩ Range request: bytes ${start}-${end}/${contentLength}`);
      }

      if (response.body) {
        response.body.pipe(res);
        response.body.on('error', (err) => {
          console.error('❌ Stream pipe error:', err);
          if (!res.headersSent) {
            res.status(502).json({ error: 'Stream interrupted' });
          }
        });
      } else {
        return res.status(502).json({
          success: false,
          error: 'No response body from stream'
        });
      }
    } catch (fetchErr) {
      console.error('❌ Fetch error:', fetchErr);
      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          error: 'Stream unavailable',
          message: fetchErr.message
        });
      }
    }
  } catch (err) {
    console.error('❌ /api/stream-proxy error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Stream proxy failed',
        message: String(err)
      });
    }
  }
});

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log('🎬 AJN BROADCAST MEDIA PLATFORM - PRODUCTION SERVER');
  console.log('='.repeat(70));
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`\n📺 Available Endpoints:`);
  console.log(`   GET  /health                 - Server health check`);
  console.log(`   GET  /api/shows              - List all shows (channels)`);
  console.log(`   GET  /api/episodes/:showId   - Get episodes for a show`);
  console.log(`   GET  /api/stream-proxy       - Proxy external streams with CORS`);
  console.log(`\n📺 Shows Available:`);
  console.log(`   1. The Alex Jones Show       (${AJN_VIDEO_SOURCES['alex-jones-show'].videoUrls.length} videos)`);
  console.log(`   2. War Room with Harrison    (${AJN_VIDEO_SOURCES['war-room'].videoUrls.length} videos)`);
  console.log(`   3. Sunday Night Live         (${AJN_VIDEO_SOURCES['sunday-live'].videoUrls.length} videos)`);
  console.log(`\n📡 Video Sources:`);
  console.log(`   • ajn.archives.pub (AJN hourly content)`);
  console.log(`   • archive.org (Archive.org collections)`);
  console.log(`\n🔗 Open in browser: http://localhost:${PORT}/`);
  console.log('='.repeat(70) + '\n');
});
