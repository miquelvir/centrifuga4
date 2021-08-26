import html2text


body_html_path = input("path to body.html: ")

h = html2text.HTML2Text()
h.ignore_links = True

with open(body_html_path, encoding="utf8") as f:
    html = f.read()

plain = h.handle(html)

print("--- HTML ---")
print(html)
print("--- PLAIN ---")
print(plain)
