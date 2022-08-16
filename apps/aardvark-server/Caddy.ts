const baseAardvarkConfig = `

dev.zerve.app {
  tls {
    dns cloudflare {env.CLOUDFLARE_AUTH_TOKEN}
  }
  route /.z* {
    reverse_proxy http://localhost:9999
  }
  reverse_proxy http://localhost:9990
}

aardvark.zerve.dev {
  route /.z* {
    reverse_proxy http://localhost:8999
  }
  reverse_proxy http://localhost:8990
}`;

// caddy reload -config /etc/caddy/caddy.json
