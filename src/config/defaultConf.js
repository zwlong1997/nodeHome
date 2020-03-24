module.exports = {
    root : process.cwd(), //获取当前路径
    hostname: '127.0.0.1',
    port: 3000,
    compress: /\.(html|js|css|md)/,
    cache: {
        maxAge: 600,
        expires: true,
        cacheControl: true,
        lastModified: true,
        etag: true
    }
}