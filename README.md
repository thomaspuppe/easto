# easto

A static-site generator

## Run

Create the output: `node index.js` or `rm -rf ./output_blog/* && node index.js --content=content_blog --output=output_blog --templates=templates_blog`

Start a local webserver at http://localhost:8000/ :

    `cd output && caddy -port 8000`

I decided to try [Caddy](https://caddyserver.com/) as my local webserver.

You can find a great list of simple servers at https://gist.github.com/willurd/5720255 . Some of them are already available if you have Python or Ruby installed.
