import json

posts_with_contents = json.loads(open("posts-with-content.json", "r").read())
print(len(posts_with_contents["posts"]))

posts = json.loads(open("posts.json", "r").read())
print(len(posts["links"]))

# for i, post in enumerate(posts_with_contents["posts"]):
#     print("===============>", i)
#     print(post["content"])
