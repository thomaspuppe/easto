# easto

A static-site generator

## Run

Create the output: `node index.js` or `rm -rf ./output_blog/* && node index.js --content=content_blog --output=output_blog --templates=templates_blog`

Start a local webserver at http://localhost:8000/ :

    `cd output && caddy -port 8000`

I decided to try [Caddy](https://caddyserver.com/) as my local webserver.

You can find a great list of simple servers at https://gist.github.com/willurd/5720255 . Some of them are already available if you have Python or Ruby installed.


## preparation for my blog (WIP)

brew install caddy

rm -rf ./../blog.thomaspuppe.de/output/* && node index.js --content=../blog.thomaspuppe.de/content  --data=../blog.thomaspuppe.de/static --output=../blog.thomaspuppe.de/output --templates=../blog.thomaspuppe.de/themes/easto --verbose=true


## Considerations

- where do the templates belong? ... rather to the blog, especially if easto is just a dependency of the blog repo.